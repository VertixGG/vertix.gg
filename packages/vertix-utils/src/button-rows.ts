/**
 * Row layout for a generator's buttons.
 *
 * Discord draws buttons in action rows, and how they are grouped is part of what an admin sets up:
 * a row holding "rename, limit, privacy" reads differently from the same buttons cut every five.
 *
 * The set itself stays a flat list, which is what every other reader of it wants - the bot asking
 * whether a button is available, the legend image, the buttons screen inside discord. The breaks
 * only say where that list is divided, so a set with no layout of its own is simply a set with no
 * breaks, and nothing had to change to keep working.
 */

export const BUTTON_ROW_LIMITS = {
    /** Discord draws at most five components in one action row. */
    MAX_PER_ROW: 5,
    /** And at most five action rows on one message. */
    MAX_ROWS: 5
} as const;

/**
 * The entry that marks where one row ends and the next begins.
 *
 * The divisions ride inside the button list rather than beside it. A separate field would be the
 * tidier shape, but the list is the thing every reader already round trips - and a reader that does
 * not know about rows drops this entry the same way it drops any id it does not recognise, so an
 * older bot keeps drawing exactly the buttons it drew before.
 */
export const ROW_SEPARATOR = "|";

/**
 * Function splitTemplate() :: A stored template as its buttons, and where they are divided.
 */
export function splitTemplate( template: ReadonlyArray<string> ): { ids: string[]; rowBreaks: number[] } {
    const ids: string[] = [],
        rowBreaks: number[] = [];

    template.forEach( ( entry ) => {
        if ( ROW_SEPARATOR !== entry ) {
            ids.push( entry );

            return;
        }

        // A separator before anything, or two in a row, describes an empty row and says nothing.
        if ( ids.length && rowBreaks[ rowBreaks.length - 1 ] !== ids.length ) {
            rowBreaks.push( ids.length );
        }
    } );

    return { ids, rowBreaks };
}

/**
 * Function joinTemplate() :: Rows of ids as the single list that gets stored.
 */
export function joinTemplate( rows: ReadonlyArray<ReadonlyArray<string>> ): string[] {
    return rows
        .filter( ( row ) => row.length )
        .flatMap( ( row, index ) => index ? [ ROW_SEPARATOR, ...row ] : [ ...row ] );
}

/**
 * Function chunkRows() :: The list cut into rows of at most `maxPerRow`.
 *
 * What a set falls back to when it has no layout of its own, and what every generator had before
 * rows could be arranged at all.
 */
export function chunkRows<T>( ids: ReadonlyArray<T>, maxPerRow: number = BUTTON_ROW_LIMITS.MAX_PER_ROW ): T[][] {
    const rows: T[][] = [];

    for ( let i = 0; i < ids.length; i += maxPerRow ) {
        rows.push( [ ...ids.slice( i, i + maxPerRow ) ] );
    }

    return rows;
}

/**
 * Function normalizeRowBreaks() :: The breaks that still describe this list.
 *
 * A break is the index a row starts at, so one at zero or past the end describes an empty row and
 * says nothing. They can also outlive the set they were saved beside - the buttons screen inside
 * discord writes the list without them - so they are clamped rather than trusted.
 */
function normalizeRowBreaks( breaks: ReadonlyArray<number> | undefined, length: number ): number[] {
    if ( ! breaks?.length ) {
        return [];
    }

    const within = breaks.filter( ( at ) => Number.isInteger( at ) && 0 < at && at < length );

    return [ ...new Set( within ) ].sort( ( a, b ) => a - b );
}

/**
 * Function toRows() :: A generator's buttons, in the rows they are drawn in.
 *
 * Falls back to plain chunking when there is no layout to honour, and again when honouring one
 * would not fit: dropping a button to keep an arrangement is the wrong trade, since the
 * arrangement is a preference and the button is the feature.
 */
export function toRows<T>(
    ids: ReadonlyArray<T>,
    rowBreaks?: ReadonlyArray<number>,
    maxPerRow: number = BUTTON_ROW_LIMITS.MAX_PER_ROW,
    maxRows: number = BUTTON_ROW_LIMITS.MAX_ROWS
): T[][] {
    if ( ! ids.length ) {
        return [];
    }

    const breaks = normalizeRowBreaks( rowBreaks, ids.length );

    if ( ! breaks.length ) {
        return chunkRows( ids, maxPerRow );
    }

    const rows: T[][] = [];
    let start = 0;

    [ ...breaks, ids.length ].forEach( ( at ) => {
        // A row wider than discord allows spills into the next rather than losing its tail.
        rows.push( ...chunkRows( ids.slice( start, at ), maxPerRow ) );

        start = at;
    } );

    return rows.length > maxRows ? chunkRows( ids, maxPerRow ) : rows;
}

/**
 * Function flattenRows() :: The flat list a set of rows describes.
 */
export function flattenRows<T>( rows: ReadonlyArray<ReadonlyArray<T>> ): T[] {
    return rows.flatMap( ( row ) => [ ...row ] );
}

/**
 * Function toRowBreaks() :: Where a set of rows divides its flat list.
 *
 * The inverse of `toRows()`, for saving what an admin arranged. An arrangement that matches the
 * fallback is stored as no breaks at all, so a set that was never really arranged goes on
 * re-flowing as buttons are added instead of being frozen at the shape it happened to have.
 */
export function toRowBreaks<T>(
    rows: ReadonlyArray<ReadonlyArray<T>>,
    maxPerRow: number = BUTTON_ROW_LIMITS.MAX_PER_ROW
): number[] {
    const filled = rows.filter( ( row ) => row.length ),
        breaks: number[] = [];

    let at = 0;

    filled.slice( 0, -1 ).forEach( ( row ) => {
        at += row.length;

        breaks.push( at );
    } );

    const total = flattenRows( filled ).length,
        fallback: number[] = [];

    for ( let i = maxPerRow; i < total; i += maxPerRow ) {
        fallback.push( i );
    }

    const isFallback = fallback.length === breaks.length
        && fallback.every( ( value, index ) => value === breaks[ index ] );

    return isFallback ? [] : breaks;
}
