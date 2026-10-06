/**
 * What the dashboard reads besides channel counts: on the home page, how much a server's members use
 * the bot and how its events go; on the owner's statistics page, what becomes of every install, how
 * much the bot is used across every server, what the servers pay for and which features they use.
 *
 * Shared by the api that works them out and the dashboard that draws them, so the two agree on every
 * shape and every window.
 */

/** How far back each part of the home and statistics pages looks, in UTC days. */
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
    GROWTH_DAYS: 90,
    /** The owner's usage trend - rooms made and servers using the bot across every server, a bar a day. */
    USAGE_DAYS: 90,
    /** The days the busiest servers are ranked over. */
    TOP_SERVERS_DAYS: 30,
    /**
     * The hours the busiest-hours grid is drawn from. Whole weeks, so every hour of every weekday is in
     * it as many times as every other.
     */
    HOURS_DAYS: 28
} as const;

export const DASHBOARD_STATS_LIMITS = {
    /** The members listed as a server's regulars at its events. */
    REGULARS_MAX: 5,
    /** The servers listed as the busiest. */
    TOP_SERVERS_MAX: 10
} as const;

/**
 * What a server holds, as the owner's statistics name it.
 *
 * Worked out on every read from the server's subscription and its trial, and stored nowhere - but it
 * crosses the wire, so each is a literal.
 */
export const STATISTICS_PLANS = {
    /** A subscription that buys something right now. */
    PAID: "paid",
    /** On its free trial. */
    TRIAL: "trial",
    /** Bought, and what it bought has run out. */
    LAPSED: "lapsed",
    /** Had its trial and bought nothing. */
    TRIAL_ENDED: "trial-ended",
    /** Never tried, never bought. */
    FREE: "free"
} as const;

export type TStatisticsPlan = typeof STATISTICS_PLANS[ keyof typeof STATISTICS_PLANS ];

/** A count for one UTC day. */
export interface IDashboardDayCount {
    /** The day, as `YYYY-MM-DD` in UTC. */
    day: string;
    count: number;
}

/** A count for one hour. */
export interface IDashboardHourCount {
    /** The start of the hour, as an ISO timestamp in UTC. */
    hour: string;
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
    firstRoomEver: number;
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

/** How long the installs in the growth window took to get going, and what became of the ones that left. */
export interface IActivationTimings {
    /**
     * The median time from adding the bot to its first generator, over the installs that made one
     * after joining - null while none has.
     */
    medianToSetUpMs: number | null;
    /** The same, to the first room a member made. */
    medianToFirstRoomMs: number | null;
    /** Installs the bot has since been removed from. */
    removed: number;
    /** Of those, the ones that never made a generator. */
    removedWithoutSetUp: number;
    /** Of those, the ones that removed it within a day of adding it. */
    removedWithinDay: number;
    /** How long the removed ones kept the bot - the median, over those whose leave was recorded. */
    medianLifetimeMs: number | null;
}

/** One week in the life of a cohort of installs. */
export interface IRetentionCell {
    /** The installs whose week this was - over, and counted from its first day. */
    measured: number;
    /** Of those, the ones whose members made a room in it. */
    active: number;
}

/** The installs of one week, and how many kept making rooms in each week after. */
export interface IRetentionCohort {
    /** The Monday the week began, `YYYY-MM-DD` in UTC. */
    week: string;
    installs: number;
    /**
     * Week 0 first - the seven days from each install's own day. Null for a week none of them has
     * finished yet, or that began before counting did.
     */
    weeks: ( IRetentionCell | null )[];
}

/** One install, as the owner's list shows it. */
export interface IGrowthInstall {
    guildId: string;
    name: string;
    /** The latest join, or the first install when the join was never recorded. */
    installedAt: string;
    source: string;
    isInGuild: boolean;
    leftAt: string | null;
    setupAt: string | null;
    firstRoomAt: string | null;
    /** Rooms made in the last week. */
    roomsRecently: number;
    /** Null while it is not old enough to be judged. */
    isAliveAtJudgedDay: boolean | null;
    plan: TStatisticsPlan;
}

/** Where every install in the growth window got to, how fast, and how long each cohort kept going. */
export interface IActivationStats {
    /** The first day of the window, `YYYY-MM-DD` in UTC. */
    since: string;
    judgedDay: number;
    /**
     * The first day rooms were counted at all. The milestones began being recorded with them, so an
     * install from before it may read as never set up - null while nothing has been counted yet.
     */
    countedSince: string | null;
    funnel: IGrowthSummary;
    timings: IActivationTimings;
    /** Oldest week first. */
    cohorts: IRetentionCohort[];
    /** Newest first. */
    installs: IGrowthInstall[];
}

/** One of the busiest servers. */
export interface IUsageServer {
    guildId: string;
    name: string;
    isInGuild: boolean;
    /** Rooms made over the ranking window. */
    rooms: number;
    roomsThisWeek: number;
    /** Days in the ranking window with at least one room. */
    activeDays: number;
    /** The last day it had a room, `YYYY-MM-DD` in UTC. */
    lastActiveDay: string;
    plan: TStatisticsPlan;
}

/** How much the bot is used across every server. */
export interface IUsageStats {
    /** The first day rooms were counted at all - null while nothing has been counted yet. */
    countedSince: string | null;
    /** Rooms made each day across every server, oldest first, ending today. */
    roomsPerDay: IDashboardDayCount[];
    /** How many servers had rooms made each day. */
    activeServersPerDay: IDashboardDayCount[];
    roomsThisWeek: number;
    roomsLastWeek: number;
    activeThisWeek: number;
    activeLastWeek: number;
    /** By rooms over the ranking window, the most first. */
    topServers: IUsageServer[];
    /** Rooms made in each hour of the hours window that had any, oldest first. */
    roomsPerHour: IDashboardHourCount[];
    /**
     * The first hour rooms were counted by the hour at all, as an ISO timestamp. Counting by the hour
     * began after counting by the day, so it has its own - null while none has been.
     */
    hoursCountedSince: string | null;
}

/** A server with a subscription or a trial, as the owner's plans list shows it. */
export interface IRevenueServer {
    guildId: string;
    name: string;
    plan: TStatisticsPlan;
    /** The tier its subscription is billed against, or null with no subscription or a price this deployment does not sell. */
    planName: string | null;
    /** Paddle's word for its subscription, or null with none. */
    status: string | null;
    /** When what it holds now ends - the paid period, or the trial. Null when nothing it holds has an end. */
    endsAt: string | null;
    /** Paying, and set to cancel when the period ends. */
    isCancelling: boolean;
    roomsThisWeek: number;
}

/** What the servers pay for, and how their free trials went. */
export interface IRevenueStats {
    /** Servers with a subscription that buys something right now. */
    paying: number;
    /** Of those, the ones set to cancel when the period ends. */
    cancelling: number;
    /**
     * What the paying subscriptions not set to cancel bring in a month, in whole dollars, at the prices
     * this deployment quotes - a price it does not sell adds nothing.
     */
    monthlyRevenueUsd: number;
    /** Servers that were given a trial. */
    trials: number;
    trialsRunning: number;
    /** Servers that were given a trial and have bought since. */
    trialsConverted: number;
    /** Paying first, then running trials ending soonest, then the rest - the latest end first. */
    servers: IRevenueServer[];
}

/** Which features the servers the bot is in use - each a count of servers. */
export interface IAdoptionStats {
    /** Servers the bot is in - what every share is of. */
    installed: number;
    /** With a generator of either kind now. */
    setUp: number;
    dynamicV3: number;
    dynamicV2: number;
    pools: number;
    events: number;
    branding: number;
    interfaceEdits: number;
    /** How many generators of each kind those servers have. */
    generators: {
        dynamicV3: number;
        dynamicV2: number;
        pools: number;
    };
}
