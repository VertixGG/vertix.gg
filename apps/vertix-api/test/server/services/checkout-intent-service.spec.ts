import { jest } from "@jest/globals";

import {
    mintCheckoutIntent,
    readCheckoutIntent
} from "@vertix.gg/api/src/server/services/checkout-intent-service";

const GUILD_ID = "1110248409761316944";
const PRICE_ID = "pri_01m320wfr9xvvz931wekde9bd0";
const SLUG = "pro";

const payloadOf = ( token: string ) => token.split( "." )[ 0 ];
const signatureOf = ( token: string ) => token.split( "." )[ 1 ];

const reEncode = ( payload: string, change: ( value: Record<string, unknown> ) => void ) => {
    const decoded = JSON.parse( Buffer.from( payload, "base64url" ).toString( "utf8" ) ) as Record<string, unknown>;

    change( decoded );

    return Buffer.from( JSON.stringify( decoded ), "utf8" ).toString( "base64url" );
};

/**
 * The token that carries a checkout from the dashboard to the site allowed to open one.
 *
 * It is the only thing standing between a typed address and a paid plan landing on somebody else's
 * server, so the tests that matter here are the ones where it is wrong rather than the one where
 * it is right.
 */
describe( "VertixAPI/Services/CheckoutIntent", () => {
    let secret: string | undefined;

    beforeEach( () => {
        secret = process.env.DASHBOARD_SESSION_SECRET;

        process.env.DASHBOARD_SESSION_SECRET = "a-secret-for-this-test";
    } );

    afterEach( () => {
        if ( undefined === secret ) {
            delete process.env.DASHBOARD_SESSION_SECRET;
        } else {
            process.env.DASHBOARD_SESSION_SECRET = secret;
        }

        jest.restoreAllMocks();
    } );

    describe( "a token it made itself", () => {
        it( "should read back what it was given", () => {
            // Act.
            const intent = readCheckoutIntent( mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG ) );

            // Assert.
            expect( intent ).toMatchObject( { guildId: GUILD_ID, priceId: PRICE_ID, slug: SLUG } );
        } );
    } );

    describe( "a token that is wrong", () => {
        it( "should refuse one whose guild was edited", () => {
            // Arrange - the attack this exists for: pay for a server you do not own.
            const token = mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG );
            const edited = reEncode( payloadOf( token ), ( value ) => {
                value.guildId = "999999999999999999";
            } );

            // Act & Assert.
            expect( readCheckoutIntent( `${ edited }.${ signatureOf( token ) }` ) ).toBeNull();
        } );

        it( "should refuse one whose price was edited", () => {
            // Arrange.
            const token = mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG );
            const edited = reEncode( payloadOf( token ), ( value ) => {
                value.priceId = "pri_cheaper";
            } );

            // Act & Assert.
            expect( readCheckoutIntent( `${ edited }.${ signatureOf( token ) }` ) ).toBeNull();
        } );

        it( "should refuse one whose expiry was pushed out", () => {
            // Arrange.
            const token = mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG );
            const edited = reEncode( payloadOf( token ), ( value ) => {
                value.expiresAt = Date.now() + 31536000000;
            } );

            // Act & Assert.
            expect( readCheckoutIntent( `${ edited }.${ signatureOf( token ) }` ) ).toBeNull();
        } );

        it( "should refuse one signed with another secret", () => {
            // Arrange - what a token minted against a different deployment amounts to here.
            const token = mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG );

            process.env.DASHBOARD_SESSION_SECRET = "a-different-secret";

            // Act & Assert.
            expect( readCheckoutIntent( token ) ).toBeNull();
        } );

        it( "should refuse one that has expired", () => {
            // Arrange.
            const token = mintCheckoutIntent( GUILD_ID, PRICE_ID, SLUG );

            jest.spyOn( Date, "now" ).mockReturnValue( Date.now() + 31536000000 );

            // Act & Assert.
            expect( readCheckoutIntent( token ) ).toBeNull();
        } );

        it.each( [
            [ "empty", "" ],
            [ "no signature at all", "abc" ],
            [ "an empty signature", "abc." ],
            [ "a signature of the wrong length", "abc.dGlueQ" ],
            [ "a payload that is not json", `${ Buffer.from( "not json" ).toString( "base64url" ) }.x` ]
        ] )( "should refuse a token that is %s", ( _label, token ) => {
            // Act & Assert.
            expect( readCheckoutIntent( token ) ).toBeNull();
        } );
    } );
} );
