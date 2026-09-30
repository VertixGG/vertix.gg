import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { GUILD_EVENTS_ERRORS } from "@vertix.gg/definitions/src/guild-events-definitions";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

async function draw( args: UIArgs ) {
    const { EventsEmbed } = await import( "@vertix.gg/bot/src/ui/general/events/events-embed" );

    const { attributes } = await instantiateEmbed( EventsEmbed ).build( {
        eventsEnabled: true,
        eventsChannelId: "123",
        eventsSubPostsEnabled: true,
        eventsLastError: null,
        ... args
    } );

    return String( attributes.description );
}

/**
 * The Events screen in `/setup`. It explains Events by when check-in opens and closes, and those are
 * each server's own now - so the screen has to say the server's, not the defaults.
 */
describe( "VertixBot/UI-General/EventsEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should name when check-in opens and closes in this server", async() => {
        // Act.
        const description = await draw( { eventsCheckInLeadMinutes: 30, eventsLateAfterMinutes: 5 } );

        // Assert.
        expect( description ).toContain( "**Check-in** opens 30 min before the start, closes 5 min after" );
    } );

    it( "should name the defaults for a server that set no timing of its own", async() => {
        // Act.
        const description = await draw( {} );

        // Assert.
        expect( description ).toContain( "**Check-in** opens 15 min before the start, closes 10 min after" );
    } );

    it( "should say why the attendance copy failed", async() => {
        // Act.
        const missing = await draw( { eventsLastError: GUILD_EVENTS_ERRORS.LOG_CHANNEL_MISSING } ),
            forbidden = await draw( { eventsLastError: GUILD_EVENTS_ERRORS.LOG_CHANNEL_FORBIDDEN } );

        // Assert.
        expect( missing ).toContain( "The channel the attendance is copied to is gone" );
        expect( forbidden ).toContain( "The bot cannot post the attendance copy" );
    } );

    it.each( Object.values( GUILD_EVENTS_ERRORS ) )( "should leave no variable unfilled with the error %s", async( error ) => {
        // Act.
        const description = await draw( { eventsLastError: error, eventsChannelId: null } );

        // Assert.
        expect( description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
