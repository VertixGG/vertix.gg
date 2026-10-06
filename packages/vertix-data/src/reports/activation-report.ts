/**
 * What became of each install: did the server set the bot up, did its members use it, is it still there.
 *
 * Kept apart from where the rows come from, so the arithmetic can be checked against rows made up for
 * it - the script that prints this reads the database, and nothing here does.
 */

import type { IActivationTimings } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

const HOUR_MS = 60 * 60 * 1000,
    DAY_MS = 24 * HOUR_MS;

/** How close an attributed click has to be to a join to be the same install. */
export const ACTIVATION_ATTRIBUTION_WINDOW_MS = 30 * 60 * 1000;

/** Set up "at once": within a day of adding the bot. */
export const ACTIVATION_SETUP_WINDOW_MS = DAY_MS;

/** A first room "early": within a week of adding the bot. */
export const ACTIVATION_FIRST_ROOM_WINDOW_MS = 7 * DAY_MS;

/** Removed "at once": within a day of adding the bot - tried and dropped rather than run and given up. */
export const ACTIVATION_QUICK_REMOVAL_WINDOW_MS = DAY_MS;

/** What "in use now" looks back over. */
export const ACTIVATION_RECENT_WINDOW_MS = 7 * DAY_MS;

/**
 * The day an install is judged on, and the week before it that has to have rooms in it.
 *
 * Day 45 is the owner's own mark for whether growth is working; a server still there and still making
 * rooms that late is one that runs on the bot rather than one that tried it.
 */
export const ACTIVATION_JUDGED_DAY = 45;
export const ACTIVATION_JUDGED_WEEK_DAYS = 7;

/** An install with no attributed click near it. */
export const ACTIVATION_UNATTRIBUTED_SOURCE = "unattributed";

export interface IActivationGuildRow {
    guildId: string;
    name: string;
    isInGuild: boolean;
    createdAt: Date;
    joinedAt: Date | null;
    leftAt: Date | null;
    setupAt: Date | null;
    firstRoomAt: Date | null;
}

export interface IActivationInstallRow {
    guildId: string;
    source: string;
    createdAt: Date;
}

export interface IActivationDayRow {
    guildId: string;
    day: Date;
    roomsCreated: number;
}

export interface IActivationInstall {
    guildId: string;
    name: string;
    /** The latest join, or the first install when the join was never recorded. */
    installedAt: Date;
    source: string;
    isInGuild: boolean;
    leftAt: Date | null;
    setupAt: Date | null;
    firstRoomAt: Date | null;
    isSetUpAtOnce: boolean;
    hasFirstRoomEarly: boolean;
    roomsRecently: number;
    /** Null while day 45 has not come yet. */
    isAliveAtJudgedDay: boolean | null;
}

export interface IActivationSummary {
    source: string;
    installs: number;
    setUpAtOnce: number;
    setUpEver: number;
    firstRoomEarly: number;
    firstRoomEver: number;
    activeRecently: number;
    stillInstalled: number;
    /** Installs old enough to be judged at day 45, and how many of them were alive then. */
    judged: number;
    aliveAtJudgedDay: number;
}

export interface IActivationReport {
    installs: IActivationInstall[];
    bySource: IActivationSummary[];
    total: IActivationSummary;
}

function isWithin( at: Date | null, from: Date, windowMs: number ): boolean {
    return null !== at && at.getTime() >= from.getTime() && at.getTime() - from.getTime() <= windowMs;
}

function sumRooms( days: IActivationDayRow[], from: number, to: number ): number {
    return days
        .filter( ( row ) => row.day.getTime() >= from && row.day.getTime() < to )
        .reduce( ( sum, row ) => sum + row.roomsCreated, 0 );
}

/**
 * Function attributeInstall() :: Which link an install came through, if any.
 *
 * The attributed click closest to the join, within the window - a server installed twice through two
 * links gets the one that belongs to the join being measured.
 */
function attributeInstall( installedAt: Date, clicks: IActivationInstallRow[] ): string {
    const nearest = clicks
        .map( ( click ) => ( { click, distance: Math.abs( click.createdAt.getTime() - installedAt.getTime() ) } ) )
        .filter( ( entry ) => entry.distance <= ACTIVATION_ATTRIBUTION_WINDOW_MS )
        .sort( ( a, b ) => a.distance - b.distance )[ 0 ];

    return nearest?.click.source ?? ACTIVATION_UNATTRIBUTED_SOURCE;
}

function summarise( source: string, installs: IActivationInstall[] ): IActivationSummary {
    const judged = installs.filter( ( install ) => null !== install.isAliveAtJudgedDay );

    return {
        source,
        installs: installs.length,
        setUpAtOnce: installs.filter( ( install ) => install.isSetUpAtOnce ).length,
        setUpEver: installs.filter( ( install ) => null !== install.setupAt ).length,
        firstRoomEarly: installs.filter( ( install ) => install.hasFirstRoomEarly ).length,
        firstRoomEver: installs.filter( ( install ) => null !== install.firstRoomAt ).length,
        activeRecently: installs.filter( ( install ) => install.roomsRecently > 0 ).length,
        stillInstalled: installs.filter( ( install ) => install.isInGuild ).length,
        judged: judged.length,
        aliveAtJudgedDay: judged.filter( ( install ) => install.isAliveAtJudgedDay ).length
    };
}

/**
 * Function buildActivationReport() :: Every install since a date, and what became of it, by source.
 */
export function buildActivationReport( options: {
    guilds: IActivationGuildRow[];
    installs: IActivationInstallRow[];
    days: IActivationDayRow[];
    now: Date;
    since: Date;
} ): IActivationReport {
    const { now, since } = options;

    const installs = options.guilds
        .map( ( guild ): IActivationInstall => {
            const installedAt = guild.joinedAt ?? guild.createdAt,
                days = options.days.filter( ( row ) => row.guildId === guild.guildId ),
                judgedAt = installedAt.getTime() + ACTIVATION_JUDGED_DAY * DAY_MS;

            let isAliveAtJudgedDay: boolean | null = null;

            if ( judgedAt <= now.getTime() ) {
                const wasThere = null === guild.leftAt || guild.leftAt.getTime() > judgedAt,
                    roomsThatWeek = sumRooms( days, judgedAt - ACTIVATION_JUDGED_WEEK_DAYS * DAY_MS, judgedAt );

                isAliveAtJudgedDay = wasThere && roomsThatWeek > 0;
            }

            return {
                guildId: guild.guildId,
                name: guild.name,
                installedAt,
                source: attributeInstall(
                    installedAt,
                    options.installs.filter( ( click ) => click.guildId === guild.guildId )
                ),
                isInGuild: guild.isInGuild,
                leftAt: guild.leftAt,
                setupAt: guild.setupAt,
                firstRoomAt: guild.firstRoomAt,
                isSetUpAtOnce: isWithin( guild.setupAt, installedAt, ACTIVATION_SETUP_WINDOW_MS ),
                hasFirstRoomEarly: isWithin( guild.firstRoomAt, installedAt, ACTIVATION_FIRST_ROOM_WINDOW_MS ),
                roomsRecently: sumRooms( days, now.getTime() - ACTIVATION_RECENT_WINDOW_MS, now.getTime() + DAY_MS ),
                isAliveAtJudgedDay
            };
        } )
        .filter( ( install ) => install.installedAt.getTime() >= since.getTime() )
        .sort( ( a, b ) => b.installedAt.getTime() - a.installedAt.getTime() );

    const sources = [ ... new Set( installs.map( ( install ) => install.source ) ) ].sort();

    return {
        installs,
        bySource: sources.map( ( source ) => summarise( source, installs.filter( ( install ) => install.source === source ) ) ),
        total: summarise( "all", installs )
    };
}

/**
 * Function median() :: The middle of some durations - the mean of the middle two when there is no one middle.
 */
function median( durations: number[] ): number | null {
    if ( ! durations.length ) {
        return null;
    }

    const sorted = [ ... durations ].sort( ( a, b ) => a - b ),
        middle = Math.floor( sorted.length / 2 );

    return sorted.length % 2 ? sorted[ middle ] : ( sorted[ middle - 1 ] + sorted[ middle ] ) / 2;
}

/**
 * Function sinceInstall() :: How long after the install a moment came, or null when it did not come after it.
 *
 * A milestone is written once and never moved, so a server that set up during an earlier install still
 * carries that date - which says nothing about how long this one took.
 */
function sinceInstall( install: IActivationInstall, at: Date | null ): number | null {
    if ( ! at || at.getTime() < install.installedAt.getTime() ) {
        return null;
    }

    return at.getTime() - install.installedAt.getTime();
}

function isDuration( duration: number | null ): duration is number {
    return null !== duration;
}

/**
 * Function buildActivationTimings() :: How long the installs took to set up and to be used, and what
 * became of the ones the bot was removed from.
 */
export function buildActivationTimings( installs: IActivationInstall[] ): IActivationTimings {
    const removed = installs.filter( ( install ) => ! install.isInGuild ),
        lifetimes = removed.map( ( install ) => sinceInstall( install, install.leftAt ) ).filter( isDuration );

    return {
        medianToSetUpMs: median( installs.map( ( install ) => sinceInstall( install, install.setupAt ) ).filter( isDuration ) ),
        medianToFirstRoomMs: median( installs.map( ( install ) => sinceInstall( install, install.firstRoomAt ) ).filter( isDuration ) ),
        removed: removed.length,
        removedWithoutSetUp: removed.filter( ( install ) => null === install.setupAt ).length,
        removedWithinDay: lifetimes.filter( ( lifetime ) => lifetime <= ACTIVATION_QUICK_REMOVAL_WINDOW_MS ).length,
        medianLifetimeMs: median( lifetimes )
    };
}
