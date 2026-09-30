import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ACTIVATION_JUDGED_DAY, buildActivationReport } from "@vertix.gg/data/src/reports/activation-report";
import {
    buildDaySeries,
    buildGuildActivityStats,
    getWindowStart,
    toISODay
} from "@vertix.gg/data/src/reports/guild-activity-report";
import { buildGuildEventsStats } from "@vertix.gg/data/src/reports/guild-events-report";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import { GUILD_EVENT_RUN_PHASES } from "@vertix.gg/definitions/src/guild-events-definitions";

import type { DiscordService } from "@vertix.gg/api/src/server/services/discord-service";
import type { ManagementService } from "@vertix.gg/api/src/server/services/management-service";

import type {
    IGrowthStats,
    IGuildActivityStats,
    IGuildEventsStats
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

const client = PrismaBotClient.$.getClient();

const logger = new Logger( "VertixAPI/DashboardService" );

export interface GlobalStats {
    totalGuilds: number;
    activeGuilds: number;
    totalChannels: number;
    totalMasterChannels: number;
    totalDynamicChannels: number;
    totalUsers: number;
    /** Rooms members made in the last seven days, across every server. */
    roomsThisWeek: number;
    /** Servers whose members made a room in the last seven days. */
    activeThisWeek: number;
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
    /** When the bot was last added - null for a server it joined before joins were recorded. */
    joinedAt: Date | null;
    /** Its first generator, ever - null until one was made after that was recorded. */
    setupAt: Date | null;
    /** The first room a member made, ever - null until one was made after that was recorded. */
    firstRoomAt: Date | null;
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
    /** The generator's channel name, as the bot sees it - null when the bot could not say. */
    name: string | null;
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
    const weekStart = getWindowStart( new Date(), DASHBOARD_STATS_WINDOWS.WEEK_DAYS );

    const [ totalGuilds, activeGuilds, totalChannels, channelsByType, totalUsers, weekDays ] = await Promise.all( [
        client.guild.count(),
        client.guild.count( { where: { isInGuild: true } } ),
        client.channel.count(),
        client.channel.groupBy( {
            by: [ "internalType" ],
            _count: true
        } ),
        client.user.count(),
        client.guildActivityDay.findMany( {
            where: { day: { gte: weekStart }, roomsCreated: { gt: 0 } },
            select: { guildId: true, roomsCreated: true }
        } )
    ] );

    const masterChannels = channelsByType.find( c => c.internalType === "MASTER_CREATE_CHANNEL" )?._count ?? 0;
    const dynamicChannels = channelsByType.find( c => c.internalType === "DYNAMIC_CHANNEL" )?._count ?? 0;

    return {
        totalGuilds,
        activeGuilds,
        totalChannels,
        totalMasterChannels: masterChannels,
        totalDynamicChannels: dynamicChannels,
        totalUsers,
        roomsThisWeek: weekDays.reduce( ( sum, row ) => sum + row.roomsCreated, 0 ),
        activeThisWeek: new Set( weekDays.map( ( row ) => row.guildId ) ).size
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
        lastActiveAt: guild.lastActiveAt,
        joinedAt: guild.joinedAt,
        setupAt: guild.setupAt,
        firstRoomAt: guild.firstRoomAt
    };
}

/**
 * Function getGuildActivity() :: The rooms a server's members made, day by day, over the activity window.
 *
 * With the first day rooms were counted anywhere, so a chart can tell a day before counting began
 * from a quiet one.
 */
export async function getGuildActivity( guildId: string ): Promise<IGuildActivityStats> {
    const now = new Date();

    const [ rows, first ] = await Promise.all( [
        client.guildActivityDay.findMany( {
            where: { guildId, day: { gte: getWindowStart( now, DASHBOARD_STATS_WINDOWS.ACTIVITY_DAYS ) } },
            select: { day: true, roomsCreated: true }
        } ),
        client.guildActivityDay.findFirst( { orderBy: { day: "asc" }, select: { day: true } } )
    ] );

    return buildGuildActivityStats( {
        days: rows.map( ( row ) => ( { day: row.day, count: row.roomsCreated } ) ),
        now,
        countedSince: first?.day ?? null
    } );
}

/**
 * Function getGuildEventsStats() :: How a server's events went over the events window.
 */
export async function getGuildEventsStats( guildId: string ): Promise<IGuildEventsStats> {
    const since = getWindowStart( new Date(), DASHBOARD_STATS_WINDOWS.EVENTS_DAYS );

    const [ settings, runs ] = await Promise.all( [
        client.guildEventSettings.findUnique( { where: { guildId }, select: { enabled: true } } ),
        client.guildEventRun.findMany( {
            where: { guildId, occurrenceStartAt: { gte: since } },
            select: { id: true, phase: true, minVoiceSeconds: true }
        } )
    ] );

    const endedRunIds = runs.filter( ( run ) => GUILD_EVENT_RUN_PHASES.ENDED === run.phase ).map( ( run ) => run.id );

    const attendees = endedRunIds.length ? await client.guildEventAttendee.findMany( {
        where: { runId: { in: endedRunIds } },
        select: {
            runId: true,
            userId: true,
            displayName: true,
            interested: true,
            checkedInAt: true,
            late: true,
            voiceSeconds: true
        }
    } ) : [];

    return buildGuildEventsStats( { runs, attendees, isEnabled: !! settings?.enabled } );
}

/**
 * Function getGrowthStats() :: What became of every install in the growth window - for the owner.
 *
 * The same report `scripts/report-activation.ts` prints, over the same rows, so the page and the
 * script never disagree.
 */
export async function getGrowthStats(): Promise<IGrowthStats> {
    const now = new Date(),
        since = getWindowStart( now, DASHBOARD_STATS_WINDOWS.GROWTH_DAYS );

    const [ guilds, installs, days ] = await Promise.all( [
        client.guild.findMany( {
            select: {
                guildId: true,
                name: true,
                isInGuild: true,
                createdAt: true,
                joinedAt: true,
                leftAt: true,
                setupAt: true,
                firstRoomAt: true
            }
        } ),
        client.guildInstall.findMany( { where: { createdAt: { gte: since } }, select: { guildId: true, source: true, createdAt: true } } ),
        client.guildActivityDay.findMany( { where: { day: { gte: since } }, select: { guildId: true, day: true, roomsCreated: true } } )
    ] );

    const report = buildActivationReport( { guilds, installs, days, now, since } );

    return {
        since: toISODay( since ),
        judgedDay: ACTIVATION_JUDGED_DAY,
        installsPerDay: buildDaySeries(
            report.installs.map( ( install ) => ( { day: install.installedAt, count: 1 } ) ),
            now,
            DASHBOARD_STATS_WINDOWS.GROWTH_DAYS
        ),
        total: report.total,
        bySource: report.bySource
    };
}

/**
 * Function getLiveGenerator() :: A generator's channel name, and the category it sits in right now.
 *
 * Asked of the bot rather than read from the stored row, which keeps neither the name nor anything but
 * the category the generator was created in: an admin who has since dragged it elsewhere would see the
 * new category's name beside the old one's id. The bot answers out of its channel cache.
 *
 * Both are null when the bot could not say, and the panel falls back to the stored ids.
 */
async function getLiveGenerator(
    managementService: ManagementService,
    guildId: string,
    masterChannelId: string
): Promise<{ name: string | null; category: MasterChannelCategory | null }> {
    const info = await managementService.requestDynamicChannelInfo( guildId, masterChannelId, [] );

    return {
        name: info?.masterChannel?.name ?? null,
        category: info?.category ? { id: info.category.id, name: info.category.name } : null
    };
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
            const [ dynamicChannelsCount, live ] = await Promise.all( [
                // Counted the way the bot counts before refusing the next one - off the rows it
                // made, not off the category, which also holds the generator itself and whatever
                // else an admin put there.
                client.channel.count( {
                    where: {
                        ownerChannelId: mc.channelId,
                        internalType: "DYNAMIC_CHANNEL"
                    }
                } ),
                managementService ? getLiveGenerator( managementService, guildId, mc.channelId ) : null
            ] );

            return {
                channelId: mc.channelId,
                name: live?.name ?? null,
                categoryId: mc.categoryId,
                createdAt: mc.createdAt,
                dynamicChannelsCount,
                category: live?.category ?? null
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
