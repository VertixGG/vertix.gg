import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

const client = PrismaBotClient.$.getClient();

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

    const masterChannelInfos: MasterChannelInfo[] = await Promise.all(
        masterChannels.map( async ( mc ) => {
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
        masterChannels: masterChannelInfos
    };
}
