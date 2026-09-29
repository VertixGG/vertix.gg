/**
 * A server's own profile for the bot - the name, avatar, banner and bio it shows in that server.
 *
 * Discord's `Modify Current Member` has taken all four from a bot since 2025-09-10, and each is
 * scoped to the one server it was set in: the bot's own profile, and how it looks in every other
 * server, are untouched. That is what makes it something a server can buy for itself.
 *
 * Sold with Pro - `IBillingTier.includesBranding` - and nothing else changes what the bot looks like.
 */
export interface IGuildBrandingProfile {
    /** The name the bot goes by in the server, or null for its own. */
    nick: string | null;

    /** The bio on its profile card there, or null for none. */
    bio: string | null;

    /** A `data:image/…;base64,` uri, or null for its own avatar. */
    avatar: string | null;

    /** A `data:image/…;base64,` uri, or null for none. */
    banner: string | null;
}

/** The image types discord accepts for an avatar or a banner upload. */
export const GUILD_BRANDING_IMAGE_MIME_TYPES = [ "image/png", "image/jpeg", "image/gif" ] as const;

export type TGuildBrandingImageMimeType = typeof GUILD_BRANDING_IMAGE_MIME_TYPES[ number ];

/**
 * The largest image, decoded, a server may upload - avatar and banner alike.
 *
 * Discord documents no ceiling for these. This one is ours, and it is set by the request rather than
 * by discord: the dashboard sends an image as base64 in json, which is a third larger than the file,
 * and the proxy in front of the api refuses a body over a megabyte. The dashboard shrinks a still
 * image well under it before it is sent; an animated gif is sent as it is, and this is what it is
 * held to.
 */
export const GUILD_BRANDING_IMAGE_MAX_BYTES = 400 * 1024;

/** The square an avatar is shrunk to fit before it is uploaded. Discord draws it far smaller. */
export const GUILD_BRANDING_AVATAR_MAX_DIMENSION = 512;

/** The width a banner is shrunk to before it is uploaded, keeping its shape. */
export const GUILD_BRANDING_BANNER_MAX_WIDTH = 1024;

/** Discord's own bounds on a nickname. */
export const GUILD_BRANDING_NICK_MIN_LENGTH = 1;
export const GUILD_BRANDING_NICK_MAX_LENGTH = 32;

/** The length discord gives a profile bio. The member route does not document one of its own. */
export const GUILD_BRANDING_BIO_MAX_LENGTH = 190;

/**
 * How often a server's profile may be pushed to discord: this many times inside the window below.
 *
 * Discord documents no rate for the route and asks that none be assumed, so this is a ceiling of our
 * own on how hard one server's saves can lean on it. Only saves count - the bot never changes the
 * profile by itself - and it only ever touches the server that asked.
 */
export const GUILD_BRANDING_APPLY_COOLDOWN_MAX = 3;
export const GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS = 10 * 60 * 1000;

/**
 * How often each process looks over the profiles of the servers it holds.
 *
 * What takes a profile away from a server whose plan ran out, and puts it back when it pays again.
 * The end of a paid period sends no event - the row simply stops being true - so something has to
 * come and look.
 */
export const GUILD_BRANDING_RECONCILE_INTERVAL_MS = 10 * 60 * 1000;

/**
 * How long the api waits for the bot to say how an apply went.
 *
 * And, a little inside it, how long the bot waits for discord before answering "pending" instead.
 * discord.js waits out a rate limit rather than failing, which can take longer than anybody should
 * stare at a spinner - so the bot answers in time either way, and what discord finally said is on the
 * next read of the page.
 */
export const GUILD_BRANDING_APPLY_REQUEST_TIMEOUT_MS = 10 * 1000;
export const GUILD_BRANDING_APPLY_ANSWER_TIMEOUT_MS = 8 * 1000;

/**
 * The largest request body the branding route accepts.
 *
 * One image at its ceiling, as base64, and the text around it. The dashboard sends at most one image
 * per request so that two of them never add up to more than the proxy lets through.
 */
export const GUILD_BRANDING_REQUEST_BODY_LIMIT_BYTES = 640 * 1024;

/**
 * What became of asking the bot to apply a server's profile.
 *
 * Codes rather than sentences: the dashboard words each one for the person who pressed save.
 */
export const GUILD_BRANDING_APPLY_OUTCOMES = {
    APPLIED: "applied",
    /** Sent to discord, which has not answered yet - the result lands on the next read. */
    PENDING: "pending",
    NOT_ENTITLED: "not-entitled",
    COOLDOWN: "cooldown",
    INVALID_IMAGE: "invalid-image",
    /** The bot is not in the server, or this process does not hold it. */
    GUILD_NOT_AVAILABLE: "guild-not-available",
    DISCORD_REFUSED: "discord-refused",
    /** Something on our side went wrong - the database, or discord being unreachable. Logged, not shown. */
    FAILED: "failed"
} as const;

export type TGuildBrandingApplyOutcome =
    typeof GUILD_BRANDING_APPLY_OUTCOMES[ keyof typeof GUILD_BRANDING_APPLY_OUTCOMES ];

/**
 * The first bytes each accepted type starts with.
 *
 * Checked against the bytes, not only the declared type: a uri claiming `image/png` over something
 * else is refused here rather than handed to discord to refuse.
 */
const GUILD_BRANDING_IMAGE_SIGNATURES: Record<TGuildBrandingImageMimeType, readonly number[][]> = {
    "image/png": [ [ 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A ] ],
    "image/jpeg": [ [ 0xFF, 0xD8, 0xFF ] ],
    "image/gif": [
        [ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 ],
        [ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ]
    ]
};

const GUILD_BRANDING_DATA_URI_PATTERN = /^data:(image\/(?:png|jpeg|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

export interface IGuildBrandingImage {
    mimeType: TGuildBrandingImageMimeType;
    /** The decoded size, in bytes. */
    byteLength: number;
}

function isGuildBrandingImageMimeType( value: string ): value is TGuildBrandingImageMimeType {
    return ( GUILD_BRANDING_IMAGE_MIME_TYPES as readonly string[] ).includes( value );
}

/**
 * Function parseGuildBrandingImage() :: An uploaded image, if it is one this accepts.
 *
 * Null for anything that is not a base64 `data:` uri of an accepted type, whose bytes are that type,
 * and that fits under `GUILD_BRANDING_IMAGE_MAX_BYTES`.
 *
 * **This is a security boundary, not a courtesy.** discord.js resolves an image it is given: a
 * string that is not a `data:` uri it fetches as a url, or reads off the disk as a path. A profile is
 * written by whoever manages a server, so a string that reached `editMe()` without passing here could
 * make the bot fetch an address of their choosing, or upload a file of the host's as the avatar. The
 * api checks on the way in and the bot checks again on the way out, and both check with this.
 *
 * Decoded with `atob`, which both the browser and the runtime have, so the dashboard can ask the same
 * question before it sends anything.
 */
export function parseGuildBrandingImage( value: string ): IGuildBrandingImage | null {
    const match = GUILD_BRANDING_DATA_URI_PATTERN.exec( value );

    if ( ! match ) {
        return null;
    }

    const [ , mimeType, base64 ] = match;

    // Base64 comes in groups of four characters. A length that is not a multiple of four is not an
    // image anything can decode, and discord would only refuse it later.
    if ( ! isGuildBrandingImageMimeType( mimeType ) || 0 !== base64.length % 4 ) {
        return null;
    }

    const padding = base64.endsWith( "==" ) ? 2 : base64.endsWith( "=" ) ? 1 : 0,
        byteLength = Math.floor( base64.length * 3 / 4 ) - padding;

    if ( byteLength <= 0 || byteLength > GUILD_BRANDING_IMAGE_MAX_BYTES ) {
        return null;
    }

    let head: string;

    try {
        // Twelve characters decode to nine bytes - past the longest signature there is.
        head = atob( base64.slice( 0, 12 ) );
    } catch {
        return null;
    }

    const matchesSignature = GUILD_BRANDING_IMAGE_SIGNATURES[ mimeType ].some( ( signature ) =>
        signature.every( ( byte, index ) => head.charCodeAt( index ) === byte ) );

    if ( ! matchesSignature ) {
        return null;
    }

    return { mimeType, byteLength };
}

/**
 * Why a profile cannot be saved as it is, one reason per field that is wrong.
 *
 * Empty when it can. A field that is null is always fine - it means the bot's own.
 */
export function validateGuildBrandingProfile( profile: IGuildBrandingProfile ): string[] {
    const reasons: string[] = [];

    if ( null !== profile.nick ) {
        const length = profile.nick.trim().length;

        if ( length < GUILD_BRANDING_NICK_MIN_LENGTH || length > GUILD_BRANDING_NICK_MAX_LENGTH ) {
            reasons.push(
                `The name has to be ${ GUILD_BRANDING_NICK_MIN_LENGTH } to ${ GUILD_BRANDING_NICK_MAX_LENGTH } characters.`
            );
        }
    }

    if ( null !== profile.bio && profile.bio.length > GUILD_BRANDING_BIO_MAX_LENGTH ) {
        reasons.push( `The bio can be at most ${ GUILD_BRANDING_BIO_MAX_LENGTH } characters.` );
    }

    const maxKilobytes = GUILD_BRANDING_IMAGE_MAX_BYTES / 1024;

    if ( null !== profile.avatar && ! parseGuildBrandingImage( profile.avatar ) ) {
        reasons.push( `The avatar has to be a PNG, JPEG or GIF of at most ${ maxKilobytes } KB.` );
    }

    if ( null !== profile.banner && ! parseGuildBrandingImage( profile.banner ) ) {
        reasons.push( `The banner has to be a PNG, JPEG or GIF of at most ${ maxKilobytes } KB.` );
    }

    return reasons;
}
