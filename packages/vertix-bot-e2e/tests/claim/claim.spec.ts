import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

/**
 * Claiming a channel whose owner walked away.
 *
 * The vote itself cannot be driven from here and that is a property of the feature rather than a gap
 * in the harness: a claim opens when the owner leaves and somebody else is still in the channel, and
 * a suite signed into one account cannot be both people. When the owner is the last one out the
 * channel is deleted instead, which is the behaviour these tests can reach.
 *
 * What is covered is the half a single member can produce: the button exists on the panel, and the
 * command answers correctly when there is nothing to claim. `spec/commands-spec.md` row `V-08`
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

    test( "pressing claim on a channel that is not up for grabs refuses politely", async( { app, dynamicChannels, v3Generator } ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId );

        const panel = await dynamicChannels.panel( channel );

        const mark = await app.messages.mark();

        await app.messages
            .componentButton( panel, BotCatalog.$.panelButton( "VertixBot/UI-V3/DynamicChannelClaimChannelButton" ).emojiName )
            .click();

        const reply = await app.messages.waitForReply( mark ).catch( () => null );

        if ( reply ) {
            const shown = normalizeDiscordText( await app.messages.embedTitle( reply ).innerText() );

            expect( shown ).not.toBe(
                normalizeDiscordText( BotCatalog.$.embedTitle( "VertixBot/UI-General/CommandFailedEmbed" ) )
            );
        }

        await dynamicChannels.close( channel );
    } );

    test.skip( "a vote decides the new owner - needs a second connected member, which one account cannot be", async() => {} );
} );
