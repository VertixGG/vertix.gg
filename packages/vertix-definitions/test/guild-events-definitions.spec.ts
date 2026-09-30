import {
    formatGuildEventVoiceTime,
    GUILD_EVENT_ATTENDANCE_KINDS,
    resolveGuildEventAttendanceKind
} from "@vertix.gg/definitions/src/guild-events-definitions";

const MINUTE = 60 * 1000;

/**
 * The rule the bot's board and the dashboard both read attendance by - if the two ever disagreed,
 * somebody would be late on one and on time on the other.
 */
describe( "VertixDefinitions/GuildEvents", () => {
    describe( "resolveGuildEventAttendanceKind()", () => {
        it( "should sort everybody on the roster into came, late and no-show", () => {
            // Act & Assert.
            expect( resolveGuildEventAttendanceKind( { interested: true, hasCheckedIn: true, late: false } ) )
                .toBe( GUILD_EVENT_ATTENDANCE_KINDS.CAME );
            expect( resolveGuildEventAttendanceKind( { interested: true, hasCheckedIn: true, late: true } ) )
                .toBe( GUILD_EVENT_ATTENDANCE_KINDS.LATE );
            expect( resolveGuildEventAttendanceKind( { interested: true, hasCheckedIn: false, late: false } ) )
                .toBe( GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW );
        } );

        it( "should call somebody who came without being on the roster a walk-in", () => {
            // Act & Assert.
            expect( resolveGuildEventAttendanceKind( { interested: false, hasCheckedIn: true, late: false } ) )
                .toBe( GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN );
        } );

        it( "should have nothing to say about somebody neither on the roster nor there", () => {
            // Act & Assert.
            expect( resolveGuildEventAttendanceKind( { interested: false, hasCheckedIn: false, late: false } ) ).toBeNull();
        } );
    } );

    describe( "formatGuildEventVoiceTime()", () => {
        it( "should write time in voice as hours and minutes, dropping the seconds", () => {
            // Act & Assert.
            expect( formatGuildEventVoiceTime( 5 * MINUTE + 59 * 1000 ) ).toBe( "0:05" );
            expect( formatGuildEventVoiceTime( 125 * MINUTE ) ).toBe( "2:05" );
        } );
    } );
} );
