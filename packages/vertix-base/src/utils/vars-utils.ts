import {
    INDEX_PLACEHOLDER_PATTERN,
    VAR_DYNAMIC_CHANNEL_INDEX
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

/**
 * Checks if a template string contains any index placeholder.
 * Supports: {index}
 *
 * @param template - The template string to check
 * @returns true if the template contains an index placeholder
 */
export function varsHasIndexPlaceholder( template?: string | null ): boolean {
    if ( !template ) {
        return false;
    }

    return (
        template.includes( VAR_DYNAMIC_CHANNEL_INDEX )
    );
}

/**
 * Replaces all index placeholders in a template with the given index value.
 * If no placeholder is found, appends the index with a dash separator.
 *
 * @param template - The template string containing placeholders
 * @param index - The index value to substitute
 * @returns The template with placeholders replaced by the index
 */
export function varsReplaceIndexPlaceholder( template: string, index: number ): string {
    const indexValue = String( index );

    if ( varsHasIndexPlaceholder( template ) ) {
        // Reset lastIndex since we're using a global regex
        INDEX_PLACEHOLDER_PATTERN.lastIndex = 0;
        return template.replace( INDEX_PLACEHOLDER_PATTERN, indexValue );
    }

    return `${ template }-${ indexValue }`;
}

const ROMAN_NUMERALS: [ number, string ][] = [
    [ 1000, "M" ], [ 900, "CM" ], [ 500, "D" ], [ 400, "CD" ],
    [ 100, "C" ], [ 90, "XC" ], [ 50, "L" ], [ 40, "XL" ],
    [ 10, "X" ], [ 9, "IX" ], [ 5, "V" ], [ 4, "IV" ], [ 1, "I" ]
];

const ALPHA_BASE = 26, ALPHA_FIRST_CODE = 65;

/**
 * Function varsIndexAsRoman() :: Formats a channel index as a roman numeral, 1 becomes I.
 *
 * Anything below 1 has no roman form, so it is returned as plain digits rather than an empty name.
 */
export function varsIndexAsRoman( index: number ): string {
    if ( index < 1 ) {
        return String( index );
    }

    let remainder = index,
        result = "";

    for ( const [ value, numeral ] of ROMAN_NUMERALS ) {
        while ( remainder >= value ) {
            result += numeral;
            remainder -= value;
        }
    }

    return result;
}

/**
 * Function varsIndexAsAlpha() :: Formats a channel index as spreadsheet style letters, 1 becomes A
 * and 27 becomes AA.
 */
export function varsIndexAsAlpha( index: number ): string {
    if ( index < 1 ) {
        return String( index );
    }

    let remainder = index,
        result = "";

    while ( remainder > 0 ) {
        const position = ( remainder - 1 ) % ALPHA_BASE;

        result = String.fromCharCode( ALPHA_FIRST_CODE + position ) + result;

        remainder = Math.floor( ( remainder - 1 ) / ALPHA_BASE );
    }

    return result;
}
