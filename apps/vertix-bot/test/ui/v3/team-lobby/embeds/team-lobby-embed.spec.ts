import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

async function draw( args: UIArgs ) {
    const { TeamLobbyEmbed } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-embed" );

    const { attributes } = await instantiateEmbed( TeamLobbyEmbed ).build( args );

    return String( attributes.description );
}

const LOBBY_ID = "840000000000000001";

/**
 * The panel in a team lobby's panel channel: where to go to take part, how the lobby is split right now,
 * and who runs it.
 */
describe( "VertixBot/UI-V3/TeamLobbyEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should lead with joining the lobby, as a link to it - a split takes only the people in it", async() => {
        // Act.
        const description = await draw( { lobbyId: LOBBY_ID, roomIds: [], hostRoleIds: [] } );

        // Assert - the panel sits in a channel of its own, so nothing else says where to go.
        expect( description.split( "\n" )[ 1 ] ).toBe(
            `👉 **Join <#${ LOBBY_ID }> to take part** - a split only takes the people who are in it.`
        );
        expect( description ).toContain( "↩️ **Recall** - everyone back to the lobby, and the rooms close." );
    } );

    it( "should name the rooms a split opened, as links to them", async() => {
        // Act.
        const description = await draw( { roomIds: [ "111", "222" ], hostRoleIds: [] } );

        // Assert.
        expect( description ).toContain( "**Split into:** <#111> · <#222>" );
    } );

    it( "should say everyone is in the lobby while it is not split", async() => {
        // Act.
        const description = await draw( { roomIds: [], hostRoleIds: [] } );

        // Assert.
        expect( description ).toContain( "**Not split** - everyone is in the lobby." );
    } );

    it( "should name the roles that run it, or say anyone in it does", async() => {
        // Act.
        const withHosts = await draw( { roomIds: [], hostRoleIds: [ "333" ] } ),
            withoutHosts = await draw( { roomIds: [], hostRoleIds: [] } );

        // Assert.
        expect( withHosts ).toContain( "**Hosts:** <@&333>" );
        expect( withoutHosts ).toContain( "**Hosts:** anyone in the lobby" );
    } );

    it( "should leave no variable unfilled", async() => {
        // Act.
        const description = await draw( { lobbyId: LOBBY_ID, roomIds: [ "111" ], hostRoleIds: [ "333" ] } );

        // Assert.
        expect( description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
