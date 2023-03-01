import { Guild } from "discord.js";

import { Prisma } from "@prisma/client";

import ModelBase from "@internal/bases/model-base";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@internal/dynamico/constants/master-channel";

export default class ChannelModel extends ModelBase {
    private static instance: ChannelModel;

    private model: Prisma.channelDelegate<Prisma.RejectPerOperation>;

    public static getName(): string {
        return "Discord/Models/Channel";
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
        this.logger.info( this.create,
            `Creating channel '${ args.data.channelId }' for guild '${ args.data.guildId }'` );

        this.logger.debug( this.create, '🔽', args.data );

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

    public async getMasterTotal( guildId: string ) {
        const total = await this.model.count( {
            where: {
                guildId,
                isMaster: true
            }
        } );

        this.logger.debug( this.getMasterTotal,
            `Total master channels for guildId: '${ guildId }' is '${ total }'`
        );

        return total;
    }

    public async isReachedMasterLimit( guildId: string ) {
        return await this.getMasterTotal( guildId ) >= DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS;
    }

    public async isMaster( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isMaster: true
            }
        } );
    }

    public async isDynamic( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isDynamic: true
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
