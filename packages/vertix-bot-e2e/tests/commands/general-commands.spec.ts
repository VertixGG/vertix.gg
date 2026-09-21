import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * The four commands that are not part of a group.
 *
 * `/help` carries no permission on purpose - `spec/commands-spec.md` row `G-01` took the admin gate
 * off it, and a member who cannot manage the server being unable to read the help is the regression
 * that row exists to prevent. `/welcome` was beside it until it was declared `ADMIN`, which is why
 * `/help` no longer points at it.
 */
test.describe( "general commands", () => {
    test( "/help lists the three guides, privately", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "help" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/HelpEmbed" ) );

        expect( await app.messages.isEphemeral( reply ) ).toBe( true );

        const labels = await app.messages.componentLabels( reply );

        // The guides only, in the order `HelpElementsGroup` draws them - set it up, understand what
        // the generator does, turn features on. The row under them is dashboard, website and support,
        // which discord draws as links rather than as buttons, so they are not read the same way.
        for ( const entity of [
            "VertixBot/UI-General/HelpSetupGuideButton",
            "VertixBot/UI-General/HelpJoinToCreateButton",
            "VertixBot/UI-General/HelpFeaturesButton"
        ] ) {
            const label = BotCatalog.$.buttonLabel( entity );

            expect(
                labels,
                `/help did not offer "${ label }" - it offered ${ JSON.stringify( labels ) }`
            ).toContain( label );
        }
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
