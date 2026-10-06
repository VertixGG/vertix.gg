import {
    addWeeks,
    isGuildWeeklyReportError,
    resolveReportedWeekStart,
    resolveWeekStart
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

/**
 * Where a week is cut - Monday 00:00 UTC - which decides which week a summary is about and whether it
 * is still owed. Off by a day here, and a server is sent the same week twice or never at all.
 */
describe( "VertixDefinitions/GuildWeeklyReport", () => {
    describe( "resolveWeekStart()", () => {
        it( "should file a moment under the Monday its week began on", () => {
            // Act & Assert - a Wednesday afternoon.
            expect( resolveWeekStart( new Date( "2026-10-07T15:00:00.000Z" ) ) ).toEqual( new Date( "2026-10-05T00:00:00.000Z" ) );
        } );

        it( "should file Sunday night under the Monday before it, not the one after", () => {
            // Act & Assert.
            expect( resolveWeekStart( new Date( "2026-10-11T23:59:59.000Z" ) ) ).toEqual( new Date( "2026-10-05T00:00:00.000Z" ) );
        } );

        it( "should file Monday midnight under itself", () => {
            // Act & Assert.
            expect( resolveWeekStart( new Date( "2026-10-05T00:00:00.000Z" ) ) ).toEqual( new Date( "2026-10-05T00:00:00.000Z" ) );
        } );
    } );

    describe( "resolveReportedWeekStart()", () => {
        it( "should name the last week that has ended - the one before the week going on", () => {
            // Act & Assert - ten minutes into Monday, last week is finally over.
            expect( resolveReportedWeekStart( new Date( "2026-10-05T00:10:00.000Z" ) ) ).toEqual( new Date( "2026-09-28T00:00:00.000Z" ) );
            expect( resolveReportedWeekStart( new Date( "2026-10-04T23:50:00.000Z" ) ) ).toEqual( new Date( "2026-09-21T00:00:00.000Z" ) );
        } );
    } );

    describe( "addWeeks()", () => {
        it( "should move a moment by whole weeks, either way", () => {
            // Act & Assert.
            expect( addWeeks( new Date( "2026-10-05T00:00:00.000Z" ), 1 ) ).toEqual( new Date( "2026-10-12T00:00:00.000Z" ) );
            expect( addWeeks( new Date( "2026-10-05T00:00:00.000Z" ), -1 ) ).toEqual( new Date( "2026-09-28T00:00:00.000Z" ) );
        } );
    } );

    describe( "isGuildWeeklyReportError()", () => {
        it( "should know the stored codes, and nothing else", () => {
            // Act & Assert.
            expect( isGuildWeeklyReportError( "channel-missing" ) ).toBe( true );
            expect( isGuildWeeklyReportError( "channel-forbidden" ) ).toBe( true );
            expect( isGuildWeeklyReportError( "something-newer" ) ).toBe( false );
            expect( isGuildWeeklyReportError( null ) ).toBe( false );
        } );
    } );
} );
