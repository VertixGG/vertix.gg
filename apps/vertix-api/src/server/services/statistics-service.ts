import process from "process";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import {
    ACTIVATION_JUDGED_DAY,
    buildActivationReport,
    buildActivationTimings
} from "@vertix.gg/data/src/reports/activation-report";
import { buildAdoptionStats } from "@vertix.gg/data/src/reports/adoption-report";
import { buildDaySeries, getWindowStart, toISODay } from "@vertix.gg/data/src/reports/guild-activity-report";
import { buildRetentionCohorts } from "@vertix.gg/data/src/reports/retention-report";
import { buildRevenueStats, createStatisticsPlanResolver } from "@vertix.gg/data/src/reports/revenue-report";
import { buildUsageStats, getHoursWindowStart } from "@vertix.gg/data/src/reports/usage-report";

import { readBillingTiers } from "@vertix.gg/definitions/src/billing-definitions";
import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type {
    IActivationStats,
    IAdoptionStats,
    IGrowthStats,
    IRevenueStats,
    IUsageStats
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * The owner's statistics: what becomes of every install, how much the bot is used across every server,
 * what the servers pay for and which features they use.
 *
 * Every figure is worked out by a report in `@vertix.gg/data/src/reports/`, apart from the reads here,
 * so each can be checked against rows made up for it. The routes in front of these answer the owner only.
 */

const client = PrismaBotClient.$.getClient();

/**
 * Function readInstallRows() :: The rows every install in a window is worked out from - the ones
 * `scripts/report-activation.ts` reads, with each server's trial beside it.
 */
async function readInstallRows( since: Date ) {
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
                firstRoomAt: true,
                trialEndsAt: true
            }
        } ),
        client.guildInstall.findMany( { where: { createdAt: { gte: since } }, select: { guildId: true, source: true, createdAt: true } } ),
        client.guildActivityDay.findMany( { where: { day: { gte: since } }, select: { guildId: true, day: true, roomsCreated: true } } )
    ] );

    return { guilds, installs, days };
}

/**
 * Function readCountedSince() :: The first day rooms were counted anywhere, or null while none has been.
 */
async function readCountedSince(): Promise<Date | null> {
    const first = await client.guildActivityDay.findFirst( { orderBy: { day: "asc" }, select: { day: true } } );

    return first?.day ?? null;
}

/**
 * Function getGrowthStats() :: What became of every install in the growth window, by the link it came through.
 *
 * The same report `scripts/report-activation.ts` prints, over the same rows, so the page and the script
 * never disagree.
 */
export async function getGrowthStats(): Promise<IGrowthStats> {
    const now = new Date(),
        since = getWindowStart( now, DASHBOARD_STATS_WINDOWS.GROWTH_DAYS );

    const { guilds, installs, days } = await readInstallRows( since );

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
 * Function getActivationStats() :: Where every install in the growth window got to, how fast, and how
 * long each week's installs kept going - with every install listed, and what it holds now.
 *
 * Its own read rather than more of `getGrowthStats()`, so a dashboard newer than the api asks for
 * something that is not there and says so, instead of drawing figures missing from an older answer.
 */
export async function getActivationStats(): Promise<IActivationStats> {
    const now = new Date(),
        since = getWindowStart( now, DASHBOARD_STATS_WINDOWS.GROWTH_DAYS );

    const [ { guilds, installs, days }, subscriptions, countedSince ] = await Promise.all( [
        readInstallRows( since ),
        client.subscription.findMany( { select: { guildId: true, status: true, currentPeriodEnd: true } } ),
        readCountedSince()
    ] );

    const report = buildActivationReport( { guilds, installs, days, now, since } ),
        planOf = createStatisticsPlanResolver( { guilds, subscriptions, now } );

    return {
        since: toISODay( since ),
        judgedDay: ACTIVATION_JUDGED_DAY,
        countedSince: countedSince ? toISODay( countedSince ) : null,
        funnel: report.total,
        timings: buildActivationTimings( report.installs ),
        cohorts: buildRetentionCohorts( { installs: report.installs, days, now, countedSince } ),
        installs: report.installs.map( ( install ) => ( {
            guildId: install.guildId,
            name: install.name,
            installedAt: install.installedAt.toISOString(),
            source: install.source,
            isInGuild: install.isInGuild,
            leftAt: install.leftAt?.toISOString() ?? null,
            setupAt: install.setupAt?.toISOString() ?? null,
            firstRoomAt: install.firstRoomAt?.toISOString() ?? null,
            roomsRecently: install.roomsRecently,
            isAliveAtJudgedDay: install.isAliveAtJudgedDay,
            plan: planOf( install.guildId )
        } ) )
    };
}

/**
 * Function getUsageStats() :: How much the bot is used across every server - day by day, by the hour,
 * and by the servers using it most.
 */
export async function getUsageStats(): Promise<IUsageStats> {
    const now = new Date();

    const [ days, hours, countedSince, firstHour ] = await Promise.all( [
        client.guildActivityDay.findMany( {
            where: { day: { gte: getWindowStart( now, DASHBOARD_STATS_WINDOWS.USAGE_DAYS ) }, roomsCreated: { gt: 0 } },
            select: { guildId: true, day: true, roomsCreated: true }
        } ),
        client.guildActivityHour.findMany( {
            where: { hour: { gte: getHoursWindowStart( now ) } },
            select: { hour: true, roomsCreated: true }
        } ),
        readCountedSince(),
        client.guildActivityHour.findFirst( { orderBy: { hour: "asc" }, select: { hour: true } } )
    ] );

    const guildIds = [ ... new Set( days.map( ( row ) => row.guildId ) ) ];

    const [ guilds, subscriptions ] = await Promise.all( [
        client.guild.findMany( {
            where: { guildId: { in: guildIds } },
            select: { guildId: true, name: true, isInGuild: true, trialEndsAt: true }
        } ),
        client.subscription.findMany( {
            where: { guildId: { in: guildIds } },
            select: { guildId: true, status: true, currentPeriodEnd: true }
        } )
    ] );

    const planOf = createStatisticsPlanResolver( { guilds, subscriptions, now } );

    return buildUsageStats( {
        guilds: guilds.map( ( guild ) => ( {
            guildId: guild.guildId,
            name: guild.name,
            isInGuild: guild.isInGuild,
            plan: planOf( guild.guildId )
        } ) ),
        days,
        hours,
        now,
        countedSince,
        hoursCountedSince: firstHour?.hour ?? null
    } );
}

/**
 * Function getRevenueStats() :: What the servers pay for, and how their free trials went.
 *
 * Off our own rows rather than paddle's api - they are what the bot acts on, and the page should not
 * wait on somebody else's servers to say what ours already know.
 */
export async function getRevenueStats(): Promise<IRevenueStats> {
    const now = new Date();

    const subscriptions = await client.subscription.findMany( {
        select: { guildId: true, priceId: true, status: true, currentPeriodEnd: true, scheduledToCancelAt: true }
    } );

    const guilds = await client.guild.findMany( {
        where: {
            OR: [
                { trialEndsAt: { not: null } },
                { guildId: { in: subscriptions.map( ( subscription ) => subscription.guildId ) } }
            ]
        },
        select: { guildId: true, name: true, trialEndsAt: true }
    } );

    const days = await client.guildActivityDay.findMany( {
        where: {
            guildId: { in: guilds.map( ( guild ) => guild.guildId ) },
            day: { gte: getWindowStart( now, DASHBOARD_STATS_WINDOWS.WEEK_DAYS ) }
        },
        select: { guildId: true, day: true, roomsCreated: true }
    } );

    return buildRevenueStats( { guilds, subscriptions, days, tiers: readBillingTiers( process.env ), now } );
}

/**
 * Function getAdoptionStats() :: How many of the servers the bot is in use each feature.
 *
 * A profile counts once something in it is set: removing one saves it with every field empty, so an
 * empty row is a server that had a profile and took it off.
 */
export async function getAdoptionStats(): Promise<IAdoptionStats> {
    const [ installed, generators, events, branding, customized ] = await Promise.all( [
        client.guild.findMany( { where: { isInGuild: true }, select: { guildId: true } } ),
        client.channel.findMany( {
            where: { internalType: { in: [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL" ] } },
            select: { guildId: true, internalType: true, version: true }
        } ),
        client.guildEventSettings.findMany( { where: { enabled: true }, select: { guildId: true } } ),
        client.guildBranding.findMany( {
            where: {
                OR: [
                    { nick: { not: null } },
                    { bio: { not: null } },
                    { avatar: { not: null } },
                    { banner: { not: null } }
                ]
            },
            select: { guildId: true }
        } ),
        client.guildCustomization.findMany( { distinct: [ "guildId" ], select: { guildId: true } } )
    ] );

    return buildAdoptionStats( {
        installedGuildIds: installed.map( ( row ) => row.guildId ),
        generators,
        eventsGuildIds: events.map( ( row ) => row.guildId ),
        brandingGuildIds: branding.map( ( row ) => row.guildId ),
        customizedGuildIds: customized.map( ( row ) => row.guildId )
    } );
}
