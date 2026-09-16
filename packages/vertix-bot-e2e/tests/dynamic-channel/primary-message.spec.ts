import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

const NEW_TITLE = "e2e primary title";

/**
 * Editing the message the channel's own interface is drawn on.
 *
 * This is the one feature whose effect is the thing the rest of the suite navigates by - the panel's
 * title is `{title}`, whatever the owner last set it to - so the assertion is on the message itself
 * rather than on any stored copy.
 */
test.describe( "primary message", () => {
    test( "the edit screen offers a title and a description to change", async( { app, screen: screens, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.expectEmbedTitle(
            screen,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditEmbed" )
        );

        // The title and the description are two steps past the confirmation, not two buttons on it.
        // Asserted by walking to each, because the screen that opens offers only yes and no - this
        // read as passing for as long as "Edit" also matched the custom emoji in the embed's title.
        await app.messages
            .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-General/YesButton" ) )
            .first()
            .click();

        await screens.settle(
            screen,
            mark,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEmbed" )
        );

        await expect(
            app.messages
                .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton" ) )
                .first()
        ).toBeVisible();

        await app.messages
            .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-General/WizardNextButton" ) )
            .first()
            .click();

        await screens.settle(
            screen,
            mark,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEmbed" )
        );

        await expect(
            app.messages
                .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton" ) )
                .first()
        ).toBeVisible();

        await dynamicChannels.close( channel );
    } );

    test( "changing the title opens its modal and takes the new text", async( { app, screen: screens, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        // The interface opens on its confirmation - `Confirm --Proceed--> EditTitle` - and the button
        // that opens the title modal belongs to the step after it. Pressing straight for that button
        // asks a screen showing only yes and no for something it does not carry yet.
        await app.messages
            .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-General/YesButton" ) )
            .first()
            .click();

        // The confirmation is answered by editing the same message, so the title step arrives in
        // place - and `expectEmbedTitle()` reads once, which is a race against an edit that has not
        // landed. `settle()` waits for the screen to say it is the title step.
        await screens.settle(
            screen,
            mark,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEmbed" )
        );

        await app.messages
            .labelledButton( screen, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton" ) )
            .first()
            .click();

        await app.modal.waitForTitle(
            BotCatalog.$.modalTitle( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleModal" )
        );

        await app.modal.fillField( 0, NEW_TITLE );

        await app.modal.submit();

        await dynamicChannels.close( channel );
    } );
} );
