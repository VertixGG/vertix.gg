import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type {
    IDashboardDayCount,
    IGuildActivityStats
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * How much a server's members used the bot, day by day - and the same arithmetic for anything else
 * counted per UTC day, like installs.
 *
 * Kept apart from where the rows come from, as the activation report is, so every figure can be
 * checked against rows made up for it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** How long `YYYY-MM-DD` is at the start of an ISO date. */
const ISO_DAY_LENGTH = 10;

/** One day's count, keyed by the day it happened. */
export interface IDayCountRow {
    day: Date;
    count: number;
}

/**
 * Function toUTCDayStart() :: Midnight UTC of the day a moment falls on.
 */
export function toUTCDayStart( at: Date ): Date {
    return new Date( Date.UTC( at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() ) );
}

/**
 * Function toISODay() :: A day as `YYYY-MM-DD`, in UTC.
 */
export function toISODay( at: Date ): string {
    return at.toISOString().slice( 0, ISO_DAY_LENGTH );
}

/**
 * Function getWindowStart() :: Midnight UTC of the first day of a window of `days` days ending today.
 */
export function getWindowStart( now: Date, days: number ): Date {
    return new Date( toUTCDayStart( now ).getTime() - ( days - 1 ) * DAY_MS );
}

/**
 * Function buildDaySeries() :: Every day of a window ending today, oldest first, with what was
 * counted on it - a day nothing was counted on as zero, so a chart has a bar for every day.
 *
 * Rows on the same day are added together; rows outside the window are left out.
 */
export function buildDaySeries( rows: IDayCountRow[], now: Date, days: number ): IDashboardDayCount[] {
    const start = getWindowStart( now, days ).getTime(),
        byDay = new Map<string, number>();

    for ( const row of rows ) {
        const day = toUTCDayStart( row.day );

        if ( day.getTime() < start || day.getTime() > toUTCDayStart( now ).getTime() ) {
            continue;
        }

        byDay.set( toISODay( day ), ( byDay.get( toISODay( day ) ) ?? 0 ) + row.count );
    }

    return Array.from( { length: days }, ( _, index ) => {
        const day = toISODay( new Date( start + index * DAY_MS ) );

        return { day, count: byDay.get( day ) ?? 0 };
    } );
}

function sumCounts( days: IDashboardDayCount[] ) {
    return days.reduce( ( sum, day ) => sum + day.count, 0 );
}

/**
 * Function buildGuildActivityStats() :: A server's rooms per day over the activity window, and what
 * they add up to.
 *
 * "This week" is the last seven days, today included, and "last week" the seven before them. The
 * busiest day is the latest of the days that tie for the most.
 */
export function buildGuildActivityStats( options: {
    days: IDayCountRow[];
    now: Date;
    countedSince: Date | null;
} ): IGuildActivityStats {
    const { WEEK_DAYS, ACTIVITY_DAYS } = DASHBOARD_STATS_WINDOWS,
        days = buildDaySeries( options.days, options.now, ACTIVITY_DAYS ),
        weeks = buildDaySeries( options.days, options.now, WEEK_DAYS * 2 );

    const busiestDay = days.reduce<IDashboardDayCount | null>(
        ( busiest, day ) => day.count > 0 && day.count >= ( busiest?.count ?? 0 ) ? day : busiest,
        null
    );

    return {
        days,
        countedSince: options.countedSince ? toISODay( toUTCDayStart( options.countedSince ) ) : null,
        roomsThisWeek: sumCounts( weeks.slice( WEEK_DAYS ) ),
        roomsLastWeek: sumCounts( weeks.slice( 0, WEEK_DAYS ) ),
        roomsInWindow: sumCounts( days ),
        busiestDay,
        activeDays: days.filter( ( day ) => day.count > 0 ).length
    };
}
