import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelDataBase } from "@vertix.gg/base/src/bases/model-data-base";

import { isDebugOn } from "@vertix.gg/base/src/utils/debug";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

export interface ChannelResult extends PrismaBot.Channel {
    isMaster: boolean;
    isDynamic: boolean;
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
        return "Vertix/Models/Channel";
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
        shouldDebugCache = isDebugOn( "CACHE", ChannelModel.getName() ),
        shouldDebugModel = isDebugOn( "MODEL", ChannelModel.getName() )
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async update( args: PrismaBot.Prisma.ChannelUpdateArgs, deleteCache = true ) {
        this.logger.log( this.update, `Where args: '${ args.where }'` );

        if ( args.where.channelId ) {
            this.deleteCacheByChannelId( args.where.channelId );
        } else if ( args.where.id ) {
            this.logger.log( this.update, `Object id: '${ args.where.id }'` );

            this.deleteCacheByObjectId( args.where.id );
        } else {
            throw new Error( "Channel id or object id must be provided." );
        }

        this.debugger.dumpDown( this.update, args.data, "data" );

        return this.ownerModel.update( args );
    }

    public async delete( guildId: string, channelId?: string | null ) {
        this.logger.log( this.delete,
            `Guild id: '${ guildId }' - Deleting entry of channel id: '${ channelId }'`
        );

        if ( channelId ) {
            if ( await this.isExisting( guildId, channelId ) ) {
                this.deleteCacheByChannelId( channelId );

                return this.ownerModel.delete( {
                    where: {
                        channelId
                    },
                    include: {
                        data: true
                    }
                } );
            }

            return;
        }

        this.deleteCacheByGuildId( guildId );

        this.logger.log( this.delete,
            `Guild id: '${ guildId }' - Deleting all channels for the guild`
        );

        return this.ownerModel.deleteMany( { where: { guildId: guildId } } );
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

    private deleteCacheByObjectId( id: string ) {
        this.debugger.log( this.deleteCacheByObjectId, `Removing channel object id: '${ id }' from cache.` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.id === id ) {
                // Remove from cache.
                this.deleteCache( key );

                // TODO: Model should not be aware of the data manager.
                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }

    private deleteCacheByChannelId( channelId: string ) {
        this.debugger.log( this.deleteCacheByChannelId, `Removing channel id: '${ channelId }' from cache.` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.channelId === channelId ) {
                // Remove from cache.
                this.deleteCache( key );

                // TODO: Model should not be aware of the data manager.
                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }

    private deleteCacheByGuildId( guildId: string ) {
        this.logger.log( this.deleteCacheByGuildId, `Removing guild id: '${ guildId }' from cache.` );

        // Get all that have the same guild id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.guildId === guildId ) {
                // Remove from cache.
                this.deleteCache( key );

                // TODO: Model should not be aware of the data manager.
                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }
}
