import  { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type {
    UIArgs,
    UIEntityTypesConstructor
} from "@vertix.gg/gui/src/bases/ui-definitions";

type ItemsFactory = ( args?: UIArgs ) => UIEntityTypesConstructor;

export class ElementsGroupBuilder {
    private name: string;
    private items: UIEntityTypesConstructor | ItemsFactory | undefined;

    public constructor( name: string ) {
        this.name = name;
    }

    public setItems( items: ItemsFactory ): this {
        this.items = items;
        return this;
    }

    public addRow( elements: UIEntityTypesConstructor ): this {
        if ( typeof this.items === "function" ) {
            throw new Error( "Cannot use addRow with a dynamic items factory. Use setItems instead." );
        }
        if ( "undefined" === typeof this.items ) {
            this.items = [ elements ] as UIEntityTypesConstructor;
            return this;
        }
        ( this.items as UIEntityTypesConstructor[] ).push( elements );
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
                return builder.items || [];
            }
        };
    }
}
