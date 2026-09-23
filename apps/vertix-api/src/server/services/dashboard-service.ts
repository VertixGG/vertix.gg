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

export interface MasterChannelCategory {
    id: string;
    name: string;
}

export interface MasterChannelInfo {
    channelId: string;
    categoryId: string | null;
    createdAt: Date;
    dynamicChannelsCount: number;
    /**
     * The category the generator sits in now, with its name, as the bot sees it. Null when the bot
     * could not say or the generator sits in none - `categoryId` is then all there is, and it is the
     * category the generator was created in.
     */
    category: MasterChannelCategory | null;
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

/**
 * Function selectGuildIdsWithBot() :: Which of these servers our tables say the bot is in.
 *
 * For a *list*, where `getGuildBotPresence()` is the wrong shape: it asks Discord once per server,
 * and somebody who owns thirty would spend thirty REST calls to draw one page of a picker. This is
 * one query on ids the caller already has.
 *
 * It is therefore a hint, and the picker only sorts and labels by it. The row is written when the
 * bot joins and when it leaves, so it is current in the ordinary case, but a server whose leave
 * event never landed reads as still having the bot. The screen that locks the dashboard still asks
 * Discord, so a stale row costs a wrong label and nothing else - which is why the picker must keep
 * letting an unlabelled server be opened rather than sending it straight to an invite.
 *
 * A server with no row at all is one the bot has never been in, and is absent from the answer.
 */
export async function selectGuildIdsWithBot( guildIds: string[] ): Promise<Set<string>> {
    if ( ! guildIds.length ) {
        return new Set();
    }

    const rows = await client.guild.findMany( {
        where: { guildId: { in: guildIds }, isInGuild: true },
        select: { guildId: true }
    } );

    return new Set( rows.map( ( row ) => row.guildId ) );
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
 * Function getLiveCategory() :: The category a generator sits in right now, with its name.
 *
 * Asked of the bot rather than read from the stored row, which keeps the category the generator was
 * created in: an admin who has since dragged it elsewhere would see the new category's name beside
 * the old one's id. The bot answers out of its channel cache.
 *
 * Returns null when the bot could not say, and the panel falls back to the stored id.
 */
async function getLiveCategory(
    managementService: ManagementService,
    guildId: string,
    masterChannelId: string
): Promise<MasterChannelCategory | null> {
    const info = await managementService.requestDynamicChannelInfo( guildId, masterChannelId, [] );

    return info?.category ? { id: info.category.id, name: info.category.name } : null;
}

export async function getGuildDetails( guildId: string ): Promise<GuildDetails | null> {
    const guildStats = await getGuildStats( guildId );

    if ( !guildStats ) {
        return null;
    }

    // What only the bot holds - the limit it refuses at, and each generator's category as it stands -
    // is asked through this. Before it is registered both read as unknown rather than failing the page.
    const managementService = ServiceLocator.$.get<ManagementService>( "VertixAPI/Services/Management", { silent: true } );

    if ( !managementService ) {
        logger.warn( getGuildDetails, `Management service not registered - no limit or categories for guild ${ guildId }` );
    }

    const [ masterChannels, limits ] = await Promise.all( [
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
        managementService?.getConfigLimits( guildId ) ?? null
    ] );

    const masterChannelInfos: MasterChannelInfo[] = await Promise.all(
        masterChannels.map( async( mc ) => {
            const [ dynamicChannelsCount, category ] = await Promise.all( [
                // Counted the way the bot counts before refusing the next one - off the rows it
                // made, not off the category, which also holds the generator itself and whatever
                // else an admin put there.
                client.channel.count( {
                    where: {
                        ownerChannelId: mc.channelId,
                        internalType: "DYNAMIC_CHANNEL"
                    }
                } ),
                managementService ? getLiveCategory( managementService, guildId, mc.channelId ) : null
            ] );

            return {
                channelId: mc.channelId,
                categoryId: mc.categoryId,
                createdAt: mc.createdAt,
                dynamicChannelsCount,
                category
            };
        } )
    );

    return {
        guild: guildStats,
        masterChannels: masterChannelInfos,
        // Asked rather than read out of the guild config here, so the number a generator is
        // measured against is the one the bot refuses the next member at.
        maxActiveDynamicChannels: limits?.maxActiveDynamicChannels ?? null
    };
}
