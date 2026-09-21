import { expect } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_RETRIES, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM, channelItemSelector } from "@vertix.gg/bot-e2e/src/discord/discord-dom";

import type { Locator, Page } from "@playwright/test";

/**
 * Getting to a channel.
 *
 * Two things had to be learned the hard way here.
 *
 * A text channel's url shows its messages; a voice channel's url does not - it shows a page offering
 * to join the call, and the chat is behind a toggle in the header. So selecting a channel and reading
 * its chat are two different things, and only the second waits for messages.
 *
 * And **a channel is reached by clicking it, never by navigating to it**, whenever the client already
 * has it on screen. `page.goto()` reloads the document, and a reload drops the voice connection -
 * discord says so itself, with a "you were in a voice channel last time you left" banner. One member
 * leaving a dynamic channel is the whole population of it, so the bot deletes the channel, and the
 * test that was about to open its chat finds nothing there. Navigating by url is the fallback for a
 * channel the sidebar has not drawn, which in practice means the first one of the run.
 */
export class DiscordChannels {
    private connectedCheck: ( () => Promise<boolean> ) | null = null;

    public constructor( private readonly page: Page ) {}

    /**
     * Told, rather than asked, so this stays a page object and does not grow a rest client of its own.
     */
    public guardVoiceWith( isConnected: () => Promise<boolean> ): void {
        this.connectedCheck = isConnected;
    }

    public item( channelId: string ): Locator {
        return this.page.locator( channelItemSelector( channelId ) ).first();
    }

    public async select( channelId: string ): Promise<Locator> {
        const item = this.item( channelId );

        // Waited for, not merely checked. A channel the bot made moments ago reaches the sidebar a
        // beat later, and the old check raced it - falling through to a reload that is both slow and,
        // in voice, destructive. Reloading is the last resort it was always meant to be.
        const drawn = await item
            .waitFor( { state: "visible", timeout: E2E_TIMEOUTS.CHAT_VISIBLE_MS } )
            .then( () => true )
            .catch( () => false );

        if ( drawn ) {
            await item.scrollIntoViewIfNeeded();

            await item.click();

            return item;
        }

        await this.assertReloadIsSafe( channelId );

        await this.page.goto( E2EConfig.$.channelUrl( channelId ), { waitUntil: "commit" } );

        return this.waitForItem( channelId );
    }

    /**
     * The one thing that must never happen while the member is in a voice channel.
     *
     * A reload is indistinguishable from leaving, and the member is the only one in their channel, so
     * the bot deletes it - taking the interface the test was about to press with it. That failure
     * arrives later and somewhere else, as a sidebar row that never appears, so it is stopped here
     * instead.
     */
    private async assertReloadIsSafe( channelId: string ): Promise<void> {
        if ( ! this.connectedCheck || ! await this.connectedCheck() ) {
            return;
        }

        throw new Error(
            `Refusing to reload the page to reach channel ${ channelId } while connected to voice.\n` +
            "A reload drops the voice connection, and a dynamic channel whose last member leaves is " +
            "deleted - so this would quietly destroy the channel under test.\n" +
            "Reach the channel by clicking its row in the sidebar, or leave voice first."
        );
    }

    /**
     * A cold discord client boots slowly enough to outlast the app-ready budget now and then, and it
     * comes back on its own if it is asked twice - so a channel that never draws its messages is
     * reloaded once before the failure is believed.
     */
    public async open( channelId: string ): Promise<void> {
        // Already looking at it, which is the common case: every test's fixture opens the command
        // channel and the one before it usually left the client sitting there. The url is read rather
        // than waited for, so a miss costs nothing and only a hit pays for `showsChannel()`.
        if ( this.page.url().endsWith( `/${ channelId }` ) && await this.showsChannel( channelId ) ) {
            await this.scrollToNewest();

            return;
        }

        const messages = this.page.locator( DISCORD_DOM.MESSAGE_LIST ).first();

        for ( let attempt = 1; attempt <= E2E_RETRIES.CHANNEL_OPEN; attempt++ ) {
            await this.dismissPopovers();

            await this.showChatOf( channelId );

            if ( await this.showsChannel( channelId ) ) {
                await this.scrollToNewest();

                return;
            }

            await this.revealChat( channelId );

            if ( await this.showsChannel( channelId ) ) {
                await this.scrollToNewest();

                return;
            }

            if ( attempt === E2E_RETRIES.CHANNEL_OPEN ) {
                await expect( messages ).toBeVisible( { timeout: E2E_TIMEOUTS.APP_READY_MS } );
            }
        }
    }

    /**
     * Clicking a voice channel's row is a request to *join* it, so for the channel the member is
     * already sitting in it does nothing at all - the view stays wherever it was, and the test goes
     * looking for an interface in the wrong channel. The row's own `Open Chat` button is the one that
     * navigates, and it exists only for voice channels, which is exactly the distinction needed.
     */
    private async showChatOf( channelId: string ): Promise<void> {
        const row = this.item( channelId );

        if ( ! await row.isVisible().catch( () => false ) ) {
            await this.select( channelId );

            return;
        }

        await row.scrollIntoViewIfNeeded();

        await row.hover().catch( () => undefined );

        const openChat = row.locator( DISCORD_DOM.ROW_OPEN_CHAT ).first();

        if ( await openChat.count() ) {
            await openChat.click().catch( () => undefined );

            return;
        }

        await row.click();
    }

    /**
     * Discord advertises things over its own interface - a boost promo, a badge pack - and a popover
     * sitting over the sidebar swallows the click meant for a channel. Escape closes them and does
     * nothing when there is none.
     */
    private async dismissPopovers(): Promise<void> {
        await this.page.keyboard.press( "Escape" ).catch( () => undefined );
    }

    public async waitForItem( channelId: string ): Promise<Locator> {
        const item = this.item( channelId );

        await expect( item ).toBeVisible( { timeout: E2E_TIMEOUTS.DYNAMIC_CHANNEL_CREATE_MS } );

        return item;
    }

    public async sidebarIds(): Promise<string[]> {
        return this.page.$$eval( "[data-list-item-id^=\"channels___\"]", ( elements: Element[] ) =>
            elements
                .map( ( element ) => element.getAttribute( "data-list-item-id" ) ?? "" )
                .map( ( value ) => value.replace( "channels___", "" ) )
                .filter( ( value ) => /^\d+$/.test( value ) ) );
    }

    /**
     * A channel does not necessarily open at its newest message.
     *
     * Discord restores where the reader left off, and it drops messages far from the viewport out of
     * the dom entirely - so a channel opened at an unread marker from days ago has none of today's
     * messages on screen, and a reply that arrives at the bottom is invisible. The symptom is a bot
     * that answered perfectly well and a test that waits out its timeout swearing it did not.
     */
    private async scrollToNewest(): Promise<void> {
        const jump = this.page.locator( DISCORD_DOM.JUMP_TO_PRESENT ).first();

        let moved = false;

        if ( await jump.isVisible().catch( () => false ) ) {
            await jump.click().catch( () => undefined );

            moved = true;
        }

        const scrolled = await this.page.evaluate( ( listSelector: string ) => {
            // Walked up by what actually scrolls rather than by class name: the message list itself is
            // `scrollerInner`, which matches any sensible class guess and scrolls nothing. Its
            // scrollable ancestor is the one with content taller than itself.
            let node = document.querySelector( listSelector )?.parentElement ?? null;

            while ( node && node.scrollHeight <= node.clientHeight ) {
                node = node.parentElement;
            }

            if ( ! node ) {
                return false;
            }

            const before = node.scrollTop;

            node.scrollTop = node.scrollHeight;

            return node.scrollTop !== before;
        }, DISCORD_DOM.MESSAGE_LIST );

        // Only when something actually moved. The settle is for discord redrawing after a jump, and
        // the list is usually already at the bottom - every test's fixture opens the command channel
        // it is already looking at, and each one was paying a second and a half to scroll nowhere.
        if ( moved || scrolled ) {
            await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );
        }
    }

    /**
     * Messages on screen, **and** they belong to the channel that was asked for.
     *
     * Checking only that a message list is visible is no check at all: the client is nearly always
     * already showing some channel, so a click that failed to navigate looked like a success and the
     * test went looking for a panel in whatever channel it happened to be left in. The url is the one
     * thing that says where the client actually is.
     */
    private async showsChannel( channelId: string ): Promise<boolean> {
        const arrived = await this.page
            .waitForURL( ( url ) => url.pathname.endsWith( `/${ channelId }` ), { timeout: E2E_TIMEOUTS.CHAT_VISIBLE_MS } )
            .then( () => true )
            .catch( () => false );

        if ( ! arrived ) {
            return false;
        }

        return this.page
            .locator( DISCORD_DOM.MESSAGE_LIST )
            .first()
            .waitFor( { state: "visible", timeout: E2E_TIMEOUTS.CHAT_VISIBLE_MS } )
            .then( () => true )
            .catch( () => false );
    }

    /**
     * A voice channel's chat is hidden behind a toggle, and that is where the bot puts the channel's
     * own interface - so every panel this suite presses is behind this click.
     *
     * Two ways in: the toggle on the call view itself, whose label carries the unread count
     * (`Show Chat, 1 mention, unread`), and the `Open Chat` button on the channel's row in the
     * sidebar, which only appears on hover. The first is preferred because it names the channel being
     * looked at; the second is scoped to a row and works when no call view is open.
     */
    private async revealChat( channelId: string ): Promise<void> {
        const toggle = this.page.locator( DISCORD_DOM.SHOW_CHAT_TOGGLE ).first();

        if ( await toggle.count() ) {
            await toggle.click().catch( () => undefined );

            return;
        }

        const row = this.item( channelId );

        const openChat = row.locator( DISCORD_DOM.ROW_OPEN_CHAT ).first();

        if ( await openChat.count() ) {
            await row.hover().catch( () => undefined );

            await openChat.click().catch( () => undefined );
        }
    }
}
