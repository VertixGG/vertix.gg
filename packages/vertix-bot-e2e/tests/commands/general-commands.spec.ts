import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * The four commands that are not part of a group.
 *
 * `/help` and `/welcome` carry no permission on purpose - `spec/commands-spec.md` rows `G-01` and
 * `G-02` took the admin gate off them, and a member who cannot manage the server being unable to
 * read the help is the regression those rows exist to prevent.
 */
test.describe( "general commands", () => {
    test( "/help opens the feedback interface, privately", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "help" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/FeedbackEmbed" ) );

        expect( await app.messages.isEphemeral( reply ) ).toBe( true );

        const labels = await app.messages.componentLabels( reply );

        expect( labels ).toContain( BotCatalog.$.buttonLabel( "VertixBot/UI-General/FeedbackReportButton" ) );
    } );

    test( "/welcome explains what the bot does", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "welcome" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/WelcomeEmbed" ) );

        expect( await app.messages.isEphemeral( reply ) ).toBe( true );
    } );

    test( "/setup opens the hub rather than the wizard", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "setup" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupEmbed" ) );
    } );

} );
