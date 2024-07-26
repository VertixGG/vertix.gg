import util from "node:util";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelBaseCachedWithModel } from "@vertix.gg/base/src/bases/model-base";

import { DataTypeFactory  } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

export type TVersionType = `${ number }.${ number }.${ number }`;

interface TBaseModel {
    create( ... args: any[] ): any;
    create<T>( ... args: any[] ): Promise<T>;
    findUnique( ... args: any[] ): any,
}

export interface TDataVersioningDefaultUniqueKeys {
    key: string;
    version: TVersionType;
}

export interface TDataVersioningOptions {
    include?: Record<string, any>;
    cache: boolean;
}

export function DataVersioningModelFactory<
    TModelResult extends TDefaultResult,
    TModel extends TBaseModel,
    TUniqueKeys extends TDataVersioningDefaultUniqueKeys = TDataVersioningDefaultUniqueKeys
>(
    model: TModel,
    options: {
        modelNamespace?: string,
        shouldDebugCache?: boolean,
        shouldDebugModel?: boolean
    } = {}
) {
    class VersioningModel extends DataTypeFactory( ModelBaseCachedWithModel<TModel, TModelResult> ) {
        public static getName() {
            return options.modelNamespace ?? "VertixBase/Factory/VersioningModel";
        }

        public constructor(
            shouldDebugCache = ( undefined === typeof options.shouldDebugCache
                ? isDebugEnabled( "CACHE", VersioningModel.getName() ) :
                options.shouldDebugCache
            ),
            shouldDebugModel = ( undefined === typeof options.shouldDebugModel
                ? isDebugEnabled( "MODEL", VersioningModel.getName() ) :
                options.shouldDebugModel
            )
        ) {
            super( shouldDebugCache, shouldDebugModel );
        }

        protected getModel() {
            return model;
        }

        protected getUniqueKeyName() {
            return "key_version";
        }

        /**
         * Function `get()<T>` - Fetches a value from the cache or the database.
         * The main purpose of this function is to find a value associated with a provided key and version.
         * It attempts to retrieve the value from the cache first.
         * If not present in the cache, it queries the database.
         * If the value is found in the database, it stores the value in the cache for future faster access.
         * Finally, it converts the fetched value to the appropriate type using the getValueAsType method.
         *
         * @returns The value associated with the key and version, converted to the appropriate type, or null if not found.
         **/
        public async get<T extends ReturnType<typeof this.getValueAsType>>( keys: TUniqueKeys, options: TDataVersioningOptions = {
            cache: true,
        } ) {
            const keysArray = Object.values( keys ) as string[];

            const cacheKey = this.generateCacheKey( ... keysArray );

            let result = options.cache ? this.getCache( cacheKey ) : null;

            if ( ! result ) {
                const args = {
                    where: {
                        [ this.getUniqueKeyName() ]: keys
                    }
                } as any;

                if ( options.include ) {
                    args.include = options.include;
                }

                result = await this.getModel().findUnique( args );

                if ( result ) {
                    this.setCache( cacheKey, result );
                }
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        /**
         * Function `create<T>()` - Creates a new entry in the database and cache
         *
         * This function is responsible for creating a new entry in the data model and updating the cache. It works by
         * checking if the specified key and version combination already exists using the `get` method. If the entry
         * already exists, it logs an error and skips creation. If the entry does not exist, it proceeds to determine
         * the data type of the value using the `getDataType` method, then it creates the new entry in the data model.
         * It updates the cache with the new entry if creation is successful and finally returns the entry converted
         * to the appropriate type using the `getValueAsType` method.
         *
         * @returns The newly created entry, converted to the appropriate type, or null if creation failed.
         **/
        public async create<T extends ReturnType<typeof this.getValueAsType>>( keys: TUniqueKeys, value: T ) {
            // Check if exists
            if ( await this.get( keys ) ) {
                this.logger.error( this.create, `Keys: ${ util.inspect( keys ) } already exists` );
            }

            const dataType = this.getDataType( value );

            const result = await this.getModel().create<TModelResult>( {
                data: {
                    ... keys,

                    type: dataType,
                    [ this.getValueField( dataType ) ]: this.transformValue( value, dataType )
                }
            } );

            if ( result ) {
                const keysArray = Object.values( keys ) as string[];

                this.setCache( this.generateCacheKey( ... keysArray ), result );
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        private generateCacheKey( key: string, version: string ): string
        private generateCacheKey( ... args: string[] ): string
        private generateCacheKey( ... args: string[] ) {
            return args.join( "|" );
        };
    }

    return VersioningModel;
}

export type TDataVersioningModel<TModelResult extends TDefaultResult, TModel extends TBaseModel>
    = ReturnType<typeof DataVersioningModelFactory<TModelResult, TModel>>;
