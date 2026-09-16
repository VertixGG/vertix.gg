import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

const BAD_WORD = "e2eforbidden";

/**
 * The settings that belong to the server rather than to one generator.
 *
 * The roles screen offers a chooser, not three pickers: one menu asks which of voice, verified and
 * staff roles is being edited, and that role's own picker opens next. The first version of this file
 * asserted all three were on screen at once, which is a shape the bot has never had - written from the
 * language file rather than from the screen, which is the mistake `AGENTS.md` describes as pinning
 * fiction.
 */
test.describe( "server options", () => {
    test( "the roles screen offers voice, verified and staff roles to edit", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "roles" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupServerOptionsRolesEmbed" )
        );

        const offered = await app.messages.optionLabelsOf(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/ServerOptionsEditSelectMenu" )
        );

        // Matched as a prefix: discord draws an option's description under its label, so the text of
        // the row is "Voice Role\nThe role given to members while they are in a voice channel".
        for ( const value of [ "editVoiceRole", "editVerifiedRoles", "editStaffRoles" ] ) {
            const label = BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/ServerOptionsEditSelectMenu", value );

            expect(
                offered.some( ( option ) => option.includes( label ) ),
                `the roles screen did not offer "${ label }" - it offered ${ JSON.stringify( offered ) }`
            ).toBe( true );
        }
    } );

    /**
     * Submitting the bad words modal hands the admin back to the setup hub rather than leaving them on
     * the bad words screen, so the word is read back there and removing it means going in again.
     */
    test( "a bad word can be set and removed again", async( { app } ) => {
        await app.openCommandChannel();

        const badwords = await app.commands.run( { group: "manage", name: "badwords" } );

        await app.messages.expectEmbedTitle(
            badwords,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupBadwordsEmbed" )
        );

        await app.messages
            .labelledButton( badwords, BotCatalog.$.buttonLabel( "VertixBot/UI-General/SetupBadwordsEditButton" ) )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-General/BadwordsModal" ) );

        await app.modal.fillField( 0, BAD_WORD );

        await app.modal.submit();

        await expect( app.messages.embedDescription( badwords ) ).toContainText( BAD_WORD );

        const reopened = await app.commands.run( { group: "manage", name: "badwords" } );

        await app.messages
            .labelledButton( reopened, BotCatalog.$.buttonLabel( "VertixBot/UI-General/BadwordsClearButton" ) )
            .click();

        await expect( app.messages.embedDescription( reopened ) ).not.toContainText( BAD_WORD );
    } );

    test( "the server options screen offers its configuration menu", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "server-options" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupServerOptionsEmbed" )
        );

        await expect(
            app.messages.selectMenu( reply, BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/ServerOptionsEditSelectMenu" ) )
        ).toBeVisible();
    } );
} );
