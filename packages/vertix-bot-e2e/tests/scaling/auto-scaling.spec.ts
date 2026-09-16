import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { templateToPattern } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * Auto-scaling channels, which are a different kind of generator rather than a dynamic channel.
 *
 * A member never stays in the scaling master - it routes them into a numbered room and the master is
 * left empty again - so the assertion is that a room appeared and that the member is not where they
 * clicked. The prefix and member cap come from the configuration modal's own placeholders, which are
 * the defaults the service ships with.
 */
test.describe( "auto-scaling", () => {
    test( "a scaling generator can be created from the setup menu", async( { app, guild, generators, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const generator = await generators.createScaling( {
            prefix: BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingPrefixInput" ),
            maxMembers: Number( BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingMaxMembersInput" ) )
        } );

        const record = await guild.channel( generator.channelId );

        expect( record.id ).toBe( generator.channelId );
    } );

    test( "joining the scaling master routes the member into a numbered room", async( { app, guild, generators, dynamicChannels, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const prefix = BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingPrefixInput" );

        const generator = await generators.createScaling( {
            prefix,
            maxMembers: Number( BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingMaxMembersInput" ) )
        } );

        const before = await guild.voiceChannelIds();

        await dynamicChannels.joinGenerator( generator.channelId );

        const room = await guild.waitForNewVoiceChannel( before );

        expect( room.id ).not.toBe( generator.channelId );

        expect( room.name, `expected a room named like "${ prefix }"` ).toMatch( templateToPattern( prefix ) );

        await app.voice.disconnect();
    } );
} );
