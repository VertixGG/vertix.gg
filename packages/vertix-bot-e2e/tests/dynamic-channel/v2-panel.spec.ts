import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * The control panel a channel gets from a generator running the older interface.
 *
 * It is a different panel, not a differently-styled one: v2 draws a label beside a unicode emoji where
 * v3 draws a custom emoji and no text, and its buttons are different classes opening different
 * adapters. A suite that only ever built v3 generators proved nothing about any of it.
 */
test.describe( "v2 control panel", () => {
    test( "a v2 generator makes a channel carrying the v2 panel", async( { app, dynamicChannels, v2Generator } ) => {
        const channel = await dynamicChannels.open( v2Generator.channelId, "v2" );

        const panel = await dynamicChannels.panel( channel );

        const drawn = await app.messages.componentLabels( panel );

        const known = BotCatalog.$.panelButtonsV2.flatMap( ( button ) =>
            BotCatalog.$.panelButtonV2Readings( button.name ) );

        expect( drawn.length, "the v2 panel drew no buttons" ).toBeGreaterThan( 0 );

        expect(
            drawn.some( ( label ) => known.includes( label.trim() ) ),
            `nothing the v2 panel drew is a button this catalog knows - it drew ${ JSON.stringify( drawn ) }`
        ).toBe( true );

        await dynamicChannels.close( channel );
    } );

    test( "renaming from the v2 panel opens the v2 modal", async( { app, dynamicChannels, v2Generator } ) => {
        const channel = await dynamicChannels.open( v2Generator.channelId, "v2" );

        const panel = await dynamicChannels.panel( channel );

        await app.messages
            .labelledButton( panel, BotCatalog.$.panelButtonV2( "VertixBot/UI-V2/DynamicChannelMetaRenameButton" ).label )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V2/DynamicChannelMetaRenameModal" ) );

        await app.modal.cancel();

        await dynamicChannels.close( channel );
    } );

    test( "the v2 panel keeps region and bitrate off itself", async( { app, dynamicChannels, v2Generator } ) => {
        const channel = await dynamicChannels.open( v2Generator.channelId, "v2" );

        const panel = await dynamicChannels.panel( channel );

        // The button exists and is offered on the buttons screen - what it is not is part of the set
        // a generator is created with.
        expect(
            BotCatalog.$.panelButtonsV2.map( ( button ) => button.name ),
            "the v2 panel lost its region button"
        ).toContain( "VertixBot/UI-V2/DynamicChannelRegionButton" );

        // A generator nobody curated does not carry it. A set that gains a button on its own is an
        // arrangement somebody chose being overruled by a deploy, so region is opted into rather than
        // handed out - and `/voice region` reaches the same screen without taking a slot at all.
        await expect(
            app.messages.labelledButton( panel, BotCatalog.$.panelButtonV2( "VertixBot/UI-V2/DynamicChannelRegionButton" ).label )
        ).toHaveCount( 0 );

        // Bitrate stays a menu on the screen that button opens, for the same reason and one more: it
        // asks a question the region screen already asks.
        await expect(
            app.messages.selectMenu( panel, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V2/DynamicChannelBitrateSelectMenu" ) )
        ).toHaveCount( 0 );

        await dynamicChannels.close( channel );
    } );

    for ( const button of BotCatalog.$.panelButtonsV2 ) {
        test( `pressing ${ button.name.split( "/" ).at( -1 ) } answers with something`, async( { app, dynamicChannels, v2Generator } ) => {
            const channel = await dynamicChannels.open( v2Generator.channelId, "v2" );

            const panel = await dynamicChannels.panel( channel );

            const readings = BotCatalog.$.panelButtonV2Readings( button.name );

            const drawn = await app.messages.componentLabels( panel );

            const reading = readings.find( ( candidate ) => drawn.some( ( label ) => label.trim() === candidate ) );

            if ( ! reading ) {
                test.skip( true, `${ button.name } is not in this generator's button set` );

                return;
            }

            const pressable = app.messages.labelledButton( panel, reading ).first();

            // A greyed-out button is the interface answering, not failing. Claiming is the one that
            // shows up here: it is disabled while the channel has an owner sitting in it, which is
            // exactly the state this test opens, so pressing it waits out the clock on a control the
            // bot is right to have closed.
            if ( ! await pressable.isEnabled() ) {
                test.skip( true, `${ button.name } is disabled in this state - nothing to press` );

                return;
            }

            const mark = await app.messages.mark();

            await pressable.click();

            if ( await app.modal.isOpen() ) {
                await app.modal.cancel();

                await dynamicChannels.close( channel );

                return;
            }

            const reply = await app.messages.waitForReply( mark );

            const shown = await app.messages.titleText( reply );

            expect( shown ).not.toBe(
                normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ) )
            );

            await app.messages.dismiss( reply );

            await dynamicChannels.close( channel );
        } );
    }
} );
