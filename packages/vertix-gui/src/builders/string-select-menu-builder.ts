import {
    UIElementStringSelectMenu
} from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import {
    UIArgs,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";
import { APISelectMenuOption } from "discord.js";

type OptionsFactory = ( args?: UIArgs ) => Promise<APISelectMenuOption[]>;

export class StringSelectMenuBuilder {
    private name: string;
    private instanceType: UIInstancesTypes = UIInstancesTypes.Dynamic;
    private placeholder: string | ( ( args?: UIArgs ) => Promise<string> );
    private minValues: number | ( ( args?: UIArgs ) => Promise<number> ) = 1;
    private maxValues: number | ( ( args?: UIArgs ) => Promise<number> ) = 1;
    private options: OptionsFactory = () => Promise.resolve( [] );
    private isAvailable: boolean | ( ( args?: UIArgs ) => Promise<boolean> | boolean ) = true;

    constructor( name: string ) {
        this.name = name;
    }

    public setInstanceType( type: UIInstancesTypes ): this {
        this.instanceType = type;
        return this;
    }

    public setPlaceholder( placeholder: string | ( ( args?: UIArgs ) => Promise<string> ) ): this {
        this.placeholder = placeholder;
        return this;
    }

    public setMinValues( minValues: number | ( ( args?: UIArgs ) => Promise<number> ) ): this {
        this.minValues = minValues;
        return this;
    }

    public setMaxValues( maxValues: number | ( ( args?: UIArgs ) => Promise<number> ) ): this {
        this.maxValues = maxValues;
        return this;
    }

    public setOptions( options: OptionsFactory ): this {
        this.options = options;
        return this;
    }

    public setAvailability( isAvailable: boolean | ( ( args?: UIArgs ) => Promise<boolean> | boolean ) ): this {
        this.isAvailable = isAvailable;
        return this;
    }

    public build(): typeof UIElementStringSelectMenu {
        const builder = this;

        return class GeneratedStringSelectMenu extends UIElementStringSelectMenu {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                return builder.instanceType;
            }

            protected async getPlaceholder( args?: UIArgs ): Promise<string> {
                if ( typeof builder.placeholder === "function" ) {
                    return builder.placeholder( args );
                }
                return builder.placeholder;
            }

            protected async getMinValues( args?: UIArgs ): Promise<number> {
                if ( typeof builder.minValues === "function" ) {
                    return builder.minValues( args );
                }
                return builder.minValues;
            }

            protected async getMaxValues( args?: UIArgs ): Promise<number> {
                if ( typeof builder.maxValues === "function" ) {
                    return builder.maxValues( args );
                }
                return builder.maxValues;
            }

            protected getSelectOptions( args?: UIArgs ): Promise<APISelectMenuOption[]> {
                return builder.options( args );
            }

            protected async isAvailable( args?: UIArgs ): Promise<boolean> {
                if ( typeof builder.isAvailable === "function" ) {
                    return builder.isAvailable( args );
                }
                return builder.isAvailable;
            }
        };
    }
}
