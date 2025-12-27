import type { UIExportedComponent } from "@vertix.gg/definitions/src/ui-export-definitions";

import type { ComponentPreview } from "@vertix.gg/api/src/server/types";

export function extractComponentPreview( component: UIExportedComponent ): ComponentPreview {
    const firstEmbedsGroup = component.embedsGroups[ 0 ];
    const firstEmbed = firstEmbedsGroup?.items[ 0 ];
    const definition = firstEmbed?.definition;

    const buttons: ComponentPreview[ "buttons" ] = [];
    component.elementsGroups.forEach( group => {
        group.items.forEach( row => {
            row.forEach( item => {
                if ( item.definition?.elementType === "button" || item.definition?.elementType === "button-url" ) {
                    buttons.push( { label: item.definition?.label ?? "", element: item.element } );
                }
            } );
        } );
    } );

    return {
        name: component.name,
        embedTitle: definition?.title,
        embedDescription: definition?.description,
        embedColor: definition?.color,
        buttons,
        modals: component.modals
    };
}
