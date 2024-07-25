import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelBaseCachedWithModel } from "@vertix.gg/base/src/bases/model-base";

import { DataTypeFactory  } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

type VersionType = `${ number }.${ number }.${ number }`;

const CONFIG_DEFAULT_VERSION: VersionType = "0.0.0";

interface TBaseModel {
    create( ... args: any[] ): any;
    create<T>( ... args: any[] ): Promise<T>;
    findUnique( ... args: any[] ): any,
}

export function DataVersioningModelFactory<TModelResult extends TDefaultResult, const TModel extends TBaseModel >(
    model: TModel,
    defaultVersion = CONFIG_DEFAULT_VERSION,
) {
    class VersioningModel extends DataTypeFactory( ModelBaseCachedWithModel<TModel, TModelResult> ) {
        public static getName() {
            return "VertixBase/Factory/VersioningModel";
        }

        public constructor(
            // TODO: Env name should comes from above
            shouldDebugCache = isDebugEnabled( "CACHE", VersioningModel.getName() ),
            shouldDebugModel = isDebugEnabled( "MODEL", VersioningModel.getName() )
        ) {
            super( shouldDebugCache, shouldDebugModel );
        }

        protected getModel() {
            return model;
        }

        public async get<T extends ReturnType<typeof this.getValueAsType>>( key: string, version = defaultVersion, cache = true ) {
            const cacheKey = this.generateCacheKey( key, version );

            let result = cache ? this.getCache( cacheKey ) : null;

            if ( ! result ) {
                result = await this.getModel().findUnique( {
                    where: {
                        key_version: {
                            key,
                            version
                        }
                    }
                } );

                if ( result ) {
                    this.setCache( cacheKey, result );
                }
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        public async create<T extends ReturnType<typeof this.getValueAsType>>( key: string, value: T, version = defaultVersion ) {
            // Check if exists
            if ( await this.get( key, version, true ) ) {
                this.logger.error( this.create, `Key: '${ key }', version: '${ version }' already exists, skipping creation.` );
            }

            const dataType = this.getDataType( value );

            const result = await this.getModel().create<TModelResult>( {
                data: {
                    key,
                    version,
                    type: dataType,
                    [ this.getValueField( dataType ) ]: value
                }
            } );

            if ( result ) {
                this.setCache( this.generateCacheKey( result.key, result.version ), result );
            }

            return result ? this.getValueAsType<T>( result ) : null;
        }

        private generateCacheKey( key: string, version: string ) {
            return key + "|" + version;
        }
    }

    return VersioningModel;
}

