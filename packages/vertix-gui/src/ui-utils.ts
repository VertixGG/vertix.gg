export const UI_TEMPLATE_WRAPPER_START = "{",
    UI_TEMPLATE_WRAPPER_END = "}";

export function uiUtilsWrapAsTemplate<const T extends string = string>( template: T ) {
    return `${ UI_TEMPLATE_WRAPPER_START }${ template }${ UI_TEMPLATE_WRAPPER_END }` as `${ typeof UI_TEMPLATE_WRAPPER_START }${ T }${ typeof UI_TEMPLATE_WRAPPER_END }`;
}

const UI_TEMPLATE_UNRESOLVED_VAR_REGEX = new RegExp( UI_TEMPLATE_WRAPPER_START + "(.+?)" + UI_TEMPLATE_WRAPPER_END );

/**
 * Function uiUtilsHasUnresolvedTemplate() :: Whether a composed string still carries a variable that
 * nothing filled in.
 *
 * Prose survives an unresolved variable - it reads oddly, but it reads. A URL does not: Discord
 * refuses the entire message over a single malformed one, so whatever builds a URL asks first.
 */
export function uiUtilsHasUnresolvedTemplate( value: string ) {
    return UI_TEMPLATE_UNRESOLVED_VAR_REGEX.test( value );
}

export const uiUtilsDynamicElementsRearrange = ( elements: [][], elementsPerRow: number ): [][] => {
    const dynamicElements: [][] = [];
    let dynamicRow: [] = [];

    for ( let i = 0; i < elements.length; i++ ) {
        const row = elements[ i ];

        for ( let j = 0; j < row.length; j++ ) {
            const element = row[ j ];
            dynamicRow.push( element );

            if ( dynamicRow.length === elementsPerRow ) {
                dynamicElements.push( dynamicRow );
                dynamicRow = [];
            }
        }
    }

    if ( dynamicRow.length > 0 ) {
        dynamicElements.push( dynamicRow );
    }

    return dynamicElements;
};
