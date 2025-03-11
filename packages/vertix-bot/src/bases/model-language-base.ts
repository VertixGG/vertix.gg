import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBaseCachedWithClient } from "@vertix.gg/base/src/bases/model-base";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

export interface TModelHelper<T> {
    findFirst( ...args: any[] ): T;
    count( ...args: any[] ): Number;
    create( ...args: any[] ): T;
}

/**
 * Wasted too much time on this, didn't find a good solution.
 */
export abstract class ModelLanguageBase<TModel, TPayloadWithContent> extends ModelBaseCachedWithClient<
    PrismaBot.PrismaClient,
    TPayloadWithContent
> {
    public static getName(): string {
        return "VertixBot/Bases/ModelLanguageBase";
    }

    public async get( name: string, languageCode: string, cache = true ) {
        // TODO: Find a better way to do this.
        name = name.split( UI_CUSTOM_ID_SEPARATOR, 1 )[ 0 ];

        this.debugger.log(
            this.get,
            `Getting button language for: '${ name }', language code: '${ languageCode }', cache: '${ cache }'`
        );

        const key = languageCode + ":" + name;

        if ( cache ) {
            const cached = this.getCache( key );

            if ( cached ) {
                return cached;
            }
        }

        const result = ( this.getModel() as TModelHelper<TPayloadWithContent> ).findFirst(
            this.getFindArgs( name, languageCode )
        );

        this.setCache( key, result );

        return result;
    }

    public async create( name: string, languageCode: string, languageName: string, content: any ) {
        this.logger.log(
            this.create,
            `For '${ name }' - Language code: '${ languageCode }', language name: '${ languageName }'`
        );
        this.debugger.dumpDown( this.create, content );

        return ( this.getModel() as TModelHelper<TPayloadWithContent> ).create( {
            data: {
                name,
                language: {
                    name: languageName,
                    code: languageCode
                },
                content
            }
        } );
    }

    public async getCount( code: string ) {
        return ( this.getModel() as TModelHelper<TPayloadWithContent> ).count( { where: { language: { is: { code } } } } );
    }

    protected abstract getModel(): TModel;

    protected getClient() {
        return PrismaBotClient.$.getClient();
    }

    protected getFindArgs( name: string, languageCode: string ): any {
        return {
            where: {
                name,
                language: {
                    is: {
                        code: languageCode
                    }
                }
            },
            include: {
                content: true
            }
        };
    }
}
