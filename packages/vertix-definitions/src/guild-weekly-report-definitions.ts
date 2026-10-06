/**
 * A server's weekly summary, and the counts it is worked out from that nothing else keeps.
 *
 * Free on every plan. The week is Monday 00:00 UTC to the next Monday, and its summary is posted once,
 * at the bot's first look after the week ends, in the text channel the server picked on the dashboard.
 * A server picks nothing until it wants one: there is no channel it could be posted in by default
 * that every server would want it in.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** A week, in days - the span a summary covers, and the span before it that it is held against. */
export const GUILD_WEEKLY_REPORT_WEEK_DAYS = 7;

export const GUILD_WEEKLY_REPORT_TIMINGS = {
    /** How often the bot looks for a week to post. A week goes out at the first look after it ends. */
    SWEEP_INTERVAL_MS: 30 * 60 * 1000,

    /** How long the api waits for the bot's word on a channel before it saves nothing. */
    STATUS_REQUEST_TIMEOUT_MS: 5000
} as const;

/**
 * How long a member's days in a server's rooms are kept, then deleted.
 *
 * Longer than anything counts back over - the dashboard's month, and a summary's week held against the
 * week before it - and no longer than that, since they name who was in voice and nothing needs them after.
 */
export const GUILD_VOICE_MEMBERS_KEEP_DAYS = 60;

/**
 * Why a week did not go out. Stored on the server's row and shown on the dashboard, so each is a literal.
 */
export const GUILD_WEEKLY_REPORT_ERRORS = {
    /** The channel is gone, or is no longer a text channel the bot can see. */
    CHANNEL_MISSING: "channel-missing",
    /** The bot may no longer post an embed there. */
    CHANNEL_FORBIDDEN: "channel-forbidden"
} as const;

export type TGuildWeeklyReportError = typeof GUILD_WEEKLY_REPORT_ERRORS[ keyof typeof GUILD_WEEKLY_REPORT_ERRORS ];

/**
 * Why the dashboard could not point the summary at a channel. They cross the wire, so each is a literal.
 */
export const GUILD_WEEKLY_REPORT_SAVE_REFUSALS = {
    /** The bot did not answer, so nobody could say whether it can post there. */
    BOT_UNREACHABLE: "bot-unreachable",
    /** The bot is not in the server. */
    BOT_NOT_IN_GUILD: "bot-not-in-guild",
    /** Not a text channel the bot can see, or one it may not post an embed in. */
    CHANNEL_UNUSABLE: "channel-unusable"
} as const;

export type TGuildWeeklyReportSaveRefusal =
    typeof GUILD_WEEKLY_REPORT_SAVE_REFUSALS[ keyof typeof GUILD_WEEKLY_REPORT_SAVE_REFUSALS ];

/**
 * Function isGuildWeeklyReportError() :: Whether a stored string is one of the error codes this build knows.
 */
export function isGuildWeeklyReportError( value: string | null ): value is TGuildWeeklyReportError {
    return Object.values( GUILD_WEEKLY_REPORT_ERRORS ).includes( value as TGuildWeeklyReportError );
}

/**
 * Function resolveWeekStart() :: Monday 00:00 UTC of the week a moment falls in.
 */
export function resolveWeekStart( at: Date ): Date {
    const day = Date.UTC( at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() ),
        daysSinceMonday = ( new Date( day ).getUTCDay() + 6 ) % GUILD_WEEKLY_REPORT_WEEK_DAYS;

    return new Date( day - daysSinceMonday * DAY_MS );
}

/**
 * Function resolveReportedWeekStart() :: Monday 00:00 UTC of the last week that has ended - the one a summary
 * posted now is about.
 */
export function resolveReportedWeekStart( now: Date ): Date {
    return new Date( resolveWeekStart( now ).getTime() - GUILD_WEEKLY_REPORT_WEEK_DAYS * DAY_MS );
}

/**
 * Function addWeeks() :: The same moment so many weeks later - or earlier, for a negative count.
 */
export function addWeeks( at: Date, weeks: number ): Date {
    return new Date( at.getTime() + weeks * GUILD_WEEKLY_REPORT_WEEK_DAYS * DAY_MS );
}

/**
 * What a weekly summary says about one week, beside the week before it.
 */
export interface IGuildWeeklySummary {
    /** Monday 00:00 UTC of the week it is about. */
    weekStart: Date;
    rooms: number;
    roomsBefore: number;
    /** Members who were in the server's rooms that week. */
    members: number;
    membersBefore: number;
    /** The UTC hour of the week the most rooms were made in - the earliest of those that tie, null in a week with none. */
    busiestHour: Date | null;
    busiestHourRooms: number;
    /** The generator whose rooms were made most - null in a week with none. */
    topGenerator: { generatorId: string; rooms: number } | null;
}

/**
 * A server's weekly summary as the dashboard shows it.
 */
export interface IGuildWeeklyReportView {
    /** The channel it is posted in, or null when it is off. */
    channelId: string | null;
    /** Monday of the last week posted, as an ISO timestamp, or null when none has been. */
    lastWeekStart: string | null;
    /** Why the last week did not go out, or null when it did. */
    lastError: TGuildWeeklyReportError | null;
}

/**
 * What the bot answers when asked whether it can post a summary in a channel.
 */
export interface IGuildPostStatus {
    /** The bot answering - a save makes it the one that posts. */
    applicationId: string;
    isBotInGuild: boolean;
    /** What the bot lacks to post an embed there - empty when it can - or null when it is not a text channel the bot can see. */
    missingPermissions: string[] | null;
}
