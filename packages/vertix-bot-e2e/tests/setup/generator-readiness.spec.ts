import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";

/**
 * Where the member ends up, which is never where they joined.
 *
 * Joining a generator connects them to the generator; the bot then makes a room and moves them into
 * it, so the answer is the first channel that is neither nothing nor the generator itself.
 *
 * Asked of the member rather than of the guild's channel list. The list answers "a channel that was
 * not there before", which is a different question and sometimes a different channel: when two
 * appear close together it names whichever discord lists first, and this failed asserting the member
 * sat in a room created a moment after the one they were actually in.
 */
async function waitForRoomOfTheirOwn( app: DiscordApp, generatorId: string ): Promise<string> {
    const deadline = Date.now() + E2E_TIMEOUTS.VOICE_CONNECT_MS;

    let seen: string | null = null;

    while ( Date.now() < deadline ) {
        seen = await app.voice.connectedChannelId();

        if ( seen && seen !== generatorId ) {
            return seen;
        }

        await new Promise( ( resolve ) => setTimeout( resolve, E2E_INTERVALS.POLL_MS ) );
    }

    throw new Error(
        `The member was still in ${ seen ?? "no channel" } rather than a room of their own, ` +
        `${ E2E_TIMEOUTS.VOICE_CONNECT_MS }ms after joining generator ${ generatorId }.`
    );
}

/**
 * A generator has to work the moment it exists.
 *
 * The wizard creates the voice channel and members can join it immediately, but the settings that
 * `createDynamicChannel()` reads - the name template above all - were written afterwards, behind a
 * discord round trip that took most of a second. Anyone joining in that window was told their channel
 * could not be created, and the message blamed discord's limits or a missing permission, which is
 * neither.
 *
 * Nobody types fast enough to hit it by hand. This test does it every run: it joins the instant the
 * wizard finishes and does not wait for the control panel the way every other test does.
 */
test.describe( "generator readiness", () => {
    test( "joining a generator the moment it is created still opens a channel", async( { app, guild, generators, dynamicChannels, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const knownVoiceIds = await guild.voiceChannelIds();

        await generators.runV3Wizard();

        const generator = await guild.waitForNewVoiceChannel( knownVoiceIds );

        const before = await guild.voiceChannelIds();

        await dynamicChannels.joinGenerator( generator.id );

        const connectedId = await waitForRoomOfTheirOwn( app, generator.id );

        expect(
            before,
            "the member was moved into a channel that was already there rather than one made for them"
        ).not.toContain( connectedId );

        const created = await guild.channel( connectedId );

        await dynamicChannels.close( {
            channelId: created.id,
            name: created.name,
            generatorId: generator.id,
            version: "v3"
        } );
    } );

    test( "the bot does not report a creation failure on a fresh generator", async( { app, guild, generators, dynamicChannels, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const knownVoiceIds = await guild.voiceChannelIds();

        await generators.runV3Wizard();

        const generator = await guild.waitForNewVoiceChannel( knownVoiceIds );

        const mark = await app.messages.mark();

        await dynamicChannels.joinGenerator( generator.id );

        const failure = await app.messages.waitForReply( mark ).catch( () => null );

        if ( failure ) {
            const shown = await app.messages.titleText( failure );

            expect(
                shown,
                "the bot answered with the channel-create failure notice on a generator it had just made"
            ).not.toBe( normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/ChannelCreateFailedEmbed" ) ) );
        }

        await app.voice.disconnect();
    } );
} );
