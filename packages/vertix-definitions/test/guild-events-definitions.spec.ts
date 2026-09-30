import {
    formatGuildEventVoiceTime,
    GUILD_EVENT_ATTENDANCE_KINDS,
    GUILD_EVENTS_NUMBER_SETTINGS,
    GUILD_EVENTS_SETTINGS_DEFAULTS,
    GUILD_EVENTS_TIMINGS,
    isGuildEventsSettingChoice,
    resolveGuildEventAttendanceKind,
    resolveGuildEventsSettings,
    toGuildEventsClockTimings
} from "@vertix.gg/definitions/src/guild-events-definitions";

const MINUTE = 60 * 1000;

const HOUR = 60 * MINUTE;

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

        it( "should count somebody who stayed less than the least time as never having come", () => {
            // Act & Assert - on the roster, they did not come; off it, there is nothing to say.
            expect( resolveGuildEventAttendanceKind( {
                interested: true, hasCheckedIn: true, late: false, voiceSeconds: 119, minVoiceSeconds: 120
            } ) ).toBe( GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW );
            expect( resolveGuildEventAttendanceKind( {
                interested: false, hasCheckedIn: true, late: false, voiceSeconds: 119, minVoiceSeconds: 120
            } ) ).toBeNull();
        } );

        it( "should count somebody who stayed exactly the least time as having come", () => {
            // Act & Assert.
            expect( resolveGuildEventAttendanceKind( {
                interested: true, hasCheckedIn: true, late: true, voiceSeconds: 120, minVoiceSeconds: 120
            } ) ).toBe( GUILD_EVENT_ATTENDANCE_KINDS.LATE );
        } );
    } );

    describe( "resolveGuildEventsSettings()", () => {
        it( "should answer every setting of a server that never set Events up from the defaults", () => {
            // Act.
            const settings = resolveGuildEventsSettings( null );

            // Assert.
            expect( settings ).toEqual( {
                enabled: false,
                channelId: null,
                subPostsEnabled: true,
                checkInLeadMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes,
                lateAfterMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes,
                endAfterEmptyMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.endAfterEmptyMinutes,
                maxDurationHours: GUILD_EVENTS_SETTINGS_DEFAULTS.maxDurationHours,
                eventChannelIds: [],
                checkInRoleId: null,
                checkInPingInterested: false,
                subRoleId: null,
                subMinMissing: GUILD_EVENTS_SETTINGS_DEFAULTS.subMinMissing,
                minVoiceMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.minVoiceMinutes,
                logChannelId: null,
                lastError: null
            } );
        } );

        it( "should keep what a row set and answer only what it left null from the defaults", () => {
            // Act - a row written before the timings existed has them null, or missing altogether.
            const settings = resolveGuildEventsSettings( {
                enabled: true,
                channelId: "111111111111111111",
                lateAfterMinutes: 0,
                checkInLeadMinutes: null,
                eventChannelIds: null
            } );

            // Assert - a zero is a choice, not an absence.
            expect( settings.lateAfterMinutes ).toBe( 0 );
            expect( settings.checkInLeadMinutes ).toBe( GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes );
            expect( settings.eventChannelIds ).toEqual( [] );
            expect( settings.enabled ).toBe( true );
        } );
    } );

    describe( "toGuildEventsClockTimings()", () => {
        it( "should measure a server's timing in milliseconds", () => {
            // Act.
            const timings = toGuildEventsClockTimings( resolveGuildEventsSettings( {
                checkInLeadMinutes: 30,
                lateAfterMinutes: 5,
                endAfterEmptyMinutes: 2,
                maxDurationHours: 3
            } ) );

            // Assert.
            expect( timings ).toEqual( {
                checkInLeadMs: 30 * MINUTE,
                lateAfterMs: 5 * MINUTE,
                endAfterEmptyMs: 2 * MINUTE,
                runMaxMs: 3 * HOUR
            } );
        } );

        it( "should never let a run last longer than any run may", () => {
            // Act - a value no choice offers, straight from a row.
            const timings = toGuildEventsClockTimings( resolveGuildEventsSettings( { maxDurationHours: 48 } ) );

            // Assert.
            expect( timings.runMaxMs ).toBe( GUILD_EVENTS_TIMINGS.RUN_MAX_MS );
        } );
    } );

    describe( "isGuildEventsSettingChoice()", () => {
        it( "should accept only the values a setting offers", () => {
            // Act & Assert.
            expect( isGuildEventsSettingChoice( "lateAfterMinutes", 0 ) ).toBe( true );
            expect( isGuildEventsSettingChoice( "lateAfterMinutes", 7 ) ).toBe( false );
            expect( isGuildEventsSettingChoice( "lateAfterMinutes", "10" ) ).toBe( false );
            expect( isGuildEventsSettingChoice( "checkInLeadMinutes", 24 * 60 ) ).toBe( false );
        } );

        it( "should offer every default among its own setting's choices", () => {
            // Act & Assert - a default the dashboard cannot show is a default nobody can pick back.
            for ( const setting of GUILD_EVENTS_NUMBER_SETTINGS ) {
                expect( isGuildEventsSettingChoice( setting, GUILD_EVENTS_SETTINGS_DEFAULTS[ setting ] ) ).toBe( true );
            }
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
