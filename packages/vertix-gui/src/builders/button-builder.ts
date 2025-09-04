import {
    UIElementButtonBase,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIButtonStyleTypes,
    UIArgs
} from "@vertix.gg/gui/src/bases/ui-definitions";

export class ButtonBuilder {
    private name: string;
    private instanceType: UIInstancesTypes = UIInstancesTypes.Dynamic;
    private label: string | ( ( args?: UIArgs ) => Promise<string> );
    private style: UIButtonStyleTypes | ( ( args?: UIArgs ) => Promise<UIButtonStyleTypes> ) = "secondary";
    private emoji: string | ( ( args?: UIArgs ) => Promise<string> );
    private isAvailable: boolean | ( ( args?: UIArgs ) => Promise<boolean> | boolean ) = true;
    private options: any | ( ( args?: UIArgs ) => Promise<any> );
    private logic: any | ( ( args?: UIArgs ) => Promise<any> );

    constructor( name: string ) {
        this.name = name;
    }

    public setInstanceType( type: UIInstancesTypes ): this {
        this.instanceType = type;
        return this;
    }

    public setLabel( label: string | ( ( args?: UIArgs ) => Promise<string> ) ): this {
        this.label = label;
        return this;
    }

    public setStyle( style: UIButtonStyleTypes | ( ( args?: UIArgs ) => Promise<UIButtonStyleTypes> ) ): this {
        this.style = style;
        return this;
    }

    public setEmoji( emoji: string | ( ( args?: UIArgs ) => Promise<string> ) ): this {
        this.emoji = emoji;
        return this;
    }

    public setAvailability( isAvailable: boolean | ( ( args?: UIArgs ) => Promise<boolean> | boolean ) ): this {
        this.isAvailable = isAvailable;
        return this;
    }

    public setOptions( options: any | ( ( args?: UIArgs ) => Promise<any> ) ): this {
        this.options = options;
        return this;
    }

    public setLogic( logic: any | ( ( args?: UIArgs ) => Promise<any> ) ): this {
        this.logic = logic;
        return this;
    }

    public build(): typeof UIElementButtonBase {
        const builder = this;

        return class GeneratedButton extends UIElementButtonBase {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                return builder.instanceType;
            }

            protected async getLabel( args?: UIArgs ): Promise<string> {
                if ( typeof builder.label === "function" ) {
                    return builder.label( args );
                }
                return builder.label;
            }

            protected async getStyle( args?: UIArgs ): Promise<UIButtonStyleTypes> {
                if ( typeof builder.style === "function" ) {
                    return builder.style( args );
                }
                return builder.style;
            }

            protected async getEmoji( args?: UIArgs ): Promise<string> {
                if ( typeof builder.emoji === "function" ) {
                    return builder.emoji( args );
                }
                return builder.emoji;
            }

            protected async isAvailable( args?: UIArgs ): Promise<boolean> {
                if ( typeof builder.isAvailable === "function" ) {
                    return builder.isAvailable( args );
                }
                return builder.isAvailable;
            }

            protected getOptions( args?: UIArgs ) {
                if ( typeof builder.options === "function" ) {
                    return builder.options( args );
                }
                return builder.options;
            }

            protected async getLogic( args?: UIArgs ) {
                if ( typeof builder.logic === "function" ) {
                    return builder.logic( args );
                }
                return builder.logic;
            }
        };
    }
}
