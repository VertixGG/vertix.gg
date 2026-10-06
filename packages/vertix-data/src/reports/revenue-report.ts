import { isSubscriptionEntitling, isTrialRunning } from "@vertix.gg/definitions/src/billing-definitions";
import { DASHBOARD_STATS_WINDOWS, STATISTICS_PLANS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { getWindowStart } from "@vertix.gg/data/src/reports/guild-activity-report";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";
import type {
    IRevenueServer,
    IRevenueStats,
    TStatisticsPlan
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * What the servers pay for and how their free trials went - and what any one server holds, in the words
 * the owner's statistics use.
 *
 * Read off the rows the bot acts on - the subscription paddle last reported and the trial the server was
 * given - so a server reads here as holding what the bot holds it to. Kept apart from where those rows come
 * from, as the other reports are.
 */

export interface IPlanSubscriptionRow {
    guildId: string;
    status: string;
    currentPeriodEnd: Date | null;
}

export interface IRevenueSubscriptionRow extends IPlanSubscriptionRow {
    priceId: string;
    scheduledToCancelAt: Date | null;
}

export interface IPlanGuildRow {
    guildId: string;
    trialEndsAt: Date | null;
}

export interface IRevenueGuildRow extends IPlanGuildRow {
    name: string;
}

export interface IRevenueDayRow {
    guildId: string;
    day: Date;
    roomsCreated: number;
}

/** The order the plans list goes in - paying first. */
const PLAN_ORDER: readonly TStatisticsPlan[] = [
    STATISTICS_PLANS.PAID,
    STATISTICS_PLANS.TRIAL,
    STATISTICS_PLANS.LAPSED,
    STATISTICS_PLANS.TRIAL_ENDED,
    STATISTICS_PLANS.FREE
];

/** The plans whose end is still to come, listed soonest first. The rest are over, and listed latest first. */
const RUNNING_PLANS: readonly TStatisticsPlan[] = [ STATISTICS_PLANS.PAID, STATISTICS_PLANS.TRIAL ];

/**
 * Function resolveStatisticsPlan() :: What one server holds right now.
 *
 * A subscription that still buys something comes before the trial - a server that bought during its trial
 * is paying, not trying - and a running trial comes before a subscription that has run out.
 */
export function resolveStatisticsPlan( options: {
    subscription: IPlanSubscriptionRow | null;
    trialEndsAt: Date | null;
    now: Date;
} ): TStatisticsPlan {
    const { subscription, trialEndsAt, now } = options;

    if ( subscription && isSubscriptionEntitling( subscription, now ) ) {
        return STATISTICS_PLANS.PAID;
    }

    if ( isTrialRunning( trialEndsAt, now ) ) {
        return STATISTICS_PLANS.TRIAL;
    }

    if ( subscription ) {
        return STATISTICS_PLANS.LAPSED;
    }

    return trialEndsAt ? STATISTICS_PLANS.TRIAL_ENDED : STATISTICS_PLANS.FREE;
}

/**
 * Function createStatisticsPlanResolver() :: What each server holds, looked up by its id - for a list of
 * servers read alongside their subscriptions and trials.
 */
export function createStatisticsPlanResolver( options: {
    guilds: IPlanGuildRow[];
    subscriptions: IPlanSubscriptionRow[];
    now: Date;
} ): ( guildId: string ) => TStatisticsPlan {
    const trials = new Map( options.guilds.map( ( guild ) => [ guild.guildId, guild.trialEndsAt ] ) ),
        subscriptions = new Map( options.subscriptions.map( ( subscription ) => [ subscription.guildId, subscription ] ) );

    return ( guildId ) => resolveStatisticsPlan( {
        subscription: subscriptions.get( guildId ) ?? null,
        trialEndsAt: trials.get( guildId ) ?? null,
        now: options.now
    } );
}

/**
 * Function resolveEndsAt() :: When what a server holds now runs out - the paid period, or the trial.
 */
function resolveEndsAt( plan: TStatisticsPlan, subscription: IRevenueSubscriptionRow | null, trialEndsAt: Date | null ): string | null {
    const isPaidPlan = STATISTICS_PLANS.PAID === plan || STATISTICS_PLANS.LAPSED === plan,
        endsAt = isPaidPlan ? subscription?.currentPeriodEnd : trialEndsAt;

    return endsAt?.toISOString() ?? null;
}

function compareServers( a: IRevenueServer, b: IRevenueServer ): number {
    const byPlan = PLAN_ORDER.indexOf( a.plan ) - PLAN_ORDER.indexOf( b.plan );

    if ( byPlan ) {
        return byPlan;
    }

    if ( a.endsAt === b.endsAt ) {
        return a.name.localeCompare( b.name );
    }

    if ( ! a.endsAt || ! b.endsAt ) {
        return a.endsAt ? -1 : 1;
    }

    const soonestFirst = a.endsAt.localeCompare( b.endsAt );

    return RUNNING_PLANS.includes( a.plan ) ? soonestFirst : -soonestFirst;
}

/**
 * Function buildRevenueStats() :: What the servers pay for, and how their trials went.
 *
 * The monthly figure is at the prices this deployment quotes, which paddle charges but never reports
 * back - and it leaves out a subscription set to cancel, since that one has no next month to bring in.
 * A trial converted when the server has bought at any point since, whether or not it still pays.
 */
export function buildRevenueStats( options: {
    guilds: IRevenueGuildRow[];
    subscriptions: IRevenueSubscriptionRow[];
    days: IRevenueDayRow[];
    tiers: readonly IBillingTier[];
    now: Date;
} ): IRevenueStats {
    const { now, tiers } = options,
        subscriptions = new Map( options.subscriptions.map( ( subscription ) => [ subscription.guildId, subscription ] ) ),
        paying = options.subscriptions.filter( ( subscription ) => isSubscriptionEntitling( subscription, now ) ),
        renewing = paying.filter( ( subscription ) => null === subscription.scheduledToCancelAt ),
        trialGuilds = options.guilds.filter( ( guild ) => null !== guild.trialEndsAt ),
        weekFrom = getWindowStart( now, DASHBOARD_STATS_WINDOWS.WEEK_DAYS ).getTime();

    const findTier = ( priceId: string ) => tiers.find( ( tier ) => tier.priceId === priceId ) ?? null;

    const servers = options.guilds
        .filter( ( guild ) => null !== guild.trialEndsAt || subscriptions.has( guild.guildId ) )
        .map( ( guild ): IRevenueServer => {
            const subscription = subscriptions.get( guild.guildId ) ?? null,
                plan = resolveStatisticsPlan( { subscription, trialEndsAt: guild.trialEndsAt, now } );

            return {
                guildId: guild.guildId,
                name: guild.name,
                plan,
                planName: subscription ? findTier( subscription.priceId )?.name ?? null : null,
                status: subscription?.status ?? null,
                endsAt: resolveEndsAt( plan, subscription, guild.trialEndsAt ),
                isCancelling: STATISTICS_PLANS.PAID === plan && !! subscription?.scheduledToCancelAt,
                roomsThisWeek: options.days
                    .filter( ( row ) => row.guildId === guild.guildId && row.day.getTime() >= weekFrom )
                    .reduce( ( sum, row ) => sum + row.roomsCreated, 0 )
            };
        } )
        .sort( compareServers );

    return {
        paying: paying.length,
        cancelling: paying.length - renewing.length,
        monthlyRevenueUsd: renewing.reduce( ( sum, subscription ) => sum + ( findTier( subscription.priceId )?.monthlyPriceUsd ?? 0 ), 0 ),
        trials: trialGuilds.length,
        trialsRunning: trialGuilds.filter( ( guild ) => isTrialRunning( guild.trialEndsAt, now ) ).length,
        trialsConverted: trialGuilds.filter( ( guild ) => subscriptions.has( guild.guildId ) ).length,
        servers
    };
}
