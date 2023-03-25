import { Guild } from "discord.js";

import { Channel, E_INTERNAL_CHANNEL_TYPES, Prisma } from ".prisma/client";

import { ModelDataBase } from "@dynamico/bases/model-data-base";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@internal/dynamico/constants/master-channel";

import PrismaInstance from "@internal/prisma";

export interface ChannelResult extends Channel {
    isMasterCreate: boolean;
    isDynamic: boolean;
}

const client = PrismaInstance.getClient(),
    model = client.$extends( {
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

export class ChannelModel extends ModelDataBase<typeof model, typeof client.channelData> {
    private static instance: ChannelModel;

    public static getName(): string {
        return "Dynamico/Models/Channel";
    }

    public static getInstance(): ChannelModel {
        if ( ! ChannelModel.instance ) {
            ChannelModel.instance = new ChannelModel();
        }

        return ChannelModel.instance;
    }

    public async create( args: Prisma.ChannelCreateArgs ) {
        this.logger.info( this.create,
            `Creating channel '${ args.data.channelId }' for guild '${ args.data.guildId }'` );

        this.debugger.dumpDown( this.create, args.data );

        return this.ownerModel.create( args );
    }

    public async delete( guild: Guild, channelId?: string | null ) {
        if ( channelId ) {
            this.logger.info( this.delete,
                `Deleting channel '${ channelId }' for guild '${ guild.name }' guildId: '${ guild.id }'` );

            if ( await this.isExisting( guild, channelId ) ) {
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

        this.logger.info( this.delete,
            `Deleting all channels for guild '${ guild.name }' guildId: '${ guild.id }'` );

        return this.ownerModel.deleteMany( { where: { guildId: guild.id } } );
    }

    public async get( guildId: string, channelId?: string, internalType?: E_INTERNAL_CHANNEL_TYPES ) {
        const args: any = {
            where: {
                guildId,
            }
        };

        if ( channelId ) {
            args.where.channelId = channelId;
        }

        if ( internalType ) {
            args.where.internalType = internalType;
        }

        return await this.ownerModel.findFirst( args );
    }

    public async getMasterTotal( guildId: string, internalType: E_INTERNAL_CHANNEL_TYPES ) {
        const total = await this.ownerModel.count( {
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
        const result = await this.ownerModel.findFirst( {
            where: {
                channelId,
                guildId,
            }
        } );

        return result?.isMasterCreate;
    }

    public async isDynamic( channelId: string, guildId: string ) {
        const result = await this.ownerModel.findFirst( {
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

        return !! await this.ownerModel.findFirst( { where } );
    }

    protected getOwnerModel() {
        return model;
    }

    protected getDataModel()  {
        return client.channelData;
    }

    protected getOwnerIdFieldName(): string {
        return "channelId";
    }
}

export default ChannelModel;
