/**
 * Events - what the bot does around a server's own scheduled events.
 *
 * A board goes up before one starts, the members on its "Interested" list check in by being in its
 * voice channel, the ones who never came are marked, a post asks somebody to take their place, and
 * the board ends as the attendance. Built on discord's Scheduled Events, so the roster is the event's
 * own list and nothing here needs a privileged intent.
 */

/**
 * Where one occurrence of an event stands.
 *
 * Stored on every run, so these are a storage contract: renaming one strands every run filed under it.
 */
export const GUILD_EVENT_RUN_PHASES = {
    /** The board is up and the roster still follows the event. */
    CHECK_IN: "check-in",
    /** The roster is frozen and whoever had not come is marked. */
    RUNNING: "running",
    /** Over - the board is the attendance now. */
    ENDED: "ended",
    /** Called off, or moved, before it began - the board says so and there is no attendance. */
    CANCELED: "canceled"
} as const;

export type TGuildEventRunPhase = typeof GUILD_EVENT_RUN_PHASES[ keyof typeof GUILD_EVENT_RUN_PHASES ];

/**
 * Why Events could not do its part in a server, kept for the settings screen to show.
 *
 * Codes rather than sentences - the screen words each one - and stored, so a storage contract too.
 */
export const GUILD_EVENTS_ERRORS = {
    /** The channel Events posts in is gone. */
    POST_CHANNEL_MISSING: "post-channel-missing",
    /** The bot cannot see, write or embed in the channel Events posts in. */
    POST_CHANNEL_FORBIDDEN: "post-channel-forbidden",
    /** The bot cannot see an event's voice channel, so neither its roster nor who is in it. */
    EVENT_CHANNEL_FORBIDDEN: "event-channel-forbidden",
    /** One run's board was deleted - kept on that run only, so nobody tries to edit it again. */
    BOARD_DELETED: "board-deleted"
} as const;

export type TGuildEventsError = typeof GUILD_EVENTS_ERRORS[ keyof typeof GUILD_EVENTS_ERRORS ];

/**
 * The clock a run keeps.
 *
 * Measured from the start discord has for the event, not from anybody pressing Start: a voice event
 * only becomes active when a member starts it, and plenty of servers never do.
 */
export const GUILD_EVENTS_TIMINGS = {
    /** How long before the start the board goes up and check-in opens. */
    CHECK_IN_LEAD_MS: 15 * 60 * 1000,
    /** How long after the start somebody on the roster who has not come is marked as not coming. */
    NO_SHOW_AFTER_MS: 10 * 60 * 1000,
    /** How long the event's channels have to stay empty, once the roster froze, for the run to end. */
    EMPTY_END_AFTER_MS: 10 * 60 * 1000,
    /** The longest a run stays open, whatever else happens. */
    RUN_MAX_MS: 12 * 60 * 60 * 1000,
    /** How often each process looks over the events of the servers it holds. */
    SWEEP_INTERVAL_MS: 60 * 1000,
    /** The least time between two edits of one board, so a crowd arriving at once is one edit. */
    BOARD_EDIT_MIN_INTERVAL_MS: 10 * 1000
} as const;

/** How much of a roster is read, and how much of it one board shows. */
export const GUILD_EVENTS_LIMITS = {
    /** The most members read off an event's "Interested" list. */
    ROSTER_MAX: 500,
    /**
     * The most members a board lists under one heading; the rest are counted instead.
     *
     * Four lists of this many, each line a mention and a duration, stay well inside the one embed
     * description everything on a board has to fit in.
     */
    BOARD_LIST_MAX: 20
} as const;

/**
 * What a member was at one run, as the attendance reads it.
 *
 * Worked out from the stored row rather than stored itself, by one rule the bot's board and the
 * dashboard both use - so the two never disagree about who was late.
 */
export const GUILD_EVENT_ATTENDANCE_KINDS = {
    /** On the roster, and there by the time it froze. */
    CAME: "came",
    /** On the roster, and came only after it froze. */
    LATE: "late",
    /** On the roster, and never came. */
    NO_SHOW: "no-show",
    /** Came without being on the roster. */
    WALK_IN: "walk-in"
} as const;

export type TGuildEventAttendanceKind = typeof GUILD_EVENT_ATTENDANCE_KINDS[ keyof typeof GUILD_EVENT_ATTENDANCE_KINDS ];

/** What the attendance of one member is worked out from. */
export interface IGuildEventAttendanceFacts {
    interested: boolean;
    hasCheckedIn: boolean;
    late: boolean;
}

/**
 * Function resolveGuildEventAttendanceKind() :: What a member was at a run.
 *
 * Null for somebody neither on the roster nor there - nobody the attendance has anything to say about.
 */
export function resolveGuildEventAttendanceKind( facts: IGuildEventAttendanceFacts ): TGuildEventAttendanceKind | null {
    if ( ! facts.interested ) {
        return facts.hasCheckedIn ? GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN : null;
    }

    if ( ! facts.hasCheckedIn ) {
        return GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW;
    }

    return facts.late ? GUILD_EVENT_ATTENDANCE_KINDS.LATE : GUILD_EVENT_ATTENDANCE_KINDS.CAME;
}

const MS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_HOUR = 60;

/**
 * Function formatGuildEventVoiceTime() :: Time in voice as hours and minutes, `1:05`.
 *
 * Digits only, so the attendance needs no translating wherever it is read - the board in any of the
 * bot's languages and the dashboard alike.
 */
export function formatGuildEventVoiceTime( ms: number ) {
    const totalMinutes = Math.floor( ms / MS_PER_MINUTE ),
        hours = Math.floor( totalMinutes / MINUTES_PER_HOUR ),
        minutes = totalMinutes % MINUTES_PER_HOUR;

    return `${ hours }:${ String( minutes ).padStart( 2, "0" ) }`;
}

/** Events as a server has it set, as the dashboard shows it. */
export interface IGuildEventsSettingsView {
    enabled: boolean;
    channelId: string | null;
    subPostsEnabled: boolean;
    /** A `GUILD_EVENTS_ERRORS` code - the last thing that stopped Events in the server. */
    lastError: string | null;
}

/** A change to the settings, from the dashboard. What it leaves out stays as it is. */
export interface IGuildEventsSettingsPatch {
    enabled?: boolean;
    channelId?: string | null;
    subPostsEnabled?: boolean;
}

export type TGuildEventAttendanceCounts = Record<TGuildEventAttendanceKind, number>;

/** One run in the history. */
export interface IGuildEventRunSummary {
    id: string;
    name: string;
    /** When the occurrence was scheduled to start, as an ISO date. */
    occurrenceStartAt: string;
    endedAt: string | null;
    phase: TGuildEventRunPhase;
    voiceChannelId: string;
    counts: TGuildEventAttendanceCounts;
}

/** One member's part in a run. */
export interface IGuildEventAttendeeView {
    userId: string;
    /** The name the server showed for them at the time, or null for a run from before names were kept. */
    displayName: string | null;
    kind: TGuildEventAttendanceKind;
    voiceSeconds: number;
    checkedInAt: string | null;
}

export interface IGuildEventRunDetail extends IGuildEventRunSummary {
    attendees: IGuildEventAttendeeView[];
}

export interface IGuildEventRunsPage {
    runs: IGuildEventRunSummary[];
    /** Where the next page starts - the last run's start - or null when there is no more. */
    nextCursor: string | null;
}

/**
 * What became of saving the settings from the dashboard.
 *
 * Codes rather than sentences: the dashboard words each one for whoever pressed save.
 */
export const GUILD_EVENTS_SAVE_CODES = {
    SAVED: "saved",
    /** The change makes no sense - turning Events on with no channel to post in, say. */
    INVALID: "invalid",
    /** The bot is not in the server, so there is nothing to run Events. */
    BOT_NOT_IN_GUILD: "bot-not-in-guild",
    /** The bot cannot post in the channel picked - the reasons name what it lacks. */
    CHANNEL_FORBIDDEN: "channel-forbidden",
    /** No bot answered. A channel is only accepted once the bot has said it can post there. */
    BOT_UNREACHABLE: "bot-unreachable"
} as const;

export type TGuildEventsSaveCode = typeof GUILD_EVENTS_SAVE_CODES[ keyof typeof GUILD_EVENTS_SAVE_CODES ];

/** How the dashboard reads Events. */
export const GUILD_EVENTS_DASHBOARD = {
    /** How many runs one page of the history holds. */
    HISTORY_PAGE_SIZE: 20,
    /**
     * The cursor that asks for the first page. Every other page is asked for by the id of the last
     * run the one before it showed - a path segment, since the dashboard's client sends no query.
     */
    FIRST_PAGE_CURSOR: "latest",
    /** How long the api waits for the bot to say whether it can post in a channel. */
    STATUS_REQUEST_TIMEOUT_MS: 5 * 1000
} as const;
