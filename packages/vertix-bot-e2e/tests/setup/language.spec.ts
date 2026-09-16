import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

const OTHER_LANGUAGE = "de";

/**
 * Changing the language the bot speaks in this guild.
 *
 * This is the one setting that changes what every other test can assert, since the rest of the suite
 * compares against `en.json` - so the language is put back before the test ends, and again afterwards
 * whatever happened, rather than trusting the guild reset to undo it. The reset removes generators;
 * it does not touch guild settings.
 */
test.describe( "language", () => {
    test.afterEach( async( { app } ) => {
        const reply = await app.commands.run( { group: "manage", name: "language" } ).catch( () => null );

        if ( ! reply ) {
            return;
        }

        // First entry, not "English" - the bot translates the language names too, so from a guild
        // this test left speaking german there is no english label to find.
        await app.messages
            .chooseFirstOption( reply, BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/LanguageSelectMenu" ) )
            .catch( () => undefined );
    } );

    test( "the language screen names the language in use", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "language" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/LanguageEmbed" ) );

        await expect( app.messages.embedDescription( reply ) ).toContainText( "English" );
    } );

    test( "choosing another language changes what the bot says, and changing back restores it", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "language" } );

        await app.messages.chooseOption(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/LanguageSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/LanguageSelectMenu", OTHER_LANGUAGE )
        );

        await expect( app.messages.embedDescription( reply ) ).toContainText( "Deutsch" );

        await app.messages.chooseFirstOption(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/LanguageSelectMenu" )
        );

        await expect( app.messages.embedDescription( reply ) ).toContainText( "English" );
    } );
} );
