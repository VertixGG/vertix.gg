import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * Making a generator, both interfaces.
 *
 * A guild can run v2 and v3 generators side by side, and the version a generator carries decides
 * which adapter every later command opens - so both wizards are walked, and each is checked to have
 * actually produced a voice channel rather than only to have reached its last step.
 */
test.describe( "new generator wizard", () => {
    test( "the v3 wizard walks three steps and creates a generator", async( { app, guild, generators, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const before = await guild.voiceChannelIds();

        const generator = await generators.createV3();

        expect( before ).not.toContain( generator.channelId );

        const record = await guild.channel( generator.channelId );

        expect( record.name ).toBeTruthy();
    } );

    test( "the v2 wizard creates a generator of its own", async( { app, guild, generators, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const generator = await generators.createV2();

        const record = await guild.channel( generator.channelId );

        expect( record.id ).toBe( generator.channelId );
    } );

    test( "step one offers the channel name template", async( { app, screen, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const created = await app.commands.run( { group: "manage", name: "new-generator" } );

        const stepOne = await screen.choose(
            created,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupMasterCreateSelectMenu", "v3" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep1Embed" )
        );

        await app.messages
            .labelledButton( stepOne, BotCatalog.$.buttonLabel( "VertixBot/UI-General/ChannelNameTemplateEditButton" ) )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-General/ChannelNameTemplateModal" ) );

        await app.modal.cancel();
    } );

    test( "step two offers the buttons a new channel will carry", async( { app, screen, emptyGuild } ) => {
        void emptyGuild;

        await app.openCommandChannel();

        const created = await app.commands.run( { group: "manage", name: "new-generator" } );

        const stepOne = await screen.choose(
            created,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupMasterCreateSelectMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupMasterCreateSelectMenu", "v3" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep1Embed" )
        );

        const stepTwo = await screen.advance(
            stepOne,
            BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/SetupNewStep2Embed" )
        );

        // Addressed by position: the menu arrives with the default set already chosen, so it draws
        // those fourteen buttons where its placeholder would be.
        const buttons = app.messages.selectMenuAt( stepTwo, 0 );

        await expect( buttons ).toBeVisible();

        await expect( buttons ).toContainText(
            BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelRenameButton" )
        );
    } );
} );
