import { Channel, E_INTERNAL_CHANNEL_TYPES, Prisma } from "@prisma/client";

import { ModelDataBase } from "@vertix/bases/model-data-base";

import { AppManager } from "@vertix/managers/app-manager";
import { ChannelDataManager } from "@vertix/managers/channel-data-manager";

import { PrismaInstance } from "@internal/prisma";

export interface ChannelResult extends Channel {
    isMaster: boolean;
    isDynamic: boolean;
}

const extendedModel = Prisma.defineExtension( ( client ) => {
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

const prisma = PrismaInstance.getClient().$extends( extendedModel );

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
        shouldDebugCache = AppManager.isDebugOn( "CACHE", ChannelModel.getName() ),
        shouldDebugModel = AppManager.isDebugOn( "MODEL", ChannelModel.getName() )
    ) {
        super( shouldDebugCache, shouldDebugModel );
    }

    public async create( args: Prisma.ChannelCreateArgs ) {
        this.logger.log( this.create,
            `Guild id: '${ args.data.guildId }' - Creating entry for channel id: '${ args.data.channelId }''`
        );

        this.debugger.dumpDown( this.create, args.data );

        return this.ownerModel.create( args );
    }

    public async update( args: Prisma.ChannelUpdateArgs, deleteCache = true ) {
        if ( args.where.channelId ) {
            this.logger.log( this.update, `Channel id: '${ args.where.channelId }'` );

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
        if ( channelId ) {
            this.logger.log( this.delete,
                `Guild id: '${ guildId }' - Deleting entry of channel id: '${ channelId }'`
            );

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
        }

        this.deleteCacheByGuildId( guildId );

        this.logger.log( this.delete,
            `Guild id: '${ guildId }' - Deleting all channels for the guild`
        );

        return this.ownerModel.deleteMany( { where: { guildId: guildId } } );
    }

    public deleteCacheByObjectId( id: string ) {
        this.debugger.log( this.deleteCacheByObjectId, `Removing channel object id: '${ id }' from cache.` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.id === id ) {
                // Remove from cache.
                this.deleteCache( key );

                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }

    public deleteCacheByChannelId( channelId: string ) {
        this.debugger.log( this.deleteCacheByChannelId, `Removing channel id: '${ channelId }' from cache.` );

        // Get all that have the same channel id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.channelId === channelId ) {
                // Remove from cache.
                this.deleteCache( key );

                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }

    public deleteCacheByGuildId( guildId: string ) {
        this.logger.log( this.deleteCacheByGuildId, `Removing guild id: '${ guildId }' from cache.` );

        // Get all that have the same guild id.
        for ( let [ key, value ] of this.getMap().entries() ) {
            if ( value.guildId === guildId ) {
                // Remove from cache.
                this.deleteCache( key );

                ChannelDataManager.$.removeFromCache( value.id );
            }
        }
    }

    public async getAll( guildId: string, internalType?: E_INTERNAL_CHANNEL_TYPES, includeData?: boolean ) {
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

        return await this.ownerModel.findMany( args );
    }

    public async getMasters( guildId: string, includeData?: boolean ) {
        return await this.getAll( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL, includeData );
    }

    public async getDynamics( guildId: string, includeData?: boolean ) {
        return await this.getAll( guildId, E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL, includeData );
    }

    public async getDynamicsByMasterId( guildId: string, masterChannelId: string ) {
        return await this.ownerModel.findMany( {
            where: {
                guildId,
                ownerChannelId: masterChannelId, // Id in discord.
                internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
            }
        } );
    }

    public async getByObjectId( id: string, cache = true ) {
        this.debugger.log( this.getByObjectId, `Getting channel object id: '${ id }'` );

        let result = null;

        if ( cache ) {
            result = this.getCache( id );
        }

        if ( ! result ) {
            result = await this.ownerModel.findUnique( { where: { id } } );

            if ( result ) {
                this.setCache( id, result );
            }
        }

        this.debugger.dumpDown( this.getByObjectId, result, "result" );

        return result;
    }

    public async getByChannelId( channelId: string|null, cache = true ) {
        this.debugger.log( this.getByChannelId, `Getting channel id: '${ channelId }'` );

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

    public async getTypeCount( guildId: string, internalType: E_INTERNAL_CHANNEL_TYPES ) {
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
        this.logger.log( this.isMaster, `Channel id: '${ channelId }'` );

        const result = !! ( await this.getByChannelId( channelId, cache ) )?.isMaster;

        this.logger.log( this.isMaster, `Channel id: '${ channelId }' - isMaster: '${ result }'` );

        return result;
    }

    public async isDynamic( channelId: string, cache = true ) {
        this.logger.log( this.isDynamic, `Channel id: '${ channelId }'` );

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

    protected getOwnerModel() {
        return prisma.channel;
    }

    protected getDataModel() {
        return prisma.channelData;
    }

    protected getOwnerIdFieldName(): string {
        return "channelId";
    }
}
