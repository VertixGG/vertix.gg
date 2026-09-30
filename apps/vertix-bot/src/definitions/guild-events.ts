/**
 * What a check-in board is showing. The run's phases, and one of its own: a board whose event was
 * moved before it began says where it went.
 */
export const GUILD_EVENT_BOARD_STATES = {
    CHECK_IN: "check-in",
    RUNNING: "running",
    ENDED: "ended",
    CANCELED: "canceled",
    MOVED: "moved"
} as const;

export type TGuildEventBoardState = typeof GUILD_EVENT_BOARD_STATES[ keyof typeof GUILD_EVENT_BOARD_STATES ];

/** How what a board or a "need a sub" post says is reduced to something that can be compared. */
export const GUILD_EVENTS_HASH_ALGORITHM = "md5";

/**
 * Where the join link points when it has no channel to point at - only ever the case while the
 * screens are exported, since a link button has to carry some address to be drawn at all.
 */
export const GUILD_EVENTS_JOIN_FALLBACK_URL = "https://discord.com/channels/@me";
