import { createHmac, timingSafeEqual } from "crypto";

const IPC_SECRET_ENV_KEY = "IPC_SHARED_SECRET";

/**
 * How far apart a message's timestamp may be from now before it is refused.
 *
 * Every participant runs on the same host, so the only thing this window has to tolerate is the
 * hop through Redis. It is what bounds a replay: a captured `delete` is worthless once it expires,
 * and keeping the window short is cheaper than remembering every id that has been seen.
 */
const IPC_MAX_AGE_MS = 60000;

export class IPCAuthError extends Error {}

/**
 * Deterministic serialization, so both ends sign the same bytes.
 *
 * `JSON.stringify` walks a parsed object in whatever order the keys landed in, which is not the
 * order the sender wrote them - numeric-looking keys in particular come back first. Sorting at
 * every level removes the question.
 */
function stableStringify( value: unknown ): string {
    if ( null === value || "object" !== typeof value ) {
        return JSON.stringify( value ?? null );
    }

    if ( Array.isArray( value ) ) {
        return `[${ value.map( stableStringify ).join( "," ) }]`;
    }

    const entries = Object.keys( value as Record<string, unknown> )
        .sort()
        .map( ( key ) => {
            const entry = ( value as Record<string, unknown> )[ key ];

            return undefined === entry ? null : `${ JSON.stringify( key ) }:${ stableStringify( entry ) }`;
        } )
        .filter( ( entry ): entry is string => null !== entry );

    return `{${ entries.join( "," ) }}`;
}

/**
 * Function getSecret() :: The shared secret, or a refusal naming what is missing.
 *
 * Absent, nothing is signed and nothing is accepted. That is deliberate: the alternative - passing
 * messages through unsigned when the key is not configured - is the hole this exists to close, and
 * it would close it only on the machines that happened to be set up correctly.
 */
function getSecret(): string {
    const secret = process.env[ IPC_SECRET_ENV_KEY ]?.trim();

    if ( ! secret ) {
        throw new IPCAuthError(
            `'${ IPC_SECRET_ENV_KEY }' is not set - IPC management messages cannot be signed or verified. ` +
            "Set the same value for every Vertix process that shares this Redis instance."
        );
    }

    return secret;
}

export function isIPCAuthConfigured(): boolean {
    return Boolean( process.env[ IPC_SECRET_ENV_KEY ]?.trim() );
}

/**
 * Function signIPCEnvelope() :: The signature for an envelope, over everything but the signature.
 *
 * The id, timestamp and channel are signed alongside the payload, so a message cannot be lifted
 * onto a different channel or held and sent back later still carrying a valid signature.
 */
export function signIPCEnvelope( envelope: object ): string {
    const { signature: _signature, ...unsigned } = envelope as Record<string, unknown>;

    return createHmac( "sha256", getSecret() )
        .update( stableStringify( unsigned ) )
        .digest( "hex" );
}

/**
 * Function verifyIPCEnvelope() :: Whether an envelope was signed by a process holding the secret
 * and is recent enough to act on.
 *
 * Returns the reason rather than throwing, so a caller can log which message it dropped and why
 * without the refusal travelling any further.
 */
export function verifyIPCEnvelope( envelope: object ): { valid: true } | { valid: false; reason: string } {
    const { signature, timestamp } = envelope as { signature?: unknown; timestamp?: unknown };

    if ( "string" !== typeof signature || ! signature.length ) {
        return { valid: false, reason: "message carries no signature" };
    }

    if ( "number" !== typeof timestamp || ! Number.isFinite( timestamp ) ) {
        return { valid: false, reason: "message carries no usable timestamp" };
    }

    const age = Math.abs( Date.now() - timestamp );

    if ( age > IPC_MAX_AGE_MS ) {
        return { valid: false, reason: `message is ${ age }ms out of date, over the ${ IPC_MAX_AGE_MS }ms window` };
    }

    let expected: string;

    try {
        expected = signIPCEnvelope( envelope );
    } catch( error ) {
        return { valid: false, reason: error instanceof Error ? error.message : "could not compute a signature" };
    }

    const received = Buffer.from( signature, "hex" );
    const computed = Buffer.from( expected, "hex" );

    // A length mismatch never reaches timingSafeEqual, which throws on one.
    if ( received.length !== computed.length || ! timingSafeEqual( received, computed ) ) {
        return { valid: false, reason: "signature does not match" };
    }

    return { valid: true };
}
