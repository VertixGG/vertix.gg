import util from "node:util";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelWithDataBase } from "@vertix.gg/base/src/bases/model-with-data-base";

import { clientChannelExtend } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import { ChannelDataModel } from "@vertix.gg/base/src/models/channel/channel-data-model";

import { ChannelDataModelV3 } from "@vertix.gg/base/src/models/channel/channel-data-model-v3";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataType } from "@vertix.gg/base/src/factory/data-type-factory";

import type {
    ChannelExtended,
    ChannelFindManyArgsWithDataIncludeKey,
    ChannelFindUniqueArgsWithDataIncludeKey
} from "@vertix.gg/base/src/models/channel/channel-client-extend";

type ChannelExtendedResult<T extends TDataType> =
    | ( ChannelExtended & {
          data?: T;
      } )
    | undefined
    | null;

// TODO: Cache mechanism is not fully working, in order to fix it, its require to handle all possible keys.
export class ChannelModel extends ModelWithDataBase<
    typeof clientChannelExtend.channel,
    typeof clientChannelExtend.channelData,
    ChannelExtended,
    PrismaBot.ChannelData,
    TDataOwnerDefaultUniqueKeys
> {
    private static instance: ChannelModel;

    public static get $ () {
        if ( !this.instance ) {
            this.instance = new ChannelModel();
        }

        return this.instance;
    }

    public static getName () {
        return "VertixBase/Models/Channel";
    }

    public constructor () {
        super( isDebugEnabled( "CACHE", ChannelModel.getName() ), isDebugEnabled( "MODEL", ChannelModel.getName() ) );
    }

    protected getModel () {
        return clientChannelExtend.channel;
    }

    protected getDataModels () {
        return [ ChannelDataModel, ChannelDataModelV3 ];
    }

    public async findUnique<T extends TDataType> (
        findUniqueArgs: ChannelFindUniqueArgsWithDataIncludeKey,
        cache = true
    ) {
        this.debugger.log( this.findUnique, `Fetching entry for channel id: '${ util.inspect( findUniqueArgs.where ) }''` );

        let result: ChannelExtendedResult<T>;

        let cacheKey = this.generateCacheKey( findUniqueArgs.where );

        if ( cache ) {
            result = this.getCache( cacheKey );
        }

        const findUniqueArgsWithoutInclude = { ...findUniqueArgs, include: null /* manually */ };

        if ( !result ) {
            result = await this.model.findUnique( findUniqueArgsWithoutInclude );
        }

        if ( result ) {
            cache && this.setCache( cacheKey, result );

            if ( findUniqueArgs.include ) {
                result = await this.getChannelData<T>( result, findUniqueArgs.include.key, cache );
            }
        }

        this.debugger.dumpDown( this.findUnique, {
            findUniqueArgs,
            result
        } );

        return result;
    }

    public async findMany<T extends TDataType> ( findManyArgs: ChannelFindManyArgsWithDataIncludeKey, cache = true ) {
        const type = findManyArgs.where?.internalType ?? PrismaBot.E_INTERNAL_CHANNEL_TYPES.DEFAULT_CHANNEL;

        this.logger.log(
            this.findMany,
            `Guild id: '${ findManyArgs.where!.guildId }' - Finding all channels with type: '${ type }'`
        );

        const findManyWithoutInclude = { ...findManyArgs, include: null /* manually */ };

        const results = await this.model.findMany( findManyWithoutInclude );

        this.debugger.dumpDown( this.findMany, {
            findManyArgs,
            results
        } );

        const self = this;

        async function handleResultWithCacheInclude () {
            return Promise.all(
                results.map( async ( result ) => {
                    self.setCache( self.generateCacheKey( { channelId: result.channelId } ), result );

                    return await self.getChannelData<T>( result, findManyArgs.include!.key, cache );
                } )
            );
        }

        function handleResultWithCache () {
            results.forEach( ( result ) => self.setCache( self.generateCacheKey( { channelId: result.channelId } ), result ) );

            return Promise.resolve( results );
        }

        function handleResultWithInclude () {
            return Promise.all(
                results.map( async ( result ) => {
                    return await self.getChannelData<T>( result, findManyArgs.include!.key, cache );
                } )
            );
        }

        function handleResult () {
            return Promise.resolve( results );
        }

        type Handler = () => Promise<typeof results>;

        const cacheKey = cache ? "true" : "false";
        const includeKey = findManyArgs.include ? "true" : "false";

        const handlers: Record<string, Record<string, Handler>> = {
            true: {
                true: handleResultWithCacheInclude,
                false: handleResultWithCache
            },
            false: {
                true: handleResultWithInclude,
                false: handleResult
            }
        };

        // Favor speed over memory.
        return handlers[ cacheKey ][ includeKey ]();
    }

    public async create ( createArgs: PrismaBot.Prisma.ChannelCreateArgs["data"], cache = true ) {
        this.logger.log(
            this.create,
            `Guild id: '${ createArgs.guildId }' - Creating entry for channel id: '${ createArgs.channelId }''`
        );

        const result = await this.model.create( { data: createArgs } );

        this.debugger.dumpDown( this.create, {
            createArgs,
            result
        } );

        if ( cache ) {
            this.setCache( this.generateCacheKey( { channelId: result.channelId } ), result );
        }

        return result;
    }

    public async update ( updateArgs: Pick<PrismaBot.Prisma.ChannelUpdateArgs, "where" | "data">, cache = true ) {
        this.logger.log(
            this.update,
            `Guild id: '${ updateArgs.data.guildId }' - Updating entry for channel id: '${ updateArgs.where.channelId }''`
        );

        // Delete cache
        if ( cache ) {
            this.deleteCache( this.generateCacheKey( updateArgs.where ) );
        }

        const result = await this.model.update( updateArgs );

        this.debugger.dumpDown( this.update, {
            updateArgs,
            result
        } );

        return result;
    }

    public async delete ( deleteArgs: PrismaBot.Prisma.ChannelDeleteArgs["where"], cache = true ) {
        this.logger.log( this.delete, `Deleting entry for channel id: '${ deleteArgs.channelId }''` );

        // Delete cache
        if ( cache ) {
            this.deleteCache( this.generateCacheKey( deleteArgs ) );
        }

        const result = await this.model.delete( { where: deleteArgs } );

        this.debugger.dumpDown( this.create, {
            deleteArgs,
            result
        } );
    }

    public async deleteMany ( where: PrismaBot.Prisma.ChannelDeleteManyArgs["where"], cache = true ) {
        this.logger.log( this.deleteMany, `Deleting entries for guild id: '${ where!.guildId }''` );

        if ( !cache ) {
            return ( await this.model.deleteMany( { where } ) ).count || 0;
        }

        let count = 0;
        const results = await this.findMany( { where } );

        for ( const result of results ) {
            await this.delete( { channelId: result.channelId }, false );
            count++;
        }

        return count;
    }

    public async getMasters ( guildId: string, dataKey?: string ) {
        const where: ChannelFindManyArgsWithDataIncludeKey["where"] = {
            guildId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
        };

        const include: ChannelFindManyArgsWithDataIncludeKey["include"] | undefined = dataKey
            ? {
                  data: true,
                  key: dataKey
              }
            : undefined;

        return this.findMany( { where, include } );
    }

    public async getDynamics ( guildId: string, dataKey?: string ) {
        const where: ChannelFindManyArgsWithDataIncludeKey["where"] = {
            guildId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
        };

        const include: ChannelFindManyArgsWithDataIncludeKey["include"] | undefined = dataKey
            ? {
                  data: true,
                  key: dataKey
              }
            : undefined;

        return this.findMany( { where, include } );
    }

    public async getDynamicsByMasterId ( guildId: string, masterChannelId: string ) {
        return this.findMany( {
            where: {
                guildId,
                ownerChannelId: masterChannelId,
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
            }
        } );
    }

    public async getByChannelId ( channelId: string | null, cache = true ) {
        // TODO: Remove backwards compatibility.
        if ( !channelId ) {
            return null;
        }

        return this.findUnique( { where: { channelId } }, cache );
    }

    public async getMasterByDynamicChannelId ( dynamicChannelId: string, cache = true ) {
        this.logger.log(
            this.getMasterByDynamicChannelId,
            `Dynamic channel id: '${ dynamicChannelId }' - Trying to get master channel from ${ cache ? "cache" : "database" }`
        );

        const dynamicChannelDB = await this.getByChannelId( dynamicChannelId, cache );

        if ( !dynamicChannelDB || !dynamicChannelDB.ownerChannelId ) {
            return null;
        }

        return await this.getByChannelId( dynamicChannelDB.ownerChannelId, cache );
    }

    public async getTypeCount ( guildId: string, internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) {
        const total = await this.model.count( {
            where: {
                guildId,
                internalType
            }
        } );

        this.debugger.log( this.getTypeCount, `Guild id: '${ guildId }' - Total master channels for is '${ total }'` );

        return total;
    }

    public async isMaster ( channelId: string, cache = true ) {
        return !!( await this.getByChannelId( channelId, cache ) )?.isMaster;
    }

    public async isDynamic ( channelId: string, cache = true ) {
        return !!( await this.getByChannelId( channelId, cache ) )?.isDynamic;
    }

    public getModelByVersion ( version: string ) {
        return this.dataModels.find( ( m ) => m.getVersion() === version ) || this.dataModels.at( 0 );
    }

    private async getChannelData<T extends TDataType> (
        result: NonNullable<ChannelExtendedResult<T>>,
        key: string,
        cache = true
    ) {
        const dataModel = this.getModelByVersion( result.version );

        // We need to run a second query to get the data for this channel.
        // No worries, since our data model is a one-to-many relation, Prisma with MongoDB will run two queries anyway.
        const dataResult = await dataModel!.getData<T>(
            {
                key,
                ownerId: result.id
            },
            { cache }
        );

        return {
            ...result,
            data: dataResult
        };
    }

    private generateCacheKey ( obj: Record<string, any> ) {
        if ( !obj.channelId ) {
            throw new Error( "Missing channelId" );
        }

        return obj.channelId as string;
    }
}
