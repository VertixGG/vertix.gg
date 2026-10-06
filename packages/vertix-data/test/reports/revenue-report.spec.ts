import { STATISTICS_PLANS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import {
    buildRevenueStats,
    createStatisticsPlanResolver,
    resolveStatisticsPlan
} from "@vertix.gg/data/src/reports/revenue-report";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";
import type { IRevenueGuildRow, IRevenueSubscriptionRow } from "@vertix.gg/data/src/reports/revenue-report";

const DAY_MS = 24 * 60 * 60 * 1000;

const NOW = new Date( "2026-12-01T12:00:00.000Z" );

const daysFromNow = ( days: number ) => new Date( NOW.getTime() + days * DAY_MS );

const PRO: IBillingTier = {
    name: "Pro",
    slug: "pro",
    priceId: "pri_pro",
    maxMasterChannels: Number.POSITIVE_INFINITY,
    monthlyPriceUsd: 4,
    includesBranding: true,
    trialDays: 14
};

function makeSubscription( overrides: Partial<IRevenueSubscriptionRow> & { guildId: string } ): IRevenueSubscriptionRow {
    return {
        priceId: PRO.priceId,
        status: "active",
        currentPeriodEnd: daysFromNow( 20 ),
        scheduledToCancelAt: null,
        ... overrides
    };
}

function makeGuild( overrides: Partial<IRevenueGuildRow> & { guildId: string } ): IRevenueGuildRow {
    return {
        name: `guild-${ overrides.guildId }`,
        trialEndsAt: null,
        ... overrides
    };
}

describe( "VertixData/Reports/Revenue", () => {
    describe( "resolveStatisticsPlan()", () => {
        const plan = ( subscription: IRevenueSubscriptionRow | null, trialEndsAt: Date | null ) =>
            resolveStatisticsPlan( { subscription, trialEndsAt, now: NOW } );

        it( "should call a server paying while its subscription buys something, trial or not", () => {
            // Act & Assert - one that bought during its trial is paying, not trying.
            expect( plan( makeSubscription( { guildId: "a" } ), null ) ).toBe( STATISTICS_PLANS.PAID );
            expect( plan( makeSubscription( { guildId: "a" } ), daysFromNow( 5 ) ) ).toBe( STATISTICS_PLANS.PAID );
        } );

        it( "should call a server on its trial while that runs, even with a subscription that ran out", () => {
            // Arrange.
            const lapsed = makeSubscription( { guildId: "a", status: "canceled", currentPeriodEnd: daysFromNow( -3 ) } );

            // Act & Assert.
            expect( plan( null, daysFromNow( 5 ) ) ).toBe( STATISTICS_PLANS.TRIAL );
            expect( plan( lapsed, daysFromNow( 5 ) ) ).toBe( STATISTICS_PLANS.TRIAL );
        } );

        it( "should tell a server that bought and stopped from one that only tried, and from one that did neither", () => {
            // Arrange.
            const lapsed = makeSubscription( { guildId: "a", status: "canceled", currentPeriodEnd: daysFromNow( -3 ) } );

            // Act & Assert.
            expect( plan( lapsed, daysFromNow( -10 ) ) ).toBe( STATISTICS_PLANS.LAPSED );
            expect( plan( null, daysFromNow( -10 ) ) ).toBe( STATISTICS_PLANS.TRIAL_ENDED );
            expect( plan( null, null ) ).toBe( STATISTICS_PLANS.FREE );
        } );

        it( "should look a server's plan up by its id", () => {
            // Arrange.
            const planOf = createStatisticsPlanResolver( {
                guilds: [ { guildId: "trying", trialEndsAt: daysFromNow( 2 ) } ],
                subscriptions: [ makeSubscription( { guildId: "paying" } ) ],
                now: NOW
            } );

            // Act & Assert.
            expect( [ planOf( "paying" ), planOf( "trying" ), planOf( "unknown" ) ] )
                .toEqual( [ STATISTICS_PLANS.PAID, STATISTICS_PLANS.TRIAL, STATISTICS_PLANS.FREE ] );
        } );
    } );

    describe( "buildRevenueStats()", () => {
        const subscriptions = [
            makeSubscription( { guildId: "renewing", currentPeriodEnd: daysFromNow( 20 ) } ),
            makeSubscription( { guildId: "cancelling", currentPeriodEnd: daysFromNow( 4 ), scheduledToCancelAt: daysFromNow( 4 ) } ),
            makeSubscription( { guildId: "retired-price", priceId: "pri_retired", currentPeriodEnd: daysFromNow( 9 ) } ),
            makeSubscription( { guildId: "lapsed", status: "canceled", currentPeriodEnd: daysFromNow( -30 ), scheduledToCancelAt: daysFromNow( -30 ) } )
        ];

        const guilds = [
            makeGuild( { guildId: "renewing", name: "Renewing", trialEndsAt: daysFromNow( -40 ) } ),
            makeGuild( { guildId: "cancelling", name: "Cancelling" } ),
            makeGuild( { guildId: "retired-price", name: "Retired" } ),
            makeGuild( { guildId: "lapsed", name: "Lapsed" } ),
            makeGuild( { guildId: "trying", name: "Trying", trialEndsAt: daysFromNow( 3 ) } ),
            makeGuild( { guildId: "tried-soon", name: "Tried soon", trialEndsAt: daysFromNow( 1 ) } ),
            makeGuild( { guildId: "tried", name: "Tried", trialEndsAt: daysFromNow( -6 ) } )
        ];

        const days = [
            { guildId: "trying", day: new Date( "2026-11-30T00:00:00.000Z" ), roomsCreated: 4 },
            { guildId: "trying", day: new Date( "2026-11-01T00:00:00.000Z" ), roomsCreated: 40 }
        ];

        const stats = () => buildRevenueStats( { guilds, subscriptions, days, tiers: [ PRO ], now: NOW } );

        it( "should count the servers paying, and bring in a month only from the ones not set to cancel", () => {
            // Act & Assert - a price this deployment does not sell is paying all the same, and adds nothing.
            expect( stats() ).toMatchObject( { paying: 3, cancelling: 1, monthlyRevenueUsd: PRO.monthlyPriceUsd } );
        } );

        it( "should count the trials given, running, and the ones that bought since", () => {
            // Act & Assert.
            expect( stats() ).toMatchObject( { trials: 4, trialsRunning: 2, trialsConverted: 1 } );
        } );

        it( "should list paying first, then trials ending soonest, then the rest from the latest end", () => {
            // Act & Assert.
            expect( stats().servers.map( ( server ) => [ server.guildId, server.plan ] ) ).toEqual( [
                [ "cancelling", STATISTICS_PLANS.PAID ],
                [ "retired-price", STATISTICS_PLANS.PAID ],
                [ "renewing", STATISTICS_PLANS.PAID ],
                [ "tried-soon", STATISTICS_PLANS.TRIAL ],
                [ "trying", STATISTICS_PLANS.TRIAL ],
                [ "lapsed", STATISTICS_PLANS.LAPSED ],
                [ "tried", STATISTICS_PLANS.TRIAL_ENDED ]
            ] );
        } );

        it( "should say what each server holds, until when, and how busy it was this week", () => {
            // Act.
            const servers = stats().servers;

            // Assert.
            expect( servers.find( ( server ) => "cancelling" === server.guildId ) ).toMatchObject( {
                planName: PRO.name,
                status: "active",
                endsAt: daysFromNow( 4 ).toISOString(),
                isCancelling: true
            } );
            expect( servers.find( ( server ) => "retired-price" === server.guildId ) ).toMatchObject( { planName: null, isCancelling: false } );
            expect( servers.find( ( server ) => "trying" === server.guildId ) ).toMatchObject( {
                planName: null,
                status: null,
                endsAt: daysFromNow( 3 ).toISOString(),
                roomsThisWeek: 4
            } );
            expect( servers.find( ( server ) => "lapsed" === server.guildId ) ).toMatchObject( { isCancelling: false } );
        } );

        it( "should leave out a server that never had a trial or a subscription", () => {
            // Arrange.
            const result = buildRevenueStats( {
                guilds: [ makeGuild( { guildId: "free" } ) ],
                subscriptions: [],
                days: [],
                tiers: [ PRO ],
                now: NOW
            } );

            // Act & Assert.
            expect( result ).toEqual( {
                paying: 0,
                cancelling: 0,
                monthlyRevenueUsd: 0,
                trials: 0,
                trialsRunning: 0,
                trialsConverted: 0,
                servers: []
            } );
        } );
    } );
} );
