import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM } from "@vertix.gg/bot-e2e/src/discord/discord-dom";
import { DiscordRest } from "@vertix.gg/bot-e2e/src/discord/discord-rest";

import type { DiscordChannels } from "@vertix.gg/bot-e2e/src/discord/discord-channels";
import type { Page } from "@playwright/test";

/**
 * Joining and leaving voice, which is how every dynamic channel in this suite comes into existence.
 *
 * Whether the join worked is asked of discord, not of the page. The client draws a connection several
 * ways - a call view, a panel above the user area, a highlighted row - and the bot moves the member
 * into a different channel the instant they arrive in a generator, so the one question with a stable
 * answer is which channel discord thinks this account is sitting in.
 */
export class DiscordVoice {
    private readonly rest: DiscordRest;

    public constructor(
        private readonly page: Page,
        private readonly channels: DiscordChannels,
        public readonly accountId: string | null
    ) {
        this.rest = new DiscordRest( E2EConfig.$.botToken );
    }

    public async join( channelId: string ): Promise<void> {
        const item = await this.channels.select( channelId );

        await item.scrollIntoViewIfNeeded();

        await item.click();

        await this.waitForConnected();
    }

    public async connectedChannelId(): Promise<string | null> {
        if ( ! this.accountId ) {
            return null;
        }

        const state = await this.rest.voiceState( E2EConfig.$.guildId, this.accountId );

        return state?.channel_id ?? null;
    }

    public async isConnected(): Promise<boolean> {
        if ( this.accountId ) {
            return null !== await this.connectedChannelId();
        }

        return this.page.locator( DISCORD_DOM.VOICE_PANEL ).first().isVisible().catch( () => false );
    }

    public async waitForConnected(): Promise<string> {
        const deadline = Date.now() + E2E_TIMEOUTS.VOICE_CONNECT_MS;

        while ( Date.now() < deadline ) {
            const channelId = await this.connectedChannelId();

            if ( channelId ) {
                return channelId;
            }

            await this.page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        throw new Error(
            `The signed-in account did not join voice within ${ E2E_TIMEOUTS.VOICE_CONNECT_MS }ms. ` +
            "Clicking the channel in the sidebar did not connect it - check that the browser was " +
            "started with a fake microphone and that the account may connect to that channel."
        );
    }

    /**
     * Leaving the way a member does, then making sure. The button carries a translated label and the
     * guild's language is something these tests change, so discord is asked whether the account is
     * still in voice and moved out directly if it is.
     */
    public async disconnect(): Promise<void> {
        // Asked first because the usual answer is no. Every test's fixture leaves voice on the way
        // out and most of them never joined, and `waitForDisconnected()` settles for a second and a
        // half before it answers - a pause that exists to let the client catch up with a
        // disconnection that happened, and buys nothing for one that did not.
        if ( ! await this.isConnected() ) {
            return;
        }

        const button = this.page.locator( DISCORD_DOM.VOICE_DISCONNECT ).first();

        if ( await button.isVisible().catch( () => false ) ) {
            await button.click().catch( () => undefined );
        }

        if ( await this.waitForDisconnected() ) {
            return;
        }

        if ( this.accountId ) {
            await this.rest.disconnectMember( E2EConfig.$.guildId, this.accountId );

            await this.waitForDisconnected();
        }
    }

    private async waitForDisconnected(): Promise<boolean> {
        const deadline = Date.now() + E2E_TIMEOUTS.VOICE_CONNECT_MS / 3;

        while ( Date.now() < deadline ) {
            if ( ! await this.isConnected() ) {
                await this.page.waitForTimeout( E2E_INTERVALS.SETTLE_MS );

                return true;
            }

            await this.page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        return false;
    }
}
