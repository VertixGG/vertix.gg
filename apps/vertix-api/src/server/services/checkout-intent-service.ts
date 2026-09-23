import crypto from "node:crypto";

import { discordConfig } from "@vertix.gg/api/src/server/config/discord";

const INTENT_LIFETIME_MS = 10 * 60 * 1000;

const SIGNATURE_LENGTH_BYTES = 32;

/**
 * The key this signs with, derived from the session secret rather than asked for separately.
 *
 * One secret to deploy rather than two, and a label so the derived key is not the session key: a
 * token minted here can never be mistaken for a session, or the reverse, even though both trace
 * back to the same configured value.
 */
function signingKey(): Buffer {
    return crypto.createHmac( "sha256", discordConfig.getSessionSecret() )
        .update( "vertix/checkout-intent" )
        .digest();
}

export interface ICheckoutIntent {
    guildId: string;
    priceId: string;
    slug: string;
    expiresAt: number;
}

function encode( value: object ): string {
    return Buffer.from( JSON.stringify( value ), "utf8" ).toString( "base64url" );
}

function sign( payload: string ): string {
    return crypto.createHmac( "sha256", signingKey() ).update( payload ).digest( "base64url" );
}

/**
 * Function mintCheckoutIntent() :: Says, in a form that travels, that this guild may be paid for.
 *
 * The checkout is opened from the marketing site, because that is the domain paddle approved to
 * launch one from - and that site has no session to ask who anybody is. So the dashboard, which
 * does, has the api vouch for the guild here, and the site carries the answer rather than being
 * trusted to name a guild itself. Without this a typed url would attach a paid plan to a server
 * the payer does not own.
 *
 * Short-lived because it only has to survive one redirect.
 */
export function mintCheckoutIntent( guildId: string, priceId: string, slug: string ): string {
    const payload = encode( {
        guildId,
        priceId,
        slug,
        expiresAt: Date.now() + INTENT_LIFETIME_MS
    } satisfies ICheckoutIntent );

    return `${ payload }.${ sign( payload ) }`;
}

/**
 * Function readCheckoutIntent() :: The intent a token carries, or nothing at all.
 *
 * Answers `null` for every way a token can be wrong rather than saying which - a caller has no use
 * for the difference, and telling one apart from another is how a signature gets probed.
 */
export function readCheckoutIntent( token: string ): ICheckoutIntent | null {
    const [ payload, signature ] = token.split( "." );

    if ( ! payload || ! signature ) {
        return null;
    }

    const expected = Buffer.from( sign( payload ), "base64url" );
    const given = Buffer.from( signature, "base64url" );

    // Compared in constant time, and only once both are the same length: `timingSafeEqual` throws
    // on a length mismatch, and a throw is itself an answer about the signature.
    if ( given.length !== SIGNATURE_LENGTH_BYTES || expected.length !== SIGNATURE_LENGTH_BYTES ) {
        return null;
    }

    if ( ! crypto.timingSafeEqual( expected, given ) ) {
        return null;
    }

    try {
        const intent = JSON.parse( Buffer.from( payload, "base64url" ).toString( "utf8" ) ) as ICheckoutIntent;

        if ( ! intent.guildId || ! intent.priceId || Date.now() > intent.expiresAt ) {
            return null;
        }

        return intent;
    } catch {
        return null;
    }
}
