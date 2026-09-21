import { createHmac } from "crypto";

import { verifyPaddleSignature } from "@vertix.gg/utils/src/paddle-signature";

const SECRET = "pdl_ntfset_secret";

const BODY = JSON.stringify( {
    event_type: "subscription.updated",
    data: { id: "sub_123", status: "active" }
} );

/** A fixed moment, so "five seconds ago" is arithmetic rather than a race with the clock. */
const NOW = new Date( "2026-09-21T12:00:00.000Z" );

const secondsAt = ( date: Date ) => Math.floor( date.getTime() / 1000 );

const sign = ( timestamp: number, body: string, secret = SECRET ) =>
    createHmac( "sha256", secret ).update( `${ timestamp }:${ body }` ).digest( "hex" );

const headerFor = ( options: { timestamp?: number; body?: string; secret?: string } = {} ) => {
    const timestamp = options.timestamp ?? secondsAt( NOW );

    return `ts=${ timestamp };h1=${ sign( timestamp, options.body ?? BODY, options.secret ) }`;
};

describe( "VertixUtils/PaddleSignature", () => {
    it( "should accept what paddle actually signed", () => {
        // Act.
        const result = verifyPaddleSignature( { header: headerFor(), rawBody: BODY, secret: SECRET, now: NOW } );

        // Assert.
        expect( result.isValid ).toBe( true );
    } );

    it( "should refuse a body that was changed after signing", () => {
        // Act - the signature is real, the body is not the one it was made from.
        const result = verifyPaddleSignature( {
            header: headerFor(),
            rawBody: BODY.replace( "active", "canceled" ),
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result ).toEqual( { isValid: false, reason: "mismatch" } );
    } );

    it( "should refuse a signature made with another secret", () => {
        // Act.
        const result = verifyPaddleSignature( {
            header: headerFor( { secret: "someone-elses-secret" } ),
            rawBody: BODY,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result ).toEqual( { isValid: false, reason: "mismatch" } );
    } );

    it( "should accept one signed within the window", () => {
        // Act - four seconds is late, and still inside five.
        const result = verifyPaddleSignature( {
            header: headerFor( { timestamp: secondsAt( NOW ) - 4 } ),
            rawBody: BODY,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result.isValid ).toBe( true );
    } );

    it( "should refuse one signed too long ago to be this request", () => {
        // Act - a genuine signature replayed later is the thing the window exists for.
        const result = verifyPaddleSignature( {
            header: headerFor( { timestamp: secondsAt( NOW ) - 6 } ),
            rawBody: BODY,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result ).toEqual( { isValid: false, reason: "expired" } );
    } );

    it( "should refuse one dated in the future", () => {
        // Act - not a late request, a wrong one.
        const result = verifyPaddleSignature( {
            header: headerFor( { timestamp: secondsAt( NOW ) + 30 } ),
            rawBody: BODY,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result ).toEqual( { isValid: false, reason: "expired" } );
    } );

    it.each( [
        [ "nothing at all", undefined ],
        [ "an empty header", "" ],
        [ "only a timestamp", `ts=${ secondsAt( NOW ) }` ],
        [ "only a hash", "h1=abc123" ],
        [ "a timestamp that is not a number", "ts=yesterday;h1=abc123" ],
        [ "something else entirely", "Bearer token" ]
    ] )( "should refuse %s", ( _label, header ) => {
        // Act.
        const result = verifyPaddleSignature( { header, rawBody: BODY, secret: SECRET, now: NOW } );

        // Assert.
        expect( result.isValid ).toBe( false );
        expect( result.reason ).toBe( "malformed-header" );
    } );

    it( "should read the halves in either order", () => {
        // Act - the order is paddle's to choose and not ours to depend on.
        const timestamp = secondsAt( NOW );

        const result = verifyPaddleSignature( {
            header: `h1=${ sign( timestamp, BODY ) };ts=${ timestamp }`,
            rawBody: BODY,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result.isValid ).toBe( true );
    } );

    it( "should refuse a body that was parsed and re-serialised on the way in", () => {
        // Act - the same object, spelled the way `JSON.stringify` spells it rather than the way it
        // arrived. This is the mistake a json body parser makes for you, and it is unverifiable.
        const reserialised = JSON.stringify( JSON.parse( BODY ), null, 4 );

        const result = verifyPaddleSignature( {
            header: headerFor(),
            rawBody: reserialised,
            secret: SECRET,
            now: NOW
        } );

        // Assert.
        expect( result ).toEqual( { isValid: false, reason: "mismatch" } );
    } );
} );
