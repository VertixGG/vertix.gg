import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { PrismaBotClient , PrismaBot } from "@vertix.gg/prisma/bot-client";
import { Logger } from "@vertix.gg/base/src/modules/logger";

const client = PrismaBotClient.$.getClient();

type Channel = PrismaBot.Channel;
type ChannelCreateInput = PrismaBot.Prisma.ChannelCreateInput;
type ChannelDataCreateInput = PrismaBot.Prisma.ChannelDataCreateWithoutChannelInput;

export interface SetupWizardChannelDataItem {
    key: string;
    version: string;
    type: "string" | "array" | "boolean";
    value?: string | boolean;
    values?: Array<string | number | boolean>;
}

export interface SetupWizardPersistencePayload {
    guildId: string;
    userOwnerId: string;
    channelId: string;
    createdAtDiscord: number;
    version: string;
    internalType?: PrismaBot.E_INTERNAL_CHANNEL_TYPES;
    dataItems: SetupWizardChannelDataItem[];
}

export class SetupWizardMasterChannelsData extends UIDataBase<Channel> {
    private readonly logger: Logger;

    public static getName(): string {
        return "Vertix/Data/Setup/SetupWizardMasterChannelsData";
    }

    public constructor() {
        super();
        this.logger = new Logger( this );
    }

    public async create( identifier: { guildId: string }, data: SetupWizardPersistencePayload ): Promise<Channel> {
        return this.createMasterChannel( data );
    }

    public async read( identifier: { guildId: string; channelId?: string } ): Promise<Channel | null> {
        if ( identifier.channelId ) {
            return await client.channel.findUnique( {
                where: { channelId: identifier.channelId }
            } );
        }
        return null;
    }

    public async update( identifier: { guildId: string; channelId: string }, data: Partial<Channel> ): Promise<Channel> {
        return await client.channel.update( {
            where: { channelId: identifier.channelId },
            data
        } );
    }

    public async delete( identifier: { guildId: string; channelId: string } ): Promise<Channel | boolean | void> {
        return await client.channel.delete( {
            where: { channelId: identifier.channelId }
        } );
    }

    public async createMasterChannel( payload: SetupWizardPersistencePayload ): Promise<Channel> {
        const createInput: ChannelCreateInput = {
            guildId: payload.guildId,
            userOwnerId: payload.userOwnerId,
            channelId: payload.channelId,
            version: payload.version,
            internalType: payload.internalType ?? PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            createdAtDiscord: payload.createdAtDiscord,
            data: {
                create: this.buildChannelDataItems( payload.dataItems )
            }
        };

        try {
            const channel = await client.channel.create( { data: createInput } );
            this.logger.log( this.createMasterChannel, `Created master channel ${ channel.id } for guild ${ payload.guildId }` );
            return channel;
        } catch( error ) {
            this.logger.error( this.createMasterChannel, "Failed to persist setup wizard result", error );
            throw error;
        }
    }

    private buildChannelDataItems( items: SetupWizardChannelDataItem[] ): ChannelDataCreateInput[] {
        return items
            .filter( ( item ) => ( item.value !== undefined && item.value !== null ) || ( item.values && item.values.length > 0 ) )
            .map( ( item ) => {
                const record: ChannelDataCreateInput = {
                    key: item.key,
                    version: item.version,
                    type: this.mapType( item.type )
                };

                if ( item.type === "boolean" && typeof item.value === "boolean" ) {
                    record.value = String( item.value );
                } else if ( item.type === "string" && typeof item.value === "string" ) {
                    record.value = item.value;
                } else if ( item.type === "array" && item.values ) {
                    record.values = item.values.map( ( value ) => String( value ) );
                }

                if ( record.type !== PrismaBot.E_DATA_TYPES.array ) {
                    delete record.values;
                }

                if ( record.type === PrismaBot.E_DATA_TYPES.array ) {
                    delete record.value;
                }

                return record;
            } );
    }

    private mapType( type: SetupWizardChannelDataItem[ "type" ] ): PrismaBot.E_DATA_TYPES {
        switch ( type ) {
            case "boolean":
                return PrismaBot.E_DATA_TYPES.boolean;
            case "array":
                return PrismaBot.E_DATA_TYPES.array;
            case "string":
            default:
                return PrismaBot.E_DATA_TYPES.string;
        }
    }
}
