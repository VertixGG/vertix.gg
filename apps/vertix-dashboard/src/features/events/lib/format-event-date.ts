/**
 * Function formatEventDate() :: When an event was, the way the history states it - "3 Oct 2026, 21:00".
 *
 * In the reader's own locale and time zone, the way discord shows an event's time to each member.
 */
export function formatEventDate( value: string ): string {
    const date = new Date( value );

    if ( Number.isNaN( date.getTime() ) ) {
        return value;
    }

    return date.toLocaleString( undefined, { dateStyle: "medium", timeStyle: "short" } );
}
