import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * Editing the two kinds of generator that are not a v3 dynamic one.
 *
 * `/manage edit` opens whatever the generator is - a v2 generator opens the v2 editor, an auto-scaling
 * one opens the scaling editor - and the suite only ever had a v3 generator to point it at. Each test
 * empties the guild first so the picker holds exactly one entry, which is also the only way to be sure
 * which generator was opened: the picker labels its options `Master Channel #1` and says nothing about
 * what kind they are.
 */
test.describe( "editing generators of every kind", () => {
    test( "a v2 generator opens the v2 editor", async( { app, screen, generators, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const generator = await generators.createV2();

        const reply = await app.commands.run( { group: "manage", name: "edit" } );

        const edit = await screen.chooseFirst(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterEditSelectMenu" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V2/SetupEditEmbed" )
        );

        const description = await app.messages.embedDescription( edit ).innerText();

        expect( description ).toContain( generator.channelId );
    } );

    test( "an auto-scaling generator opens the scaling editor", async( { app, screen, generators, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const generator = await generators.createScaling( {
            prefix: BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingPrefixInput" ),
            maxMembers: Number( BotCatalog.$.textInputPlaceholder( "VertixBot/UI-General/SetupScalingMaxMembersInput" ) )
        } );

        const reply = await app.commands.run( { group: "manage", name: "edit" } );

        const edit = await screen.chooseFirst(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterEditSelectMenu" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ScalingSetupEditEmbed" )
        );

        const description = await app.messages.embedDescription( edit ).innerText();

        expect( description ).toContain( generator.channelId );
    } );
} );
