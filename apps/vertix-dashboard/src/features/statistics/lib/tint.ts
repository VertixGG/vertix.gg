/**
 * How strongly a cell is tinted, from nothing to the strongest - written out whole, so tailwind finds
 * every one of them in the source.
 */
const TINTS = [ "", "bg-accent/15", "bg-accent/30", "bg-accent/45", "bg-accent/65", "bg-accent/85" ];

/**
 * Function resolveTint() :: The tint for a part of a whole - none for nothing, the strongest for all of it.
 */
export function resolveTint( part: number, whole: number ): string {
    if ( whole <= 0 || part <= 0 ) {
        return TINTS[ 0 ];
    }

    return TINTS[ Math.ceil( Math.min( part / whole, 1 ) * ( TINTS.length - 1 ) ) ];
}
