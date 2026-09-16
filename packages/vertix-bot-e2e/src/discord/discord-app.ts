import { expect } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM, channelItemSelector } from "@vertix.gg/bot-e2e/src/discord/discord-dom";
import { DiscordChannels } from "@vertix.gg/bot-e2e/src/discord/discord-channels";
import { DiscordCommands } from "@vertix.gg/bot-e2e/src/discord/discord-commands";
import { DiscordMessages } from "@vertix.gg/bot-e2e/src/discord/discord-messages";
import { DiscordModal } from "@vertix.gg/bot-e2e/src/discord/discord-modal";
import { DiscordVoice } from "@vertix.gg/bot-e2e/src/discord/discord-voice";
import { signedInAccountId } from "@vertix.gg/bot-e2e/src/discord/account-check";

import type { Page } from "@playwright/test";

/**
 * The discord client, as the suite sees it.
 *
 * One object per test, holding the collaborators that each know one part of the client - the
 * sidebar, the message list, the command box, a modal, the voice connection. Nothing here knows
 * anything about vertix; what the bot is expected to do lives in the tests, and what it says lives in
 * the catalog.
 */
export class DiscordApp {
    public readonly channels: DiscordChannels;

    public readonly messages: DiscordMessages;

    public readonly commands: DiscordCommands;

    public readonly modal: DiscordModal;

    public readonly voice: DiscordVoice;

    private membersLoaded = false;

    public constructor( public readonly page: Page, accountId: string | null = signedInAccountId() ) {
        this.channels = new DiscordChannels( page );

        this.messages = new DiscordMessages( page, E2EConfig.$.applicationName );

        this.commands = new DiscordCommands( page, E2EConfig.$.applicationName, this.messages );

        this.modal = new DiscordModal( page );

        this.voice = new DiscordVoice( page, this.channels, accountId );

        this.channels.guardVoiceWith( () => this.voice.isConnected() );
    }

    /**
     * Waits for the navigation to commit rather than for the document to finish loading.
     *
     * The discord client keeps fetching long after it is usable, and a second client booting beside
     * the first is slower still - slow enough that `domcontentloaded` outran its own timeout and the
     * second member's tests failed before they began. What matters is not that loading finished but
     * that the guild is on screen, which is the wait below.
     */
    public async openGuild(): Promise<void> {
        await this.page.goto( E2EConfig.$.guildUrl, { waitUntil: "commit" } );

        await expect( this.page.locator( DISCORD_DOM.GUILDS_NAV ) ).toBeVisible( {
            timeout: E2E_TIMEOUTS.APP_READY_MS
        } );

        // The servers rail arrives long before the guild it points at. Waiting only for the rail let a
        // cold client report itself ready while its channel list was still a spinner, and whatever
        // looked for a channel next found nothing and blamed the channel.
        //
        // Waited on by name, not by "any channel row": the first row in that list is a hidden focus
        // target for Events, which is never visible and never will be.
        await expect( this.page.locator( channelItemSelector( E2EConfig.$.commandChannelId ) ).first() ).toBeVisible( {
            timeout: E2E_TIMEOUTS.APP_READY_MS
        } );
    }

    public async openCommandChannel(): Promise<void> {
        await this.channels.open( E2EConfig.$.commandChannelId );
    }

    /**
     * Makes the guild's members known to this client, once per session.
     *
     * A user select offers only the members the client has already cached - itself, whoever it has
     * seen speak, and the applications. Everyone else is missing from the list *and* from the search,
     * which answers "No results found" rather than asking the server. So inviting a member who has
     * not been seen yet is impossible, while transferring to one sitting in the channel works, and
     * the difference looks like a broken picker rather than an empty cache.
     *
     * Showing the member list is what a person does without noticing; it fetches the roster and the
     * picker can offer everyone from then on. Done here, at the command channel, rather than inside
     * `chooseMember()`: by the time a picker is open the client is in a voice channel's chat, and
     * going anywhere else to fetch a roster would take the screen under test with it.
     */
    public async ensureMembersLoaded(): Promise<void> {
        if ( this.membersLoaded ) {
            return;
        }

        this.membersLoaded = true;

        await this.openCommandChannel();

        const toggle = this.page.locator( DISCORD_DOM.MEMBER_LIST_TOGGLE ).first();

        if ( ! await toggle.count() ) {
            return;
        }

        if ( "Show Member List" === await toggle.getAttribute( "aria-label" ) ) {
            await toggle.click();
        }

        await this.page
            .locator( DISCORD_DOM.MEMBER_LIST_ITEM )
            .first()
            .waitFor( { state: "visible", timeout: E2E_TIMEOUTS.CHAT_VISIBLE_MS } )
            .catch( () => undefined );
    }

    /**
     * Puts the client back to a state the next test can start from.
     *
     * One browser is shared by the whole run, so whatever a test leaves on screen is what the next one
     * begins with - and a modal or a popover left open swallows its first click. The symptom is not a
     * failing assertion but a command whose answer never arrives, twenty seconds later, in a test that
     * passes perfectly well on its own.
     */
    public async settle(): Promise<void> {
        if ( await this.modal.isOpen() ) {
            await this.modal.cancel().catch( () => undefined );
        }

        await this.page.keyboard.press( "Escape" ).catch( () => undefined );

        await this.dismissInterruptions();
    }

    /**
     * Closes whatever discord has put over the app.
     *
     * Discord shows its own popups - a game-servers promotion is what found this - and they sit in
     * the layer container over everything, swallowing the clicks meant for the channel list beneath.
     * Escape does not close them. The symptom is not an overlay anybody sees: it is a channel that
     * will not open and a command list that offers "nothing at all", on one account and not the other,
     * which reads like that account having lost its permissions.
     *
     * Only the close control is pressed. The other button belongs to the promotion.
     */
    public async dismissInterruptions(): Promise<void> {
        for ( let attempt = 1; attempt <= 3; attempt++ ) {
            const dialog = this.page.locator( DISCORD_DOM.DIALOG ).first();

            if ( ! await dialog.isVisible().catch( () => false ) ) {
                return;
            }

            const close = dialog.locator( DISCORD_DOM.DIALOG_CLOSE ).first();

            if ( ! await close.count() ) {
                return;
            }

            await close.click( { timeout: E2E_TIMEOUTS.ACTION_MS } ).catch( () => undefined );

            await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );
        }
    }
}
