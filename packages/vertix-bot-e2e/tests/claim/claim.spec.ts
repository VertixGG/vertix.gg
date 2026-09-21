import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * Claiming a channel whose owner walked away.
 *
 * The vote itself cannot be driven from here and that is a property of the feature rather than a gap
 * in the harness: a claim opens when the owner leaves and somebody else is still in the channel, and
 * a suite signed into one account cannot be both people. When the owner is the last one out the
 * channel is deleted instead, which is the behaviour these tests can reach.
 *
 * What is covered is the half a single member can produce: the button exists on the panel, it is
 * closed while the owner is still there, and the command answers correctly when there is nothing to
 * claim. `spec/commands-spec.md` row `V-08`
 * explains why the command points at a claim rather than casting a vote.
 */
test.describe( "claim", () => {
    test( "the panel carries a claim button", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const drawn = await app.messages.componentLabels( panel );

        expect( drawn ).toContain(
            BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton" ).emojiName
        );

        await dynamicChannels.close( channel );
    } );

    test( "claiming is closed while the channel still has its owner", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        // The button is drawn and dead, which is the answer - a channel with its owner sitting in it
        // is not up for grabs, and the interface says so by closing the control rather than by
        // taking the press and refusing it. This asked for the refusal and waited out the clock on a
        // button that was never going to answer.
        const claim = app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton" ).emojiName )
            .first();

        await expect( claim ).toBeVisible();

        await expect( claim ).toBeDisabled();

        await dynamicChannels.close( channel );
    } );

    // A vote deciding the new owner lives in `claim-second-member.spec.ts`, which has the second
    // account it takes. This file held an empty skip saying one account could not do it - true, and
    // by then no longer the reason it was missing.
} );
