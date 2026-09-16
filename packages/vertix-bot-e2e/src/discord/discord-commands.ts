import { expect } from "@playwright/test";

import { E2E_RETRIES, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM } from "@vertix.gg/bot-e2e/src/discord/discord-dom";

import type { DiscordMessages, TMessageMark } from "@vertix.gg/bot-e2e/src/discord/discord-messages";
import type { Locator, Page } from "@playwright/test";

export interface ICommandTarget {
    group: string | null;
    name: string;
}

interface IOfferedRow {
    command: string;
    application: string;
}

/**
 * Typing a slash command the way a member does.
 *
 * Two things here are not optional.
 *
 * The row is matched on the application that published it as well as on the command. A test guild
 * with three other voice-channel bots in it offers four `/help` rows and two `/voice claim` rows, and
 * the one discord highlights by default is not necessarily ours - so nothing is ever sent by pressing
 * enter on whatever happened to be selected.
 *
 * And the query is retyped rather than waited on. Discord does not have the guild's application
 * commands when a fresh session first opens - typing `/` on a cold client lists only its own built-in
 * commands - and once it has answered a query from that empty list it will sit on "no results"
 * indefinitely rather than asking again. Waiting longer does not help; typing again does.
 */
export class DiscordCommands {
    public constructor(
        private readonly page: Page,
        private readonly applicationName: string,
        private readonly messages: DiscordMessages
    ) {}

    public static textOf( target: ICommandTarget ): string {
        return target.group ? `/${ target.group } ${ target.name }` : `/${ target.name }`;
    }

    public async send( target: ICommandTarget ): Promise<TMessageMark> {
        const mark = await this.messages.mark();

        const row = await this.findOwnCommand( target );

        await row.click();

        await expect( this.page.locator( DISCORD_DOM.COMMAND_CHIP ).first() ).toBeVisible( {
            timeout: E2E_TIMEOUTS.MODAL_OPEN_MS
        } );

        await this.submit();

        return mark;
    }

    public async run( target: ICommandTarget ): Promise<Locator> {
        const mark = await this.send( target );

        return this.messages.waitForReply( mark );
    }

    private async findOwnCommand( target: ICommandTarget ): Promise<Locator> {
        const row = this.ownCommandRow( target );

        for ( let attempt = 0; attempt < E2E_RETRIES.COMMAND_SEARCH; attempt++ ) {
            await this.type( DiscordCommands.textOf( target ) );

            try {
                await row.waitFor( { state: "visible", timeout: E2E_TIMEOUTS.COMMAND_SEARCH_MS } );

                return row;
            } catch {
                await this.page.keyboard.press( "Escape" );
            }
        }

        throw new Error( await this.describeMiss( target ) );
    }

    /**
     * Sending, and making sure it went.
     *
     * Enter is pressed on the composer rather than on the page: choosing a row from the autocomplete is
     * a click, and a click can leave focus somewhere the keypress never reaches. The composer emptying
     * is the proof it was sent - without that check a command that silently never left looks exactly
     * like a bot that never answered, twenty seconds later and in the wrong place.
     */
    private async submit(): Promise<void> {
        const box = this.page.locator( DISCORD_DOM.MESSAGE_BOX ).first();

        const chip = this.page.locator( DISCORD_DOM.COMMAND_CHIP ).first();

        for ( let attempt = 0; attempt < E2E_RETRIES.COMMAND_SEARCH; attempt++ ) {
            await box.press( "Enter" );

            const sent = await chip
                .waitFor( { state: "detached", timeout: E2E_TIMEOUTS.COMMAND_SEARCH_MS } )
                .then( () => true )
                .catch( () => false );

            if ( sent ) {
                return;
            }
        }

        throw new Error(
            "The command was built in the composer but never sent - pressing enter left it there."
        );
    }

    private async type( commandText: string ): Promise<void> {
        const box = this.page.locator( DISCORD_DOM.MESSAGE_BOX ).first();

        await box.click();

        await this.page.keyboard.press( "ControlOrMeta+A" );

        await this.page.keyboard.press( "Backspace" );

        await box.pressSequentially( commandText );
    }

    private ownCommandRow( target: ICommandTarget ): Locator {
        const commandText = DiscordCommands.textOf( target );

        return this.page
            .locator( DISCORD_DOM.AUTOCOMPLETE_OPTION )
            .filter( { has: this.page.locator( `${ DISCORD_DOM.AUTOCOMPLETE_TITLE }:text-is("${ commandText }")` ) } )
            .filter( { has: this.page.locator( `${ DISCORD_DOM.AUTOCOMPLETE_SOURCE }:text-is("${ this.applicationName }")` ) } )
            .first();
    }

    /**
     * What discord was offering instead. Without this the failure is "a locator was not visible",
     * which cannot tell apart a bot that is gone, a caller who may not run the command, and a client
     * that never loaded the list.
     */
    private async describeMiss( target: ICommandTarget ): Promise<string> {
        const offered: IOfferedRow[] = await this.page
            .locator( DISCORD_DOM.AUTOCOMPLETE_OPTION )
            .evaluateAll( ( elements: Element[], selectors: { title: string; source: string } ) =>
                elements.map( ( element ) => ( {
                    command: element.querySelector( selectors.title )?.textContent ?? "",
                    application: element.querySelector( selectors.source )?.textContent ?? ""
                } ) ),
            { title: DISCORD_DOM.AUTOCOMPLETE_TITLE, source: DISCORD_DOM.AUTOCOMPLETE_SOURCE } );

        const commandText = DiscordCommands.textOf( target );

        const listing = offered.length
            ? offered.map( ( entry ) => `    ${ entry.command }  (${ entry.application })` ).join( "\n" )
            : "    nothing at all";

        const fromOtherApps = offered.filter( ( entry ) => entry.command === commandText );

        const diagnosis = fromOtherApps.length
            ? `Other applications offer ${ commandText }, so the client is loaded and ${ this.applicationName } is not among them.`
            : `No application offered ${ commandText }.`;

        return (
            `${ this.applicationName } did not offer ${ commandText } after ` +
            `${ E2E_RETRIES.COMMAND_SEARCH } attempts.\n\n` +
            `${ diagnosis }\n\n` +
            "Discord hides a command from anyone who may not run it, so the usual causes are that the " +
            "signed-in account lacks the permissions the command declares, or that the application has " +
            "not registered it.\n\n" +
            `What discord offered:\n${ listing }\n`
        );
    }
}
