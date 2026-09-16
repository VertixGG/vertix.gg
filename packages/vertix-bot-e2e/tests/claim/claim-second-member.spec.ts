import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import type { VertixScreen } from "@vertix.gg/bot-e2e/src/vertix/vertix-screen";

const CLAIM_TEST_MS = 240_000;

const SHORT_TIMING_SECONDS = "5";

/**
 * Claiming a channel whose owner walked off, which takes two people by definition.
 *
 * A claim opens when the owner leaves a channel somebody else is still in. With one account that state
 * cannot exist - the owner leaving is the last member leaving, and the bot deletes the channel - which
 * is why this was the one part of the bot the suite could only skip.
 *
 * The guild's claim timings are lowered first. Left at their defaults the bot waits ten minutes before
 * offering the channel and sweeps once a minute, and no test can sit through that; the timings screen
 * is a feature in its own right and had no coverage either, so setting them is worth doing through the
 * interface rather than behind it.
 */
async function lowerClaimTimings( app: DiscordApp, screen: VertixScreen ): Promise<void> {
    await app.openCommandChannel();

    const options = await app.commands.run( { group: "manage", name: "server-options" } );

    const claim = await screen.choose(
        options,
        BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/ServerOptionsEditSelectMenu" ),
        BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/ServerOptionsEditSelectMenu", "editClaim" ),
        BotCatalog.$.embedTitle( "VertixBot/UI-General/SetupClaimEmbed" )
    );

    for ( const [ value, modal ] of [
        [ "claim-owner-away", "VertixBot/UI-General/SetupClaimTimeoutModal" ],
        [ "claim-check-interval", "VertixBot/UI-General/SetupClaimSweepIntervalModal" ]
    ] ) {
        await app.messages.chooseOption(
            claim,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupClaimSelectOptionMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupClaimSelectOptionMenu", value )
        );

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( modal ) );

        await app.modal.fillField( 0, SHORT_TIMING_SECONDS );

        await app.modal.submit();
    }
}

test.describe( "claim with a second member", () => {

    test( "a channel the owner leaves becomes claimable, and whoever is left can claim it", async( {
        app,
        screen,
        guild,
        dynamicChannels,
        v3Generator,
        secondMember
    } ) => {
        test.setTimeout( CLAIM_TEST_MS );

        test.skip( ! secondMember, "needs a second member in the test guild - see the README" );

        const second = secondMember as DiscordApp;

        await lowerClaimTimings( app, screen );

        const channel = await dynamicChannels.open( v3Generator.channelId, "v3" );

        // The second member joins the channel itself, not the generator - joining a generator would
        // get them a channel of their own instead of making them the one left behind in this one.
        await second.voice.join( channel.channelId );

        expect( await second.voice.connectedChannelId() ).toBe( channel.channelId );

        await app.voice.disconnect();

        await second.channels.open( channel.channelId );

        const claimable = await second.messages.waitForReply( await second.messages.mark() ).catch( () => null );

        expect( claimable, "the bot never offered the channel for claiming" ).not.toBeNull();

        await second.messages.expectEmbedTitle(
            claimable as NonNullable<typeof claimable>,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimStartEmbed" )
        );

        const mark = await second.messages.mark();

        await second.messages
            .labelledButton( claimable as NonNullable<typeof claimable>, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/ClaimStartButton" ) )
            .click();

        const vote = await second.messages.waitForReply( mark ).catch( () => claimable );

        await second.messages.expectEmbedTitle(
            vote as NonNullable<typeof vote>,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimVoteStepInEmbed" )
        );

        await second.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId );
    } );

    test( "the claim button refuses from outside the channel", async( { app, ownedChannel } ) => {
        test.setTimeout( E2E_TIMEOUTS.TEST_MS );

        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "voice", name: "claim" } );

        await app.messages.expectEmbedTitle(
            reply,
            BotCatalog.$.embedTitle( "VertixBot/UI-General/NotClaimableEmbed" )
        );

        expect( ownedChannel.channelId ).toBeTruthy();
    } );
} );
