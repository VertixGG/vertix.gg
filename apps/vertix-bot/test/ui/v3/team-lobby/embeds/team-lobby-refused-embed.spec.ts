import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { TEAM_LOBBY_REFUSALS } from "@vertix.gg/bot/src/definitions/team-lobby";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

async function draw( args: UIArgs ) {
    const { TeamLobbyRefusedEmbed } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-refused-embed" );

    const { attributes } = await instantiateEmbed( TeamLobbyRefusedEmbed ).build( args );

    return String( attributes.description );
}

/**
 * Why a lobby was not made, split or called back. Its sentences are keyed by refusal codes written
 * out in the embed, so a code added to the definitions without one here would fall through to
 * "Discord refused" - which is what the first test is for.
 */
describe( "VertixBot/UI-V3/TeamLobbyRefusedEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it.each( Object.values( TEAM_LOBBY_REFUSALS ).filter( ( code ) => TEAM_LOBBY_REFUSALS.FAILED !== code ) )(
        "should have a sentence of its own for %s",
        async( code ) => {
            // Act.
            const description = await draw( { refusalCode: code } ),
                failed = await draw( { refusalCode: TEAM_LOBBY_REFUSALS.FAILED } );

            // Assert.
            expect( description ).not.toBe( failed );
            expect( description ).not.toMatch( /\{[a-zA-Z]+\}/ );
        }
    );

    it( "should say how many rooms a setup may open", async() => {
        // Act.
        const description = await draw( { refusalCode: TEAM_LOBBY_REFUSALS.TOO_MANY_ROOMS, roomsLimit: 20 } );

        // Assert.
        expect( description ).toContain( "more than **20** rooms" );
    } );

    it( "should name what the bot is missing", async() => {
        // Act.
        const description = await draw( {
            refusalCode: TEAM_LOBBY_REFUSALS.MISSING_PERMISSIONS,
            missingPermissions: [ "MoveMembers", "Connect" ]
        } );

        // Assert.
        expect( description ).toContain( "**MoveMembers, Connect**" );
    } );

    it( "should fall back to Discord having refused for a code it does not know", async() => {
        // Act.
        const description = await draw( { refusalCode: "something-new" } );

        // Assert.
        expect( description ).toBe( "Discord refused to make a room. Try again in a moment." );
    } );
} );
