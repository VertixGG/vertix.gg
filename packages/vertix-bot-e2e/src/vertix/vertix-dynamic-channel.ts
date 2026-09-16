import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { BOT_LIMITS, DISCORD_LIMITS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM } from "@vertix.gg/bot-e2e/src/discord/discord-dom";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import type { GuildState } from "@vertix.gg/bot-e2e/src/discord/guild-state";
import type { Locator } from "@playwright/test";

export type TInterfaceVersion = "v2" | "v3";

/**
 * When this worker last had the bot make somebody a channel.
 *
 * Module state rather than a fixture because the limit is the bot's and applies across every test in
 * the run, not within one of them.
 */
const lastCreatedAt = new Map<string, number>();

function sleep( milliseconds: number ): Promise<void> {
    return new Promise( ( resolve ) => setTimeout( resolve, milliseconds ) );
}

/**
 * Two limits are waited out here, and they belong to different people.
 *
 * The bot's own is the shorter: it refuses to make a member a second channel within ten seconds, and
 * says so on screen. Discord's is the longer and is about the other end - every channel opened here
 * is a channel deleted later, and deleting is what gets limited. Waiting before opening is what
 * spaces the deletions, because by the time the next one is opened the last has been taken away.
 *
 * Both are measured from the same moment, so the wait is whichever is still outstanding.
 */
async function waitOutChannelLimits( accountId: string ): Promise<void> {
    const previous = lastCreatedAt.get( accountId );

    if ( undefined === previous ) {
        return;
    }

    const since = Date.now() - previous;

    const wait = Math.max(
        BOT_LIMITS.DYNAMIC_CHANNEL_CREATE_THROTTLE_MS + BOT_LIMITS.CREATE_THROTTLE_MARGIN_MS - since,
        DISCORD_LIMITS.CHANNEL_OPEN_SPACING_MS - since
    );

    if ( wait > 0 ) {
        await sleep( wait );
    }
}

export interface IDynamicChannelHandle {
    channelId: string;
    name: string;
    generatorId: string;
    version: TInterfaceVersion;
}

/**
 * A channel of one's own.
 *
 * Joining a generator is the only way a member gets one, so that is how the suite gets one too. The
 * channel that appears is found by asking discord which voice channels exist now that did not
 * before, rather than by reading the sidebar, because the bot moves the member into the new channel
 * at the same moment it creates it and the two events race in the client.
 */
export class VertixDynamicChannel {
    public constructor( private readonly app: DiscordApp, private readonly guild: GuildState ) {}

    public async open( generatorId: string, version: TInterfaceVersion = "v3" ): Promise<IDynamicChannelHandle> {
        const accountId = this.app.voice.accountId ?? "unknown";

        await waitOutChannelLimits( accountId );

        const knownVoiceIds = await this.guild.voiceChannelIds();

        await this.app.voice.join( generatorId );

        lastCreatedAt.set( accountId, Date.now() );

        const created = await this.guild.waitForNewVoiceChannel( knownVoiceIds );

        return { channelId: created.id, name: created.name, generatorId, version };
    }

    /**
     * Joining a generator without waiting to be handed the channel, for the tests that want to watch
     * the creation themselves. Paced the same way, because it creates a channel just the same.
     */
    public async joinGenerator( generatorId: string ): Promise<void> {
        const accountId = this.app.voice.accountId ?? "unknown";

        await waitOutChannelLimits( accountId );

        await this.app.voice.join( generatorId );

        lastCreatedAt.set( accountId, Date.now() );
    }

    public async openChat( handle: IDynamicChannelHandle ): Promise<void> {
        await this.app.channels.open( handle.channelId );
    }

    /**
     * The channel's own interface, found by what its buttons wear.
     *
     * The two interfaces are recognised differently because they are drawn differently: v3 draws a
     * custom emoji and no text, so its buttons are found by the emoji's name; v2 draws a label beside
     * a unicode emoji, so its buttons are found by the label. Neither can be found by the message's
     * title, which is whatever the owner last set it to.
     */
    public async panel( handle: IDynamicChannelHandle ): Promise<Locator> {
        await this.openChat( handle );

        return "v2" === handle.version ? this.findPanelV2( handle ) : this.findPanelV3( handle );
    }

    private async findPanelV2( handle: IDynamicChannelHandle ): Promise<Locator> {
        const labels = BotCatalog.$.panelButtonsV2.flatMap( ( button ) =>
            BotCatalog.$.panelButtonV2Readings( button.name ) );

        const deadline = Date.now() + E2E_TIMEOUTS.BOT_REPLY_MS;

        while ( Date.now() < deadline ) {
            const found = await this.app.page.$$eval(
                DISCORD_DOM.MESSAGE_ITEM,
                ( elements: Element[], wanted: string[] ) => {
                    const matching = elements.filter( ( element ) =>
                        Array.from( element.querySelectorAll( "button" ) ).some( ( button ) =>
                            wanted.includes( ( button as HTMLElement ).innerText.trim() ) ) );

                    return matching.at( -1 )?.id ?? null;
                },
                labels
            );

            if ( found ) {
                return this.app.messages.byId( found );
            }

            await this.app.page.waitForTimeout( E2E_TIMEOUTS.EXPECT_MS / 20 );
        }

        throw new Error( `No v2 control panel message found in channel ${ handle.channelId }.` );
    }

    private async findPanelV3( handle: IDynamicChannelHandle ): Promise<Locator> {
        const emojiNames = BotCatalog.$.panelButtons.map( ( button ) => button.emojiName );

        const deadline = Date.now() + E2E_TIMEOUTS.BOT_REPLY_MS;

        while ( Date.now() < deadline ) {
            const found = await this.app.page.$$eval(
                DISCORD_DOM.MESSAGE_ITEM,
                ( elements: Element[], names: string[] ) => {
                    const matching = elements.filter( ( element ) =>
                        names.some( ( name ) => element.querySelector( `img.emoji[alt="${ name }"]` ) )
                    );

                    return matching.at( -1 )?.id ?? null;
                },
                emojiNames
            );

            if ( found ) {
                return this.app.messages.byId( found );
            }

            await this.app.page.waitForTimeout( E2E_TIMEOUTS.EXPECT_MS / 20 );
        }

        throw new Error( `No control panel message found in channel ${ handle.channelId }.` );
    }

    /**
     * Leaves the channel and lets the bot take it away.
     *
     * The waiting is tidiness, not an assertion - this is what a test calls when it has finished with
     * a channel, and discord being slow to take one away is not that test's result. Whether leaving
     * removes a channel is asserted where it is the subject, in the lifecycle spec.
     *
     * Slow it can be: deleting a channel is rate limited, and a spec that opens and drops one per
     * test spends that budget in a few seconds. Measured on its own, a channel is gone the moment
     * its last member leaves; measured third in a burst, the same deletion has outlasted minutes.
     */
    public async close( handle: IDynamicChannelHandle ): Promise<void> {
        await this.app.voice.disconnect();

        await this.guild.waitForChannelGone( handle.channelId ).catch( () => undefined );
    }
}
