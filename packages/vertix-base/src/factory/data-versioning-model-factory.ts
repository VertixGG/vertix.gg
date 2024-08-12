import util from "node:util";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { deepMerge } from "@vertix.gg/utils/src/object";

import { ModelBaseCachedWithModel } from "@vertix.gg/base/src/bases/model-base";

import { DataTypeFactory  } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

export type TVersionType = `${ number }.${ number }.${ number }.${ number }`;

export interface TDataVersioningDefaultUniqueKeys {
    key: string;
    version: TVersionType;
}

export interface TDataVersioningOptions {
    cache: boolean;
}

export function DataVersioningModelFactory<
    TModelResult extends TDefaultResult,
    TModel extends TBaseModelStub,
    TUniqueKeys extends TDataVersioningDefaultUniqueKeys = TDataVersioningDefaultUniqueKeys
>(
    model: TModel,
    options: {
        meta?: TModel["name"],
        modelNamespace?: string,
        shouldDebugCache?: boolean,
        shouldDebugModel?: boolean
    } = {}
) {
    const meta = options.meta;

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

                result = await this.getModel().findUnique( args );

                if ( result ) {
                    this.setCache( cacheKey, result );
                }
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        public async getWithMeta<T extends ReturnType<typeof this.getValueAsType>, const TMeta extends object>( keys: TUniqueKeys, options: TDataVersioningOptions = {
            cache: true,
        } ) {
            if ( ! meta ) {
                throw new Error( "Meta is required" );
            }

            const keysArray = Object.values( keys ) as string[];

            keysArray.push( "withMeta" );

            const cacheKey = this.generateCacheKey( ... keysArray );

            let result = options.cache ? this.getCache( cacheKey ) : null;

            if ( ! result ) {
                const args = {
                    where: {
                        [ this.getUniqueKeyName() ]: keys
                    }
                } as any;

                args.include = {
                    [ meta ]: true,
                };

                result = await this.getModel().findUnique( args );

                if ( result ) {
                    this.setCache( cacheKey, result );
                }
            }

            if ( result ) {
                return {
                    data: this.getValueAsType<T>( result ),
                    meta: result[ meta as keyof TModelResult ] as TMeta
                };
            }

            return null;
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

            this.setCacheResult( keys, result );

            return result ? this.getValueAsType<T>( result ) : null;
        }

        public async update<T extends ReturnType<typeof this.getValueAsType>>( keys: TUniqueKeys, value: T ) {
            const dataType = this.getDataType( value );

            const newValue = await this.mergeWithExisting( keys, value );

            const result = await this.getModel().update<TModelResult>( {
                where: {
                    [ this.getUniqueKeyName() ]: keys
                },
                data: {
                    type: dataType,
                    [ this.getValueField( dataType ) ]: this.transformValue( newValue, dataType )
                }
            } );

            // Delete cache
            if ( result ) {
                this.deleteCacheForKeys( keys );
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        public async upsert<T extends ReturnType<typeof this.getValueAsType>>( keys: TUniqueKeys, value: T ) {
            const dataType = this.getDataType( value );

            const result = await this.getModel().upsert<TModelResult>( {
                where: {
                    [ this.getUniqueKeyName() ]: keys
                },
                update: {
                    type: dataType,
                    [ this.getValueField( dataType ) ]: this.transformValue( await this.mergeWithExisting( keys, value ), dataType )
                },
                create: {
                    ... keys,

                    type: dataType,
                    [ this.getValueField( dataType ) ]: this.transformValue( value, dataType )
                }
            } );

            // Delete cache only if already exists
            this.deleteCacheIfAlreadyExists( keys );

            return result ? this.getValueAsType<T>( result ) : null;
        }

        private async mergeWithExisting( keys: TUniqueKeys, value: any ) {
            let existing;

            const dataType = this.getDataType( value );

            if ( "object" === dataType ) {
                existing = await this.get( keys );
            }

            // Deep merge existing object with the new value if it exists
            return existing ? deepMerge( existing, value ) : value;
        }

        private setCacheResult( keys: TUniqueKeys, result: TModelResult ) {
            const keysArray = Object.values( keys ) as string[];

            this.setCache( this.generateCacheKey( ... keysArray ), result );
        }

        private deleteCacheForKeys( keys: TUniqueKeys ) {
            const keysArray = Object.values( keys ) as string[];

            this.deleteCache( this.generateCacheKey( ... keysArray ) );
        }

        private deleteCacheIfAlreadyExists( keys: TUniqueKeys ) {
            const keysArray = Object.values( keys ) as string[];

            const cacheKey = this.generateCacheKey( ... keysArray );

            if ( this.getCache( cacheKey ) ) {
                this.deleteCache( cacheKey );
            }
        };

        private generateCacheKey( key: string, version: string ): string
        private generateCacheKey( ... args: string[] ): string
        private generateCacheKey( ... args: string[] ) {
            return args.join( "|" );
        };
    }

    return VersioningModel;
}

export type TDataVersioningModel<TModelResult extends TDefaultResult, TModel extends TBaseModelStub>
    = ReturnType<typeof DataVersioningModelFactory<TModelResult, TModel>>;
