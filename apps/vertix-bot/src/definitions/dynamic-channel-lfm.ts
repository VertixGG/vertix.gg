import { DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS } from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

export const DYNAMIC_CHANNEL_LFM_LIMITS = {
    MAX_CHANNELS: 10,

    NOTE_MIN_LENGTH: 0,

    NOTE_MAX_LENGTH: 128,

    MAX_PING_ROLES: 5,

    // A room of fifty would otherwise draw fifty segments; past ten the bar stops being a glance
    // and the numbers beside it are the real answer anyway.
    SLOTS_BAR_MAX_SEGMENTS: 10
} as const;

export const DYNAMIC_CHANNEL_LFM_PARTS = {
    SLOT_TAKEN: "●",

    SLOT_OPEN: "○"
} as const;

/**
 * What a master channel that chose nothing runs on.
 *
 * Read from the shared fallbacks rather than written again here, so the numbers an admin sees
 * offered in the setup screen and the numbers the feature uses when nobody has been near it are
 * the same numbers.
 *
 * The ping cooldown is far longer than the post cooldown, and counted per destination rather than
 * per room: a channel that is pinged every time somebody posts is a channel people mute, and a
 * muted lfm channel is worth less than one that never pinged at all.
 */
export const DYNAMIC_CHANNEL_LFM_TIMING = {
    POST_COOLDOWN_MS: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown,

    PING_COOLDOWN_MS: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.pingCooldown,

    POST_EXPIRY_MS: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry,

    OCCUPANCY_DEBOUNCE_DELAY_MS: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.occupancyDebounce
} as const;

/**
 * How often a standing post redraws so its countdown moves.
 *
 * Not one of the four a generator can set, because it is the bot's own cost rather than the
 * server's behaviour. Paired with the tenths-of-a-minute countdown, which changes every six
 * seconds - a redraw slower than the number it draws leaves a post looking frozen, and one faster
 * spends an edit to write the same text again.
 */
export const DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS = 5 * 1000;

export enum DynamicChannelLfmPostResultCode {
    Error = 0,
    Success = "success",
    NotConfigured = "not-configured",
    Cooldown = "cooldown",
    AlreadyPosted = "already-posted",
    ChannelHidden = "channel-hidden",
    ChannelPrivate = "channel-private",
    ChannelFull = "channel-full"
}

export interface IDynamicChannelLfmPostResult {
    code: DynamicChannelLfmPostResultCode;
    postedChannelId?: string;
    retryAfterMs?: number;
}
