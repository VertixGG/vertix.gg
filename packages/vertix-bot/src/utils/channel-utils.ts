import { ChannelType } from "discord.js";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import type { CategoryChannel, Client, Guild } from "discord.js";
import type { Logger } from "@vertix.gg/base/src/modules/logger";

export class ChannelUtils {
    /**
     * Fetches a guild from cache or API.
     * Returns null if the guild cannot be found.
     */
    public static async cacheOrFetchGuild( client: Client, guildId: string ): Promise<Guild | null> {
        return client.guilds.cache.get( guildId ) ||
            await client.guilds.fetch( guildId ).catch( () => null );
    }

    /**
     * Cleans up an empty category by deleting it.
     * Only deletes if the category has no remaining channels.
     *
     * @param category - The category to potentially delete
     * @param guild - The guild containing the category
     * @param logger - Optional logger for logging the cleanup
     * @param logContext - Optional context function for logging
     * @returns true if the category was deleted, false otherwise
     */
    public static async cleanupEmptyCategoryIfNeeded(
        category: CategoryChannel | null | undefined,
        guild: Guild,
        logger?: Logger,
        logContext?: Function
    ): Promise<boolean> {
        if ( !category || category.type !== ChannelType.GuildCategory ) {
            return false;
        }

        const remaining = guild.channels.cache.filter( ( channel ) => channel.parentId === category.id );

        if ( remaining.size === 0 ) {
            if ( logger && logContext ) {
                logger.log(
                    logContext,
                    `Deleting empty category: ${ category.name } (${ category.id })`
                );
            }

            await CategoryManager.$.delete( category ).catch( ( error ) => {
                if ( logger && logContext ) {
                    logger.error( logContext, `Failed to delete category ${ category.id }`, error );
                }
            } );

            return true;
        }

        return false;
    }
}
