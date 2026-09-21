/**
 * The bitrates a channel owner may pick, in bits per second.
 *
 * Discord's own control is a slider, and the API takes any number between its floor and whatever
 * the guild's boost tier allows - so a menu has to pick points on that slider. These are the tier
 * boundaries it has, 96, 128, 256 and 384, plus the steps below them a room can drop to when it
 * would rather be cheap on somebody's data than sound good.
 *
 * Here rather than beside whichever interface drew the menu first, because both interfaces draw the
 * same menu and a copy per interface is how the two come to disagree about what `128 kbps` means.
 */
export const BITRATE_STEPS = [ 8_000, 16_000, 32_000, 64_000, 96_000, 128_000, 256_000, 384_000 ] as const;

/** Discord's floor, which is below every guild's maximum whatever its tier. */
export const BITRATE_MINIMUM = 8_000;

/**
 * The value meaning no choice of the owner's, which resolves to the generator's own bitrate.
 *
 * The counterpart of the region menu's `auto`. Without it a menu has no way back, and an owner who
 * nudged it is left reaching for `/voice reset` - which also throws away their name, their limit
 * and everyone they let in.
 */
export const BITRATE_INHERIT_VALUE = "inherit";

const BITS_PER_KILOBIT = 1_000;

/**
 * Function bitrateToKilobits() :: A bitrate as the number people read it in.
 *
 * Discord's own interface says `64 kbps` and its API takes `64000`. Nobody thinks in bits per
 * second, and the raw number printed in an embed reads as a mistake.
 */
export function bitrateToKilobits( bitrate: number ): number {
    return Math.round( bitrate / BITS_PER_KILOBIT );
}

/**
 * Function getBitrateSteps() :: The steps a guild may actually use.
 *
 * A guild with no maximum to measure against gets every step, and that is the case that matters
 * rather than a fallback: the ui exporter runs headless, with no guild behind the menu at all. A
 * list narrowed to nothing there bakes an empty menu into the catalogue, which leaves the dashboard
 * with nothing to reword and every language file with nothing to translate.
 */
export function getBitrateSteps( maximumBitrate?: number | null ): number[] {
    if ( ! maximumBitrate ) {
        return [ ...BITRATE_STEPS ];
    }

    return BITRATE_STEPS.filter( ( step ) => step <= maximumBitrate );
}

/**
 * Function clampBitrate() :: A chosen bitrate, held to what the guild allows.
 *
 * The menu says what was allowed when the screen was drawn; the guild says what is allowed now, and
 * between those two moments a server can lose a boost. Discord answers a bitrate over the maximum
 * by refusing the whole edit, so the choice is brought down to the ceiling rather than thrown away.
 */
export function clampBitrate( bitrate: number, maximumBitrate: number ): number {
    return Math.min( Math.max( bitrate, BITRATE_MINIMUM ), maximumBitrate );
}
