import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import { Prisma } from "@prisma/client";
import { Guild } from "discord.js";

import { IChannelDataCreateArgs, IChannelDataGetArgs } from "@dynamico/interfaces/channel";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@internal/dynamico/constants/master-channel";

import ModelBase from "@internal/bases/model-base";

export class ChannelModel extends ModelBase {
    private static instance: ChannelModel;

    private model: Prisma.ChannelDelegate<Prisma.RejectPerOperation>;

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
        
        this.model = this.prisma.channel;
    }

    public async create( args: Prisma.ChannelCreateArgs ) {
        this.logger.info( this.create,
            `Creating channel '${ args.data.channelId }' for guild '${ args.data.guildId }'` );

        this.debugger.dumpDown( this.create, args.data );

        return this.model.create( args );
    }

    public async createChannelData( args: IChannelDataCreateArgs ) {
        const data = {
            ownerId: args.id,
            key: args.key,
        } as any;

        if ( "string" === typeof args.value ) {
            data.type = "string";
        } else if ( Array.isArray( typeof args.value ) ) {
            data.type = "array";
        } else if ( "object" === typeof args.value ) {
            data.type = "object";
        }

        switch ( data.type ) {
            case "object":
                data.values = [];
                data.object = args.value;
                break;
            case "array":
                data.values = args.value;
                break;
            default:
            case "string":
                data.values = [ args.value ];
        }

        return this.prisma.channelData.create( { data } );
    }

    public async delete( guild: Guild, channelId?: string|null ) {
        if ( channelId ) {
            this.logger.info( this.delete,
                `Deleting channel '${ channelId }' for guild '${ guild.name }'` );

            return this.model.delete( {
                where: {
                    channelId
                },
                include: {
                    data: true
                }
            } );
        }

        this.logger.info( this.delete,
            `Deleting all channels for guild '${ guild.name }'` );

        return this.prisma.channel.deleteMany( { where: { guildId: guild.id } } );
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

        return this.prisma.channel.findFirst( args );
    }

    public async getChannelDataByChannelId( args: IChannelDataGetArgs ) {
        this.debugger.log( this.getChannelDataByChannelId, "Getting master channel data for channel", args  );

        return this.prisma.channel.findUnique( {
            where: {
                channelId: args.masterChannelId,
            },
            include: {
                data: { where: { key: args.key } },
            }
        } );
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
        return await this.getMasterTotal( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL  ) >= DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS;
    }

    public async isMasterCreate( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
            }
        } );
    }

    public async isDynamic( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            }
        } );
    }

    public async isExisting( guild: Guild, channelId?: string|null ) {
        const where: any =  { guildId: guild.id };

        if ( channelId ) {
            where.channelId = channelId;
        }

        return !! await this.prisma.channel.findFirst( { where } );
    }
}

export default ChannelModel;
