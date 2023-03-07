
import { Prisma } from "@prisma/client";
import { Guild } from "discord.js";
import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@internal/dynamico/constants/master-channel";
import ModelBase from "@internal/bases/model-base";

export class ChannelModel extends ModelBase {
    private static instance: ChannelModel;

    private model: Prisma.channelDelegate<Prisma.RejectPerOperation>;

    public static getName(): string {
        return "Dynamico/Models/Channel";
    }

    public static getInstance(): ChannelModel {
        if ( ! ChannelModel.instance ) {
            ChannelModel.instance = new ChannelModel();
        }

        return ChannelModel.instance;
    }

    constructor() {
        super();
        
        this.model = this.prisma.channel;
    }

    public async create( args: Prisma.channelCreateArgs ) {
        args.include = {
            data: true
        };

        args.data.data = { create: {} };

        this.logger.info( this.create,
            `Creating channel '${ args.data.channelId }' for guild '${ args.data.guildId }'` );

        this.logger.debug( this.create, "🔽", args );

        return this.model.create( args );
    }

    public async delete( guild: Guild, channelId?: string|null ) {
        if ( await this.isExisting( guild, channelId ) ) {
            const where: any = { guildId: guild.id };

            if ( channelId ) {
                this.logger.info( this.delete,
                    `Deleting channel '${ channelId }' for guild '${ guild.name }'` );

                where.channelId = channelId;
            } else {
                this.logger.info( this.delete,
                    `Deleting all channels for guild '${ guild.name }'` );
            }

            return this.prisma.channel.deleteMany( { where } );
        }
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

    public async getMasterChannelDataByChannelId( channelId: string, internalType = E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) {
        this.logger.debug( this.getMasterChannelDataByChannelId,
            `Getting master channel data for channel '${ channelId }', internalType '${ internalType }'`
        );

        const masterChannel = await this.prisma.channel.findFirstOrThrow( {
            where: {
                channelId,
                internalType
            },
            include: {
                data: true
            }
        } );

        return masterChannel.data;
    }

    public async getMasterTotal( guildId: string, internalType: E_INTERNAL_CHANNEL_TYPES ) {
        const total = await this.model.count( {
            where: {
                guildId,
                internalType,
            }
        } );

        this.logger.debug( this.getMasterTotal,
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
