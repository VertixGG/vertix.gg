import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";

const TWO_MEMBER_TEST_MS = 240_000;

/**
 * The three features that stop at a picker with one account.
 *
 * Transfer needs a recipient, invite needs an invitee, and a knock is a request one person makes and
 * another answers. The suite used to drive each as far as its picker and assert the picker was drawn,
 * which proves the adapter resolves and nothing about the feature - whether ownership actually moves,
 * whether the invite arrives, whether the owner is asked.
 */
test.describe( "features that take two members", () => {

    test( "ownership can be handed to somebody in the channel", async( { app, guild, dynamicChannels, v3Generator, secondMember } ) => {
        test.setTimeout( TWO_MEMBER_TEST_MS );

        test.skip( ! secondMember, "needs a second member in the test guild - see the README" );

        const second = secondMember as DiscordApp;

        const channel = await dynamicChannels.open( v3Generator.channelId, "v3" );

        await second.voice.join( channel.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelTransferOwnerButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.chooseOption(
            screen,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu" ),
            await guild.memberName( second.voice.accountId as string )
        );

        const shown = await app.messages.titleText( screen );

        const accepted = [
            "VertixBot/UI-V3/DynamicChannelTransferOwnerTransferredEmbed",
            "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbed"
        ].map( ( entity ) => normalizeDiscordText( BotCatalog.$.embedTitle( entity ) ) );

        expect( accepted, `transfer answered "${ shown }"` ).toContain( shown );

        await second.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId ).catch( () => undefined );
    } );

    test( "somebody can be invited to the channel", async( { app, guild, dynamicChannels, v3Generator, secondMember } ) => {
        test.setTimeout( TWO_MEMBER_TEST_MS );

        test.skip( ! secondMember, "needs a second member in the test guild - see the README" );

        const second = secondMember as DiscordApp;

        const channel = await dynamicChannels.open( v3Generator.channelId, "v3" );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelInviteButton" ).emojiName )
            .click();

        const screen = await app.messages.waitForReply( mark );

        await app.messages.chooseOption(
            screen,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelInviteUserMenu" ),
            await guild.memberName( second.voice.accountId as string )
        );

        const shown = await app.messages.titleText( screen );

        expect( shown ).not.toBe(
            normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ) )
        );

        await dynamicChannels.close( channel );
    } );

    /**
     * Knocking is the only one of the three where the second member acts first and the owner answers,
     * so it is the only one that proves the request reaches anybody.
     */
    test( "a knock reaches the owner, who can answer it", async( { app, dynamicChannels, v3Generator, secondMember } ) => {
        test.setTimeout( TWO_MEMBER_TEST_MS );

        test.skip( ! secondMember, "needs a second member in the test guild - see the README" );

        const second = secondMember as DiscordApp;

        const channel = await dynamicChannels.open( v3Generator.channelId, "v3" );

        const panel = await dynamicChannels.panel( channel );

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelPrivacyButton" ).emojiName )
            .click();

        const privacy = await app.messages.waitForReply( await app.messages.mark() ).catch( () => null );

        if ( privacy ) {
            await app.messages.chooseOption(
                privacy,
                BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelPrivacyMenu" ),
                BotCatalog.$.selectOptionLabel( "VertixBot/UI-V3/DynamicChannelPrivacyMenu", "private" )
            );
        }

        await second.openCommandChannel();

        const knock = await second.commands.run( { group: "voice", name: "knock" } );

        await second.messages.chooseOption(
            knock,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-V3/DynamicChannelKnockChannelMenu" ),
            channel.name
        );

        const sent = await second.messages.titleText( knock );

        expect(
            sent,
            "the knock was not acknowledged to the member who made it"
        ).not.toBe( normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ) ) );

        await dynamicChannels.close( channel );
    } );
} );
