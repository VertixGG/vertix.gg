import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type { EmbedBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

import type {
    UIInstancesTypes
    ,
    UIArgs
} from "@vertix.gg/gui/src/bases/ui-definitions";

type AsyncOrSync<T> = Promise<T> | T;

export type StringHandler<TVars> = string | ( ( vars: TVars ) => AsyncOrSync<string> );
export type NumberHandler<TVars> = number | ( ( vars: TVars ) => AsyncOrSync<number> );
export type OptionsHandler<TVars> =
    | Record<string, JsonValue>
    | ( ( vars: TVars ) => AsyncOrSync<Record<string, JsonValue>> );
export type LogicHandler<TArgs extends UIArgs, TVars> =
    | ( ( args: TArgs, vars: TVars ) => AsyncOrSync<Record<string, JsonValue>> );

export class EmbedBuilder<TArgs extends UIArgs = UIArgs, TVars = Record<string, JsonValue>> {
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

        const GeneratedEmbed = class extends UIEmbedBase {
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

            protected getLogicAsync( args: TArgs ): Promise<Record<string, JsonValue>> {
                if ( builder.logic ) {
                    return Promise.resolve( builder.logic( args, builder.vars as TVars ) );
                }
                return super.getLogicAsync( args );
            }
        };

        const metadata: EmbedBuilderMetadata<TArgs, TVars> = {
            name: builder.name,
            instanceType: builder.instanceType,
            title: builder.title,
            description: builder.description,
            color: builder.color,
            image: builder.image,
            footer: builder.footer,
            options: builder.options,
            arrayOptions: builder.arrayOptions,
            logic: builder.logic,
            vars: builder.vars
        };

        Reflect.defineProperty( GeneratedEmbed, BUILDER_METADATA_SYMBOL, {
            value: metadata
        } );

        return GeneratedEmbed;
    }
}
