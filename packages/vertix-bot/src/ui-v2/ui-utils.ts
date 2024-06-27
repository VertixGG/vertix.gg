import crypto from "node:crypto";

import { UI_CUSTOM_ID_MAX_LENGTH } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

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

export const uiGenerateCustomIdHash = ( input: string, maxLength = UI_CUSTOM_ID_MAX_LENGTH ): string => {
    const base = crypto
        .createHash( "md5" )
        .update( input )
        .digest( "hex" );

    // 32 * length
    return base.repeat( Math.ceil( maxLength / 32 ) ).slice( 0, maxLength );
};
