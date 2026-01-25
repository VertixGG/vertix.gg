import { ChannelType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import type { CategoryChannel, Guild, GuildBasedChannel } from "discord.js";
import type { Logger } from "@vertix.gg/base/src/modules/logger";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class ChannelUtils {
    public static async cacheOrFetchGuild( guildId: string ): Promise<Guild | null> {
        const client = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" ).getClient();

        return client.guilds.cache.get( guildId ) ||
            await client.guilds.fetch( guildId ).catch( () => null );
    }

    public static async cacheOrFetchChannel( guild: Guild, channelId: string ): Promise<GuildBasedChannel | null> {
        return guild.channels.cache.get( channelId ) ||
            await guild.channels.fetch( channelId ).catch( () => null );
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
