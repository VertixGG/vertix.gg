import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * The hub `/setup` opens, which is not the wizard.
 *
 * `spec/commands-spec.md` row `G-04` kept these apart on purpose: the hub shows the whole server at
 * once, and repointing `/setup` at the wizard would drop whoever typed it into the middle of one
 * task. A test that cannot tell the two screens apart would let that regression through.
 */
test.describe( "setup hub", () => {
    test( "an empty guild is offered a way to make its first generator", async( { app, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "setup" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupEmbed" ) );

        await expect(
            app.messages.selectMenu( reply, BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ) )
        ).toBeVisible();
    } );

    test( "the hub lists a generator once one exists", async( { app, v3Generator } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "setup" } );

        await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupEmbed" ) );

        const description = await app.messages.embedDescription( reply ).innerText();

        expect( description ).toContain( v3Generator.channelId );
    } );

    test( "the hub reaches the server options screen", async( { app, screen } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: null, name: "setup" } );

        await screen.advance(
            reply,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/SetupServerOptionsEditButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupServerOptionsEmbed" )
        );
    } );
} );
