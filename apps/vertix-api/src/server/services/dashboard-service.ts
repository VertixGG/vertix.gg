import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { DiscordService } from "@vertix.gg/api/src/server/services/discord-service";

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
}

export interface MasterChannelInfo {
    channelId: string;
    categoryId: string | null;
    createdAt: Date;
    dynamicChannelsCount: number;
    /**
     * Every channel sitting in this master channel's category, against which Discord measures its
     * per-category limit. Null when the master has no category, or when Discord could not be asked.
     */
    categoryChannelsCount: number | null;
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
 * Function getCategoryOccupancy() :: How many channels each of the guild's categories holds right now.
 *
 * Asked of Discord rather than of our own tables, because the per-category limit counts every
 * channel in the category - the ones a human made by hand included - and those never reach us.
 *
 * Returns null when Discord cannot be asked, so a caller reports "unknown" instead of "empty".
 */
async function getCategoryOccupancy( guildId: string ): Promise<Map<string, number> | null> {
    const discordService = ServiceLocator.$.get<DiscordService>( "VertixAPI/Services/Discord", { silent: true } );

    if ( !discordService ) {
        logger.warn( getCategoryOccupancy, `Discord service not registered - no occupancy for guild ${ guildId }` );
        return null;
    }

    const channels = await discordService.fetchGuildChannels( guildId );

    if ( !channels.length ) {
        logger.warn( getCategoryOccupancy, `No channels came back for guild ${ guildId } - occupancy unknown` );
        return null;
    }

    const occupancy = new Map<string, number>();

    for ( const channel of channels ) {
        if ( !channel.parent_id ) {
            continue;
        }

        occupancy.set( channel.parent_id, ( occupancy.get( channel.parent_id ) ?? 0 ) + 1 );
    }

    return occupancy;
}

export async function getGuildDetails( guildId: string ): Promise<GuildDetails | null> {
    const guildStats = await getGuildStats( guildId );

    if ( !guildStats ) {
        return null;
    }

    const masterChannels = await client.channel.findMany( {
        where: {
            guildId,
            internalType: "MASTER_CREATE_CHANNEL"
        },
        select: {
            channelId: true,
            categoryId: true,
            createdAt: true
        }
    } );

    // Only worth a round trip to Discord when there is a category whose fill we would report.
    const categoryOccupancy = masterChannels.some( ( mc ) => mc.categoryId )
        ? await getCategoryOccupancy( guildId )
        : null;

    const masterChannelInfos: MasterChannelInfo[] = await Promise.all(
        masterChannels.map( async( mc ) => {
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
                dynamicChannelsCount,
                categoryChannelsCount: mc.categoryId && categoryOccupancy
                    ? categoryOccupancy.get( mc.categoryId ) ?? 0
                    : null
            };
        } )
    );

    return {
        guild: guildStats,
        masterChannels: masterChannelInfos
    };
}
