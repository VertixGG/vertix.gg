import { jest } from "@jest/globals";

import { BILLING_TIER_DEFINITIONS } from "@vertix.gg/definitions/src/billing-definitions";
import { STATISTICS_PLANS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

const A_GUILD = "830000000000000001",
    ANOTHER_GUILD = "830000000000000002";

const HOUR_MS = 60 * 60 * 1000,
    DAY_MS = 24 * HOUR_MS;

/** Late in a UTC day, so a window of days is not the same as that many twenty-four hours. */
const NOW = new Date( "2026-12-01T22:00:00.000Z" );

const midnightDaysAgo = ( days: number ) => new Date( Date.UTC( 2026, 11, 1 ) - days * DAY_MS );

const daysFromNow = ( days: number ) => new Date( NOW.getTime() + days * DAY_MS );

/**
 * The reads behind the owner's statistics page. The arithmetic is the reports' and is checked in their
 * own specs; what is checked here is what each read asks the database, and that the answer reaches the
 * report it belongs to.
 */
describe( "VertixAPI/StatisticsService", () => {
    const configuredPrice = process.env.PADDLE_PRICE_PRO;

    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );

        process.env.PADDLE_PRICE_PRO = "pri_pro";
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        if ( undefined === configuredPrice ) {
            delete process.env.PADDLE_PRICE_PRO;
        } else {
            process.env.PADDLE_PRICE_PRO = configuredPrice;
        }
    } );

    /**
     * Spied on before the service is imported, since it takes the client at module load - `getClient()`
     * answers the same instance every time, which is what makes that work.
     */
    async function getClient() {
        const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );

        return PrismaBotClient.$.getClient();
    }

    it( "should count the installs in the growth window, day by day, the way the activation report does", async() => {
        const client = await getClient();

        jest.spyOn( client.guild, "findMany" ).mockResolvedValue( [ {
            guildId: A_GUILD,
            name: "A guild",
            isInGuild: true,
            createdAt: midnightDaysAgo( 200 ),
            joinedAt: new Date( midnightDaysAgo( 2 ).getTime() + HOUR_MS ),
            leftAt: null,
            setupAt: null,
            firstRoomAt: null,
            trialEndsAt: null
        } ] as never );
        jest.spyOn( client.guildInstall, "findMany" ).mockResolvedValue( [] as never );
        jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [] as never );

        const { getGrowthStats } = await import( "@vertix.gg/api/src/server/services/statistics-service" );

        const growth = await getGrowthStats();

        expect( growth.total ).toMatchObject( { installs: 1, stillInstalled: 1 } );
        expect( growth.installsPerDay.find( ( day ) => "2026-11-29" === day.day ) ).toEqual( { day: "2026-11-29", count: 1 } );
        expect( growth.since ).toBe( "2026-09-03" );
    } );

    it( "should list every install with what it holds, and follow it from the day counting began", async() => {
        const client = await getClient();

        const joinedAt = new Date( midnightDaysAgo( 2 ).getTime() + HOUR_MS ),
            leftJoinedAt = midnightDaysAgo( 20 );

        jest.spyOn( client.guild, "findMany" ).mockResolvedValue( [
            {
                guildId: A_GUILD,
                name: "A guild",
                isInGuild: true,
                createdAt: joinedAt,
                joinedAt,
                leftAt: null,
                setupAt: new Date( joinedAt.getTime() + 2 * HOUR_MS ),
                firstRoomAt: null,
                trialEndsAt: daysFromNow( 10 )
            },
            {
                guildId: ANOTHER_GUILD,
                name: "Another guild",
                isInGuild: false,
                createdAt: leftJoinedAt,
                joinedAt: leftJoinedAt,
                leftAt: new Date( leftJoinedAt.getTime() + 2 * HOUR_MS ),
                setupAt: null,
                firstRoomAt: null,
                trialEndsAt: null
            }
        ] as never );
        jest.spyOn( client.guildInstall, "findMany" ).mockResolvedValue( [] as never );
        jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [] as never );
        jest.spyOn( client.guildActivityDay, "findFirst" ).mockResolvedValue( { day: midnightDaysAgo( 12 ) } as never );

        const subscriptions = jest.spyOn( client.subscription, "findMany" ).mockResolvedValue( [] as never );

        const { getActivationStats } = await import( "@vertix.gg/api/src/server/services/statistics-service" );

        const activation = await getActivationStats();

        expect( activation ).toMatchObject( { since: "2026-09-03", countedSince: "2026-11-19" } );
        expect( activation.funnel ).toMatchObject( { installs: 2, setUpEver: 1, stillInstalled: 1 } );
        expect( activation.timings ).toMatchObject( { medianToSetUpMs: 2 * HOUR_MS, removed: 1, removedWithinDay: 1 } );
        expect( activation.installs.map( ( install ) => [ install.guildId, install.plan ] ) ).toEqual( [
            [ A_GUILD, STATISTICS_PLANS.TRIAL ],
            [ ANOTHER_GUILD, STATISTICS_PLANS.FREE ]
        ] );
        expect( activation.installs[ 0 ].installedAt ).toBe( joinedAt.toISOString() );
        expect( activation.cohorts.map( ( cohort ) => cohort.installs ) ).toEqual( [ 1, 1 ] );
        expect( subscriptions.mock.calls[ 0 ][ 0 ] ).toMatchObject( { select: { guildId: true, status: true, currentPeriodEnd: true } } );
    } );

    it( "should read the usage window's rooms, its hours, and the servers that made them", async() => {
        const client = await getClient();

        const days = jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, day: midnightDaysAgo( 0 ), roomsCreated: 3 }
        ] as never );
        const hours = jest.spyOn( client.guildActivityHour, "findMany" ).mockResolvedValue( [
            { hour: new Date( "2026-12-01T20:00:00.000Z" ), roomsCreated: 3 }
        ] as never );

        jest.spyOn( client.guildActivityDay, "findFirst" ).mockResolvedValue( { day: midnightDaysAgo( 12 ) } as never );
        jest.spyOn( client.guildActivityHour, "findFirst" ).mockResolvedValue( { hour: new Date( "2026-11-30T10:00:00.000Z" ) } as never );

        const guilds = jest.spyOn( client.guild, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, name: "A guild", isInGuild: true, trialEndsAt: null }
        ] as never );

        jest.spyOn( client.subscription, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, status: "active", currentPeriodEnd: daysFromNow( 20 ) }
        ] as never );

        const { getUsageStats } = await import( "@vertix.gg/api/src/server/services/statistics-service" );

        const usage = await getUsageStats();

        expect( usage.topServers ).toEqual( [ expect.objectContaining( { guildId: A_GUILD, rooms: 3, plan: STATISTICS_PLANS.PAID } ) ] );
        expect( usage.roomsPerHour ).toEqual( [ { hour: "2026-12-01T20:00:00.000Z", count: 3 } ] );
        expect( usage ).toMatchObject( { countedSince: "2026-11-19", hoursCountedSince: "2026-11-30T10:00:00.000Z" } );

        expect( days.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { day: { gte: midnightDaysAgo( 89 ) }, roomsCreated: { gt: 0 } } } );
        expect( hours.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { hour: { gte: new Date( "2026-11-03T23:00:00.000Z" ) } } } );
        expect( guilds.mock.calls[ 0 ][ 0 ] ).toMatchObject( { where: { guildId: { in: [ A_GUILD ] } } } );
    } );

    it( "should read every subscription and every trial, and price them at the tiers this deployment sells", async() => {
        const client = await getClient();

        jest.spyOn( client.subscription, "findMany" ).mockResolvedValue( [ {
            guildId: A_GUILD,
            priceId: "pri_pro",
            status: "active",
            currentPeriodEnd: daysFromNow( 20 ),
            scheduledToCancelAt: null
        } ] as never );

        const guilds = jest.spyOn( client.guild, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, name: "A guild", trialEndsAt: daysFromNow( -30 ) },
            { guildId: ANOTHER_GUILD, name: "Another guild", trialEndsAt: daysFromNow( 5 ) }
        ] as never );

        jest.spyOn( client.guildActivityDay, "findMany" ).mockResolvedValue( [] as never );

        const { getRevenueStats } = await import( "@vertix.gg/api/src/server/services/statistics-service" );

        const revenue = await getRevenueStats();

        expect( revenue ).toMatchObject( {
            paying: 1,
            monthlyRevenueUsd: BILLING_TIER_DEFINITIONS[ 0 ].monthlyPriceUsd,
            trials: 2,
            trialsRunning: 1,
            trialsConverted: 1
        } );
        expect( guilds.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { OR: [ { trialEndsAt: { not: null } }, { guildId: { in: [ A_GUILD ] } } ] }
        } );
    } );

    it( "should count the features of the servers the bot is in", async() => {
        const client = await getClient();

        jest.spyOn( client.guild, "findMany" ).mockResolvedValue( [ { guildId: A_GUILD }, { guildId: ANOTHER_GUILD } ] as never );

        const channels = jest.spyOn( client.channel, "findMany" ).mockResolvedValue( [
            { guildId: A_GUILD, internalType: "MASTER_CREATE_CHANNEL", version: "0.0.0.3" }
        ] as never );

        jest.spyOn( client.guildEventSettings, "findMany" ).mockResolvedValue( [ { guildId: ANOTHER_GUILD } ] as never );

        const branding = jest.spyOn( client.guildBranding, "findMany" ).mockResolvedValue( [ { guildId: A_GUILD } ] as never );

        jest.spyOn( client.guildCustomization, "findMany" ).mockResolvedValue( [ { guildId: A_GUILD } ] as never );

        const { getAdoptionStats } = await import( "@vertix.gg/api/src/server/services/statistics-service" );

        expect( await getAdoptionStats() ).toMatchObject( {
            installed: 2,
            setUp: 1,
            dynamicV3: 1,
            events: 1,
            branding: 1,
            interfaceEdits: 1
        } );
        expect( channels.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { internalType: { in: [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL" ] } }
        } );
        expect( branding.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { OR: [ { nick: { not: null } }, { bio: { not: null } }, { avatar: { not: null } }, { banner: { not: null } } ] }
        } );
    } );
} );
