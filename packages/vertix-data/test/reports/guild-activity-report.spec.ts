import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import {
    buildDaySeries,
    buildGuildActivityStats,
    getWindowStart
} from "@vertix.gg/data/src/reports/guild-activity-report";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Late in a UTC day, so "today" is not the same as "the last twenty-four hours". */
const NOW = new Date( "2026-12-01T22:00:00.000Z" );

const daysAgo = ( days: number ) => new Date( Date.UTC( 2026, 11, 1 ) - days * DAY_MS );

describe( "VertixData/Reports/GuildActivity", () => {
    describe( "buildDaySeries()", () => {
        it( "should give every day of the window, oldest first, with a quiet day as zero", () => {
            // Act.
            const series = buildDaySeries( [ { day: daysAgo( 1 ), count: 4 } ], NOW, 3 );

            // Assert.
            expect( series ).toEqual( [
                { day: "2026-11-29", count: 0 },
                { day: "2026-11-30", count: 4 },
                { day: "2026-12-01", count: 0 }
            ] );
        } );

        it( "should add up rows on the same day, whatever their time, and leave out rows outside the window", () => {
            // Act.
            const series = buildDaySeries( [
                { day: new Date( "2026-12-01T01:00:00.000Z" ), count: 2 },
                { day: new Date( "2026-12-01T20:00:00.000Z" ), count: 1 },
                { day: daysAgo( 5 ), count: 9 }
            ], NOW, 2 );

            // Assert.
            expect( series ).toEqual( [
                { day: "2026-11-30", count: 0 },
                { day: "2026-12-01", count: 3 }
            ] );
        } );

        it( "should start the window the right number of days back", () => {
            // Act & Assert.
            expect( getWindowStart( NOW, 7 ).toISOString() ).toBe( "2026-11-25T00:00:00.000Z" );
        } );
    } );

    describe( "buildGuildActivityStats()", () => {
        it( "should split the last two weeks into this week and last week", () => {
            // Arrange - today counts as this week; seven days ago is last week.
            const days = [
                { day: daysAgo( 0 ), count: 3 },
                { day: daysAgo( 6 ), count: 2 },
                { day: daysAgo( 7 ), count: 5 },
                { day: daysAgo( 13 ), count: 1 },
                { day: daysAgo( 14 ), count: 100 }
            ];

            // Act.
            const stats = buildGuildActivityStats( { days, now: NOW, countedSince: daysAgo( 20 ) } );

            // Assert.
            expect( stats.roomsThisWeek ).toBe( 5 );
            expect( stats.roomsLastWeek ).toBe( 6 );
            expect( stats.roomsInWindow ).toBe( 111 );
        } );

        it( "should name the busiest day - the latest of those that tie - and count the days anything happened", () => {
            // Arrange.
            const days = [
                { day: daysAgo( 9 ), count: 4 },
                { day: daysAgo( 3 ), count: 4 },
                { day: daysAgo( 1 ), count: 1 }
            ];

            // Act.
            const stats = buildGuildActivityStats( { days, now: NOW, countedSince: null } );

            // Assert.
            expect( stats.busiestDay ).toEqual( { day: "2026-11-28", count: 4 } );
            expect( stats.activeDays ).toBe( 3 );
            expect( stats.days ).toHaveLength( DASHBOARD_STATS_WINDOWS.ACTIVITY_DAYS );
            expect( stats.days.at( -1 )?.day ).toBe( "2026-12-01" );
        } );

        it( "should have no busiest day, and say since when rooms were counted, for a server with none", () => {
            // Act.
            const stats = buildGuildActivityStats( { days: [], now: NOW, countedSince: new Date( "2026-11-20T08:30:00.000Z" ) } );

            // Assert.
            expect( stats.busiestDay ).toBeNull();
            expect( stats.activeDays ).toBe( 0 );
            expect( stats.countedSince ).toBe( "2026-11-20" );
        } );
    } );
} );
