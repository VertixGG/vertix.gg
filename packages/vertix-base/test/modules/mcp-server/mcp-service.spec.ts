import { formatLogParams, serializeLogEntry } from "@vertix.gg/base/src/modules/mcp-server/mcp-service";

describe( "VertixBase/Modules/MCPService", () => {
    describe( "formatLogParams()", () => {
        it( "should print an error with its message and stack", () => {
            const error = new Error( "Missing Permissions" );

            const rendered = formatLogParams( [ error ] );

            expect( rendered ).toContain( "Error: Missing Permissions" );
            expect( rendered ).toContain( "mcp-service.spec.ts" );
        } );

        it( "should print the fields a library hangs on an error", () => {
            const error = Object.assign( new Error( "Missing Permissions" ), { code: 50013, status: 403 } );

            const rendered = formatLogParams( [ error ] );

            expect( rendered ).toContain( "code: 50013" );
            expect( rendered ).toContain( "status: 403" );
        } );

        it( "should print an error's cause", () => {
            const error = new Error( "Failed to create channel", { cause: new Error( "Unknown Channel" ) } );

            expect( formatLogParams( [ error ] ) ).toContain( "Unknown Channel" );
        } );

        it( "should print strings as they are and join params with a space", () => {
            const rendered = formatLogParams( [ "channel:", { id: "1" } ] );

            expect( rendered.startsWith( "channel: {" ) ).toBe( true );
            expect( rendered ).toContain( "id: '1'" );
        } );

        it( "should print a circular object instead of throwing", () => {
            const circular: Record<string, unknown> = { name: "loop" };

            circular.self = circular;

            expect( formatLogParams( [ circular ] ) ).toContain( "[Circular" );
        } );

        it( "should answer an empty string when there are no params", () => {
            expect( formatLogParams( [] ) ).toBe( "" );
        } );
    } );

    describe( "serializeLogEntry()", () => {
        it( "should keep the params when they serialize", () => {
            const body = JSON.parse( serializeLogEntry( { params: [ { id: "1" } ], formatted: "line" } ) );

            expect( body ).toEqual( { params: [ { id: "1" } ], formatted: "line" } );
        } );

        it( "should send the line without its params when one is circular", () => {
            const circular: Record<string, unknown> = { name: "loop" };

            circular.self = circular;

            const body = JSON.parse( serializeLogEntry( { params: [ circular ], formatted: "line [Circular *1]" } ) );

            expect( body ).toEqual( { formatted: "line [Circular *1]" } );
        } );

        it( "should send the line without its params when one is a bigint", () => {
            const body = JSON.parse( serializeLogEntry( { params: [ BigInt( 1 ) ], formatted: "line 1n" } ) );

            expect( body ).toEqual( { formatted: "line 1n" } );
        } );
    } );
} );
