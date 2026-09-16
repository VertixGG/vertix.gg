import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

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

        const created = await guild.waitForNewVoiceChannel( before );

        expect( created.id ).not.toBe( generator.id );

        expect( await app.voice.connectedChannelId() ).toBe( created.id );

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
