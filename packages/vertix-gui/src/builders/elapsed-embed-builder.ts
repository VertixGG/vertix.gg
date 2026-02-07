import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import {
    UIEmbedElapsedTimeBase,
    vars as elapsedTimeVars
} from "@vertix.gg/gui/src/bases/ui-embed-time-elapsed-base";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type {
    ElapsedEmbedBuilderMetadata,
    EndTimeHandler
} from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import type { OptionsHandler } from "@vertix.gg/gui/src/builders/embed-builder";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

export class ElapsedEmbedBuilder<TArgs extends UIArgs = UIArgs, TVars extends Record<string, JsonValue> = Record<string, JsonValue>> extends EmbedBuilder<TArgs, TVars> {
    protected endTime: EndTimeHandler<TArgs> | undefined;

    public setEndTime( handler: EndTimeHandler<TArgs> ): this {
        this.endTime = handler;
        return this;
    }

    public build() {
        const builder = this;

        // Validation
        if ( !builder.endTime ) {
            throw new Error( `End time handler is required for elapsed embed '${ builder.name }'` );
        }

        // Merge user-provided vars with the elapsed-time vars so the exporter
        // includes them in the metadata (making them visible in the dashboard).
        const mergedVars = builder.vars
            ? { ...elapsedTimeVars.get(), ...builder.vars }
            : elapsedTimeVars.get();

        const GeneratedEmbed = class extends UIEmbedElapsedTimeBase {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                if ( builder.instanceType === null ) {
                    throw new Error( `Instance type is not defined for '${ builder.name }'` );
                }
                return builder.instanceType;
            }

            protected getEndTime( args: UIArgs ): Date {
                return builder.endTime!( args as TArgs );
            }

            protected getTitle() {
                if ( typeof builder.title === "function" ) {
                    return ( builder.title as Function )( builder.vars as TVars );
                }
                return builder.title || "";
            }

            protected getDescription() {
                if ( typeof builder.description === "function" ) {
                    return ( builder.description as Function )( builder.vars as TVars );
                }
                return builder.description || "";
            }

            protected getColor() {
                if ( typeof builder.color === "function" ) {
                    return ( builder.color as Function )( builder.vars as TVars );
                }
                return builder.color ?? -1;
            }

            protected getImage() {
                if ( typeof builder.image === "function" ) {
                    const value = ( builder.image as Function )( builder.vars as TVars );
                    return value || "";
                }
                return builder.image || "";
            }

            protected getThumbnail() {
                if ( typeof builder.thumbnail === "function" ) {
                    const value = ( builder.thumbnail as Function )( builder.vars as TVars );
                    return value ? { url: value } : null;
                }
                return builder.thumbnail ? { url: builder.thumbnail } : null;
            }

            protected getOptions() {
                if ( typeof builder.options === "function" ) {
                    return ( builder.options as Function )( builder.vars as TVars );
                }
                return builder.options || {};
            }

            protected getFooter() {
                if ( typeof builder.footer === "function" ) {
                    return ( builder.footer as Function )( builder.vars as TVars );
                }
                return builder.footer || "";
            }

            protected getArrayOptions() {
                if ( typeof builder.arrayOptions === "function" ) {
                    return ( builder.arrayOptions as Function )( builder.vars as TVars );
                }
                return builder.arrayOptions || {};
            }

            protected getDefaultVars() {
                if ( builder.defaultVars ) {
                    return builder.defaultVars( builder.vars as TVars ) ?? {};
                }

                return {};
            }

            protected getLogicAsync( args: TArgs ): Promise<Record<string, JsonValue>> {
                if ( builder.logic ) {
                    return Promise.resolve( builder.logic( args, builder.vars as TVars ) );
                }
                return super.getLogicAsync( args );
            }
        };

        const metadata: ElapsedEmbedBuilderMetadata<TArgs, any> = {
            name: builder.name,
            instanceType: builder.instanceType,
            title: builder.title,
            description: builder.description,
            color: builder.color,
            image: builder.image,
            thumbnail: builder.thumbnail,
            footer: builder.footer,
            options: this.mergeElapsedTimeOptions( GeneratedEmbed.prototype[ "getElapsedTimeOptions" ]() ),
            arrayOptions: builder.arrayOptions,
            logic: builder.logic,
            vars: mergedVars,
            defaultVars: builder.defaultVars,
            endTime: builder.endTime
        };

        Reflect.defineProperty( GeneratedEmbed, BUILDER_METADATA_SYMBOL, {
            value: metadata
        } );

        return GeneratedEmbed;
    }

    private mergeElapsedTimeOptions( elapsedTimeOptions: Record<string, JsonValue> ): OptionsHandler<TVars> {
        if ( ! this.options ) {
            return elapsedTimeOptions;
        }

        if ( typeof this.options === "function" ) {
            const userOptionsFn = this.options;

            return ( vars: TVars ) => ( {
                ...elapsedTimeOptions,
                ...userOptionsFn( vars )
            } );
        }

        return {
            ...elapsedTimeOptions,
            ...this.options
        };
    }
}
