import { isDebugEnabled, isDebugTypeEnabled } from "@vertix.gg/utils/src/environment";

const TYPE = "TESTTYPE",
    ENV_KEY = `DEBUG_${ TYPE }`;

describe( "VertixUtils/Environment", () => {
    const original = process.env[ ENV_KEY ];

    const set = ( value?: string ) => {
        if ( undefined === value ) {
            delete process.env[ ENV_KEY ];
        } else {
            process.env[ ENV_KEY ] = value;
        }
    };

    afterEach( () => set( original ) );

    describe( "isDebugTypeEnabled()", () => {
        it( "should be false when the variable is unset", () => {
            set( undefined );

            expect( isDebugTypeEnabled( TYPE ) ).toBe( false );
        } );

        it.each( [
            [ "empty", "" ],
            [ "whitespace", "   \n  \n" ],
            [ "nothing but comments", "# off for now\n# and this too" ]
        ] )( "should be false when the variable is %s", ( _name, value ) => {
            set( value );

            expect( isDebugTypeEnabled( TYPE ) ).toBe( false );
        } );

        it( "should be true when the variable names anything", () => {
            set( "debug\nshardReady" );

            expect( isDebugTypeEnabled( TYPE ) ).toBe( true );
        } );

        it( "should be true even when everything it names is commented but one", () => {
            set( "# debug\nshardReady\n# ready" );

            expect( isDebugTypeEnabled( TYPE ) ).toBe( true );
        } );
    } );

    describe( "isDebugEnabled()", () => {
        it( "should answer for an entity the variable names", () => {
            set( "debug\nshardReady" );

            expect( isDebugEnabled( TYPE, "shardReady" ) ).toBe( true );
            expect( isDebugEnabled( TYPE, "ready" ) ).toBe( false );
        } );

        it( "should ignore comments and surrounding whitespace", () => {
            set( "  debug  \n# shardReady\n" );

            expect( isDebugEnabled( TYPE, "debug" ) ).toBe( true );
            expect( isDebugEnabled( TYPE, "shardReady" ) ).toBe( false );
        } );

        /**
         * The bug this pair was separated for.
         *
         * Two callers used `isDebugEnabled( type, "" )` as an "is this on at all" gate. Empty lines
         * are filtered out of the list before the lookup, so that question can never be true no
         * matter what the variable says - the block behind those gates never ran, and setting the
         * variable produced silence rather than logs.
         */
        it( "should never answer true for the empty entity, which is why the pair exists", () => {
            set( "debug\nshardReady" );

            expect( isDebugEnabled( TYPE, "" ) ).toBe( false );
            expect( isDebugTypeEnabled( TYPE ) ).toBe( true );
        } );
    } );
} );
