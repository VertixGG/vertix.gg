import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

async function draw( args: UIArgs ) {
    const { TeamLobbySplitEmbed } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-split-embed" );

    const { attributes } = await instantiateEmbed( TeamLobbySplitEmbed ).build( args );

    return String( attributes.description );
}

/**
 * What a split did, told to whoever asked for it.
 */
describe( "VertixBot/UI-V3/TeamLobbySplitEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should say how many rooms opened and how many were moved into them", async() => {
        // Act.
        const description = await draw( { mode: "random-teams", roomsCount: "2", moved: "10" } );

        // Assert.
        expect( description ).toContain( "Opened **2** rooms and moved **10** members into them." );
    } );

    it( "should tell a lobby that picks its teams where to go, since nobody was moved", async() => {
        // Act.
        const description = await draw( { mode: "pick-teams", roomsCount: "3", moved: "0" } );

        // Assert.
        expect( description ).toContain( "Opened **3** team rooms - everyone walks into the one they want." );
        expect( description ).not.toContain( "moved" );
    } );
} );
