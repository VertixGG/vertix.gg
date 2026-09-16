import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * Every button the panel actually drew, pressed once.
 *
 * Which buttons a generator draws is a stored set rather than a fixed list, so the test presses what
 * it finds rather than what it hoped for - and fails only if a button that is on screen does nothing,
 * or answers with the notice the bot shows when a command falls over. That is the cheapest possible
 * check and it is the one that catches an adapter that stopped resolving.
 */
test.describe( "dynamic channel control panel", () => {
    test( "the panel draws buttons the bot knows about", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const drawn = await app.messages.componentLabels( panel );

        const known = BotCatalog.$.panelButtons.map( ( button ) => button.emojiName );

        expect( drawn.length ).toBeGreaterThan( 0 );

        for ( const label of drawn ) {
            expect( known, `the panel drew "${ label }", which is not a button in the catalog` ).toContain( label );
        }

        await dynamicChannels.close( channel );
    } );

    for ( const button of BotCatalog.$.panelButtons ) {
        test( `pressing ${ button.emojiName } answers with something`, async( { app, dynamicChannels, v3Generator } ) => {
            const channel = await dynamicChannels.open( v3Generator.channelId );

            const panel = await dynamicChannels.panel( channel );

            const target = app.messages.componentButton( panel, button.emojiName );

            if ( ! await target.isVisible().catch( () => false ) ) {
                test.skip( true, `${ button.emojiName } is not in this generator's button set` );

                return;
            }

            // A panel button can be drawn and deliberately dead - claim stays disabled until the owner
            // has actually left - and refusing to press one is the feature, not a failure.
            if ( await target.isDisabled().catch( () => false ) ) {
                test.skip( true, `${ button.emojiName } is drawn but disabled right now` );

                return;
            }

            const mark = await app.messages.mark();

            await target.click();

            if ( await app.modal.isOpen() ) {
                await app.modal.cancel();

                await dynamicChannels.close( channel );

                return;
            }

            const reply = await app.messages.waitForReply( mark );

            const shown = normalizeDiscordText( await app.messages.embedTitle( reply ).innerText() );

            expect( shown ).not.toBe(
                normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ) )
            );

            await app.messages.dismiss( reply );

            await dynamicChannels.close( channel );
        } );
    }
} );
