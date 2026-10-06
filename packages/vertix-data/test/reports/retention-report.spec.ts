import {
    RETENTION_WEEKS,
    buildRetentionCohorts,
    toUTCWeekStart
} from "@vertix.gg/data/src/reports/retention-report";

import type { IRetentionDayRow, IRetentionInstallRow } from "@vertix.gg/data/src/reports/retention-report";

/** A Tuesday, late in the UTC day - so "today" is not the same as "the last twenty-four hours". */
const NOW = new Date( "2026-12-01T22:00:00.000Z" );

const day = ( iso: string ) => new Date( `${ iso }T00:00:00.000Z` );

function cohorts( installs: IRetentionInstallRow[], days: IRetentionDayRow[], countedSince: Date | null = day( "2026-11-01" ) ) {
    return buildRetentionCohorts( { installs, days, now: NOW, countedSince } );
}

describe( "VertixData/Reports/Retention", () => {
    describe( "toUTCWeekStart()", () => {
        it( "should name the Monday a day's week began on", () => {
            // Act & Assert - a Tuesday, the Monday itself, and a Sunday at its last hour.
            expect( toUTCWeekStart( new Date( "2026-12-01T22:00:00.000Z" ) ) ).toEqual( day( "2026-11-30" ) );
            expect( toUTCWeekStart( day( "2026-11-30" ) ) ).toEqual( day( "2026-11-30" ) );
            expect( toUTCWeekStart( new Date( "2026-11-29T23:00:00.000Z" ) ) ).toEqual( day( "2026-11-23" ) );
        } );
    } );

    describe( "buildRetentionCohorts()", () => {
        it( "should group installs by the week they came in, and follow each from its own day", () => {
            // Arrange - two installs in the week of Nov 9, a Tuesday's and a Wednesday's, and one on
            // Monday Nov 23. The Tuesday's third week ended this morning; the Wednesday's ends tomorrow.
            const installs = [
                { guildId: "tuesday", installedAt: new Date( "2026-11-10T15:00:00.000Z" ) },
                { guildId: "wednesday", installedAt: new Date( "2026-11-11T09:00:00.000Z" ) },
                { guildId: "monday", installedAt: new Date( "2026-11-23T10:00:00.000Z" ) }
            ];

            const days = [
                { guildId: "tuesday", day: day( "2026-11-12" ), roomsCreated: 2 },
                { guildId: "tuesday", day: day( "2026-11-26" ), roomsCreated: 1 },
                { guildId: "wednesday", day: day( "2026-11-19" ), roomsCreated: 4 }
            ];

            // Act.
            const result = cohorts( installs, days );

            // Assert.
            expect( result.map( ( cohort ) => [ cohort.week, cohort.installs ] ) ).toEqual( [
                [ "2026-11-09", 2 ],
                [ "2026-11-23", 1 ]
            ] );

            expect( result[ 0 ].weeks.slice( 0, 4 ) ).toEqual( [
                { measured: 2, active: 1 },
                { measured: 2, active: 1 },
                { measured: 1, active: 1 },
                null
            ] );

            expect( result[ 1 ].weeks.slice( 0, 2 ) ).toEqual( [ { measured: 1, active: 0 }, null ] );
        } );

        it( "should not measure a week that began before counting did", () => {
            // Arrange - counting began on Nov 18: the Tuesday install's first two weeks were not counted.
            const installs = [
                { guildId: "tuesday", installedAt: new Date( "2026-11-10T15:00:00.000Z" ) },
                { guildId: "wednesday", installedAt: new Date( "2026-11-11T09:00:00.000Z" ) }
            ];

            const days = [
                { guildId: "tuesday", day: day( "2026-11-26" ), roomsCreated: 1 },
                { guildId: "wednesday", day: day( "2026-11-19" ), roomsCreated: 4 }
            ];

            // Act.
            const [ cohort ] = cohorts( installs, days, day( "2026-11-18" ) );

            // Assert.
            expect( cohort.weeks.slice( 0, 3 ) ).toEqual( [
                null,
                { measured: 1, active: 1 },
                { measured: 1, active: 1 }
            ] );
        } );

        it( "should measure nothing while nothing has been counted anywhere", () => {
            // Arrange.
            const installs = [ { guildId: "a", installedAt: new Date( "2026-10-01T12:00:00.000Z" ) } ];

            // Act.
            const [ cohort ] = cohorts( installs, [], null );

            // Assert.
            expect( cohort.installs ).toBe( 1 );
            expect( cohort.weeks.every( ( cell ) => null === cell ) ).toBe( true );
        } );

        it( "should credit a server only with its own rooms", () => {
            // Arrange.
            const installs = [ { guildId: "quiet", installedAt: new Date( "2026-11-10T15:00:00.000Z" ) } ];

            const days = [ { guildId: "busy", day: day( "2026-11-12" ), roomsCreated: 30 } ];

            // Act & Assert.
            expect( cohorts( installs, days )[ 0 ].weeks[ 0 ] ).toEqual( { measured: 1, active: 0 } );
        } );

        it( "should follow each install for as many weeks as fit the growth window", () => {
            // Arrange.
            const installs = [ { guildId: "a", installedAt: new Date( "2026-11-10T15:00:00.000Z" ) } ];

            // Act & Assert.
            expect( cohorts( installs, [] )[ 0 ].weeks ).toHaveLength( RETENTION_WEEKS );
        } );
    } );
} );
