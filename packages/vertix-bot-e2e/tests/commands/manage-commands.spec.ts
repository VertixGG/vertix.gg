import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * `/manage`, one row at a time.
 *
 * The screen each row opens is written out in full rather than derived from the row's execution step.
 * The two names look alike and are not the same thing - composing one from the other is the mistake
 * `AGENTS.md` describes under UI Entity Names, where a name nobody can search for is a name nobody can
 * safely rename. The last test here fails if a row is added to the group without an expectation.
 */
const EXPECTED_SCREENS: { command: string; embed: string }[] = [
    { command: "/manage setup", embed: "VertixBot/UI-General/SetupEmbed" },
    { command: "/manage new-generator", embed: "VertixBot/UI-General/SetupMasterCreateEmbed" },
    { command: "/manage edit", embed: "VertixBot/UI-General/SetupMasterEditEmbed" },
    { command: "/manage roles", embed: "VertixBot/UI-General/SetupServerOptionsRolesEmbed" },
    { command: "/manage server-options", embed: "VertixBot/UI-General/SetupServerOptionsEmbed" },
    { command: "/manage badwords", embed: "VertixBot/UI-General/SetupBadwordsEmbed" },
    { command: "/manage language", embed: "VertixBot/UI-General/LanguageEmbed" }
];

test.describe( "manage commands", () => {
    for ( const { command, embed } of EXPECTED_SCREENS ) {
        test( `${ command } opens its own screen`, async( { app } ) => {
            const definition = BotCatalog.$.command( command );

            await app.openCommandChannel();

            const reply = await app.commands.run( { group: definition.group, name: definition.name } );

            await app.messages.expectEmbedTitle( reply, BotCatalog.$.embedTitle( embed ) );

            expect( await app.messages.isEphemeral( reply ) ).toBe( true );

            await app.messages.dismiss( reply );
        } );
    }

    test( "every /manage row has an expected screen", async() => {
        const declared = BotCatalog.$.commandsOfGroup( "manage" ).map( ( command ) => command.fullName );

        const covered = EXPECTED_SCREENS.map( ( expectation ) => expectation.command );

        expect( declared.sort() ).toEqual( covered.sort() );
    } );

    test( "/manage edit offers the generator that exists", async( { app, v3Generator } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "edit" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupMasterEditEmbed" )
        );

        await expect(
            app.messages.selectMenu( reply, BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterEditSelectMenu" ) )
        ).toBeVisible();

        expect( v3Generator.channelId ).toBeTruthy();
    } );
} );
