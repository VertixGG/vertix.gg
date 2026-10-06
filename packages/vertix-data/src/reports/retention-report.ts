import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { toISODay, toUTCDayStart } from "@vertix.gg/data/src/reports/guild-activity-report";

import type { IRetentionCell, IRetentionCohort } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * How long installs kept going: grouped by the week they came in, and how many of each week's installs
 * had rooms made in every week after.
 *
 * Kept apart from where the rows come from, as the activation report is, so every cell can be checked
 * against rows made up for it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday, as `getUTCDay()` numbers the days - the day a cohort's week begins. */
const COHORT_WEEK_START_DAY = 1;

/** How many weeks after its install each one is followed for - as many as fit the growth window. */
export const RETENTION_WEEKS = Math.floor( DASHBOARD_STATS_WINDOWS.GROWTH_DAYS / DASHBOARD_STATS_WINDOWS.WEEK_DAYS );

export interface IRetentionInstallRow {
    guildId: string;
    installedAt: Date;
}

export interface IRetentionDayRow {
    guildId: string;
    day: Date;
    roomsCreated: number;
}

/**
 * Function toUTCWeekStart() :: Midnight UTC of the Monday of the week a moment falls in.
 */
export function toUTCWeekStart( at: Date ): Date {
    const { WEEK_DAYS } = DASHBOARD_STATS_WINDOWS,
        day = toUTCDayStart( at ),
        sinceWeekStart = ( day.getUTCDay() - COHORT_WEEK_START_DAY + WEEK_DAYS ) % WEEK_DAYS;

    return new Date( day.getTime() - sinceWeekStart * DAY_MS );
}

/**
 * Function groupActiveDays() :: The days each server had rooms made on, by server.
 */
function groupActiveDays( rows: IRetentionDayRow[] ): Map<string, number[]> {
    const byGuild = new Map<string, number[]>();

    for ( const row of rows.filter( ( candidate ) => candidate.roomsCreated > 0 ) ) {
        const days = byGuild.get( row.guildId ) ?? [];

        days.push( toUTCDayStart( row.day ).getTime() );

        byGuild.set( row.guildId, days );
    }

    return byGuild;
}

/**
 * Function buildRetentionCohorts() :: Each week's installs, and how many of them had rooms made in every
 * week after.
 *
 * A week is measured from each install's own day, so week 0 is the seven days from the day it was added -
 * not the calendar week it fell in, which for an install on a Sunday would be one day long. An install is
 * measured in a week only once that week is over, and only when the week began on or after the day
 * counting did: a week nobody counted is not one in which nobody made rooms.
 */
export function buildRetentionCohorts( options: {
    installs: IRetentionInstallRow[];
    days: IRetentionDayRow[];
    now: Date;
    countedSince: Date | null;
} ): IRetentionCohort[] {
    const { WEEK_DAYS } = DASHBOARD_STATS_WINDOWS,
        weekMs = WEEK_DAYS * DAY_MS,
        today = toUTCDayStart( options.now ).getTime(),
        countedFrom = options.countedSince ? toUTCDayStart( options.countedSince ).getTime() : null,
        activeDays = groupActiveDays( options.days ),
        cohorts = new Map<string, { installs: number; weeks: IRetentionCell[] }>();

    for ( const install of options.installs ) {
        const week = toISODay( toUTCWeekStart( install.installedAt ) ),
            installDay = toUTCDayStart( install.installedAt ).getTime(),
            days = activeDays.get( install.guildId ) ?? [];

        const cohort = cohorts.get( week ) ?? {
            installs: 0,
            weeks: Array.from( { length: RETENTION_WEEKS }, () => ( { measured: 0, active: 0 } ) )
        };

        cohort.installs++;

        cohort.weeks.forEach( ( cell, index ) => {
            const start = installDay + index * weekMs,
                end = start + weekMs;

            if ( end > today || null === countedFrom || start < countedFrom ) {
                return;
            }

            cell.measured++;

            if ( days.some( ( day ) => day >= start && day < end ) ) {
                cell.active++;
            }
        } );

        cohorts.set( week, cohort );
    }

    return [ ... cohorts.entries() ]
        .sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
        .map( ( [ week, cohort ] ) => ( {
            week,
            installs: cohort.installs,
            weeks: cohort.weeks.map( ( cell ) => cell.measured ? cell : null )
        } ) );
}
