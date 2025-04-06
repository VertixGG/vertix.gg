import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

const client = PrismaBotClient.$.getClient();

type Channel = PrismaBot.Channel;
type ChannelCreateInput = PrismaBot.Prisma.ChannelCreateInput;
type ChannelUpdateInput = PrismaBot.Prisma.ChannelUpdateInput;

export class GuildMasterChannelsData extends UIDataBase<Channel> {
    protected logger: Logger;

    public static getName(): string {
        return "Vertix/Data/Guild/MasterChannelsData";
    }

    public constructor() {
        super();
        this.logger = new Logger( this );
    }

    /**
     * Creates a new master channel record.
     * @param data - The data needed to create the channel, conforming to PrismaBot.Prisma.ChannelCreateInput.
     * @returns The created Channel record.
     */
    protected async create( data: ChannelCreateInput ): Promise<Channel> {
        try {
            const newChannel = await client.channel.create( { data } );
            this.logger.log( this.create, `Created channel with ID: ${ newChannel.id }` );
            return newChannel;
        } catch ( error ) {
            this.logger.error( this.create, "Error creating channel:", error );
            throw error;
        }
    }

    /**
     * Reads a master channel record by its unique identifier.
     * @param identifier - The unique ID of the channel to read.
     * @returns The Channel record or null if not found.
     */
    protected async read( identifier: string ): Promise<Channel | null> {
        if ( !identifier ) {
            this.logger.warn( this.read, "Read called with invalid identifier" );
            return null;
        }
        try {
            const channel = await client.channel.findUnique( { where: { id: identifier } } );
            if ( !channel ) {
                this.logger.log( this.read, `Channel with ID: ${ identifier } not found.` );
                return null;
            }
            this.logger.log( this.read, `Read channel with ID: ${ identifier }` );
            return channel;
        } catch ( error ) {
            this.logger.error( this.read, `Error reading channel with ID: ${ identifier }:`, error );
            throw error;
        }
    }

    /**
     * Updates a master channel record.
     * @param identifier - The unique ID of the channel to update.
     * @param data - The data to update, conforming to PrismaBot.Prisma.ChannelUpdateInput.
     * @returns The updated Channel record.
     */
    protected async update( identifier: string, data: ChannelUpdateInput ): Promise<Channel> {
        if ( !identifier ) {
            this.logger.error( this.update, "Update called with invalid identifier" );
            throw new Error( "Invalid identifier provided for update." );
        }
        try {
            const updatedChannel = await client.channel.update( {
                where: { id: identifier },
                data,
            } );
            this.logger.log( this.update, `Updated channel with ID: ${ identifier }` );
            return updatedChannel;
        } catch ( error ) {
            this.logger.error( this.update, `Error updating channel with ID: ${ identifier }:`, error );
            throw error;
        }
    }

    /**
     * Deletes a master channel record by its unique identifier.
     * @param identifier - The unique ID of the channel to delete.
     * @returns The deleted Channel record.
     */
    protected async delete( identifier: string ): Promise<Channel> {
        if ( !identifier ) {
            this.logger.error( this.delete, "Delete called with invalid identifier" );
            throw new Error( "Invalid identifier provided for delete." );
        }
        try {
            const deletedChannel = await client.channel.delete( { where: { id: identifier } } );
            this.logger.log( this.delete, `Deleted channel with ID: ${ identifier }` );
            return deletedChannel;
        } catch ( error ) {
            this.logger.error( this.delete, `Error deleting channel with ID: ${ identifier }:`, error );
            throw error;
        }
    }
}
