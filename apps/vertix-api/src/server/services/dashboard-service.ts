import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { DiscordService } from "@vertix.gg/api/src/server/services/discord-service";
import type { ManagementService } from "@vertix.gg/api/src/server/services/management-service";

const client = PrismaBotClient.$.getClient();

const logger = new Logger( "VertixAPI/DashboardService" );

export interface GlobalStats {
    totalGuilds: number;
    activeGuilds: number;
    totalChannels: number;
    totalMasterChannels: number;
    totalDynamicChannels: number;
    totalUsers: number;
}

export interface GuildStats {
    guildId: string;
    name: string;
    totalChannels: number;
    masterChannels: number;
    dynamicChannels: number;
    isInGuild: boolean;
    createdAt: Date;
    lastActiveAt: Date | null;
}

export interface GuildDetails {
    guild: GuildStats;
    masterChannels: MasterChannelInfo[];
    /**
     * How many channels each generator may have open at once, which its `dynamicChannelsCount` is
     * measured against. One number for the guild rather than one per generator, because that is
     * what the bot holds. Null when the bot could not be asked.
     */
    maxActiveDynamicChannels: number | null;
}

export interface MasterChannelInfo {
    channelId: string;
    categoryId: string | null;
    createdAt: Date;
    dynamicChannelsCount: number;
}

export interface GuildBotPresence {
    guildId: string;
    /**
     * Whether the bot is a member of the guild. Null when Discord could not be asked - which is an
     * absence of an answer, not an answer of "no".
     */
    isBotInGuild: boolean | null;
}

/**
 * Function getGuildBotPresence() :: Whether the bot is in the guild at all.
 *
 * The dashboard locks itself against a server the bot cannot reach, so this is asked of Discord
 * every time rather than read from a column a worker refreshes on its own schedule.
 */
export async function getGuildBotPresence( guildId: string ): Promise<GuildBotPresence> {
    const discordService = ServiceLocator.$.get<DiscordService>( "VertixAPI/Services/Discord", { silent: true } );

    if ( !discordService ) {
        logger.warn( getGuildBotPresence, `Discord service not registered - membership of ${ guildId } unknown` );
        return { guildId, isBotInGuild: null };
    }

    return { guildId, isBotInGuild: await discordService.isBotInGuild( guildId ) };
}

export async function getGlobalStats(): Promise<GlobalStats> {
    const [ totalGuilds, activeGuilds, totalChannels, channelsByType, totalUsers ] = await Promise.all( [
        client.guild.count(),
        client.guild.count( { where: { isInGuild: true } } ),
        client.channel.count(),
        client.channel.groupBy( {
            by: [ "internalType" ],
            _count: true
        } ),
        client.user.count()
    ] );

    const masterChannels = channelsByType.find( c => c.internalType === "MASTER_CREATE_CHANNEL" )?._count ?? 0;
    const dynamicChannels = channelsByType.find( c => c.internalType === "DYNAMIC_CHANNEL" )?._count ?? 0;

    return {
        totalGuilds,
        activeGuilds,
        totalChannels,
        totalMasterChannels: masterChannels,
        totalDynamicChannels: dynamicChannels,
        totalUsers
    };
}

export async function getGuildStats( guildId: string ): Promise<GuildStats | null> {
    const guild = await client.guild.findUnique( {
        where: { guildId }
    } );

    if ( !guild ) {
        return null;
    }

    const [ totalChannels, channelsByType ] = await Promise.all( [
        client.channel.count( { where: { guildId } } ),
        client.channel.groupBy( {
            by: [ "internalType" ],
            where: { guildId },
            _count: true
        } )
    ] );

    const masterChannels = channelsByType.find( c => c.internalType === "MASTER_CREATE_CHANNEL" )?._count ?? 0;
    const dynamicChannels = channelsByType.find( c => c.internalType === "DYNAMIC_CHANNEL" )?._count ?? 0;

    return {
        guildId: guild.guildId,
        name: guild.name,
        totalChannels,
        masterChannels,
        dynamicChannels,
        isInGuild: guild.isInGuild,
        createdAt: guild.createdAt,
        lastActiveAt: guild.lastActiveAt
    };
}

/**
 * Function getMaxActiveDynamicChannels() :: How many channels one generator may have open, asked of the bot.
 *
 * Asked rather than read out of the guild config here, so the number a generator is measured
 * against is the one the bot refuses the next member at - see `ManagementService.getConfigLimits()`.
 *
 * Returns null when the bot cannot be asked, so a caller reports "unknown" instead of guessing.
 */
async function getMaxActiveDynamicChannels( guildId: string ): Promise<number | null> {
    const managementService = ServiceLocator.$.get<ManagementService>( "VertixAPI/Services/Management", { silent: true } );

    if ( !managementService ) {
        logger.warn( getMaxActiveDynamicChannels, `Management service not registered - no channel limit for guild ${ guildId }` );
        return null;
    }

    return ( await managementService.getConfigLimits( guildId ) )?.maxActiveDynamicChannels ?? null;
}

export async function getGuildDetails( guildId: string ): Promise<GuildDetails | null> {
    const guildStats = await getGuildStats( guildId );

    if ( !guildStats ) {
        return null;
    }

    const [ masterChannels, maxActiveDynamicChannels ] = await Promise.all( [
        client.channel.findMany( {
            where: {
                guildId,
                internalType: "MASTER_CREATE_CHANNEL"
            },
            select: {
                channelId: true,
                categoryId: true,
                createdAt: true
            }
        } ),
        getMaxActiveDynamicChannels( guildId )
    ] );

    const masterChannelInfos: MasterChannelInfo[] = await Promise.all(
        masterChannels.map( async( mc ) => {
            // Counted the way the bot counts before refusing the next one - off the rows it made,
            // not off the category, which also holds the generator itself and whatever else an
            // admin put there.
            const dynamicChannelsCount = await client.channel.count( {
                where: {
                    ownerChannelId: mc.channelId,
                    internalType: "DYNAMIC_CHANNEL"
                }
            } );

            return {
                channelId: mc.channelId,
                categoryId: mc.categoryId,
                createdAt: mc.createdAt,
                dynamicChannelsCount
            };
        } )
    );

    return {
        guild: guildStats,
        masterChannels: masterChannelInfos,
        maxActiveDynamicChannels
    };
}
