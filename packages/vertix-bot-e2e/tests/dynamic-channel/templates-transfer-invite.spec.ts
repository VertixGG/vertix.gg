import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * A name this run alone will use.
 *
 * A template is kept against the member rather than the guild, so emptying the guild leaves every
 * one the suite has ever saved - and a fixed name is therefore free exactly once. Every run after
 * the first asks the bot to save a name it already holds, and the screen that comes back is not the
 * one this test waits for. Clearing the rows instead was tried and is worse: the bot caches them,
 * and deleting underneath a running bot leaves it writing to a row that is no longer there.
 */
const TEMPLATE_NAME = `e2e-template-${ Date.now().toString( 36 ) }`;

/**
 * Templates, transfer and invite - the three that ask for something before they can act.
 *
 * Transfer and invite need somebody to hand the channel to, and a suite with one account has nobody,
 * so they are driven as far as the picker and no further. The picker being drawn is the part that
 * breaks when an adapter stops resolving; who ends up owning the channel is a second account's job.
 */
test.describe( "templates", () => {
    test( "a template can be captured and then offered back", async( { app, screen, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelTemplatesButton" ).emojiName )
            .click();

        const templates = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            templates,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelTemplatesEmbed" )
        );

        await app.messages
            .labelledButton( templates, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton" ) )
            .click();

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal" ) );

        await app.modal.fillField( 0, TEMPLATE_NAME );

        const beforeSave = await app.messages.mark();

        await app.modal.submit();

        const saved = await screen.settle(
            templates,
            beforeSave,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelTemplatesSavedEmbed" )
        );

        expect( saved ).toBeTruthy();

        // Saved templates are kept against the member and a member may hold only `MAX_TEMPLATES` of
        // them, so a suite that saves one per run and never takes it back stops working on the sixth.
        // Taken back through the interface rather than the database - the bot holds these in memory,
        // and deleting the row underneath it leaves it writing to something that is not there.
        await app.messages
            .labelledButton( saved, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelTemplatesManageButton" ) )
            .first()
            .click();

        const managing = await screen.settle(
            saved,
            await app.messages.mark(),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbed" )
        );

        await app.messages.chooseOption(
            managing,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu" ),
            TEMPLATE_NAME
        );

        // "Confirm Delete", not the general yes/no pair - this screen confirms with a button of its
        // own, and it only appears once a template is picked.
        await app.messages
            .labelledButton( managing, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton" ) )
            .first()
            .click();

        await screen.settle(
            managing,
            await app.messages.mark(),
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelTemplatesDeletedEmbed" )
        );

        await dynamicChannels.close( channel );
    } );
} );

test.describe( "transfer and invite", () => {
    test( "transfer opens a user picker", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelTransferOwnerButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelTransferOwnerEmbed" )
        );

        await expect(
            app.messages.userSelectMenu( screen, BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu" ) )
        ).toBeVisible();

        await dynamicChannels.close( channel );
    } );

    test( "invite opens its own screen", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelInviteButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelInviteEmbed" )
        );

        await dynamicChannels.close( channel );
    } );
} );
