import { Guild } from "discord.js";

import { Channel, E_INTERNAL_CHANNEL_TYPES, Prisma } from ".prisma/client";

import {
    IChannelDataCreateArgs,
    IChannelDataGetArgs,
    IChannelDataSelectUniqueArgs,
    IChannelDataUpsertArgs
} from "@dynamico/interfaces/channel";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@internal/dynamico/constants/master-channel";

import ModelBase from "@internal/bases/model-base";

export interface ChannelResult extends Channel {
    isMasterCreate: boolean;
    isDynamic: boolean;
}

export class ChannelModel extends ModelBase {
    private static instance: ChannelModel;

    private readonly model;

    public static getName(): string {
        return "Dynamico/Models/Channel";
    }

    public static getInstance(): ChannelModel {
        if ( ! ChannelModel.instance ) {
            ChannelModel.instance = new ChannelModel();
        }

        return ChannelModel.instance;
    }

    public constructor() {
        super();

        this.model = this.prisma.$extends( {
            result: {
                channel: {
                    isMasterCreate: {
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
        } ).channel;
    }

    public async create( args: Prisma.ChannelCreateArgs ) {
        this.logger.info( this.create,
            `Creating channel '${ args.data.channelId }' for guild '${ args.data.guildId }'` );

        this.debugger.dumpDown( this.create, args.data );

        return this.model.create( args );
    }

    public async createChannelData( args: IChannelDataCreateArgs ) {
        const data = this.getInternalNormalizedData( args );

        this.debugger.dumpDown( this.createChannelData, { data, args } );

        return this.prisma.channelData.create( {
            data: {
                ... data,
                ownerId: args.ownerId,
                key: args.key,
            }
        } );
    }

    public async setChannelData( args: IChannelDataUpsertArgs ) {
        if ( null === args.default ) {
            return this.logger.error( this.setChannelData,
                `Cannot set channel data for '${ args.key }' to null.` );
        }

        const createArgs: IChannelDataCreateArgs = {
            ownerId: args.ownerId,
            key: args.key,
            value: args.default,
        };

        return this.prisma.channelData.update( {
            where: {
                ownerId_key: {
                    ownerId: args.ownerId,
                    key: args.key,
                },
            },
            data: this.getInternalNormalizedData( createArgs )
        } );
    }

    public async deleteChannelData( args: IChannelDataSelectUniqueArgs ) {
        return this.prisma.channelData.delete( {
            where: {
                ownerId_key: {
                    ownerId: args.ownerId,
                    key: args.key,
                },
            },
        } );
    }

    public async delete( guild: Guild, channelId?: string | null ) {
        if ( channelId ) {
            this.logger.info( this.delete,
                `Deleting channel '${ channelId }' for guild '${ guild.name }' guildId: '${ guild.id }'` );

            if ( await this.isExisting( guild, channelId ) ) {
                return this.model.delete( {
                    where: {
                        channelId
                    },
                    include: {
                        data: true
                    }
                } );
            }
        }

        this.logger.info( this.delete,
            `Deleting all channels for guild '${ guild.name }' guildId: '${ guild.id }'` );

        return this.model.deleteMany( { where: { guildId: guild.id } } );
    }

    public async get( guildId: string, channelId: string, internalType?: E_INTERNAL_CHANNEL_TYPES ) {
        const args: any = {
            where: {
                guildId,
                channelId,
            }
        };

        if ( internalType ) {
            args.where.internalType = internalType;
        }

        return await this.model.findFirst( args );
    }

    public async getChannelDataByChannelId( args: IChannelDataGetArgs ) {
        this.debugger.log( this.getChannelDataByChannelId, "Getting channel data for channel:", args );

        return this.model.findUnique( {
            where: {
                id: args.ownerId,
            },
            include: {
                data: { where: { key: args.key } },
            }
        } );
    }

    public getInternalNormalizedData( args: IChannelDataCreateArgs ) {
        const data: any = {};

        if ( "string" === typeof args.value ) {
            data.type = "string";
        } else if ( Array.isArray( args.value ) ) {
            data.type = "array";
        } else if ( "object" === typeof args.value ) {
            data.type = "object";
        }

        switch ( data.type ) {
            case "object":
                data.object = args.value;
                break;
            case "array":
                data.values = args.value;
                break;
            default:
            case "string":
                data.values = [ args.value ];
        }

        return data;
    }

    public async getMasterTotal( guildId: string, internalType: E_INTERNAL_CHANNEL_TYPES ) {
        const total = await this.model.count( {
            where: {
                guildId,
                internalType,
            }
        } );

        this.debugger.log( this.getMasterTotal,
            `Total master channels for guildId: '${ guildId }' is '${ total }'`
        );

        return total;
    }

    public async isReachedMasterLimit( guildId: string ) {
        return await this.getMasterTotal( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) >= DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS;
    }

    public async isMasterCreate( channelId: string, guildId: string ) {
        const result = await this.model.findFirst( {
            where: {
                channelId,
                guildId,
            }
        } );

        return result?.isMasterCreate;
    }

    public async isDynamic( channelId: string, guildId: string ) {
        const result = await this.model.findFirst( {
            where: {
                channelId,
                guildId,
            }
        } );

        return result?.isDynamic;
    }

    public async isExisting( guild: Guild, channelId?: string | null ) {
        const where: any = { guildId: guild.id };

        if ( channelId ) {
            where.channelId = channelId;
        }

        return !! await this.model.findFirst( { where } );
    }
}

export default ChannelModel;
