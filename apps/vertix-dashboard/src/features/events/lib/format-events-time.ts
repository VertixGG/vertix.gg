const MINUTES_PER_HOUR = 60;

const HOURS_PER_HALF_DAY = 12;

const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * Function formatEventsMinutes() :: A span of minutes the way the settings say it - `45 min`, `1 h`,
 * `1 h 30 min`.
 */
export function formatEventsMinutes( minutes: number ) {
    const hours = Math.floor( minutes / MINUTES_PER_HOUR ),
        rest = minutes % MINUTES_PER_HOUR;

    if ( ! hours ) {
        return `${ rest } min`;
    }

    return rest ? `${ hours } h ${ rest } min` : `${ hours } h`;
}

/**
 * Function formatEventsClock() :: A time of the example evening, given in minutes after midnight,
 * as a clock reads it - `8:45 PM`.
 */
export function formatEventsClock( minutesOfDay: number ) {
    const wrapped = ( ( minutesOfDay % MINUTES_PER_DAY ) + MINUTES_PER_DAY ) % MINUTES_PER_DAY,
        hours = Math.floor( wrapped / MINUTES_PER_HOUR ),
        minutes = wrapped % MINUTES_PER_HOUR,
        suffix = hours < HOURS_PER_HALF_DAY ? "AM" : "PM",
        clockHours = hours % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY;

    return `${ clockHours }:${ String( minutes ).padStart( 2, "0" ) } ${ suffix }`;
}
