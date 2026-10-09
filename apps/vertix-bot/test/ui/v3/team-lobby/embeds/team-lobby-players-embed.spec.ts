import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const ALEX_ID = "600000000000000001",
    MIA_ID = "600000000000000002";

async function draw( args: UIArgs ) {
    const { TeamLobbyPlayersEmbed } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-players-embed" );

    const { attributes } = await instantiateEmbed( TeamLobbyPlayersEmbed ).build( args );

    return String( attributes.description );
}

/**
 * Who a split is for, under the screen asking how - and what **Apply** is waiting for.
 */
describe( "VertixBot/UI-V3/TeamLobbyPlayersEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should say the whole lobby plays while nobody is picked, and ask for the number", async() => {
        // Act.
        const description = await draw( { players: [] } );

        // Assert.
        expect( description ).toBe( "**Playing:** everyone in the lobby\n-# Pick the number, then Apply." );
    } );

    it( "should list each member picked, marked by whether they are in the lobby, and say Apply waits", async() => {
        // Act.
        const description = await draw( {
            count: "2",
            players: [ { id: ALEX_ID, isReady: true }, { id: MIA_ID, isReady: false } ]
        } );

        // Assert.
        expect( description ).toBe(
            `**Playing:** ✅ <@${ ALEX_ID }> · ❌ <@${ MIA_ID }>\n` +
            "-# ❌ Not in the lobby yet, or a bot - Apply waits for everyone picked to be in the lobby."
        );
    } );

    it( "should say it is ready once the number is picked and everybody picked is in the lobby", async() => {
        // Act.
        const description = await draw( { count: "2", players: [ { id: ALEX_ID, isReady: true } ] } );

        // Assert.
        expect( description ).toContain( "-# Ready - Apply splits the lobby." );
    } );

    it.each( [
        [ "nobody-to-split", "-# ❌ Nobody is in the lobby to split yet." ],
        [ "too-few-members", "-# ❌ Not enough people in the lobby for that - pick a smaller number, or wait for more to join." ],
        [ "too-many-rooms", "-# ❌ That would open more than 20 rooms - pick bigger groups." ]
    ] )( "should say why Apply is off when the lobby cannot make the split - %s", async( planRefusal, line ) => {
        // Act.
        const description = await draw( { count: "2", players: [], planRefusal, roomsLimit: 20 } );

        // Assert.
        expect( description ).toBe( `**Playing:** everyone in the lobby\n${ line }` );
    } );

    it( "should leave no variable unfilled", async() => {
        // Act.
        const description = await draw( { count: "3", players: [ { id: ALEX_ID, isReady: false } ] } );

        // Assert.
        expect( description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
