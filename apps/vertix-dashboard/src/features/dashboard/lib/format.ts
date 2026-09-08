/**
 * Function formatDate() :: A date the way the panels state it - "12 Mar 2025".
 *
 * Returns null for a missing or unparsable value, so a caller can say "never" in its own words
 * rather than printing "Invalid Date" at a reader.
 */
export function formatDate( value: string | null | undefined ): string | null {
    if ( ! value ) {
        return null;
    }

    const date = new Date( value );

    if ( Number.isNaN( date.getTime() ) ) {
        return null;
    }

    return date.toLocaleDateString( undefined, { day: "numeric", month: "short", year: "numeric" } );
}

/**
 * Function formatRelative() :: How long ago something happened, in one phrase.
 *
 * Coarse on purpose: the dashboard answers "is this server still in use", which a day or an hour
 * settles, and a to-the-second answer would only go stale between repaints.
 */
export function formatRelative( value: string | null | undefined ): string | null {
    if ( ! value ) {
        return null;
    }

    const date = new Date( value );

    if ( Number.isNaN( date.getTime() ) ) {
        return null;
    }

    const seconds = Math.round( ( Date.now() - date.getTime() ) / 1000 );

    if ( seconds < 60 ) {
        return "just now";
    }

    const minutes = Math.round( seconds / 60 );

    if ( minutes < 60 ) {
        return `${ minutes }m ago`;
    }

    const hours = Math.round( minutes / 60 );

    if ( hours < 24 ) {
        return `${ hours }h ago`;
    }

    const days = Math.round( hours / 24 );

    if ( days < 30 ) {
        return `${ days }d ago`;
    }

    return formatDate( value );
}

/**
 * Function formatCount() :: A number with thousands separated, for the stat tiles.
 */
export function formatCount( value: number ): string {
    return value.toLocaleString();
}

/**
 * Function formatShare() :: One value's share of a total, as a rounded percentage.
 *
 * A total of zero has no shares to give, so it reads as zero rather than as a division by nothing.
 */
export function formatShare( value: number, total: number ): number {
    if ( total <= 0 ) {
        return 0;
    }

    return Math.round( ( value / total ) * 100 );
}
