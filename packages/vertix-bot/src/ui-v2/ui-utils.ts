export const UI_TEMPLATE_WRAPPER_START = "{",
    UI_TEMPLATE_WRAPPER_END = "}";

export const uiUtilsWrapAsTemplate = ( template: string ): string => {
    return UI_TEMPLATE_WRAPPER_START + template + UI_TEMPLATE_WRAPPER_END;
};

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

