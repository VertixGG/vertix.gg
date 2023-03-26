import {
    DataResult,
    IDataGetArgs,
    IDataManager,
    IDataModel,
    IDataSelectUniqueArgs,
    IDataUpdateArgs
} from "@dynamico/interfaces/data";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

export abstract class ManagerDataBase<ModelType extends IDataModel> extends ManagerCacheBase<DataResult> implements IDataManager {
    private dataSourceModel: ModelType;

    public constructor() {
        super();

        this.dataSourceModel = this.getDataSourceModel();
    }

    public abstract removeFromCache( ownerId: string ): void;

    protected abstract getDataSourceModel(): ModelType;

    public async getData( args: IDataGetArgs, isOwnerIdSourceId = false ) {
        if ( isOwnerIdSourceId ) {
            args = { ... args };
            args.ownerId = await this.getIdByOwnerSourceId( args.ownerId );
        }

        const { ownerId, key, cache } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.getData,
            `Getting data for ownerId: '${ ownerId }', key: '${ key }'` );

        // Get from cache.
        if ( cache ) {
            const cached = this.getCache( cacheKey );

            if ( cached ) {
                return cached;
            }
        }

        // Get from database.
        const dbData = await this.dataSourceModel.getData( args );
        if ( ! dbData ) {
            this.logger.debug( this.getData,
                `Could not find data for ownerId: '${ args.ownerId }' with key: '${ args.key }'`
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
            data = dbData.data[ 0 ];

            message = "Getting";
        } else {
            this.logger.debug( this.getData,
                `Could not find data for ownerId: '${ args.ownerId }'`
            );
            return;
        }

        message += ` data for ownerId: '${ args.ownerId }', type: '${ data.type }' key: '${ args.key }' with values:\n`;

        this.debugger.log( this.getData, message, data.object || data.values );

        // Set cache.
        this.setCache( cacheKey, data );

        return data;
    }

    public async setData( args: IDataUpdateArgs, isOwnerIdSourceId = false ) {
        if ( isOwnerIdSourceId ) {
            args = { ... args };
            args.ownerId = await this.getIdByOwnerSourceId( args.ownerId );
        }

        this.logger.info( this.setData,
            `Setting data for ownerId: '${ args.ownerId }', key: '${ args.key }'` );

        args.cache = true;

        // Don't create on default.
        const dbData = await this.getData( {
            ... args,
            default: null,
        } );

        // If exist, replace.
        if ( dbData ) {
            this.logger.debug( this.setData,
                `Data for ownerId: '${ args.ownerId }', key: '${ args.key }' already exist, replacing...` );

            if ( ! args.default ) {
                this.logger.error( this.setData,
                    `Data for ownerId: '${ args.ownerId }', key: '${ args.key }' already exist, but no default value was provided, aborting...` );
                return;
            }

            // Since the data should be saved in cache, we need to map the data to the correct format.
            const mappedDBData = this.dataSourceModel.getInternalNormalizedData( {
                ... dbData,
                value: args.default
            } );

            return this.updateData( args, mappedDBData );
        }

        // If not exist, create.
        if ( null !== args.default ) {
            this.logger.debug( this.setData,
                `Data for ownerId: '${ args.ownerId }', key: '${ args.key }' does not exist, creating...` );

            const data = await this.dataSourceModel.createData( {
                key: args.key,
                value: args.default,
                ownerId: args.ownerId,
            } );

            // Set cache.
            this.setCache( `${ args.ownerId }-${ args.key }`, data );

            return data;
        }
    }

    public async updateData( args: IDataUpdateArgs, dbData: DataResult ) {
        const { ownerId, key } = args,
            cacheKey = `${ ownerId }-${ key }`;

        this.logger.info( this.updateData,
            `Updating data for ownerId: '${ args.ownerId }', key: '${ args.key }'`
        );

        // Set cache.
        this.setCache( cacheKey, dbData );

        await this.dataSourceModel.setData( args );
    }

    public async deleteData( args: IDataSelectUniqueArgs, isOwnerIdSourceId = false ) {
        if ( isOwnerIdSourceId ) {
            args = { ... args };
            args.ownerId = await this.getIdByOwnerSourceId( args.ownerId );
        }

        this.logger.info( this.deleteData,
            `Deleting data for ownerId: '${ args.ownerId }', key: '${ args.key }'` );

        this.removeFromCache( args.ownerId );

        return await this.dataSourceModel.deleteData( args );
    }

    private async getIdByOwnerSourceId( ownerId: string ) {
        const owner = await this.dataSourceModel.getOwnerId( ownerId );

        this.debugger.log( this.getIdByOwnerSourceId,
            `Getting owner id for sourceId: '${ ownerId }' ownerId: '${ owner?.id }'`,
        );

        if ( ! owner ) {
            this.logger.error( this.getIdByOwnerSourceId,
                `Could not find owner with sourceId: '${ ownerId }' return the ownerId instead.`
            );
            return ownerId;
        }

        return owner.id;
    }
}

export default ManagerDataBase;
