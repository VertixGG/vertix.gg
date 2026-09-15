import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const MEMBER_ID = "830000000000000001",
    OTHER_MEMBER_ID = "830000000000000002";

// `MAX_TIMEOUT_PER_CREATE` in the service. Not exported, and the number is the point of the test
// rather than an input to it - an entry is worth keeping for exactly as long as it can still refuse
// somebody.
const WINDOW = 10 * 1000;

type Request = { timestamp: number; tryCount: number; shouldSentWarning: boolean };

type Sweeper = { forgetStaleChannelRequests( now: number ): void };

/**
 * Reads nothing off the service but the map, so it is called against the prototype with a map
 * handed to it rather than standing a service up.
 */
async function makeSweeper() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { MasterChannelService } = await import( "@vertix.gg/bot/src/services/master-channel-service" );

    const state = { requestedChannelMap: new Map<string, Request>() },
        proto = MasterChannelService.prototype as unknown as Sweeper;

    return {
        state,
        request: ( memberId: string, timestamp: number ) =>
            state.requestedChannelMap.set( memberId, { timestamp, tryCount: 1, shouldSentWarning: true } ),
        sweep: ( now: number ) => proto.forgetStaleChannelRequests.call( state, now )
    };
}

/**
 * How recently somebody asked for a channel is what tells a member in a hurry from one leaning on
 * the generator. It was kept forever - one entry for every member who ever joined a generator, on a
 * bot that is meant to stay up.
 */
describe( "VertixBot/Services/MasterChannel/request sweep", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( new Date( "2026-01-01T00:00:00.000Z" ) );
    } );

    afterEach( () => {
        jest.useRealTimers();
    } );

    it( "should keep somebody who asked a moment ago", async() => {
        const { state, request, sweep } = await makeSweeper();

        const now = Date.now();

        request( MEMBER_ID, now );

        sweep( now + WINDOW - 1 );

        expect( state.requestedChannelMap.has( MEMBER_ID ) ).toBe( true );
    } );

    it( "should drop somebody the window has passed for", async() => {
        const { state, request, sweep } = await makeSweeper();

        const now = Date.now();

        request( MEMBER_ID, now );

        sweep( now + WINDOW );

        expect( state.requestedChannelMap.has( MEMBER_ID ) ).toBe( false );
    } );

    it( "should judge each member on their own time", async() => {
        const { state, request, sweep } = await makeSweeper();

        const now = Date.now();

        request( MEMBER_ID, now - WINDOW );
        request( OTHER_MEMBER_ID, now );

        sweep( now );

        expect( state.requestedChannelMap.has( MEMBER_ID ) ).toBe( false );
        expect( state.requestedChannelMap.has( OTHER_MEMBER_ID ) ).toBe( true );
    } );

    it( "should empty a map nobody is in a hurry in", async() => {
        const { state, request, sweep } = await makeSweeper();

        const now = Date.now();

        request( MEMBER_ID, now - WINDOW );
        request( OTHER_MEMBER_ID, now - WINDOW );

        sweep( now );

        expect( state.requestedChannelMap.size ).toBe( 0 );
    } );
} );
