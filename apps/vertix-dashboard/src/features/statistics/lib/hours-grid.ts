import type { IDashboardHourCount } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/** The days of the week as `Date.getDay()` numbers them, in the order the grid draws them - Monday first. */
export const HOURS_GRID_WEEKDAYS: readonly number[] = [ 1, 2, 3, 4, 5, 6, 0 ];

/** What each row of the grid is called, in the same order. */
export const HOURS_GRID_WEEKDAY_LABELS: readonly string[] = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ];

export const HOURS_GRID_DAY_HOURS = 24;

/** How long the quietest stretch the grid names is - about what a deploy and its restarts take. */
export const HOURS_GRID_QUIET_STRETCH_HOURS = 3;

/** A place in the grid - a row, Monday first, and an hour of the day. */
export interface IHoursGridSpot {
    row: number;
    hour: number;
    count: number;
}

/**
 * Function buildHoursGrid() :: Rooms by weekday and hour in the viewer's own time zone - a row per weekday,
 * Monday first, and a count per hour.
 *
 * The counts are kept by the UTC hour and read here in local time, which is where a deploy window or an
 * audience's evening is actually thought about.
 */
export function buildHoursGrid( hours: IDashboardHourCount[] ): number[][] {
    const grid = HOURS_GRID_WEEKDAYS.map( () => Array.from( { length: HOURS_GRID_DAY_HOURS }, () => 0 ) );

    for ( const entry of hours ) {
        const at = new Date( entry.hour );

        grid[ HOURS_GRID_WEEKDAYS.indexOf( at.getDay() ) ][ at.getHours() ] += entry.count;
    }

    return grid;
}

/**
 * Function findBusiestHour() :: The hour of the week with the most rooms - the earliest of those that tie.
 */
export function findBusiestHour( grid: number[][] ): IHoursGridSpot {
    const flat = grid.flat(),
        index = flat.indexOf( Math.max( ... flat ) );

    return { row: Math.floor( index / HOURS_GRID_DAY_HOURS ), hour: index % HOURS_GRID_DAY_HOURS, count: flat[ index ] };
}

/**
 * Function findQuietestStretch() :: The run of hours in the week with the fewest rooms made in it - where a
 * restart would be felt least. It wraps from Sunday night into Monday morning, as the week does, and is the
 * earliest of the runs that tie.
 */
export function findQuietestStretch( grid: number[][], length: number ): IHoursGridSpot {
    const flat = grid.flat(),
        countFrom = ( start: number ) => Array.from( { length }, ( _, offset ) => flat[ ( start + offset ) % flat.length ] )
            .reduce( ( sum, count ) => sum + count, 0 );

    const start = flat
        .map( ( _, index ) => index )
        .reduce( ( quietest, index ) => countFrom( index ) < countFrom( quietest ) ? index : quietest, 0 );

    return { row: Math.floor( start / HOURS_GRID_DAY_HOURS ), hour: start % HOURS_GRID_DAY_HOURS, count: countFrom( start ) };
}
