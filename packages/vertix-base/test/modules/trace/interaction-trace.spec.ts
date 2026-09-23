import { jest } from "@jest/globals";

import { performance } from "node:perf_hooks";

import { InteractionTrace, INTERACTION_TRACE_SLOW_MS } from "@vertix.gg/base/src/modules/trace/interaction-trace";

const tick = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

/**
 * A query made three awaits below the handler, the way one is made from inside an adapter's
 * `getReplyArgs()` - nothing hands it the trace, it has to find it.
 */
async function deepQuery( label: string ) {
    await tick();

    return ( async() => {
        await tick();

        return InteractionTrace.$.span( "db", label, async() => {
            await tick();

            return label;
        } );
    } )();
}

describe( "VertixBase/Modules/InteractionTrace", () => {
    let warn: jest.SpiedFunction<( ... args: unknown[] ) => void>;

    beforeEach( () => {
        InteractionTrace.$.reset();

        warn = jest.spyOn( InteractionTrace.$[ "logger" ], "warn" ).mockImplementation( () => {} );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "run()", () => {
        it( "should file a wait made anywhere below the handler under its interaction", async() => {
            let spans: readonly { label: string }[] = [];

            await InteractionTrace.$.run( "VertixGUI/Test/Adapter:VertixGUI/Test/Button", "interaction-id", 0, async() => {
                await deepQuery( "Channel.findFirst" );

                spans = [ ... InteractionTrace.$.getCurrent()!.spans ];
            } );

            expect( spans.map( ( span ) => span.label ) ).toEqual( [ "Channel.findFirst" ] );
        } );

        it( "should keep two presses handled at once apart", async() => {
            const seen: Record<string, string[]> = {};

            const press = ( id: string, label: string ) => InteractionTrace.$.run( id, id, 0, async() => {
                await deepQuery( label );

                seen[ id ] = InteractionTrace.$.getCurrent()!.spans.map( ( span ) => span.label );
            } );

            await Promise.all( [ press( "first", "Guild.findUnique" ), press( "second", "Channel.update" ) ] );

            expect( seen ).toEqual( { first: [ "Guild.findUnique" ], second: [ "Channel.update" ] } );
        } );

        it( "should count a wait outside any press in the totals only", async() => {
            await deepQuery( "Channel.deleteMany" );

            expect( InteractionTrace.$.getCurrent() ).toBeUndefined();
            expect( InteractionTrace.$.getSpanTotals().get( "db Channel.deleteMany" )?.count ).toBe( 1 );
        } );

        it( "should hand back what the handler returned, and let its throw through", async() => {
            await expect( InteractionTrace.$.run( "name", "id", 0, async() => "done" ) ).resolves.toBe( "done" );
            await expect( InteractionTrace.$.run( "name", "id", 0, async() => {
                throw new Error( "handler failed" );
            } ) ).rejects.toThrow( "handler failed" );
        } );
    } );

    describe( "slow presses", () => {
        it( "should say nothing about a press that was quick", async() => {
            await InteractionTrace.$.run( "quick", "id", 0, () => deepQuery( "Guild.findUnique" ) );

            expect( warn ).not.toHaveBeenCalled();
        } );

        it( "should log a slow press with what it waited on", async() => {
            // Queued past the threshold, so the press is slow without the test having to be.
            await InteractionTrace.$.run( "VertixGUI/Test/Adapter:VertixGUI/Test/Button", "interaction-id", INTERACTION_TRACE_SLOW_MS, async() => {
                await deepQuery( "Channel.findFirst" );
                await deepQuery( "Channel.findFirst" );

                InteractionTrace.$.record( "discord", "PATCH /channels/:id", 900 );
                InteractionTrace.$.record( "discord-rate-limit", "PATCH /channels/:id ( shared )", 600000 );
                InteractionTrace.$.markAcknowledged();
            } );

            expect( warn ).toHaveBeenCalledTimes( 1 );

            const line = String( warn.mock.calls[ 0 ][ 1 ] );

            expect( line ).toContain( "'VertixGUI/Test/Adapter:VertixGUI/Test/Button' ( interaction-id )" );
            expect( line ).toContain( `queued ${ INTERACTION_TRACE_SLOW_MS }ms` );
            expect( line ).toMatch( /acknowledged at \d+ms/ );
            expect( line ).toMatch( /db 2x \d+ms \( Channel\.findFirst 2x \d+ms \)/ );
            expect( line ).toContain( "discord 1x 900ms ( PATCH /channels/:id 1x 900ms )" );
            expect( line ).toContain( "discord-rate-limit 1x 600000ms" );
        } );

        it( "should say when a press was never acknowledged", async() => {
            await InteractionTrace.$.run( "name", "id", INTERACTION_TRACE_SLOW_MS, async() => {} );

            expect( String( warn.mock.calls[ 0 ][ 1 ] ) ).toContain( "never acknowledged" );
        } );

        it( "should name an event loop stall that happened during the press", async() => {
            await InteractionTrace.$.run( "name", "id", INTERACTION_TRACE_SLOW_MS, async() => {
                InteractionTrace.$.recordStall( performance.now(), 420 );
            } );

            expect( String( warn.mock.calls[ 0 ][ 1 ] ) ).toContain( "event loop stalled 420ms" );
        } );
    } );

    describe( "markAcknowledged()", () => {
        it( "should keep the first answer, not the last", async() => {
            let ackMs: number | undefined;

            await InteractionTrace.$.run( "name", "id", 0, async() => {
                InteractionTrace.$.markAcknowledged();

                ackMs = InteractionTrace.$.getCurrent()!.ackMs;

                await new Promise( ( resolve ) => setTimeout( resolve, 20 ) );

                InteractionTrace.$.markAcknowledged();

                expect( InteractionTrace.$.getCurrent()!.ackMs ).toBe( ackMs );
            } );

            expect( ackMs ).toBeLessThan( 20 );
        } );
    } );

    describe( "logSummary()", () => {
        it( "should list what took the most time, then start counting again", async() => {
            const info = jest.spyOn( InteractionTrace.$[ "logger" ], "info" ).mockImplementation( () => {} );

            InteractionTrace.$.record( "db", "Channel.findMany", 40 );
            InteractionTrace.$.record( "db", "Channel.findMany", 60 );
            InteractionTrace.$.record( "discord", "PATCH /channels/:id", 30 );

            InteractionTrace.$.logSummary();

            const summary = String( info.mock.calls[ 0 ][ 1 ] );

            expect( summary ).toContain( "db Channel.findMany - 2x, 100ms total, avg 50ms, max 60ms" );
            expect( summary.indexOf( "db Channel.findMany" ) ).toBeLessThan( summary.indexOf( "discord PATCH" ) );
            expect( InteractionTrace.$.getSpanTotals().size ).toBe( 0 );
        } );
    } );

    describe( "normalizeRoute()", () => {
        it.each( [
            [ "/channels/1234567890123456789/messages/1234567890123456780", "/channels/:id/messages/:id" ],
            [ "/interactions/1234567890123456789/aW50ZXJhY3Rpb246MTIzNDU2/callback", "/interactions/:id/:token/callback" ],
            [ "/webhooks/1234567890123456789/aW50ZXJhY3Rpb24/messages/@original", "/webhooks/:id/:token/messages/@original" ],
            [ "/guilds/1234567890123456789/members?limit=1000", "/guilds/:id/members" ]
        ] )( "should turn '%s' into '%s'", ( route, expected ) => {
            expect( InteractionTrace.normalizeRoute( route ) ).toBe( expected );
        } );
    } );
} );
