import  { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type {
    UIArgs
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

export class ElementsGroupBuilder<
    TItemsDefinition extends typeof UIElementBase<any>[],
    TItemsFactory extends ( args?: UIArgs ) => TItemsDefinition
> {
    private name: string;
    private items: TItemsDefinition | TItemsFactory | undefined;

    public constructor( name: string ) {
        this.name = name;
    }

    public setItems( items: TItemsFactory  ): this {
        this.items = items;
        return this;
    }

    public addRow( elements: TItemsDefinition ): this {
        if ( typeof this.items === "function" ) {
            throw new Error( "Cannot use addRow with a dynamic items factory. Use setItems instead." );
        }
        if ( "undefined" === typeof this.items ) {
            this.items = [ elements ] as unknown as TItemsDefinition;
            return this;
        }
        ( this.items as any[] ).push( elements );
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
