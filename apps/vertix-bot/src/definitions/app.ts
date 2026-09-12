export const VERTIX_DEFAULT_COLOR_BRAND = 0x336beb,
    VERTIX_DEFAULT_COLOR_YELLOW = 0xffd700,
    VERTIX_DEFAULT_COLOR_ORANGE_RED = 0xff6900;

/**
 * The mark Vertix puts in the corner of an embed.
 *
 * Taken from the website's `public` folder rather than its build output on purpose. A bundled asset
 * carries a content hash in its name, and the hash moves on every rebuild - which is how the
 * thumbnail this replaced came to be a 404 nobody noticed.
 */
export const VERTIX_BRAND_THUMBNAIL_URL = "https://voicechannels.online/vc-naked.png";

export const VERTIX_PROTECTED_ID = "1071097917743583384";

export const VERTIX_DEFAULT_SURVEY_COLLECTOR_ID = VERTIX_PROTECTED_ID;

export const VERTIX_OWNERS_IDS = [ VERTIX_PROTECTED_ID ];
