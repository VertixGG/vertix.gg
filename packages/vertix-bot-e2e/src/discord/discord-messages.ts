import { expect } from "@playwright/test";

import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import {
    DISCORD_DOM,
    DISCORD_TEXT,
    componentEmojiSelector
} from "@vertix.gg/bot-e2e/src/discord/discord-dom";
import { matchesCopy, normalizeDiscordText, templateToPattern } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { Locator, Page } from "@playwright/test";

/**
 * What the message list looked like before an interaction.
 *
 * Not just a watermark, because a reply is not always a new message: several `/manage` rows open the
 * same adapter, and the bot answers the second one by **editing the ephemeral it already sent**. That
 * message keeps its id, so a watermark alone never sees it and the test waits out its timeout for an
 * answer that is on screen. Holding a fingerprint of what each message said makes an edit as visible
 * as an arrival.
 */
export interface IMessageMark {
    highest: bigint;
    lengths: Record<string, number>;
}

export type TMessageMark = IMessageMark;

const THINKING_MARKER = "is thinking";

const DISCORD_EPOCH_MS = 1420070400000n;

const SNOWFLAKE_TIMESTAMP_SHIFT = 22n;

/**
 * The message id out of a `chat-messages-<channel>-<message>` element id.
 */
function messageSnowflake( elementId: string ): bigint {
    const trailing = elementId.slice( elementId.lastIndexOf( "-" ) + 1 );

    return /^\d+$/.test( trailing ) ? BigInt( trailing ) : 0n;
}

function snowflakeForNow(): bigint {
    return ( BigInt( Date.now() ) - DISCORD_EPOCH_MS ) << SNOWFLAKE_TIMESTAMP_SHIFT;
}

/**
 * Reading what the bot said.
 *
 * A reply is found by being **newer** than everything that came before it, not by being an id that was
 * not in the dom a moment ago. Those are not the same question: discord renders a channel's history
 * progressively and drops messages that scroll out, so an old message arriving in the dom looks new by
 * the second test and is not. That is how a `/help` assertion once ran against a reply from the
 * previous day - the right embed was on screen, and the locator was pointing somewhere else entirely.
 *
 * Message ids are snowflakes, so "newer" is just a bigger number, and taking the largest one on screen
 * before acting gives a watermark nothing already in the channel can pass.
 */
export class DiscordMessages {
    public constructor( private readonly page: Page, private readonly applicationName: string ) {}

    public async ids(): Promise<string[]> {
        return this.page.$$eval( DISCORD_DOM.MESSAGE_ITEM, ( elements: Element[] ) =>
            elements.map( ( element ) => element.id )
        );
    }

    /**
     * Taken before anything is clicked or typed.
     */
    public async mark(): Promise<TMessageMark> {
        const lengths = await this.page.$$eval( DISCORD_DOM.MESSAGE_ITEM, ( elements: Element[] ) =>
            Object.fromEntries( elements.map( ( element ) => [ element.id, ( element as HTMLElement ).innerText.length ] ) ) );

        const ids = Object.keys( lengths );

        const highest = ids
            .map( messageSnowflake )
            .reduce( ( largest, candidate ) => candidate > largest ? candidate : largest, 0n );

        return { highest: 0n === highest ? snowflakeForNow() : highest, lengths };
    }

    /**
     * A mark that accepts whatever is already on screen, for reading a message the bot posted before
     * the test began - a generator's panel, say.
     */
    public anyMark(): TMessageMark {
        return { highest: 0n, lengths: {} };
    }

    /**
     * Messages that arrived since the mark, and separately those that only changed under it.
     *
     * Kept apart because they are not equally good evidence. An arrival is unambiguous; a change is
     * anything from the answer being edited in to discord re-rendering a message that was already on
     * screen - and a panel whose button was just pressed re-renders. Treating the two alike made the
     * panel itself the answer to pressing its own button.
     */
    public async newerThan( mark: TMessageMark ): Promise<{ arrived: string[]; changed: string[] }> {
        const lengths = await this.page.$$eval( DISCORD_DOM.MESSAGE_ITEM, ( elements: Element[] ) =>
            Object.fromEntries( elements.map( ( element ) => [ element.id, ( element as HTMLElement ).innerText.length ] ) ) );

        const newest = ( left: string, right: string ) => messageSnowflake( left ) > messageSnowflake( right ) ? -1 : 1;

        const ids = Object.keys( lengths );

        return {
            arrived: ids.filter( ( id ) => messageSnowflake( id ) > mark.highest ).sort( newest ),
            changed: ids
                .filter( ( id ) => messageSnowflake( id ) <= mark.highest )
                .filter( ( id ) => undefined !== mark.lengths[ id ] && mark.lengths[ id ] !== lengths[ id ] )
                .sort( newest )
        };
    }

    public byId( messageId: string ): Locator {
        return this.page.locator( `li[id="${ messageId }"]` );
    }

    /**
     * `timeout` for the few answers that are not the bot thinking but the bot waiting - a claim is
     * offered when the owner has been gone long enough, and long enough is a minute.
     */
    public async waitForReply( mark: TMessageMark, timeout: number = E2E_TIMEOUTS.BOT_REPLY_MS ): Promise<Locator> {
        const started = Date.now();

        const deadline = started + timeout;

        while ( Date.now() < deadline ) {
            const { arrived, changed } = await this.newerThan( mark );

            // An edited message is only believed once nothing has arrived for a while, so a genuine
            // reply always wins over a re-render that happened to look like one.
            const acceptChanged = Date.now() - started > timeout / 2;

            for ( const id of acceptChanged ? [ ...arrived, ...changed ] : arrived ) {
                const message = this.byId( id );

                if ( await this.isFromApplication( message ) && await this.hasSettled( message ) ) {
                    return message;
                }
            }

            await this.page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        throw new Error(
            `${ this.applicationName } did not answer within ${ E2E_TIMEOUTS.BOT_REPLY_MS }ms - no message ` +
            "arrived after the mark, and none already on screen changed."
        );
    }

    public async isEphemeral( message: Locator ): Promise<boolean> {
        return message.locator( DISCORD_DOM.EPHEMERAL_MARKER ).first().isVisible().catch( () => false );
    }

    public embedTitle( message: Locator ): Locator {
        return message.locator( DISCORD_DOM.EMBED_TITLE ).first();
    }

    public embedDescription( message: Locator ): Locator {
        return message.locator( DISCORD_DOM.EMBED_DESCRIPTION ).first();
    }

    public async expectEmbedTitle( message: Locator, expectedTitle: string ): Promise<void> {
        await expect( this.embedTitle( message ) ).toBeVisible( { timeout: E2E_TIMEOUTS.BOT_REPLY_MS } );

        const actual = await this.embedTitle( message ).innerText();

        expect(
            matchesCopy( actual, expectedTitle ),
            `expected "${ normalizeDiscordText( expectedTitle ) }", got "${ normalizeDiscordText( actual ) }"`
        ).toBe( true );
    }

    public async expectEmbedDescription( message: Locator, expectedTemplate: string ): Promise<void> {
        const actual = normalizeDiscordText( await this.embedDescription( message ).innerText() );

        expect( actual ).toMatch( templateToPattern( expectedTemplate ) );
    }

    public componentButton( message: Locator, emojiName: string ): Locator {
        return message.locator( DISCORD_DOM.MESSAGE_ACCESSORIES ).locator( componentEmojiSelector( emojiName ) );
    }

    /**
     * A button by its words, with the emoji taken off first.
     *
     * A label like "Edit ✏️" reaches discord as text plus an `<img>`, and the accessible name the
     * browser builds from that is not the string the language file holds - so matching the label
     * verbatim finds nothing. The words are the stable part.
     *
     * Scoped to the message's own buttons rather than to everything in it that answers to the button
     * role. An embed drawing a custom emoji draws a button too - `:EditChannelMessage:` is one - and
     * it is named after the emoji, so a label as ordinary as "Edit" matches the emoji in the title
     * before the button underneath it. Pressing that opens discord's "this emoji is from…" popout,
     * which is a dialog with no fields, and the test that follows waits out its timeout for a modal
     * that was never asked for.
     */
    public labelledButton( message: Locator, label: string ): Locator {
        return message
            .locator( DISCORD_DOM.MESSAGE_ACCESSORIES )
            .locator( DISCORD_DOM.COMPONENT_BUTTON )
            .filter( { hasText: normalizeDiscordText( label ) } );
    }

    public async componentLabels( message: Locator ): Promise<string[]> {
        return message
            .locator( DISCORD_DOM.MESSAGE_ACCESSORIES )
            .locator( DISCORD_DOM.COMPONENT_BUTTON )
            .evaluateAll( ( elements: Element[] ) =>
                elements.map( ( element ) => {
                    // The label wins where there is one. Only v3's control panel draws buttons with no
                    // text at all, and for those the emoji's name is the only thing identifying them -
                    // but a button carrying both, like the feedback buttons, is known by what it says.
                    const label = ( element as HTMLElement ).innerText.trim();

                    return label || element.querySelector( "img.emoji" )?.getAttribute( "alt" ) || "";
                } ) );
    }

    public selectMenus( message: Locator ): Locator {
        return message.locator( DISCORD_DOM.MESSAGE_ACCESSORIES ).locator( DISCORD_DOM.SELECT_MENU );
    }

    /**
     * A select by position, for a screen where the one wanted already holds a value.
     *
     * Position is the order the bot's elements group declares, which is a property of the interface
     * rather than of a translation - unlike an option's position inside a menu, which the language
     * files fall back to and which `selectOptionLabel()` exists to avoid.
     */
    public selectMenuAt( message: Locator, index: number ): Locator {
        return this.selectMenus( message ).nth( index );
    }

    /**
     * A select by its placeholder - which only works while nothing is selected.
     *
     * Discord draws the chosen value in place of the placeholder, so the language menu reads
     * "🇺🇸 English" and the wizard's button menu reads out all fourteen buttons. Matching on the
     * placeholder finds neither. This returns the placeholder match where there is one, and otherwise
     * the only select on the screen; anything else is ambiguous and says so.
     */
    public selectMenu( message: Locator, placeholder: string ): Locator {
        return this.selectMenus( message ).filter( { hasText: normalizeDiscordText( placeholder ) } ).first();
    }

    /**
     * A user select - `ComponentType.UserSelect`, which discord fills from the guild's member list
     * rather than from options the bot writes.
     *
     * The web client draws it with a widget that shares none of the string select's shape: no
     * `aria-haspopup="listbox"`, which is exactly why `SELECT_MENU` never saw it and why transfer,
     * invite and the access menus could not be reached.
     *
     * The client draws it as a `combobox` whose **accessible name** is the placeholder:
     *
     *     - combobox "\u{1F44D} Grant Access"
     *     - button "Open"
     *
     * So it is addressed by role and name, not by text: the placeholder is the name, never rendered
     * text, and `getByText` finds nothing at all. Role and name are also the part of a widget least
     * likely to move under a redesign - unlike the class names and the `aria-haspopup` shape that
     * `SELECT_MENU` had to be pinned to.
     *
     * `getByRole` matches a name by substring, so the placeholder matches with its emoji stripped,
     * which is what the catalog hands over. Like `selectMenu()`, this only finds a picker that still
     * shows its placeholder; once a member is chosen the widget names them instead.
     */
    public userSelectMenu( message: Locator, placeholder: string ): Locator {
        return message
            .locator( DISCORD_DOM.MESSAGE_ACCESSORIES )
            .getByRole( "combobox", { name: normalizeDiscordText( placeholder ) } )
            .first();
    }

    /**
     * Whether the menu carrying this placeholder is a user select rather than a string select.
     *
     * Asked so `chooseOption()` can send a member name down the path that can pick one, without the
     * four call sites having to know which kind of menu the bot put on the screen.
     */
    public async isUserSelect( message: Locator, placeholder: string ): Promise<boolean> {
        if ( await this.selectMenus( message ).filter( { hasText: normalizeDiscordText( placeholder ) } ).count() ) {
            return false;
        }

        return 0 < await this.userSelectMenu( message, placeholder ).count();
    }

    public async resolveSelectMenu( message: Locator, placeholder: string ): Promise<Locator> {
        const byPlaceholder = this.selectMenu( message, placeholder );

        if ( await byPlaceholder.count() ) {
            return byPlaceholder;
        }

        const menus = this.selectMenus( message );

        const total = await menus.count();

        if ( 1 === total ) {
            return menus.first();
        }

        // Last, and only where this used to throw: a user select is not a string select and none of
        // the above can see it. Reached here rather than from `selectMenu()` on purpose - embeds sit
        // inside the accessories too, so matching the placeholder as text is safe as a last resort
        // and not safe as the first thing tried.
        const asUserSelect = this.userSelectMenu( message, placeholder );

        if ( await asUserSelect.count() ) {
            return asUserSelect;
        }

        const shown = await menus.evaluateAll( ( elements: Element[] ) =>
            elements.map( ( element ) => ( element as HTMLElement ).innerText.trim() ) );

        throw new Error(
            `No select menu showing "${ normalizeDiscordText( placeholder ) }", and ${ total } to choose ` +
            "between - a menu that already holds a value draws the value instead of its placeholder.\n" +
            `What this screen shows:\n${ shown.map( ( text, index ) => `    [${ index }] ${ text }` ).join( "\n" ) || "    no select menus" }\n` +
            "Address it with selectMenuAt( message, index ) when the placeholder cannot be seen."
        );
    }

    public async chooseOption( message: Locator, placeholder: string, optionLabel: string ): Promise<void> {
        if ( await this.isUserSelect( message, placeholder ) ) {
            return this.chooseMember( message, placeholder, optionLabel );
        }

        await ( await this.resolveSelectMenu( message, placeholder ) ).click();

        const option = () => this.page
            .locator( DISCORD_DOM.SELECT_MENU_OPTION )
            .filter( { hasText: normalizeDiscordText( optionLabel ) } )
            .first();

        try {
            await option().waitFor( { state: "visible", timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );
        } catch {
            throw new Error(
                `No option matching "${ normalizeDiscordText( optionLabel ) }" under "${ placeholder }".\n` +
                `What the menu offered:\n${ ( await this.optionLabels() ).map( ( label ) => `    ${ label }` ).join( "\n" ) || "    nothing" }`
            );
        }

        await this.clickOption( option );

        await this.dismissPickerIfStillOpen();
    }

    /**
     * Clicks an option, re-resolving it each time.
     *
     * A menu redraws while it is open - discord fills the generator picker as the guild's channels
     * arrive - so the row found a moment ago is often torn out from under the click, and playwright
     * reports a timeout waiting for an element that was there when it was asked for. Holding the
     * locator rather than the element is what makes a second attempt meaningful.
     */
    private async clickOption( option: () => Locator ): Promise<void> {
        for ( let attempt = 1; ; attempt++ ) {
            try {
                await option().click( { timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );
                return;
            } catch( error ) {
                if ( 3 === attempt ) {
                    throw error;
                }

                await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );
            }
        }
    }

    /**
     * Pick a member out of a user select.
     *
     * Different from `chooseOption()` in what it is matching: a string select offers what the bot
     * wrote, so the label is known from the language files. A user select offers the guild's members,
     * so the label is a member's display name and the list is discord's - long enough that the member
     * wanted may not be drawn until the picker is filtered.
     *
     * So it looks first and types only if it has to. Typing unconditionally would be the simpler
     * code and the worse idea: if the popup never took focus the characters land on the page, where
     * discord reads them as shortcuts.
     */
    public async chooseMember( message: Locator, placeholder: string, memberName: string ): Promise<void> {
        const menu = await this.resolveSelectMenu( message, placeholder );

        await menu.click();

        const anyOption = this.page.locator( DISCORD_DOM.SELECT_MENU_OPTION ).first();

        const option = () => this.page
            .locator( DISCORD_DOM.SELECT_MENU_OPTION )
            .filter( { hasText: normalizeDiscordText( memberName ) } )
            .first();

        // Wait for the list itself before looking for anybody in it. The popout opens empty and fills
        // a moment later, so a row found too early belongs to a list that is about to be redrawn - and
        // the click then lands on an element that has just been torn out.
        await anyOption
            .waitFor( { state: "visible", timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } )
            .catch( () => undefined );

        await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );

        if ( ! await option().count() ) {
            // Typed into the picker's own input rather than at the page: the control is a real input,
            // and addressing it directly is what makes this a search instead of a stray keystroke.
            await menu.pressSequentially( memberName, { delay: 60 } );

            try {
                await option().waitFor( { state: "visible", timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );

                await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );
            } catch {
                throw new Error(
                    `No member matching "${ normalizeDiscordText( memberName ) }" under "${ placeholder }", ` +
                    "before or after filtering.\n" +
                    `What the picker offered:\n${ ( await this.optionLabels() ).map( ( label ) => `    ${ label }` ).join( "\n" ) || "    nothing" }\n` +
                    "A user select can only offer members this client has cached - see ensureMembersLoaded()."
                );
            }
        }

        // The list redraws as the search settles, so the row is re-resolved on each attempt.
        await this.clickOption( option );

        await this.dismissPickerIfStillOpen();
    }

    /**
     * Closes a picker that is still open, and does nothing when it has closed itself.
     *
     * Escape is not free here. A user select closes the moment a member is chosen, so the keypress
     * falls through to the message underneath - and an ephemeral answers escape by dismissing itself.
     * The screen the test is about then leaves the dom, and what gets reported is an embed title that
     * never arrived, twenty seconds later, pointing at the assertion rather than at the keypress.
     */
    private async dismissPickerIfStillOpen(): Promise<void> {
        const stillOpen = await this.page
            .locator( DISCORD_DOM.SELECT_MENU_OPTION )
            .first()
            .isVisible()
            .catch( () => false );

        if ( stillOpen ) {
            await this.page.keyboard.press( "Escape" );
        }
    }

    /**
     * For a menu whose options the bot writes at run time - the generator picker labels its entries
     * `Master Channel #1`, which is neither the channel's name nor anything in the language files, so
     * there is nothing to match on. Returns what it picked, so a test can still say which.
     */
    public async chooseFirstOption( message: Locator, placeholder: string ): Promise<string> {
        await ( await this.resolveSelectMenu( message, placeholder ) ).click();

        const option = this.page.locator( DISCORD_DOM.SELECT_MENU_OPTION ).first();

        await option.waitFor( { state: "visible", timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );

        const label = await option.innerText();

        await option.click();

        await this.page.keyboard.press( "Escape" );

        return normalizeDiscordText( label );
    }

    /**
     * What a menu offers, without choosing any of it.
     */
    public async optionLabelsOf( message: Locator, placeholder: string ): Promise<string[]> {
        await ( await this.resolveSelectMenu( message, placeholder ) ).click();

        await this.page
            .locator( DISCORD_DOM.SELECT_MENU_OPTION )
            .first()
            .waitFor( { state: "visible", timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );

        const labels = await this.optionLabels();

        await this.page.keyboard.press( "Escape" );

        return labels;
    }

    public async optionLabels(): Promise<string[]> {
        return this.page
            .locator( DISCORD_DOM.SELECT_MENU_OPTION )
            .evaluateAll( ( elements: Element[] ) =>
                elements.map( ( element ) => ( element as HTMLElement ).innerText.trim() ) );
    }

    public async dismiss( message: Locator ): Promise<void> {
        const dismiss = message.getByText( DISCORD_TEXT.DISMISS_EPHEMERAL, { exact: false } );

        if ( await dismiss.isVisible().catch( () => false ) ) {
            await dismiss.click();
        }
    }

    private async isFromApplication( message: Locator ): Promise<boolean> {
        const author = message.locator( DISCORD_DOM.MESSAGE_AUTHOR ).first();

        if ( await author.isVisible().catch( () => false ) ) {
            const name = await author.innerText();

            return name.includes( this.applicationName );
        }

        return message.locator( DISCORD_DOM.MESSAGE_ACCESSORIES ).first().isVisible().catch( () => false );
    }

    /**
     * Discord draws the interaction's header before the answer itself arrives, so a message can be the
     * bot's and still be empty. Waiting for something to read avoids handing back a shell that fills in
     * a moment later - or never, when the bot fell over.
     */
    private async hasSettled( message: Locator ): Promise<boolean> {
        const text = await message.innerText().catch( () => "" );

        if ( ! text || text.includes( THINKING_MARKER ) ) {
            return false;
        }

        const hasEmbed = await this.embedTitle( message ).isVisible().catch( () => false );

        const hasComponents = await message
            .locator( DISCORD_DOM.MESSAGE_ACCESSORIES )
            .first()
            .isVisible()
            .catch( () => false );

        return hasEmbed || hasComponents;
    }
}
