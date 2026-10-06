import {
    DASHBOARD_STATS_LIMITS,
    DASHBOARD_STATS_WINDOWS
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import {
    buildDaySeries,
    getWindowStart,
    toISODay,
    toUTCDayStart
} from "@vertix.gg/data/src/reports/guild-activity-report";

import type {
    IDashboardHourCount,
    IUsageServer,
    IUsageStats,
    TStatisticsPlan
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * How much the bot is used across every server: the rooms made and the servers making them, day by day,
 * the busiest servers, and the hours rooms are made in.
 *
 * Kept apart from where the rows come from, as the other reports are, so every figure can be checked
 * against rows made up for it.
 */

const HOUR_MS = 60 * 60 * 1000;

const DAY_HOURS = 24;

export interface IUsageGuildRow {
    guildId: string;
    name: string;
    isInGuild: boolean;
    plan: TStatisticsPlan;
}

export interface IUsageDayRow {
    guildId: string;
    day: Date;
    roomsCreated: number;
}

export interface IUsageHourRow {
    hour: Date;
    roomsCreated: number;
}

/**
 * Function toUTCHourStart() :: The start of the hour a moment falls in.
 */
export function toUTCHourStart( at: Date ): Date {
    return new Date( Math.floor( at.getTime() / HOUR_MS ) * HOUR_MS );
}

/**
 * Function getHoursWindowStart() :: The first hour of the hours window - as many days of hours as the
 * window holds, the hour going on now the last of them.
 */
export function getHoursWindowStart( now: Date ): Date {
    return new Date( toUTCHourStart( now ).getTime() - ( DASHBOARD_STATS_WINDOWS.HOURS_DAYS * DAY_HOURS - 1 ) * HOUR_MS );
}

function sumRooms( rows: IUsageDayRow[] ) {
    return rows.reduce( ( sum, row ) => sum + row.roomsCreated, 0 );
}

function countServers( rows: IUsageDayRow[] ) {
    return new Set( rows.map( ( row ) => row.guildId ) ).size;
}

/**
 * Function buildHourCounts() :: Rooms per hour across every server - the hours in the window that had
 * any, oldest first.
 */
function buildHourCounts( rows: IUsageHourRow[], now: Date ): IDashboardHourCount[] {
    const start = getHoursWindowStart( now ).getTime(),
        end = toUTCHourStart( now ).getTime(),
        byHour = new Map<number, number>();

    for ( const row of rows ) {
        const hour = toUTCHourStart( row.hour ).getTime();

        if ( hour < start || hour > end ) {
            continue;
        }

        byHour.set( hour, ( byHour.get( hour ) ?? 0 ) + row.roomsCreated );
    }

    return [ ... byHour.entries() ]
        .filter( ( [ , count ] ) => count > 0 )
        .sort( ( [ a ], [ b ] ) => a - b )
        .map( ( [ hour, count ] ) => ( { hour: new Date( hour ).toISOString(), count } ) );
}

/**
 * Function buildTopServers() :: The servers that made the most rooms over the ranking window.
 *
 * A tie goes to the one busier this week, and then to the name - so the same rows always list the same
 * servers in the same order.
 */
function buildTopServers( guilds: IUsageGuildRow[], days: IUsageDayRow[], now: Date ): IUsageServer[] {
    const rankedFrom = getWindowStart( now, DASHBOARD_STATS_WINDOWS.TOP_SERVERS_DAYS ).getTime(),
        weekFrom = getWindowStart( now, DASHBOARD_STATS_WINDOWS.WEEK_DAYS ).getTime(),
        ranked = days.filter( ( row ) => row.day.getTime() >= rankedFrom );

    return guilds
        .map( ( guild ) => ( { guild, rows: ranked.filter( ( row ) => row.guildId === guild.guildId ) } ) )
        .filter( ( { rows } ) => rows.length > 0 )
        .map( ( { guild, rows } ): IUsageServer => ( {
            guildId: guild.guildId,
            name: guild.name,
            isInGuild: guild.isInGuild,
            rooms: sumRooms( rows ),
            roomsThisWeek: sumRooms( rows.filter( ( row ) => row.day.getTime() >= weekFrom ) ),
            activeDays: new Set( rows.map( ( row ) => toUTCDayStart( row.day ).getTime() ) ).size,
            lastActiveDay: toISODay( new Date( Math.max( ... rows.map( ( row ) => row.day.getTime() ) ) ) ),
            plan: guild.plan
        } ) )
        .sort( ( a, b ) => b.rooms - a.rooms || b.roomsThisWeek - a.roomsThisWeek || a.name.localeCompare( b.name ) )
        .slice( 0, DASHBOARD_STATS_LIMITS.TOP_SERVERS_MAX );
}

/**
 * Function buildUsageStats() :: How much the bot was used across every server over the usage window.
 *
 * "This week" is the last seven days, today included, and "last week" the seven before them - as on a
 * server's own activity. A server counts as active on a day when its members made a room on it.
 */
export function buildUsageStats( options: {
    guilds: IUsageGuildRow[];
    days: IUsageDayRow[];
    hours: IUsageHourRow[];
    now: Date;
    countedSince: Date | null;
    hoursCountedSince: Date | null;
} ): IUsageStats {
    const { USAGE_DAYS, WEEK_DAYS } = DASHBOARD_STATS_WINDOWS,
        { now } = options,
        active = options.days.filter( ( row ) => row.roomsCreated > 0 ),
        thisWeekFrom = getWindowStart( now, WEEK_DAYS ).getTime(),
        lastWeekFrom = getWindowStart( now, WEEK_DAYS * 2 ).getTime(),
        thisWeek = active.filter( ( row ) => row.day.getTime() >= thisWeekFrom ),
        lastWeek = active.filter( ( row ) => row.day.getTime() >= lastWeekFrom && row.day.getTime() < thisWeekFrom );

    return {
        countedSince: options.countedSince ? toISODay( toUTCDayStart( options.countedSince ) ) : null,
        roomsPerDay: buildDaySeries( active.map( ( row ) => ( { day: row.day, count: row.roomsCreated } ) ), now, USAGE_DAYS ),
        activeServersPerDay: buildDaySeries( active.map( ( row ) => ( { day: row.day, count: 1 } ) ), now, USAGE_DAYS ),
        roomsThisWeek: sumRooms( thisWeek ),
        roomsLastWeek: sumRooms( lastWeek ),
        activeThisWeek: countServers( thisWeek ),
        activeLastWeek: countServers( lastWeek ),
        topServers: buildTopServers( options.guilds, active, now ),
        roomsPerHour: buildHourCounts( options.hours, now ),
        hoursCountedSince: options.hoursCountedSince ? toUTCHourStart( options.hoursCountedSince ).toISOString() : null
    };
}
