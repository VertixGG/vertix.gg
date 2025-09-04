import  { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type {
    UIArgs
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

type ItemsDefinition = ( typeof UIElementBase )[][];
type ItemsFactory = ( args?: UIArgs ) => ItemsDefinition;

export class ElementsGroupBuilder {
    private name: string;
    private items: ItemsDefinition | ItemsFactory = [];

    public constructor( name: string ) {
        this.name = name;
    }

    public setItems( items: ItemsDefinition | ItemsFactory ): this {
        this.items = items;
        return this;
    }

    public addRow( elements: ( typeof UIElementBase )[] ): this {
        if ( typeof this.items === "function" ) {
            throw new Error( "Cannot use addRow with a dynamic items factory. Use setItems instead." );
        }
        this.items.push( elements );
        return this;
    }

    public build(): typeof UIElementsGroupBase {
        const builder = this;
        return class GeneratedElementsGroup extends UIElementsGroupBase {
            public static getName() {
                return builder.name;
            }

            public static getItems( args?: UIArgs ) {
                if ( typeof builder.items === "function" ) {
                    return builder.items( args );
                }
                return builder.items;
            }
        };
    }
}
