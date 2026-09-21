import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import type { VertixScreen } from "@vertix.gg/bot-e2e/src/vertix/vertix-screen";

import type { Locator } from "@playwright/test";

// The offer alone can take two and a half minutes of that - see `CLAIM_OFFER_MS`.
const CLAIM_TEST_MS = 330_000;

/**
 * The shortest each claim timing is allowed to be, in seconds, beside what the screen calls it.
 *
 * These are the floors themselves, out of `GUILD_TIMINGS_BOUNDS` - not values chosen for being
 * small. Anything under them is refused rather than clamped: the bot answers `"was not saved"` on an
 * ephemeral nobody here is reading, leaves the guild on its ten minute default, and the test then
 * sits out the very wait it believed it had just shortened. Together they put the offer between
 * thirty and forty seconds after the owner goes, which `CLAIM_OFFER_MS` covers several times over.
 */
const CLAIM_TIMINGS = [
    {
        value: "claim-owner-away",
        modal: "VertixBot/UI-General/SetupClaimTimeoutModal",
        seconds: "30",
        label: "Owner Away Before Claimable"
    },
    {
        value: "claim-check-interval",
        modal: "VertixBot/UI-General/SetupClaimSweepIntervalModal",
        seconds: "10",
        label: "Claim Check Interval"
    },
    // Not the floor. The vote has to stay open long enough to be stood for - the offer, the press and
    // the screen that answers it are several round trips - and five seconds is a race the suite would
    // lose under load. Thirty is short enough to sit through and long enough not to.
    {
        value: "vote-duration",
        modal: "VertixBot/UI-General/SetupVoteTimeoutModal",
        seconds: "30",
        label: "Vote Duration"
    },
    // The floor, and never actually applied here: the bot adds this for the second candidate onward,
    // and two accounts can only produce one. Set so the screen behind it is covered at all.
    {
        value: "vote-time-per-candidate",
        modal: "VertixBot/UI-General/SetupVoteAddTimeModal",
        seconds: "5",
        label: "Vote Time Per Candidate"
    }
] as const;

type TClaimTiming = typeof CLAIM_TIMINGS[ number ];

/**
 * What the claim screen shows for one timing right now - `"30s"`, or `"600s (default)"`.
 *
 * Taken line by line rather than from the normalized whole, because normalizing collapses the
 * newlines the embed separates its four timings by, after which every value reads as being on every
 * line. The marker is the embed's own way of saying a value is inherited rather than the guild's.
 */
async function claimTimingValue( app: DiscordApp, claim: Locator, label: string ): Promise<string> {
    const description = await app.messages.embedDescription( claim ).innerText().catch( () => "" );

    const line = description
        .split( "\n" )
        .map( ( raw ) => normalizeDiscordText( raw ) )
        .find( ( raw ) => raw.includes( label ) );

    return line?.split( "\u2219" )[ 1 ]?.trim() ?? "";
}

/**
 * That the bot kept what the modal just submitted, which it will not always have done.
 *
 * A refused value costs nothing visible - the modal closes either way and the screen behind it is
 * simply never edited - so without this the precondition fails in silence, and the test standing on
 * it goes on to blame the bot for never offering a claim it was never asked early enough for.
 */
async function expectTimingTaken( app: DiscordApp, claim: Locator, timing: TClaimTiming ): Promise<void> {
    await expect
        .poll( () => claimTimingValue( app, claim, timing.label ), {
            timeout: E2E_TIMEOUTS.BOT_REPLY_MS,
            message: `the bot did not take ${ timing.seconds }s for "${ timing.label }"`
        } )
        .toBe( `${ timing.seconds }s` );
}

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

    for ( const timing of CLAIM_TIMINGS ) {
        // Timings outlive the run that set them - `resetTestGuild()` empties the guild, it does not
        // touch its settings - so on every run after the first these are already ours, and setting
        // them again is four screens and four modals to arrive back where we started.
        if ( `${ timing.seconds }s` === await claimTimingValue( app, claim, timing.label ) ) {
            continue;
        }

        await app.messages.chooseOption(
            claim,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/SetupClaimSelectOptionMenu" ),
            BotCatalog.$.selectOptionLabel( "VertixBot/UI-General/SetupClaimSelectOptionMenu", timing.value )
        );

        await app.modal.waitForTitle( BotCatalog.$.modalTitle( timing.modal ) );

        await app.modal.fillField( 0, timing.seconds );

        await app.modal.submit();

        await expectTimingTaken( app, claim, timing );
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

        // The member has to be looking at the channel for the offer to be on their screen at all.
        await second.channels.open( channel.channelId );

        await app.voice.disconnect();

        const claimable = await second.messages
            .waitForScreen( BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimStartEmbed" ), E2E_TIMEOUTS.CLAIM_OFFER_MS )
            .catch( () => null );

        expect( claimable, "the bot never offered the channel for claiming" ).not.toBeNull();

        const mark = await second.messages.mark();

        // Pressed by its emoji rather than its label. The button inherits `DynamicChannelButtonBase`,
        // whose `isLabelOmitted()` is true, so `"Claim"` is a name it carries in the language file and
        // nowhere in the message - what discord draws is the `:ClaimChannel:` image on its own, and a
        // button filtered by text matches nothing at all.
        await second.messages
            .componentButton(
                claimable as NonNullable<typeof claimable>,
                BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton" ).emojiName
            )
            .click();

        const vote = await second.messages.waitForReply( mark ).catch( () => claimable );

        await second.messages.expectEmbedTitle(
            vote as NonNullable<typeof vote>,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimVoteStepInEmbed" )
        );

        await second.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId );
    } );

    /**
     * The half of claiming that actually changes something.
     *
     * Everything up to here is the offer: the channel is advertised, the button is pressed, a vote
     * opens. None of that moves the channel. The vote runs itself out on its own clock, announces a
     * winner, and only then is the channel handed over - which is the part a member is really asking
     * for, and the part `claim.spec.ts` carried a placeholder for rather than a test.
     *
     * Ownership is checked against discord rather than against the screen that claims it. The bot
     * drops the previous owner's overwrite and grants the winner one, so the overwrites are the
     * record - and a screen reading "has claimed the channel" is the bot's account of itself, which
     * is the thing under test and cannot also be the evidence.
     */
    test( "the vote runs out and the channel changes hands", async( {
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

        await second.voice.join( channel.channelId );

        await second.channels.open( channel.channelId );

        await app.voice.disconnect();

        const claimable = await second.messages
            .waitForScreen( BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimStartEmbed" ), E2E_TIMEOUTS.CLAIM_OFFER_MS );

        const voteMark = await second.messages.mark();

        await second.messages
            .componentButton(
                claimable,
                BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton" ).emojiName
            )
            .click();

        // The vote opens by editing the offer rather than replacing it, so a press that draws no new
        // message has still been answered - which is why the offer is what this falls back to.
        const vote = await second.messages.waitForReply( voteMark ).catch( () => claimable );

        await second.messages.expectEmbedTitle(
            vote,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimVoteStepInEmbed" )
        );

        // Standing for it. The first candidate does not extend the vote - the bot adds time from the
        // second onward - so this presses without buying itself any.
        await second.messages
            .labelledButton( vote, BotCatalog.$.buttonLabel( "VertixBot/UI-V3/ClaimVoteStepInButton" ) )
            .click();

        // Waited out rather than replied to: the result arrives on the same message when the vote's
        // own clock runs down, which is `CLAIM_VOTE_MS` and not the time a press takes to answer.
        await second.messages.expectEmbedTitle(
            vote,
            BotCatalog.$.embedTitle( "VertixBot/UI-V3/ClaimVoteWonEmbed" ),
            E2E_TIMEOUTS.CLAIM_VOTE_MS
        );

        await guild.waitForChannelOwnedBy( channel.channelId, second.voice.accountId as string );

        expect(
            await guild.channelOwnerOverwrites( channel.channelId ),
            "the member who lost the channel kept their grant on it"
        ).not.toContain( app.voice.accountId as string );

        await second.voice.disconnect();

        await guild.waitForChannelGone( channel.channelId ).catch( () => undefined );
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
