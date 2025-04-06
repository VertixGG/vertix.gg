import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { DEFAULT_GUILD_SETTINGS_KEY_BADWORDS } from "@vertix.gg/base/src/definitions/guild-data-keys";
import { DEFAULT_BADWORDS } from "@vertix.gg/base/src/definitions/badwords-defaults";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

const client = PrismaBotClient.$.getClient();

// Use the GuildData model for badwords
type GuildData = PrismaBot.GuildData;
// Define interfaces for interaction parameters
interface BadwordIdentifier {
    guildId: string;
}
interface BadwordData {
    words: string[];
}

// Renamed class to reflect Guild scope
export class GuildBadwordsData extends UIDataBase<BadwordData> { // Generic type represents the conceptual data (word list)
    protected logger: Logger;

    // Updated name
    public static getName(): string {
        return "Vertix/Data/Guild/BadwordsData";
    }

    public constructor() {
        super();
        this.logger = new Logger( this );
    }

    /**
     * Creates/Updates the badword list for a guild.
     * This acts as an upsert operation on the GuildData model.
     * @param identifier Contains guildId.
     * @param data Contains the list of words.
     * @returns The conceptual BadwordData (list of words).
     */
    protected async create( identifier: BadwordIdentifier, data: BadwordData ): Promise<BadwordData> {
        const { guildId } = identifier;
        const { words } = data;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to create/update badwords." );
        }

        try {
            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: { // Assuming GuildData uses ownerId for guild relation
                        ownerId: guildId,
                        key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                        version: "0.0.0.0" // Assuming a default version or get dynamically
                    }
                },
                update: {
                    values: words,
                    type: "array"
                 },
                create: {
                    ownerId: guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                    version: "0.0.0.0", // Assuming a default version
                    values: words,
                    type: "array"
                }
            } );
            this.logger.log( this.create, `Upserted badwords for guild: ${ guildId }` );
            return data; // Return the input data as the result
        } catch ( error ) {
            this.logger.error( this.create, `Error upserting badwords for guild ${ guildId }:`, error );
            throw error;
        }
    }

    /**
     * Reads the badword list for a guild.
     * @param identifier Contains guildId.
     * @returns The BadwordData (list of words) or null if not set.
     */
    protected async read( identifier: BadwordIdentifier ): Promise<BadwordData | null> {
        const { guildId } = identifier;
        if ( !guildId ) {
            this.logger.warn( this.read, "Read called with invalid identifier (missing guildId)" );
            return null;
        }
        try {
            const guildData = await client.guildData.findUnique( {
                where: {
                     ownerId_key_version: { // Assuming GuildData uses ownerId for guild relation
                        ownerId: guildId,
                        key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                        version: "0.0.0.0" // Assuming a default version or get dynamically
                    }
                }
            } );

            if ( !guildData || !guildData.values ) {
                this.logger.log( this.read, `Badwords not found or empty for guild: ${ guildId }, returning default.` );
                // Return default badwords if none are set in DB
                 return { words: DEFAULT_BADWORDS };
            }

            this.logger.log( this.read, `Read badwords for guild: ${ guildId }` );
            return { words: guildData.values };
        } catch ( error ) {
            this.logger.error( this.read, `Error reading badwords for guild ${ guildId }:`, error );
            throw error;
        }
    }

    /**
     * Updates the badword list (same as create/upsert).
     */
    protected async update( identifier: BadwordIdentifier, data: BadwordData ): Promise<BadwordData> {
        return this.create( identifier, data );
    }

    /**
     * Deletes the badword list for a guild.
     * @param identifier Contains guildId.
     * @returns The deleted conceptual BadwordData (previous list or default).
     */
    protected async delete( identifier: BadwordIdentifier ): Promise<BadwordData> {
         const { guildId } = identifier;
         if ( !guildId ) {
            this.logger.error( this.delete, "Delete called with invalid identifier (missing guildId)" );
            throw new Error( "Invalid identifier provided for delete." );
        }
        try {
            const existingData = await this.read( identifier ) ?? { words: [] }; // Get current/default words
            await client.guildData.deleteMany( {
                 where: {
                    ownerId: guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                    // Maybe add version filter if necessary
                 }
            } );
            this.logger.log( this.delete, `Deleted badwords entry for guild: ${ guildId }` );
            return existingData; // Return what was deleted (or default)
        } catch ( error ) {
            this.logger.error( this.delete, `Error deleting badwords for guild ${ guildId }:`, error );
            throw error;
        }
    }
}
