import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM } from "@vertix.gg/bot-e2e/src/discord/discord-dom";

/**
 * What the suite assumes about discord's markup, checked on its own.
 *
 * Discord ships hashed class names and rearranges its dom without warning. When that happens every
 * feature test fails at once and none of them says why - so these run first and name the selector,
 * turning a morning of reading traces into one line of output.
 */
test.describe( "discord dom contract", () => {
    test( "the shell, the sidebar and the message box are where the suite looks for them", async( { app } ) => {
        await app.openCommandChannel();

        await expect( app.page.locator( DISCORD_DOM.APP_MOUNT ) ).toBeAttached();

        await expect( app.page.locator( DISCORD_DOM.GUILDS_NAV ) ).toBeVisible();

        await expect( app.page.locator( DISCORD_DOM.MESSAGE_LIST ).first() ).toBeVisible();

        await expect( app.page.locator( DISCORD_DOM.MESSAGE_BOX ).first() ).toBeVisible();
    } );

    test( "the command autocomplete still names the application that published each row", async( { app } ) => {
        await app.openCommandChannel();

        const command = BotCatalog.$.commandsOfGroup( null )[ 0 ];

        const box = app.page.locator( DISCORD_DOM.MESSAGE_BOX ).first();

        await box.click();

        await box.pressSequentially( command.fullName );

        const options = app.page.locator( DISCORD_DOM.AUTOCOMPLETE_OPTION );

        await expect( options.first() ).toBeVisible( { timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );

        await expect( options.first().locator( DISCORD_DOM.AUTOCOMPLETE_TITLE ).first() ).toBeVisible();

        await expect( options.first().locator( DISCORD_DOM.AUTOCOMPLETE_SOURCE ).first() ).toBeVisible();

        const sources = await options.locator( DISCORD_DOM.AUTOCOMPLETE_SOURCE ).allInnerTexts();

        expect(
            sources.some( ( source ) => source.includes( E2EConfig.$.applicationName ) ),
            `typing "${ command.fullName }" offered rows from ${ sources.join( ", " ) || "nobody" }`
        ).toBe( true );

        await app.page.keyboard.press( "Escape" );
    } );

    test( "an ephemeral answer is still recognisable as one", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "help" } );

        await expect( reply.locator( DISCORD_DOM.EMBED_TITLE ).first() ).toBeVisible();

        expect( await app.messages.isEphemeral( reply ) ).toBe( true );

        await app.messages.dismiss( reply );
    } );

    test( "a message component button carries its emoji name in the image alt", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const labels = await app.messages.componentLabels( panel );

        expect( labels.length ).toBeGreaterThan( 0 );

        await dynamicChannels.close( channel );
    } );
} );
