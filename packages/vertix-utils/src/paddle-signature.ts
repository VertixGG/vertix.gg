import { createHmac, timingSafeEqual } from "crypto";

/**
 * How far out of date a signed request may be before it is refused.
 *
 * Five seconds, which is what paddle's own sdk enforces. The window is what stops a request that was
 * genuinely signed once being replayed for ever afterwards, so it is deliberately short - a webhook
 * arrives in the same breath it was sent, and anything that took longer than five seconds to reach
 * us is worth refusing and letting paddle retry.
 */
export const PADDLE_SIGNATURE_MAX_AGE_SECONDS = 5;

export interface IPaddleSignatureResult {
    isValid: boolean;

    /** Why not, for the log. Never sent back to the caller - it would say which guess was closer. */
    reason?: "malformed-header" | "expired" | "mismatch";
}

/**
 * Function parsePaddleSignature() :: The two halves of a `Paddle-Signature` header.
 *
 * `ts=1234567890;h1=abc…`, in either order and tolerant of spacing, because a header is a thing
 * somebody else formats.
 */
function parsePaddleSignature( header: string ): { ts: string; h1: string } | null {
    const parts = header.split( ";" );

    let ts = "", h1 = "";

    for ( const part of parts ) {
        const [ key, value ] = part.split( "=", 2 ).map( ( piece ) => piece?.trim() ?? "" );

        if ( "ts" === key ) {
            ts = value;
        } else if ( "h1" === key ) {
            h1 = value;
        }
    }

    return ts.length && h1.length ? { ts, h1 } : null;
}

/**
 * Function verifyPaddleSignature() :: Whether paddle really sent this, and recently.
 *
 * The signed payload is the timestamp and the **raw** body joined with a colon - raw meaning exactly
 * the bytes that arrived. A body that has been through a json parser and back has had its key order,
 * its spacing or its number formatting decided by us rather than by paddle, and will not verify no
 * matter how correct it looks.
 *
 * Compared timing-safe, because a comparison that returns early tells anybody willing to measure it
 * how much of their guess was right.
 */
export function verifyPaddleSignature( options: {
    header: string | undefined;
    rawBody: string;
    secret: string;
    now?: Date;
} ): IPaddleSignatureResult {
    const { header, rawBody, secret } = options;

    if ( ! header?.length ) {
        return { isValid: false, reason: "malformed-header" };
    }

    const parsed = parsePaddleSignature( header );

    if ( ! parsed ) {
        return { isValid: false, reason: "malformed-header" };
    }

    const timestamp = Number( parsed.ts );

    if ( ! Number.isFinite( timestamp ) ) {
        return { isValid: false, reason: "malformed-header" };
    }

    const nowSeconds = Math.floor( ( options.now ?? new Date() ).getTime() / 1000 );

    // Absolute, so a clock that is ahead is refused as readily as one that is behind. A signature
    // dated in the future is not a late request, it is a wrong one.
    if ( Math.abs( nowSeconds - timestamp ) > PADDLE_SIGNATURE_MAX_AGE_SECONDS ) {
        return { isValid: false, reason: "expired" };
    }

    const expected = createHmac( "sha256", secret )
        .update( `${ parsed.ts }:${ rawBody }` )
        .digest( "hex" );

    const received = parsed.h1;

    // `timingSafeEqual` throws on a length mismatch rather than answering, so the lengths are
    // checked first - and a wrong length is a wrong signature in any case.
    if ( expected.length !== received.length ) {
        return { isValid: false, reason: "mismatch" };
    }

    const isValid = timingSafeEqual( Buffer.from( expected ), Buffer.from( received ) );

    return isValid ? { isValid: true } : { isValid: false, reason: "mismatch" };
}
