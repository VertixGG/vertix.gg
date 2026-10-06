import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

// 2026-10-20 12:00 UTC.
const ENDS_AT = 1792497600;

async function draw( args: UIArgs = {} ) {
    const { TrialEndingEmbed } = await import( "@vertix.gg/bot/src/ui/general/trial-ending/trial-ending-embed" );

    const { attributes } = await instantiateEmbed( TrialEndingEmbed ).build( {
        guildName: "Raid Club",
        planName: "Pro",
        endsAt: ENDS_AT,
        maxMasterChannels: "2",
        monthlyPriceUsd: 4,
        ... args
    } );

    return { title: String( attributes.title ), description: String( attributes.description ) };
}

/**
 * The heads-up an owner gets before the free trial runs out - read in a direct message, away from
 * the server it is about, so it has to name the server, the date and what the end takes away.
 */
describe( "VertixBot/UI-General/TrialEndingEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should name the server and when its trial ends, in the reader's own time", async() => {
        // Act.
        const { title, description } = await draw();

        // Assert.
        expect( title ).toBe( "⏳  Your free Pro trial is ending" );
        expect( description ).toContain( `The free Pro trial in **Raid Club** ends <t:${ ENDS_AT }:R>, on <t:${ ENDS_AT }:f>.` );
    } );

    it( "should say what the end takes away and what keeping it costs", async() => {
        // Act.
        const { description } = await draw( { maxMasterChannels: "5" } );

        // Assert - the number is the one this server keeps, a grant included.
        expect( description ).toContain( "- **Custom bot look** - the name, avatar, banner and bio the bot wears in your server come off." );
        expect( description ).toContain( "- **Generators** - only your first 5 keep making rooms." );
        expect( description ).toContain( "Keep Pro for $4 a month on the dashboard." );
    } );

    it( "should leave no variable unfilled", async() => {
        // Act.
        const { title, description } = await draw();

        // Assert.
        expect( title + description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
