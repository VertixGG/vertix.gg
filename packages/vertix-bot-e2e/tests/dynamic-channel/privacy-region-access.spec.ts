import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * The three screens that open rather than ask - privacy, region and access all draw their own
 * interface and take a choice from a menu.
 *
 * The option chosen is looked up by its stored value rather than by the label a translator wrote,
 * which is the same mistake `AGENTS.md` describes for the language files: options fall back to
 * position, so picking "the second one" is how a test ends up asserting the wrong feature in seven
 * locales at once.
 */
test.describe( "privacy, region and access", () => {
    test( "privacy opens its screen and takes a state", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelPrivacyButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPrivacyEmbed" )
        );

        await app.messages.chooseOption(
            screen,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelPrivacyMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-V3/DynamicChannelPrivacyMenu", "private" )
        );

        await dynamicChannels.close( channel );
    } );

    test( "region opens its screen and offers the automatic option", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRegionButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelRegionEmbed" )
        );

        await expect(
            app.messages.selectMenu( screen, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelRegionSelectMenu" ) )
        ).toBeVisible();

        await dynamicChannels.close( channel );
    } );

    test( "region carries the bitrate menu, and a choice reaches the channel", async( { app, guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRegionButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await expect(
            app.messages.selectMenu( screen, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu" ) )
        ).toBeVisible();

        await app.messages.chooseOption(
            screen,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu", "64000" )
        );

        // 64 kbps rather than one of the higher steps, because every guild may use it - the ones
        // above 96 are boost tiers, and a test server that is not boosted would never be offered them.
        await guild.waitForBitrate( channel.channelId, 64_000 );

        await dynamicChannels.close( channel );
    } );

    test( "access opens the permissions screen with its menus", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbed" )
        );

        await expect(
            app.messages.userSelectMenu( screen, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu" ) )
        ).toBeVisible();

        await dynamicChannels.close( channel );
    } );
} );
