import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * Editing a generator that exists.
 *
 * The generator is picked as the menu's first entry rather than by name: the picker labels its options
 * `Master Channel #1`, which is neither the channel's name nor a string any language file carries, so
 * there is nothing to match on. The guild holds exactly one generator here, and what actually pins the
 * right one is the assertion below - the screen that opens has to name that channel.
 */
test.describe( "edit generator", () => {
    test( "the editor opens on the generator that was just created", async( { app, screen, v3Generator } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "edit" } );

        const edit = await screen.chooseFirst(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterEditSelectMenu" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupEditEmbed" )
        );

        const description = await app.messages.embedDescription( edit ).innerText();

        expect( description ).toContain( v3Generator.channelId );
    } );

    test( "the editor offers its edit options", async( { app, screen, v3Generator } ) => {
        expect( v3Generator.channelId, "there is a generator to edit" ).toBeTruthy();

        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "edit" } );

        const edit = await screen.chooseFirst(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterEditSelectMenu" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupEditEmbed" )
        );

        await expect(
            app.messages.selectMenu( edit, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/SetupEditSelectEditOptionMenu" ) )
        ).toBeVisible();
    } );
} );
