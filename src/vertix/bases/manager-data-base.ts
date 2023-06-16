import {
    DataResult,
    IDataGetArgs,
    IDataManager,
    IDataModel,
    IDataSelectUniqueArgs,
    IDataUpdateArgs
} from "@vertix/interfaces/data";

import { Debugger } from "@internal/modules/debugger";

import { CacheBase } from "@internal/bases/cache-base";

// TODO: Refactor.
export abstract class ManagerDataBase<
    ModelType extends IDataModel
> extends CacheBase<DataResult> implements IDataManager {
    private debugger: Debugger;

    private dataSourceModel: ModelType;

    public constructor( shouldDebugCache = false ) {
        super( shouldDebugCache );

        this.debugger = new Debugger( this );

        this.dataSourceModel = this.getDataSourceModel();
    }

    public async getData( args: IDataGetArgs, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId );

        const { ownerId, key, cache } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.getData,
            `Getting data for ownerId: '${ ownerId }' key: '${ key }'`
        );

        // Get from cache.
        if ( cache ) {
            const cached = this.getCache( cacheKey );

            if ( cached ) {
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
        return await this.getData( {
            ownerId,
            key: this.getSettingsKey(),
            cache,
            default: defaultSettings,
        }, isOwnerIdSourceId );
    }

    public async setData( args: IDataUpdateArgs, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId );

        this.logger.info( this.setData,
            `Setting data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
        );

        args.cache = true;

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

        this.logger.error( this.setData,
            `Data for ownerId: '${ args.ownerId }' key: '${ args.key }' does not exist, but no default value was provided, aborting...`
        );
    }

    public async setSettingsData( ownerId: string, settings: any ) {
        const oldSettings = ( await this.getSettingsData( ownerId, null, true ) )?.object || {} as any;

        Object.entries( settings ).forEach( ( [ key, value ] ) => {
            oldSettings[ key ] = value;
        } );

        return await this.setData( {
            ownerId,
            key: this.getSettingsKey(),
            default: oldSettings,
        } );
    }

    public async updateData( args: IDataUpdateArgs, dbData: DataResult ) {
        const { ownerId, key } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.updateData,
            `Updating data for ownerId: '${ args.ownerId }' key: '${ args.key }'`
        );

        // Set cache.
        this.setCache( cacheKey, dbData );

        await this.dataSourceModel.setData( args );
    }

    public async deleteData( args: IDataSelectUniqueArgs, isOwnerIdSourceId = false ) {
        args = await this.normalizeArgs( args, isOwnerIdSourceId );

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

    public abstract removeFromCache( ownerId: string ): void;

    /**
     * Function getDataSourceModel() :: is used to determine the content source model since the current class is abstract/wrapper.
     */
    protected abstract getDataSourceModel(): ModelType;

    /**
     * Function getSettingsKey() :: is used to determine the settings key, it used as default key to store settings content.
     */
    protected abstract getSettingsKey(): string;

    private async normalizeArgs( args: any, isOwnerIdSourceId: boolean ) {
        if ( isOwnerIdSourceId ) {
            args = { ... args };
            args.ownerId = await this.getIdByOwnerSourceId( args.ownerId );
        }

        return args;
    }

    private async getIdByOwnerSourceId( ownerId: string ) {
        const owner = await this.dataSourceModel.getOwnerId( ownerId );

        this.debugger.log( this.getIdByOwnerSourceId,
            `Getting owner id for sourceId: '${ ownerId }' ownerId: '${ owner?.id }'`,
        );

        if ( ! owner ) {
            throw new Error( `Could not find owner for sourceId: '${ ownerId }'` );
        }

        return owner.id;
    }
}

export default ManagerDataBase;