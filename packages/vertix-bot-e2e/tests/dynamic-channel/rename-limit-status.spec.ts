import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

const RENAMED_TO = "e2e-renamed-channel";

const USER_LIMIT = 7;

const STATUS_TEXT = "e2e status line";

/**
 * The three features that change the channel itself, checked against the channel itself.
 *
 * The bot saying "your channel's name has changed" and the channel actually being renamed are two
 * different claims, and only one of them matters. Both are asserted - the embed because that is what
 * the member sees, and discord's own record because that is what happened.
 *
 * Each of these runs on a channel created moments earlier, which is also what keeps them honest:
 * discord allows a channel two renames per ten minutes, and a suite that reused one channel would
 * start passing for the wrong reason.
 */
test.describe( "rename, limit and status", () => {
    test( "renaming through the panel renames the channel", async( { app, guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelRenameModal" ) );

        await app.modal.fillField( 0, RENAMED_TO );

        await app.modal.submit();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelRenameSuccessEmbed" )
        );

        await guild.waitForChannelNamed( channel.channelId, RENAMED_TO );

        await dynamicChannels.close( channel );
    } );

    test( "the rename modal opens carrying the channel's current name", async( { app, guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelRenameModal" ) );

        const prefilled = await app.modal.readField( 0 );

        const record = await guild.channel( channel.channelId );

        expect( prefilled ).toBe( record.name );

        await app.modal.cancel();

        await dynamicChannels.close( channel );
    } );

    test( "setting a user limit applies it to the channel", async( { app, guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelLimitMetaButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelLimitModal" ) );

        await app.modal.fillField( 0, String( USER_LIMIT ) );

        await app.modal.submit();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelLimitSuccessEmbed" )
        );

        await guild.waitForUserLimit( channel.channelId, USER_LIMIT );

        await dynamicChannels.close( channel );
    } );

    test( "a user limit outside the allowed range is refused", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelLimitMetaButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelLimitModal" ) );

        await app.modal.fillField( 0, "1000" );

        await app.modal.submit();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelLimitInvalidInputEmbed" )
        );

        await dynamicChannels.close( channel );
    } );

    test( "setting a status is acknowledged", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelStatusButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelStatusModal" ) );

        await app.modal.fillField( 0, STATUS_TEXT );

        await app.modal.submit();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelStatusSuccessEmbed" )
        );

        await dynamicChannels.close( channel );
    } );
} );
