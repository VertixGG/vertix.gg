import {
    DASHBOARD_STATS_LIMITS,
    DASHBOARD_STATS_WINDOWS,
    STATISTICS_PLANS
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import {
    buildUsageStats,
    getHoursWindowStart,
    toUTCHourStart
} from "@vertix.gg/data/src/reports/usage-report";

import type { IUsageDayRow, IUsageGuildRow, IUsageHourRow } from "@vertix.gg/data/src/reports/usage-report";

/** A Tuesday, late in the UTC day - so "today" is not the same as "the last twenty-four hours". */
const NOW = new Date( "2026-12-01T22:30:00.000Z" );

const day = ( iso: string ) => new Date( `${ iso }T00:00:00.000Z` );

function makeGuild( overrides: Partial<IUsageGuildRow> & { guildId: string } ): IUsageGuildRow {
    return {
        name: `guild-${ overrides.guildId }`,
        isInGuild: true,
        plan: STATISTICS_PLANS.FREE,
        ... overrides
    };
}

function usage( options: { guilds?: IUsageGuildRow[]; days?: IUsageDayRow[]; hours?: IUsageHourRow[] } ) {
    return buildUsageStats( {
        guilds: options.guilds ?? [],
        days: options.days ?? [],
        hours: options.hours ?? [],
        now: NOW,
        countedSince: day( "2026-10-01" ),
        hoursCountedSince: new Date( "2026-11-20T08:15:00.000Z" )
    } );
}

describe( "VertixData/Reports/Usage", () => {
    it( "should add up the rooms made each day across every server, and how many servers made them", () => {
        // Arrange.
        const days = [
            { guildId: "a", day: day( "2026-12-01" ), roomsCreated: 3 },
            { guildId: "b", day: day( "2026-12-01" ), roomsCreated: 1 },
            { guildId: "a", day: day( "2026-11-30" ), roomsCreated: 2 }
        ];

        // Act.
        const result = usage( { days } );

        // Assert.
        expect( result.roomsPerDay ).toHaveLength( DASHBOARD_STATS_WINDOWS.USAGE_DAYS );
        expect( result.roomsPerDay.slice( -2 ) ).toEqual( [
            { day: "2026-11-30", count: 2 },
            { day: "2026-12-01", count: 4 }
        ] );
        expect( result.activeServersPerDay.slice( -2 ) ).toEqual( [
            { day: "2026-11-30", count: 1 },
            { day: "2026-12-01", count: 2 }
        ] );
        expect( result.countedSince ).toBe( "2026-10-01" );
    } );

    it( "should set this week's rooms and servers against the week before", () => {
        // Arrange - this week runs from Nov 25, today included; the week before from Nov 18.
        const days = [
            { guildId: "a", day: day( "2026-11-28" ), roomsCreated: 5 },
            { guildId: "b", day: day( "2026-11-20" ), roomsCreated: 2 },
            { guildId: "c", day: day( "2026-11-24" ), roomsCreated: 1 },
            { guildId: "d", day: day( "2026-11-17" ), roomsCreated: 9 }
        ];

        // Act & Assert.
        expect( usage( { days } ) ).toMatchObject( {
            roomsThisWeek: 5,
            roomsLastWeek: 3,
            activeThisWeek: 1,
            activeLastWeek: 2
        } );
    } );

    describe( "topServers", () => {
        it( "should rank the servers by rooms over the ranking window, with what each did", () => {
            // Arrange - "a" made more rooms in the month; "b" more this week; "old" none in the month.
            const guilds = [
                makeGuild( { guildId: "a", name: "Alpha", plan: STATISTICS_PLANS.PAID } ),
                makeGuild( { guildId: "b", name: "Bravo", isInGuild: false } ),
                makeGuild( { guildId: "old", name: "Old" } )
            ];

            const days = [
                { guildId: "a", day: day( "2026-11-10" ), roomsCreated: 8 },
                { guildId: "a", day: day( "2026-11-12" ), roomsCreated: 2 },
                { guildId: "b", day: day( "2026-11-30" ), roomsCreated: 6 },
                { guildId: "old", day: day( "2026-10-01" ), roomsCreated: 50 }
            ];

            // Act.
            const { topServers } = usage( { guilds, days } );

            // Assert.
            expect( topServers ).toEqual( [
                {
                    guildId: "a",
                    name: "Alpha",
                    isInGuild: true,
                    rooms: 10,
                    roomsThisWeek: 0,
                    activeDays: 2,
                    lastActiveDay: "2026-11-12",
                    plan: STATISTICS_PLANS.PAID
                },
                {
                    guildId: "b",
                    name: "Bravo",
                    isInGuild: false,
                    rooms: 6,
                    roomsThisWeek: 6,
                    activeDays: 1,
                    lastActiveDay: "2026-11-30",
                    plan: STATISTICS_PLANS.FREE
                }
            ] );
        } );

        it( "should break a tie on this week's rooms, and then on the name", () => {
            // Arrange.
            const guilds = [ "c", "b", "a" ].map( ( guildId ) => makeGuild( { guildId, name: guildId.toUpperCase() } ) );

            const days = [
                { guildId: "a", day: day( "2026-11-10" ), roomsCreated: 4 },
                { guildId: "b", day: day( "2026-11-10" ), roomsCreated: 4 },
                { guildId: "c", day: day( "2026-11-30" ), roomsCreated: 4 }
            ];

            // Act & Assert.
            expect( usage( { guilds, days } ).topServers.map( ( server ) => server.guildId ) ).toEqual( [ "c", "a", "b" ] );
        } );

        it( "should list no more than the limit", () => {
            // Arrange.
            const guilds = Array.from( { length: DASHBOARD_STATS_LIMITS.TOP_SERVERS_MAX + 3 }, ( _, index ) => makeGuild( { guildId: `${ index }` } ) ),
                days = guilds.map( ( guild ) => ( { guildId: guild.guildId, day: day( "2026-11-30" ), roomsCreated: 1 } ) );

            // Act & Assert.
            expect( usage( { guilds, days } ).topServers ).toHaveLength( DASHBOARD_STATS_LIMITS.TOP_SERVERS_MAX );
        } );
    } );

    describe( "roomsPerHour", () => {
        it( "should start the window as many days of hours back as it holds, the current hour the last", () => {
            // Act & Assert.
            expect( toUTCHourStart( NOW ) ).toEqual( new Date( "2026-12-01T22:00:00.000Z" ) );
            expect( getHoursWindowStart( NOW ) ).toEqual( new Date( "2026-11-03T23:00:00.000Z" ) );
        } );

        it( "should add up every server's rooms in each hour, leaving out the quiet hours and those outside the window", () => {
            // Arrange.
            const hours = [
                { hour: new Date( "2026-11-30T18:00:00.000Z" ), roomsCreated: 2 },
                { hour: new Date( "2026-11-30T18:00:00.000Z" ), roomsCreated: 3 },
                { hour: new Date( "2026-11-03T23:00:00.000Z" ), roomsCreated: 1 },
                { hour: new Date( "2026-11-03T22:00:00.000Z" ), roomsCreated: 7 },
                { hour: new Date( "2026-12-01T22:00:00.000Z" ), roomsCreated: 1 }
            ];

            // Act.
            const result = usage( { hours } );

            // Assert.
            expect( result.roomsPerHour ).toEqual( [
                { hour: "2026-11-03T23:00:00.000Z", count: 1 },
                { hour: "2026-11-30T18:00:00.000Z", count: 5 },
                { hour: "2026-12-01T22:00:00.000Z", count: 1 }
            ] );
            expect( result.hoursCountedSince ).toBe( "2026-11-20T08:00:00.000Z" );
        } );
    } );
} );
