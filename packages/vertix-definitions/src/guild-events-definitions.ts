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
    BOARD_DELETED: "board-deleted",
    /** The channel the attendance is copied to is gone. */
    LOG_CHANNEL_MISSING: "log-channel-missing",
    /** The bot cannot see, write or embed in the channel the attendance is copied to. */
    LOG_CHANNEL_FORBIDDEN: "log-channel-forbidden"
} as const;

export type TGuildEventsError = typeof GUILD_EVENTS_ERRORS[ keyof typeof GUILD_EVENTS_ERRORS ];

const MS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_HOUR = 60;
const MS_PER_HOUR = MINUTES_PER_HOUR * MS_PER_MINUTE;

/**
 * The part of a run's clock no server sets.
 *
 * Everything a server does set - when check-in opens, when somebody is late, how long an empty
 * channel waits, how long a run may last - is in its settings, `GUILD_EVENTS_SETTINGS_DEFAULTS`.
 */
export const GUILD_EVENTS_TIMINGS = {
    /**
     * The longest any run stays open, whatever its server set - the most `maxDurationHours` offers.
     * What a run left open across a restart is measured against, before its server's settings are read.
     */
    RUN_MAX_MS: 24 * MS_PER_HOUR,
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
    BOARD_LIST_MAX: 20,
    /**
     * The most members pinged by name when check-in opens.
     *
     * Discord takes at most a hundred users in a message's allowed mentions, and this many mentions
     * with a role's in front stay inside the two thousand characters a message may hold.
     */
    PING_MEMBERS_MAX: 80,
    /** The most voice and stage channels a server can limit Events to. */
    EVENT_CHANNELS_MAX: 25
} as const;

/**
 * What a server that set nothing gets.
 *
 * A settings row holds only what a server chose - every one of these is null there until it does -
 * so changing a default here moves every server that never touched that setting.
 */
export const GUILD_EVENTS_SETTINGS_DEFAULTS = {
    /** How long before the start the board goes up and check-in opens. */
    checkInLeadMinutes: 15,
    /**
     * How long after the start somebody still counts as on time. At that moment the roster locks:
     * whoever from it has not come is marked as not coming, and the "need a sub" post goes up.
     */
    lateAfterMinutes: 10,
    /** How long the event's channels have to stay empty, once the roster locked, for the attendance to be final. */
    endAfterEmptyMinutes: 10,
    /** The longest a run stays open, counted from the start. */
    maxDurationHours: 12,
    /** Whether the members on the roster are pinged by name when check-in opens. */
    checkInPingInterested: false,
    /** The fewest missing it takes for a "need a sub" post to go up. */
    subMinMissing: 1,
    /** The least time in voice, over the whole event, that counts as having come. */
    minVoiceMinutes: 0
} as const;

/**
 * What each number a server sets can be - the values the dashboard offers, and the only ones the
 * api accepts.
 *
 * Check-in opens at most three hours ahead: anybody in the voice channel from then on is checked
 * in, and further out than that it is the evening before rather than the event.
 */
export const GUILD_EVENTS_SETTINGS_CHOICES = {
    checkInLeadMinutes: [ 5, 10, 15, 20, 30, 45, 60, 90, 120, 180 ],
    lateAfterMinutes: [ 0, 5, 10, 15, 20, 30, 45, 60 ],
    endAfterEmptyMinutes: [ 1, 2, 5, 10, 15, 20, 30, 60 ],
    maxDurationHours: [ 1, 2, 3, 4, 6, 8, 12, 24 ],
    subMinMissing: [ 1, 2, 3, 4, 5, 10 ],
    minVoiceMinutes: [ 0, 1, 2, 5, 10, 15, 30, 60 ]
} as const satisfies Record<string, readonly number[]>;

export type TGuildEventsNumberSetting = keyof typeof GUILD_EVENTS_SETTINGS_CHOICES;

/** Every number a server sets, in the order the settings are read. */
export const GUILD_EVENTS_NUMBER_SETTINGS = Object.keys( GUILD_EVENTS_SETTINGS_CHOICES ) as TGuildEventsNumberSetting[];

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
    /** Their time in voice over the whole run, for a run that holds anybody to a least time. */
    voiceSeconds?: number;
    /**
     * The least time in voice that counts as having come, once a run has ended - absent or zero for
     * none. Somebody who looked in for less counts as never having come.
     */
    minVoiceSeconds?: number;
}

/**
 * Function resolveGuildEventAttendanceKind() :: What a member was at a run.
 *
 * Null for somebody neither on the roster nor there - nobody the attendance has anything to say about.
 */
export function resolveGuildEventAttendanceKind( facts: IGuildEventAttendanceFacts ): TGuildEventAttendanceKind | null {
    const came = facts.hasCheckedIn && ( facts.voiceSeconds ?? 0 ) >= ( facts.minVoiceSeconds ?? 0 );

    if ( ! facts.interested ) {
        return came ? GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN : null;
    }

    if ( ! came ) {
        return GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW;
    }

    return facts.late ? GUILD_EVENT_ATTENDANCE_KINDS.LATE : GUILD_EVENT_ATTENDANCE_KINDS.CAME;
}

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

/**
 * Events as a server has it, with a default in place of everything it never set.
 *
 * What the bot runs on and what the dashboard shows - both read it through
 * `resolveGuildEventsSettings()`, so the two cannot disagree about a setting nobody touched.
 */
export interface IGuildEventsSettingsView {
    enabled: boolean;
    /** The text channel the boards and the "need a sub" posts go to. */
    channelId: string | null;
    subPostsEnabled: boolean;

    checkInLeadMinutes: number;
    lateAfterMinutes: number;
    endAfterEmptyMinutes: number;
    maxDurationHours: number;

    /** Only events held in these voice or stage channels - empty for every one. */
    eventChannelIds: string[];

    /** The role pinged when check-in opens, if any. */
    checkInRoleId: string | null;
    checkInPingInterested: boolean;

    /** The role pinged by the "need a sub" post, if any. */
    subRoleId: string | null;
    subMinMissing: number;

    minVoiceMinutes: number;
    /** A second text channel each finished attendance is copied to - a staff log, say. */
    logChannelId: string | null;

    /** A `GUILD_EVENTS_ERRORS` code - the last thing that stopped Events in the server. */
    lastError: string | null;
}

/** A change to the settings, from the dashboard. What it leaves out stays as it is. */
export type IGuildEventsSettingsPatch = Partial<Omit<IGuildEventsSettingsView, "lastError">>;

/**
 * A settings row as it is stored - every field a server has not set yet is null or missing, and a
 * server that never set Events up has no row at all.
 */
export type TGuildEventsStoredSettings = {
    [ K in keyof IGuildEventsSettingsView ]?: IGuildEventsSettingsView[ K ] | null;
};

/**
 * Function resolveGuildEventsSettings() :: A server's settings with a default in place of every
 * one it never set.
 */
export function resolveGuildEventsSettings( stored: TGuildEventsStoredSettings | null ): IGuildEventsSettingsView {
    return {
        enabled: !! stored?.enabled,
        channelId: stored?.channelId ?? null,
        subPostsEnabled: stored?.subPostsEnabled ?? true,

        checkInLeadMinutes: stored?.checkInLeadMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes,
        lateAfterMinutes: stored?.lateAfterMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes,
        endAfterEmptyMinutes: stored?.endAfterEmptyMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.endAfterEmptyMinutes,
        maxDurationHours: stored?.maxDurationHours ?? GUILD_EVENTS_SETTINGS_DEFAULTS.maxDurationHours,

        eventChannelIds: stored?.eventChannelIds ?? [],

        checkInRoleId: stored?.checkInRoleId ?? null,
        checkInPingInterested: stored?.checkInPingInterested ?? GUILD_EVENTS_SETTINGS_DEFAULTS.checkInPingInterested,

        subRoleId: stored?.subRoleId ?? null,
        subMinMissing: stored?.subMinMissing ?? GUILD_EVENTS_SETTINGS_DEFAULTS.subMinMissing,

        minVoiceMinutes: stored?.minVoiceMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.minVoiceMinutes,
        logChannelId: stored?.logChannelId ?? null,

        lastError: stored?.lastError ?? null
    };
}

/** A server's clock, in milliseconds, as a run keeps it. */
export interface IGuildEventsClockTimings {
    checkInLeadMs: number;
    lateAfterMs: number;
    endAfterEmptyMs: number;
    runMaxMs: number;
}

/**
 * Function toGuildEventsClockTimings() :: The timing a server set, as the clock measures it.
 */
export function toGuildEventsClockTimings( settings: IGuildEventsSettingsView ): IGuildEventsClockTimings {
    return {
        checkInLeadMs: settings.checkInLeadMinutes * MS_PER_MINUTE,
        lateAfterMs: settings.lateAfterMinutes * MS_PER_MINUTE,
        endAfterEmptyMs: settings.endAfterEmptyMinutes * MS_PER_MINUTE,
        runMaxMs: Math.min( settings.maxDurationHours * MS_PER_HOUR, GUILD_EVENTS_TIMINGS.RUN_MAX_MS )
    };
}

/**
 * Function isGuildEventsSettingChoice() :: Whether a value is one a server may set a number to.
 */
export function isGuildEventsSettingChoice( setting: TGuildEventsNumberSetting, value: unknown ): value is number {
    const choices: readonly number[] = GUILD_EVENTS_SETTINGS_CHOICES[ setting ];

    return "number" === typeof value && choices.includes( value );
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
    /** Nobody would be notified by the role picked: it cannot be mentioned, and the bot may not mention every role. */
    ROLE_NOT_PINGABLE: "role-not-pingable",
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
