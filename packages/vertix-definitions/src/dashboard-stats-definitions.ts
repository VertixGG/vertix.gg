/**
 * What the dashboard's home page reads besides channel counts: how much a server's members use the
 * bot, how its events go, and - for the owner - what becomes of every install.
 *
 * Shared by the api that works them out and the dashboard that draws them, so the two agree on every
 * shape and every window.
 */

/** How far back each part of the home page looks, in UTC days. */
export const DASHBOARD_STATS_WINDOWS = {
    /** The activity chart - one bar per day, today the last. */
    ACTIVITY_DAYS: 30,
    /** "This week" against the week before it. */
    WEEK_DAYS: 7,
    /** The events a server's attendance figures are worked out from. */
    EVENTS_DAYS: 90,
    /**
     * The installs the owner's growth figures cover. Longer than the day an install is judged on,
     * so the installs old enough to have reached it are in the window.
     */
    GROWTH_DAYS: 90
} as const;

export const DASHBOARD_STATS_LIMITS = {
    /** The members listed as a server's regulars at its events. */
    REGULARS_MAX: 5
} as const;

/** A count for one UTC day. */
export interface IDashboardDayCount {
    /** The day, as `YYYY-MM-DD` in UTC. */
    day: string;
    count: number;
}

/** How much a server's members used the bot, day by day. */
export interface IGuildActivityStats {
    /** Rooms made each day, oldest first, ending today - every day in the window, quiet ones as zero. */
    days: IDashboardDayCount[];
    /**
     * The first day rooms were counted at all. A day before it was not counted, which is not the same
     * as quiet - null while nothing has been counted anywhere yet.
     */
    countedSince: string | null;
    roomsThisWeek: number;
    roomsLastWeek: number;
    roomsInWindow: number;
    /** The day in the window with the most rooms, or null when there were none. */
    busiestDay: IDashboardDayCount | null;
    /** Days in the window with at least one room. */
    activeDays: number;
}

/** A member who keeps coming to a server's events. */
export interface IGuildEventsRegular {
    userId: string;
    /** A name the server showed for them, or null for rows from before names were kept. */
    displayName: string | null;
    /** Events they came to - on time, late, or without having said they would. */
    attended: number;
    /** Events they said they would come to and did not. */
    noShows: number;
}

/** How a server's events went, over the window. */
export interface IGuildEventsStats {
    isEnabled: boolean;
    /** Events that ended in the window - a canceled one had no attendance. */
    held: number;
    /** Places on the lists of those events - everybody who pressed Interested, once per event. */
    expected: number;
    came: number;
    late: number;
    noShows: number;
    walkIns: number;
    regulars: IGuildEventsRegular[];
}

/** What became of the installs from one source - or from all of them. */
export interface IGrowthSummary {
    source: string;
    installs: number;
    /** Made a generator within a day of adding the bot. */
    setUpAtOnce: number;
    setUpEver: number;
    /** A member made a room within a week of adding the bot. */
    firstRoomEarly: number;
    /** Made rooms in the last week. */
    activeRecently: number;
    stillInstalled: number;
    /** Installs old enough to be judged on the day growth is judged on, and how many were alive then. */
    judged: number;
    aliveAtJudgedDay: number;
}

/** What became of every install in the window - the owner's figures. */
export interface IGrowthStats {
    /** The first day of the window, `YYYY-MM-DD` in UTC. */
    since: string;
    /** The day an install is judged on - still there, and still making rooms, that long after. */
    judgedDay: number;
    installsPerDay: IDashboardDayCount[];
    total: IGrowthSummary;
    bySource: IGrowthSummary[];
}
