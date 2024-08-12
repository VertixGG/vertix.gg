import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { CacheBase } from "@vertix.gg/base/src/bases/cache-base";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import type {
    DataResult,
    IDataGetArgs,
    IDataManager,
    IDataModel,
    IDataSelectUniqueArgs,
    IDataUpdateArgs
} from "@vertix.gg/base/src/interfaces/data";

const DEFAULT_OWNER_ID_CACHE_TIMEOUT = /* 1 hour */ 60 * 60 * 1000;

// TODO: Refactor.
export abstract class ManagerDataBase<
    ModelType extends IDataModel
> extends CacheBase<DataResult> implements IDataManager {
    private static instances: Map<any, any> = new Map();

    private ownerIdCache: { [ ownerId: string ]: string } = {};

    private dataSourceModel: ModelType;

    protected debugger: Debugger;

    public static getInstance<TModelType extends IDataModel, TManager extends ManagerDataBase<TModelType>>( this: new () => TManager): TManager {
        if ( ! ManagerDataBase.instances.has( this ) ) {
            ManagerDataBase.instances.set( this, new this() );
        }

        return ManagerDataBase.instances.get( this );
    }

    protected constructor( shouldDebugCache = false ) {
        super( shouldDebugCache );

        this.debugger = new Debugger( this );

        this.dataSourceModel = this.getDataSourceModel();
    }

    public async getData( args: Omit<IDataGetArgs, "version">, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId, args.cache );

        const { ownerId, key, cache } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.log( this.getData,
            `Getting data for ownerId: '${ ownerId }' key: '${ key }' cache: '${ cache }'`
        );

        // Get from cache.
        if ( cache ) {
            const cached = this.getCache( cacheKey );

            if ( cached ) {
                this.debugger.log( this.getData, `Getting cached data for ownerId: '${ ownerId }' key: '${ key }' - Returned from: 'cache'` );
                return cached;
            }
        }

        // Get from database.
        const dbData = await this.dataSourceModel.getData( args ).catch( () => {
        } );

        if ( ! dbData ) {
            this.logger.debug( this.getData,
                `Could not find data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
            );
            return;
        }

        let data: DataResult,
            message: string;

        // If not exist, create.
        if ( args.default !== null && ! dbData?.data?.length ) {
            data = await this.dataSourceModel.createData( {
                key: args.key,
                value: args.default,
                ownerId: dbData.id,
            } );

            message = "Created new";
        } else if ( dbData?.data?.length ) {
            // If exist, assign.
            data = dbData.data[ 0 ];

            message = "Getting";
        } else {
            this.logger.debug( this.getData,
                `Could not find data for ownerId: '${ args.ownerId }'`
            );
            return;
        }

        message += ` data for ownerId: '${ args.ownerId }', type: '${ data.type }' key: '${ args.key }' values:\n`;

        this.debugger.log( this.getData, message, data.object || data.values );

        // Set cache.
        this.setCache( cacheKey, data );

        return data;
    }

    public async getSettingsData( ownerId: string, defaultSettings: any, cache = false, isOwnerIdSourceId = false ) {
        this.debugger.log( this.getSettingsData,
            `Getting settings data for ownerId: '${ ownerId }', cache: '${ cache }' `
        );

        return await this.getData( {
            ownerId,
            key: this.getSettingsKey(),
            cache,
            default: defaultSettings,
        }, isOwnerIdSourceId );
    }

    public async setData( args: Omit<IDataUpdateArgs, "version">, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId, args.cache );

        this.logger.info( this.setData,
            `Setting data for ownerId: '${ args.ownerId }' key: '${ args.key }', skipGet: '${ args.skipGet }' cache: '${ args.cache }'`
        );

        args.cache = true;

        if ( ! args.skipGet ) {
            // Don't create on default.
            const dbData = await this.getData( {
                ... args,
                default: null,
            } );

            // If exist, replace.
            if ( dbData ) {
                this.logger.debug( this.setData,
                    `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' already exist, replacing...`
                );

                if ( ! args.default ) {
                    this.logger.error( this.setData,
                        `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' already exist, but no default value was provided, aborting...`
                    );
                    return;
                }

                // Since the content should be saved in cache, we need to map the content to the correct format.
                const mappedDBData = this.dataSourceModel.getInternalNormalizedData( {
                    ... dbData,
                    value: args.default
                } );

                return this.updateData( args, mappedDBData );
            }

            // If not exist, create.
            if ( null !== args.default ) {
                this.logger.debug( this.setData,
                    `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' does not exist, creating...`
                );

                // `dataSourceModel.createData` calls, `dataSourceModel.getInternalNormalizedData` internally.
                const data = await this.dataSourceModel.createData( {
                    key: args.key,
                    value: args.default,
                    ownerId: args.ownerId,
                } );

                // Set cache.
                this.setCache( `${ args.ownerId }-${ args.key }`, data );

                return data;
            }
        } else {
            if ( null === args.default ) {
                this.logger.error( this.setData,
                    `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' does not exist, but no default value was provided, aborting...`
                );
                return;
            }

            this.logger.debug( this.setData,
                `Setting data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
            );

            // `dataSourceModel.createData` calls, `dataSourceModel.getInternalNormalizedData` internally.
            const data = await this.dataSourceModel.createData( {
                key: args.key,
                value: args.default,
                ownerId: args.ownerId,
            } );

            // Set cache.
            this.setCache( `${ args.ownerId }-${ args.key }`, data );

            return data;
        }

        this.logger.error( this.setData,
            `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' does not exist, but no default value was provided, aborting...`
        );
    }

    public async setSettingsData( ownerId: string, settings: any, skipGetSettings = false ) {
        let oldSettings: any = {};

        if ( ! skipGetSettings ) {
            oldSettings = ( await this.getSettingsData( ownerId, null, true ) )?.object || {} as any;
        }

        Object.entries( settings ).forEach( ( [ key, value ] ) => {
            oldSettings[ key ] = value;
        } );

        return await this.setData( {
            ownerId,
            key: this.getSettingsKey(),
            default: oldSettings,
            skipGet: skipGetSettings,
        } );
    }

    public async updateData( args: Omit<IDataUpdateArgs, "version">, dbData: DataResult ) {
        const { ownerId, key } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.updateData,
            `Updating data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
        );

        // Set cache.
        this.setCache( cacheKey, dbData );

        await this.dataSourceModel.setData( args );
    }

    public async deleteData( args: Omit<IDataSelectUniqueArgs, "version">, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId, true );

        this.logger.info( this.deleteData,
            `Deleting data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
        );

        this.removeFromCache( args.ownerId );

        return await this.dataSourceModel.deleteData( args );
    }

    public async getAllData() {
        this.logger.info( this.getAllData, "Getting all content" );

        return await this.dataSourceModel.getAllData();
    }

    public async isExist( ownerId: string, key: string, version = VERSION_UI_V2, cache = true ) {
        this.logger.debug( this.isExist,
            `Checking if data exist for ownerId: '${ ownerId }' key: '${ key }' cache: '${ cache }'`
        );

        if ( cache ) {
            const cachedResult = this.getCache( `${ ownerId }-${ key }` );

            if ( cachedResult ) {
                this.logger.debug( this.isExist,
                    `Data for ownerId: '${ ownerId }' key: '${ key }' exist in cache`
                );

                return true;
            }
        }

        return await this.dataSourceModel.isDataExist( {
            ownerId,
            key,
            version,
        } );
    }

    public abstract removeFromCache( ownerId: string ): void;

    /**
     * Function getDataSourceModel() :: is used to determine the content source model since the current class is abstract/wrapper.
     */
    protected abstract getDataSourceModel(): ModelType;

    /**
     * Function getSettingsKey() :: is used to determine the settings key, it used as default key to store settings content.
     */
    protected abstract getSettingsKey(): string;

    private async normalizeArgs( args: any, isOwnerIdSourceId: boolean, cache = true ) {
        if ( isOwnerIdSourceId ) {
            args = { ... args };
            args.ownerId = await this.getIdByOwnerSourceId( args.ownerId, cache );
        }

        return args;
    }

    private async getIdByOwnerSourceId( ownerId: string, cache: boolean ) {
        if ( cache ) {
            const cachedResult = this.ownerIdCache[ ownerId ];

            if ( cachedResult ) {
                this.debugger.log( this.getIdByOwnerSourceId,
                    `Getting owner id for sourceId: '${ ownerId }', cache: '${ cache }' - Owner id: '${ cachedResult }' data from 'cache'`,
                );

                return cachedResult;
            }
        }

        const owner = await this.dataSourceModel.getOwnerId( ownerId );

        this.debugger.log( this.getIdByOwnerSourceId,
            `Getting owner id for sourceId: '${ ownerId }', cache: '${ cache }' - Owner id: '${ owner?.id }' data from 'database'`,
        );

        if ( ! owner ) {
            throw new Error( `Could not find owner for sourceId: '${ ownerId }'` );
        }

        // Set cache.
        this.ownerIdCache[ ownerId ] = owner.id;

        // Create clear timeout.
        setTimeout( () => {
            delete this.ownerIdCache[ ownerId ];
        }, DEFAULT_OWNER_ID_CACHE_TIMEOUT );

        return owner.id;
    }
}

export default ManagerDataBase;
