import util from "node:util";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataBase } from "@vertix.gg/base/src/bases/model-data-base";

import type { WithRequiredProp } from "@vertix.gg/utils/src/common-types";

export interface ChannelResult extends PrismaBot.Channel {
    isMaster: boolean;
    isDynamic: boolean;
}

export interface ChannelResultWithCacheKey extends ChannelResult {
    cacheKey: string;
}

const E_INTERNAL_CHANNEL_TYPES = PrismaBot.E_INTERNAL_CHANNEL_TYPES;

const extendedModel = PrismaBot.Prisma.defineExtension( ( client ) => {
    return client.$extends( {
        result: {
            channel: {
                isMaster: {
                    needs: {
                        internalType: true,
                        channelId: true,
                        guildId: true,
                    },
                    compute( model ) {
                        return model.internalType === E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL;
                    }
                },
                isDynamic: {
                    needs: {
                        internalType: true,
                    },
                    compute( model ) {
                        return model.internalType === E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL;
                    }
                }
            }
        }
    } );
} );

const prisma = PrismaBotClient.getPrismaClient().$extends( extendedModel );

export class ChannelModel extends ModelDataBase<typeof prisma.channel, typeof prisma.channelData, ChannelResult> {
    private static instance: ChannelModel;

    public static getName(): string {
        return "VertixBase/Models/Channel";
    }

    public static getInstance(): ChannelModel {
        if ( ! ChannelModel.instance ) {
            ChannelModel.instance = new ChannelModel();
        }

        return ChannelModel.instance;
    }

    public static get $() {
        return ChannelModel.getInstance();
    }

    public constructor(
        shouldDebugCache = isDebugEnabled( "CACHE", ChannelModel.getName() ),
        shouldDebugModel = isDebugEnabled( "MODEL", ChannelModel.getName() )
    ) {
        super( shouldDebugCache, shouldDebugModel );
    }

    public async create( args: PrismaBot.Prisma.ChannelCreateArgs, shouldSaveCache = true ) {
        this.logger.log( this.create,
            `Guild id: '${ args.data.guildId }' - Creating entry for channel id: '${ args.data.channelId }''`
        );

        this.debugger.dumpDown( this.create, args.data );

        const result = await this.ownerModel.create( args );

        if ( shouldSaveCache ) {
            this.setCache( result.channelId, result );
        }

        return result;
    }

    public async update( args: PrismaBot.Prisma.ChannelUpdateArgs, forEachCachedEntities?: ( value: ChannelResultWithCacheKey ) => void ) {
        this.logger.log( this.update, `Where args: '${ args.where }'` );

        this.forEachCachedEntitiesByWhere( args.where, ( value ) => {
            this.deleteCache( value.cacheKey );

            forEachCachedEntities?.( value );
        } );

        this.debugger.dumpDown( this.update, args.data, "data" );

        return this.ownerModel.update( args );
    }

    public async delete(
        args: WithRequiredProp< Pick<PrismaBot.Prisma.ChannelWhereUniqueInput, "guildId" | "channelId">, "guildId" >,
        forEachCachedEntities?: ( value: ChannelResultWithCacheKey ) => void
    ) {
        this.logger.log( this.delete,
            `Guild id: '${ args.guildId }' - Deleting entry of channel id: '${ args.channelId }'`
        );

        if ( args.channelId ) {
            if ( await this.isExisting( args.guildId.toString(), args.channelId ) ) {
                this.forEachCachedEntitiesByWhere( args as Required<typeof args>, ( value ) => {
                    this.deleteCache( value.cacheKey );

                    forEachCachedEntities?.( value );
                } );

                return this.ownerModel.delete( {
                    where: {
                        channelId: args.channelId
                    },
                    include: {
                        data: true
                    }
                } );
            }

            return;
        }

        this.forEachCachedEntitiesByWhere( {
            id: undefined,
            guildId: args.guildId
        }, ( value ) => {
            this.deleteCache( value.cacheKey );

            forEachCachedEntities?.( value );
        } );

        this.logger.log( this.delete,
            `Guild id: '${ args.guildId }' - Deleting all channels for the guild`
        );

        return this.ownerModel.deleteMany( { where: { guildId: args.guildId } } );
    }

    public async getAll( guildId: string, internalType?: PrismaBot.E_INTERNAL_CHANNEL_TYPES, includeData?: boolean ) {
        const args: any = {
            where: {
                guildId,
            }
        };

        if ( internalType ) {
            args.where.internalType = internalType;
        }

        if ( includeData ) {
            args.include = {
                data: true
            };
        }

        return this.ownerModel.findMany( args );
    }

    public async getMasters( guildId: string, includeData?: boolean ) {
        return await this.getAll( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL, includeData );
    }

    public async getDynamics( guildId: string, includeData?: boolean ) {
        return await this.getAll( guildId, E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL, includeData );
    }

    public async getDynamicsByMasterId( guildId: string, masterChannelId: string ) {
        return this.ownerModel.findMany( {
            where: {
                guildId,
                ownerChannelId: masterChannelId, // Id in discord.
                internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
            }
        } );
    }

    public async getByChannelId( channelId: string|null, cache = true ) {
        this.logger.log( this.getByChannelId, `Getting channel id: '${ channelId }', cache: '${ cache }'` );

        if ( ! channelId ) {
            return null;
        }

        let result = null;

        if ( cache ) {
            result = this.getCache( channelId );
        }

        if ( ! result ) {
            result = await this.ownerModel.findFirst( { where: { channelId } } );

            if ( result ) {
                this.setCache( channelId, result );
            }
        }

        this.debugger.dumpDown( this.getByChannelId, result, "result" );

        return result;
    }

    public async getMasterChannelDBByDynamicChannelId( dynamicChannelId: string, cache = true ) {
        this.logger.log( this.getMasterChannelDBByDynamicChannelId,
            `Dynamic channel id: '${ dynamicChannelId }' - Trying to get master channel from ${ cache ? "cache" : "database" }`
        );

        const dynamicChannelDB = await this.getByChannelId( dynamicChannelId, cache );

        if ( ! dynamicChannelDB || ! dynamicChannelDB.ownerChannelId ) {
            return null;
        }

        return await this.getByChannelId( dynamicChannelDB.ownerChannelId, cache );
    }

    public async getTypeCount( guildId: string, internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) {
        const total = await this.ownerModel.count( {
            where: {
                guildId,
                internalType,
            }
        } );

        this.debugger.log( this.getTypeCount,
            `Guild id: '${ guildId }' - Total master channels for is '${ total }'`
        );

        return total;
    }

    public async isMaster( channelId: string, cache = true ) {
        this.logger.log( this.isMaster, `Channel id: '${ channelId }', cache: '${ cache }'` );

        const result = !! ( await this.getByChannelId( channelId, cache ) )?.isMaster;

        this.logger.log( this.isMaster, `Channel id: '${ channelId }' - isMaster: '${ result }'` );

        return result;
    }

    public async isDynamic( channelId: string, cache = true ) {
        this.logger.log( this.isDynamic, `Channel id: '${ channelId }', cache: '${ cache }'` );

        const result = !! ( await this.getByChannelId( channelId, cache ) )?.isDynamic;

        this.logger.log( this.isDynamic, `Channel id: '${ channelId }' - isDynamic: '${ result }'` );

        return result;
    }

    public async isExisting( guildId: string, channelId?: string | null ) {
        this.logger.log( this.isExisting,
            `Guild id: '${ guildId }' - Checking if channel id: '${ channelId }' exists`
        );

        const where: any = { guildId: guildId };

        if ( channelId ) {
            where.channelId = channelId;
        }

        const result = !! await this.ownerModel.findFirst( { where } );

        if ( ! result ) {
            this.deleteCache( guildId );
        }

        this.logger.log( this.isExisting,
            `Guild id: '${ guildId }' - Channel id: '${ channelId }' exists: '${ result }'`
        );

        return result;
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }

    protected getOwnerModel() {
        return prisma.channel;
    }

    protected getDataModel() {
        return prisma.channelData;
    }

    protected getOwnerIdFieldName(): string {
        return "channelId";
    }

    private getFilterConditionByWhere( where: PrismaBot.Prisma.ChannelWhereUniqueInput ) {
        if ( where.id ) {
            return ( value: ChannelResult ) => value.id === where.id;
        }

        if ( where.channelId ) {
            return ( value: ChannelResult ) => value.channelId === where.channelId;
        }

        if ( where.guildId ) {
            return ( value: ChannelResult ) => value.guildId === where.guildId;
        }

        return null;
    }

    private getCachedEntitiesByWhere( where: PrismaBot.Prisma.ChannelWhereUniqueInput ) {
        if ( where.id ) {
            return this.getCachedEntitiesByObjectId( where.id );
        }

        if ( where.channelId ) {
            return this.getCachedEntitiesByChannelId( where.channelId );
        }

        if ( where.guildId ) {
            return this.getCachedEntitiesByGuildId( where.guildId.toString() );
        }

        return null;
    }

    private forEachCachedEntitiesByWhere( where: PrismaBot.Prisma.ChannelWhereUniqueInput, callback: ( value: ChannelResultWithCacheKey ) => void ) {
        this.debugger.log( this.forEachCachedEntitiesByWhere, `Getting channel cache by where: ${ util.inspect( where ) }` );

        const filter = this.getFilterConditionByWhere( where );

        if ( ! filter ) {
            return;
        }

        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( filter( value ) ) {
                const result: ChannelResultWithCacheKey = {
                    cacheKey: key,
                    ...value,
                };

                callback( result );
            }
        }
    }

    private getCachedEntitiesByObjectId( id: string ) {
        const result: ChannelResultWithCacheKey[] = [];

        this.debugger.log( this.getCachedEntitiesByObjectId, `Getting channel cache by object id: '${ id }'` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.id === id ) {
                result.push( { cacheKey: key, ...value } );
            }
        }

        return result;
    }

    private getCachedEntitiesByChannelId( channelId: string ) {
        const result: ChannelResultWithCacheKey[] = [];

        this.debugger.log( this.getCachedEntitiesByChannelId, `Getting channel cache by channelId: '${ channelId }'` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.channelId === channelId ) {
                result.push( { cacheKey: key, ...value } );
            }
        }

        return result;
    }

    private getCachedEntitiesByGuildId( guildId: string ) {
        const result: ChannelResultWithCacheKey[] = [];

        this.debugger.log( this.getCachedEntitiesByGuildId, `Getting channel cache by guildId: '${ guildId }'` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.guildId === guildId ) {
                result.push( { cacheKey: key, ...value } );
            }
        }

        return result;
    }
}
