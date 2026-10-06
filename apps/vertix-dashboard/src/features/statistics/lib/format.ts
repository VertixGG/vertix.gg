import { formatCount, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

const MINUTE_MS = 60 * 1000,
    HOUR_MS = 60 * MINUTE_MS,
    DAY_MS = 24 * HOUR_MS;

/** Shorter than this a duration reads in hours - a day and a half is clearer as 36h than as 1.5d. */
const DURATION_IN_HOURS_BELOW_MS = 2 * DAY_MS;

/** Fewer than this of a unit keep one decimal - 2.5h - and more read whole - 14h. */
const DURATION_DECIMALS_BELOW = 10;

/**
 * Function formatDuration() :: A span of time in its largest sensible unit - "45m", "2.5h", "14h", "3.5d".
 */
export function formatDuration( durationMs: number ): string {
    if ( durationMs < HOUR_MS ) {
        return `${ Math.round( durationMs / MINUTE_MS ) }m`;
    }

    const isHours = durationMs < DURATION_IN_HOURS_BELOW_MS,
        amount = durationMs / ( isHours ? HOUR_MS : DAY_MS );

    return `${ amount < DURATION_DECIMALS_BELOW ? Number( amount.toFixed( 1 ) ) : Math.round( amount ) }${ isHours ? "h" : "d" }`;
}

/**
 * Function formatCountOf() :: A count with what it counts - "1 room", "12 rooms".
 */
export function formatCountOf( count: number, unit: string ): string {
    return `${ formatCount( count ) } ${ unit }${ 1 === count ? "" : "s" }`;
}

/**
 * Function formatPartOf() :: A part of a whole as `3 · 60%`, or a dash when there is no whole to share.
 */
export function formatPartOf( part: number, whole: number ): string {
    return whole ? `${ formatCount( part ) } · ${ formatShare( part, whole ) }%` : "-";
}

/**
 * Function formatUntil() :: How long until a moment, as "in 3.5d" - or null once it has passed.
 */
export function formatUntil( value: string ): string | null {
    const remainingMs = new Date( value ).getTime() - Date.now();

    if ( Number.isNaN( remainingMs ) || remainingMs <= 0 ) {
        return null;
    }

    return `in ${ formatDuration( remainingMs ) }`;
}
