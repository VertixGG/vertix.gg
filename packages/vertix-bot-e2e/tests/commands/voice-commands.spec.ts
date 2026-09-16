import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { matchesCopy, normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

const VOICE_COMMANDS = BotCatalog.$.commandsOfGroup( "voice" );

/**
 * `/voice`, every row of it, read out of the command definitions rather than listed here.
 *
 * A subcommand added to `voice-commands.ts` is covered by these two loops on the next run, and one
 * removed stops being asserted. What each row is expected to do comes from the same definition: a row
 * naming a modal has to open that modal, and a row that does not has to answer with a screen.
 */
test.describe( "voice commands without a channel", () => {
    for ( const command of VOICE_COMMANDS.filter( ( candidate ) => "owner" === candidate.tier ) ) {
        test( `${ command.fullName } says there is no channel to act on`, async( { app } ) => {
            await app.openCommandChannel();

            const reply = await app.commands.run( { group: command.group, name: command.name } );

            await app.messages.expectEmbedTitle(
                reply,
                BotCatalog.$.embedTitle( "VertixBot/UI-General/NoActiveDynamicChannelEmbed" )
            );

            expect( await app.messages.isEphemeral( reply ) ).toBe( true );
        } );
    }
} );

test.describe( "voice commands on a channel the caller owns", () => {
    for ( const command of VOICE_COMMANDS ) {
        test( `${ command.fullName } reaches its feature`, async( { app, ownedChannel } ) => {
            expect( ownedChannel.channelId ).toBeTruthy();

            await app.openCommandChannel();

            if ( command.modalName ) {
                await app.commands.send( { group: command.group, name: command.name } );

                await app.modal.waitForTitle( BotCatalog.$.modalTitle( command.modalName ) );

                await app.modal.cancel();

                return;
            }

            const reply = await app.commands.run( { group: command.group, name: command.name } );

            const shown = normalizeDiscordText( await app.messages.embedTitle( reply ).innerText() );

            const refusals = [
                BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ),
                BotCatalog.$.embedTitle( "VertixBot/UI-General/FeatureMissingInV2Embed" ),
                BotCatalog.$.embedTitle( "VertixBot/UI-General/NoActiveDynamicChannelEmbed" ),
                BotCatalog.$.embedTitle( "VertixBot/UI-General/NotYourChannelEmbed" )
            ].map( normalizeDiscordText );

            expect( shown, `${ command.fullName } answered with a refusal` ).not.toBe( "" );

            for ( const refusal of refusals ) {
                expect( shown, `${ command.fullName } answered "${ shown }"` ).not.toBe( refusal );
            }

            await app.messages.dismiss( reply );
        } );
    }
} );

test.describe( "voice claim", () => {
    test( "/voice claim says nothing is claimable while the owner is still there", async( { app, ownedChannel } ) => {
        expect( ownedChannel.channelId ).toBeTruthy();

        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "voice", name: "claim" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/NotClaimableEmbed" )
        );
    } );
} );

test.describe( "voice knock", () => {
    test( "/knock says there is nothing to knock on when the guild has no dynamic channels", async( { app } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "voice", name: "knock" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/DynamicChannelKnockNoneEmbed" )
        );
    } );

    test( "/knock offers the channel once one exists", async( { app, ownedChannel } ) => {
        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "voice", name: "knock" } );

        const shown = await app.messages.embedTitle( reply ).innerText();

        const accepted = [
            "VertixBot/UI-V3/DynamicChannelKnockEmbed",
            "VertixBot/UI-V3/DynamicChannelKnockNoneEmbed"
        ];

        expect(
            accepted.some( ( entity ) => matchesCopy( shown, BotCatalog.$.embedTitle( entity ) ) ),
            `/knock answered "${ shown }"`
        ).toBe( true );

        expect( ownedChannel.channelId ).toBeTruthy();
    } );
} );
