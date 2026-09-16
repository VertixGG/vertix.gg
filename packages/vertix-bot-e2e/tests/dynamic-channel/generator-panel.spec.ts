import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * The panel that sits beside a generator, in its `control-panel` text channel.
 *
 * A different interface from the one inside a channel, and a different adapter - `DynamicChannelPanel`
 * rather than `DynamicChannel`. `spec/commands-spec.md` describes it as a hidden variant nobody opens,
 * which is exactly why nothing was testing it: it is sent into a channel rather than opened by anyone,
 * so it never appeared in any flow the suite followed.
 *
 * It acts on whichever channel the presser owns, so the same button means two different things
 * depending on who presses it and whether they own anything - both of which are checked here.
 */
test.describe( "the panel beside a generator", () => {
    test( "a v3 generator gets a control panel carrying the channel buttons", async( { app, guild, v3Generator } ) => {
        const control = await guild.waitForControlChannel( v3Generator.channelId );

        await app.channels.open( control.id );

        const panel = await app.messages.waitForReply( app.messages.anyMark() );

        await app.messages.expectEmbedTitle(
            panel,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPanelEmbed" )
        );

        const drawn = await app.messages.componentLabels( panel );

        expect( drawn ).toContain(
            BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName
        );
    } );

    test( "pressing it without a channel of your own says so", async( { app, guild, v3Generator } ) => {
        const control = await guild.waitForControlChannel( v3Generator.channelId );

        await app.channels.open( control.id );

        const panel = await app.messages.waitForReply( app.messages.anyMark() );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName )
            .click();

        const reply = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/NoActiveDynamicChannelEmbed" )
        );

        await app.messages.dismiss( reply );
    } );

    test( "pressing it while owning a channel reaches that channel", async( { app, guild, v3Generator, ownedChannel } ) => {
        const control = await guild.waitForControlChannel( v3Generator.channelId );

        await app.channels.open( control.id );

        const panel = await app.messages.waitForReply( app.messages.anyMark() );

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelRenameButton" ).emojiName )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelRenameModal" ) );

        const prefilled = await app.modal.readField( 0 );

        const record = await guild.channel( ownedChannel.channelId );

        expect( prefilled, "the generator's panel opened on somebody else's channel" ).toBe( record.name );

        await app.modal.cancel();
    } );

    test( "a v2 generator gets the v2 panel", async( { app, guild, v2Generator } ) => {
        const control = await guild.waitForControlChannel( v2Generator.channelId ).catch( () => null );

        if ( ! control ) {
            test.skip( true, "this v2 generator was created without a control panel" );

            return;
        }

        await app.channels.open( control.id );

        const panel = await app.messages.waitForReply( app.messages.anyMark() );

        const shown = normalizeDiscordText( await app.messages.embedTitle( panel ).innerText() );

        expect( shown ).toBe(
            normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-V2/DynamicChannelPanelEmbed" ) )
        );
    } );
} );
