/**
 * The timings a guild may hold of its own, every value in milliseconds.
 *
 * Each one has an environment variable behind it, which is what a guild that set nothing falls
 * back to - the environment is the default rather than the value, so an operator changing it moves
 * every guild that never chose otherwise.
 */
export interface GuildTimingsInterface {
    claimOwnershipTimeout: number;
    claimOwnershipTimerInterval: number;
    voteTimeout: number;
    voteAddTime: number;
    voteTimerInterval: number;
}

export type TGuildTimingsField = keyof GuildTimingsInterface;

export type TGuildTimingsOverrides = Partial<GuildTimingsInterface>;

/**
 * The slice each manager runs on - neither has any use for the other's, and a vote event carrying
 * a sweep interval it never reads is a vote event that looks like it might.
 */
export type TClaimTimings = Pick<GuildTimingsInterface, "claimOwnershipTimeout" | "claimOwnershipTimerInterval">;

export type TVoteTimings = Pick<GuildTimingsInterface, "voteTimeout" | "voteAddTime" | "voteTimerInterval">;

export interface GuildTimingsBoundsInterface {
    min: number;
    max: number;
}

const SECOND = 1000,
    MINUTE = 60 * SECOND,
    HOUR = 60 * MINUTE;

export const GUILD_TIMINGS_ENV_VARS: Record<TGuildTimingsField, string> = {
    claimOwnershipTimeout: "DYNAMIC_CHANNEL_CLAIM_OWNERSHIP_TIMEOUT",
    claimOwnershipTimerInterval: "DYNAMIC_CHANNEL_CLAIM_OWNERSHIP_TIMER_INTERVAL",
    voteTimeout: "DYNAMIC_CHANNEL_VOTE_TIMEOUT",
    voteAddTime: "DYNAMIC_CHANNEL_VOTE_ADD_TIME",
    voteTimerInterval: "DYNAMIC_CHANNEL_VOTE_TIMER_INTERVAL"
} as const;

export const GUILD_TIMINGS_FALLBACKS: Record<TGuildTimingsField, number> = {
    claimOwnershipTimeout: 10 * MINUTE,
    claimOwnershipTimerInterval: MINUTE,
    voteTimeout: MINUTE,
    voteAddTime: MINUTE,
    voteTimerInterval: SECOND
} as const;

/**
 * What a guild is allowed to choose.
 *
 * The floors are what keeps a sweep interval from waking the claim manager every few milliseconds
 * across every guild that set one - the timeouts are behaviour, the intervals are cost.
 */
export const GUILD_TIMINGS_BOUNDS: Record<TGuildTimingsField, GuildTimingsBoundsInterface> = {
    claimOwnershipTimeout: { min: 30 * SECOND, max: 24 * HOUR },
    claimOwnershipTimerInterval: { min: 10 * SECOND, max: 24 * HOUR },
    voteTimeout: { min: 5 * SECOND, max: 24 * HOUR },
    voteAddTime: { min: 5 * SECOND, max: 24 * HOUR },
    voteTimerInterval: { min: SECOND, max: 24 * HOUR }
} as const;

export const GUILD_TIMINGS_FIELDS = Object.keys( GUILD_TIMINGS_FALLBACKS ) as TGuildTimingsField[];
