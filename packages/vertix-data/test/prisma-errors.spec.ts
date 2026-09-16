import { isDatabaseUnavailable, isRecordNotFound } from "@vertix.gg/data/src/utils/prisma-errors";

const prismaError = ( code: string, message = "" ) => Object.assign( new Error( message ), { code, message } );

describe( "VertixData/Utils/PrismaErrors", () => {

    describe( "isRecordNotFound", () => {
        it( "should recognise P2025", () => {
            expect( isRecordNotFound( prismaError( "P2025" ) ) ).toBe( true );
        } );

        it.each( [
            [ "another prisma code", prismaError( "P2010" ) ],
            [ "a plain error", new Error( "nope" ) ],
            [ "null", null ],
            [ "a string", "P2025" ]
        ] )( "should not recognise %s", ( _label, error ) => {
            expect( isRecordNotFound( error ) ).toBe( false );
        } );
    } );

    describe( "isDatabaseUnavailable", () => {
        it.each( [
            [ "cannot reach the server", prismaError( "P1001" ) ],
            [ "the server closed the connection", prismaError( "P1017" ) ]
        ] )( "should recognise %s", ( _label, error ) => {
            expect( isDatabaseUnavailable( error ) ).toBe( true );
        } );

        /**
         * What a replica set with no primary actually answers. The driver gets as far as sending
         * the query, so it arrives as a raw query failure rather than as a connection error - taken
         * verbatim from the seven hour outage this was written for.
         */
        it( "should recognise a replica set with no primary", () => {
            expect( isDatabaseUnavailable( prismaError(
                "P2010",
                "Raw query failed. Code: `unknown`. Message: `Kind: Server selection timeout: " +
                    "No available servers. Topology: { Type: ReplicaSetNoPrimary, Set Name: rs0 }`"
            ) ) ).toBe( true );
        } );

        /**
         * P2010 is every raw query failure, so a query that is simply wrong carries the same code.
         * Treating that as an outage would report the wrong thing and then go quiet about it.
         */
        it( "should not recognise a raw query that merely failed", () => {
            expect( isDatabaseUnavailable( prismaError(
                "P2010",
                "Raw query failed. Code: `unknown`. Message: `unknown field 'nope'`"
            ) ) ).toBe( false );
        } );

        it.each( [
            [ "a missing record", prismaError( "P2025" ) ],
            [ "a plain error", new Error( "Server selection timeout" ) ],
            [ "null", null ]
        ] )( "should not recognise %s", ( _label, error ) => {
            expect( isDatabaseUnavailable( error ) ).toBe( false );
        } );
    } );
} );
