import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { matchesCopy, normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * The two destructive buttons on the panel.
 *
 * Clearing has two honest answers - it cleared something, or there was nothing to clear - and which
 * one comes back depends on whether anybody has spoken in the channel yet. Both are accepted; what is
 * not accepted is neither.
 */
test.describe( "clear chat and reset", () => {
    test( "clearing the chat is acknowledged either way", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClearChatButton" ).emojiName )
            .click();

        const reply = await app.messages.waitForReply( mark );

        const shown = await app.messages.embedTitle( reply ).innerText();

        const accepted = [
            "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbed",
            "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbed"
        ];

        expect(
            accepted.some( ( entity ) => matchesCopy( shown, BotCatalog.$.embedTitle( entity ) ) ),
            `clear chat answered "${ normalizeDiscordText( shown ) }"`
        ).toBe( true );

        await dynamicChannels.close( channel );
    } );

    test( "resetting puts the channel back to the generator's defaults", async( { app, guild, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelResetChannelButton" ).emojiName )
            .click();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelResetChannelEmbed" )
        );

        const record = await guild.channel( channel.channelId );

        expect( record.id ).toBe( channel.channelId );

        await dynamicChannels.close( channel );
    } );
} );
