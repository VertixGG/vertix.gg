import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { templateToPattern } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * Room for one channel to be opened and then waited out all the way to gone.
 *
 * Opening already spends up to `CHANNEL_OPEN_SPACING_MS` holding back for discord, and the deletion
 * these two are about can take `CHANNEL_REMOVED_SLOW_MS` on top - which together is more than the
 * default a test gets, so the two that wait for the delete say how long they need.
 */
const DELETE_TEST_MS = 420_000;

/**
 * The whole point of the bot, start to finish.
 *
 * Nothing else in this directory means anything if this does not hold: a member joins a generator, a
 * channel appears that is theirs, and it goes away again when they leave. The channel is checked
 * against discord's own record rather than the sidebar, because the bot creates the channel and moves
 * the member into it in the same breath and the client redraws those in either order.
 */
test.describe( "dynamic channel lifecycle", () => {
    test( "joining a generator opens a channel named from the generator's template", async( { guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        expect( channel.channelId ).not.toBe( v3Generator.channelId );

        const record = await guild.channel( channel.channelId );

        const nameTemplate = BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/ChannelNameTemplateInput" );

        expect( record.name, `expected a name shaped like "${ nameTemplate }"` ).toMatch( templateToPattern( nameTemplate ) );

        await dynamicChannels.close( channel );
    } );

    test( "the new channel carries its own control panel", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const drawn = await app.messages.componentLabels( panel );

        expect( drawn ).toContain( BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName );

        await dynamicChannels.close( channel );
    } );

    test( "leaving the channel removes it", async( { app, guild, dynamicChannels, v3Generator } ) => {
        test.setTimeout( DELETE_TEST_MS );

        const channel = await dynamicChannels.open( v3Generator.channelId );

        await app.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId, E2E_TIMEOUTS.CHANNEL_REMOVED_SLOW_MS );

        const remaining = await guild.voiceChannelIds();

        expect( remaining ).not.toContain( channel.channelId );
    } );

    test( "the generator itself is not removed with the channel", async( { app, guild, dynamicChannels, v3Generator } ) => {
        test.setTimeout( DELETE_TEST_MS );

        const channel = await dynamicChannels.open( v3Generator.channelId );

        await app.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId, E2E_TIMEOUTS.CHANNEL_REMOVED_SLOW_MS );

        const generator = await guild.channel( v3Generator.channelId );

        expect( generator.id ).toBe( v3Generator.channelId );
    } );
} );
