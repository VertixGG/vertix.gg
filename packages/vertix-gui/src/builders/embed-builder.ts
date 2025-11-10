import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type {
    UIInstancesTypes
    ,
    UIArgs
} from "@vertix.gg/gui/src/bases/ui-definitions";

type StringHandler<TVars> = string | ( ( vars: TVars ) => Promise<string> | string );
type NumberHandler<TVars> = number | ( ( vars: TVars ) => Promise<number> | number );
type OptionsHandler<TVars> = object | ( ( vars: TVars ) => Promise<object> | object );
type LogicHandler<TArgs extends UIArgs, TVars> = ( args: TArgs, vars: TVars ) => Promise<object> | object;

export class EmbedBuilder<TArgs extends UIArgs = UIArgs, TVars = any> {
    private name: string;
    private instanceType: UIInstancesTypes | null = null;
    private title: StringHandler<TVars> | undefined;
    private description: StringHandler<TVars> | undefined;
    private color: NumberHandler<TVars> | undefined;
    private image: StringHandler<TVars> | undefined;
    private options: OptionsHandler<TVars> | undefined;
    private footer: StringHandler<TVars> | undefined;
    private arrayOptions: OptionsHandler<TVars> | undefined;
    private logic: LogicHandler<TArgs, TVars> | undefined;
    private vars: TVars | undefined;

    public constructor( name: string, vars?: TVars ) {
        this.name = name;
        this.vars = vars;
    }

    public setInstanceType( type: UIInstancesTypes ): this {
        this.instanceType = type;
        return this;
    }

    public setTitle( title: StringHandler<TVars> ): this {
        this.title = title;
        return this;
    }

    public setDescription( description: StringHandler<TVars> ): this {
        this.description = description;
        return this;
    }

    public setColor( color: NumberHandler<TVars> ): this {
        this.color = color;
        return this;
    }

    public setImage( image: StringHandler<TVars> ): this {
        this.image = image;
        return this;
    }

    public setOptions( options: OptionsHandler<TVars> ): this {
        this.options = options;
        return this;
    }

    public setFooterText( footer: StringHandler<TVars> ): this {
        this.footer = footer;
        return this;
    }

    public setArrayOptions( arrayOptions: OptionsHandler<TVars> ): this {
        this.arrayOptions = arrayOptions;
        return this;
    }

    public setLogic( logic: LogicHandler<TArgs, TVars> ): this {
        this.logic = logic;
        return this;
    }

    public build(): typeof UIEmbedBase {
        const builder = this;

        return class GeneratedEmbed extends UIEmbedBase {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                if ( builder.instanceType === null ) {
                    throw new Error( `Instance type is not defined for '${ builder.name }'` );
                }
                return builder.instanceType;
            }

            protected getTitle() {
                if ( typeof builder.title === "function" ) {
                    return (
                        builder.title as Function
                    )( builder.vars as TVars );
                }
                return builder.title || "";
            }

            protected getDescription() {
                if ( typeof builder.description === "function" ) {
                    return (
                        builder.description as Function
                    )( builder.vars as TVars );
                }
                return builder.description || "";
            }

            protected getColor() {
                if ( typeof builder.color === "function" ) {
                    return (
                        builder.color as Function
                    )( builder.vars as TVars );
                }
                return builder.color;
            }

            protected getImage() {
                if ( typeof builder.image === "function" ) {
                    const value = (
                        builder.image as Function
                    )( builder.vars as TVars );
                    return value || "";
                }
                return builder.image || "";
            }

            protected getOptions() {
                if ( typeof builder.options === "function" ) {
                    return (
                        builder.options as Function
                    )( builder.vars as TVars );
                }
                return builder.options || {};
            }

            protected getFooter() {
                if ( typeof builder.footer === "function" ) {
                    return (
                        builder.footer as Function
                    )( builder.vars as TVars );
                }
                return builder.footer || "";
            }

            protected getArrayOptions() {
                if ( typeof builder.arrayOptions === "function" ) {
                    return (
                        builder.arrayOptions as Function
                    )( builder.vars as TVars );
                }
                return builder.arrayOptions || {};
            }

            protected getLogicAsync( args: TArgs ): Promise<any> {
                if ( builder.logic ) {
                    return Promise.resolve( builder.logic( args, builder.vars as TVars ) );
                }
                return super.getLogicAsync( args );
            }
        };
    }
}
