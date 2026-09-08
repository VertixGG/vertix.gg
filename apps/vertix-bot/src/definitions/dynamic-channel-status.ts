export const DYNAMIC_CHANNEL_STATUS_LIMITS = {
    // Discord hard limit for the voice channel status field.
    API_MAX_LENGTH: 500,

    CUSTOM_MIN_LENGTH: 0,
    // Keeps a custom status readable where Discord renders it, under the channel name.
    CUSTOM_MAX_LENGTH: 128
} as const;

export const DYNAMIC_CHANNEL_STATUS_TIMING = {
    // Coalesces bursts of voice state changes into a single API write.
    DEBOUNCE_DELAY_MS: 1500
} as const;

export const DYNAMIC_CHANNEL_STATUS_PARTS = {
    SEPARATOR: " · ",

    // Stands in for the denominator when the channel has no user limit.
    OCCUPANCY_NO_LIMIT: "infinity",

    // A game name long enough to push the occupancy out of view helps nobody.
    GAME_MAX_LENGTH: 48,

    STATE_PRIVATE: "private",
    STATE_HIDDEN: "hidden"
} as const;

export const DYNAMIC_CHANNEL_STATUS_ROUTE_SUFFIX = "/voice-status";

export enum DynamicChannelSetStatusResultCode {
    Error = 0,
    Success = "success",
    Cleared = "cleared",
    Badword = "badword"
}

export interface IDynamicChannelSetStatusResult {
    code: DynamicChannelSetStatusResultCode;
    status?: string;
    badword?: string;
}
