import {
    DISCORD_EMBED_DESCRIPTION_LIMIT
} from "@vertix.gg/definitions/src/discord-limits-definitions";
import { GUILD_EVENTS_LIMITS } from "@vertix.gg/definitions/src/guild-events-definitions";

import { GuildEventAttendance } from "@vertix.gg/bot/src/utils/guild-events/guild-event-attendance";

import type { IGuildEventAttendeeState } from "@vertix.gg/bot/src/utils/guild-events/guild-event-attendance";

const MINUTE = 60 * 1000;
const NOW = Date.UTC( 2026, 9, 3, 18, 0, 0 );

/** The longest a user id gets - snowflakes are at most twenty digits. */
const LONGEST_USER_ID = "9".repeat( 20 );

describe( "VertixBot/Utils/GuildEventAttendance", () => {
    const attendance = GuildEventAttendance.$;

    describe( "observe()", () => {
        it( "should check a member in on arrival and add up the visit on departure", () => {
            // Arrange.
            const arrived = attendance.observe( attendance.createAttendee( "1", true ), true, NOW, false )!;

            // Act.
            const left = attendance.observe( arrived, false, NOW + 5 * MINUTE, false )!;

            // Assert.
            expect( arrived.checkedInAt ).toBe( NOW );
            expect( left.voiceMs ).toBe( 5 * MINUTE );
            expect( left.sessionStartedAt ).toBeNull();
        } );

        it( "should answer a switch the same whichever of its join and leave is seen first", () => {
            // Arrange - a member moving between two of the event's rooms is still there either way.
            const inside = attendance.observe( attendance.createAttendee( "1" ), true, NOW, false )!;

            // Act.
            const first = attendance.observe( inside, true, NOW + MINUTE, false ),
                second = attendance.observe( inside, true, NOW + MINUTE, false );

            // Assert.
            expect( first ).toBeNull();
            expect( second ).toBeNull();
        } );

        it( "should keep the first arrival as the check-in across later visits", () => {
            // Arrange.
            const first = attendance.observe( attendance.createAttendee( "1" ), true, NOW, false )!,
                gone = attendance.observe( first, false, NOW + MINUTE, false )!;

            // Act.
            const back = attendance.observe( gone, true, NOW + 10 * MINUTE, false )!;

            // Assert.
            expect( back.checkedInAt ).toBe( NOW );
            expect( back.sessionStartedAt ).toBe( NOW + 10 * MINUTE );
        } );

        it( "should turn a no-show who comes after all into late", () => {
            // Arrange.
            const noShow = { ... attendance.createAttendee( "1", true ), noShow: true };

            // Act.
            const arrived = attendance.observe( noShow, true, NOW, true )!;

            // Assert.
            expect( arrived.noShow ).toBe( false );
            expect( arrived.late ).toBe( true );
        } );

        it( "should not call somebody late who was never on the roster", () => {
            // Act.
            const walkIn = attendance.observe( attendance.createAttendee( "1" ), true, NOW, true )!;

            // Assert.
            expect( walkIn.late ).toBe( false );
        } );
    } );

    it( "should credit a visit that ended unseen up to the last look, and no further", () => {
        // Arrange.
        const inside: IGuildEventAttendeeState = { ... attendance.createAttendee( "1" ), checkedInAt: NOW, sessionStartedAt: NOW };

        // Act.
        const credited = attendance.creditUpTo( inside, NOW + 3 * MINUTE );

        // Assert.
        expect( credited.voiceMs ).toBe( 3 * MINUTE );
        expect( credited.sessionStartedAt ).toBeNull();
    } );

    it( "should mark who on the roster had not come when it froze", () => {
        // Arrange.
        const came = attendance.observe( attendance.createAttendee( "came" ), true, NOW, false )!,
            attendees = new Map( [ [ "came", came ] ] );

        // Act.
        attendance.freeze( attendees, [ "came", "missing" ] );

        // Assert.
        expect( attendees.get( "came" ) ).toMatchObject( { interested: true, noShow: false } );
        expect( attendees.get( "missing" ) ).toMatchObject( { interested: true, noShow: true } );
    } );

    describe( "subs", () => {
        it( "should ask for as many as never came, but no more than there is room for", () => {
            // Act.
            const noLimit = attendance.countSubsNeeded( 3, null ),
                limited = attendance.countSubsNeeded( 3, 1 ),
                full = attendance.countSubsNeeded( 3, 0 );

            // Assert.
            expect( noLimit ).toBe( 3 );
            expect( limited ).toBe( 1 );
            expect( full ).toBe( 0 );
        } );

        it( "should count every arrival after the freeze against the places asked for", () => {
            // Arrange.
            const frozenAt = NOW,
                before = { ... attendance.createAttendee( "1" ), checkedInAt: frozenAt - MINUTE },
                after = { ... attendance.createAttendee( "2" ), checkedInAt: frozenAt + MINUTE };

            // Act.
            const stillNeeded = attendance.countStillNeeded( 2, [ before, after ], frozenAt );

            // Assert.
            expect( stillNeeded ).toBe( 1 );
        } );
    } );

    it( "should write time in voice as hours and minutes", () => {
        // Act.
        const short = attendance.formatDuration( 5 * MINUTE + 59 * 1000 ),
            long = attendance.formatDuration( 72 * MINUTE );

        // Assert.
        expect( short ).toBe( "0:05" );
        expect( long ).toBe( "1:12" );
    } );

    describe( "buildLists()", () => {
        it( "should sort everybody into on time, late, no-show and walk-ins, longest first", () => {
            // Arrange.
            const attendees: IGuildEventAttendeeState[] = [
                { ... attendance.createAttendee( "short", true ), checkedInAt: NOW, voiceMs: MINUTE },
                { ... attendance.createAttendee( "long", true ), checkedInAt: NOW, voiceMs: 60 * MINUTE },
                { ... attendance.createAttendee( "late", true ), checkedInAt: NOW, late: true, voiceMs: MINUTE },
                { ... attendance.createAttendee( "missing", true ), noShow: true },
                { ... attendance.createAttendee( "walk-in" ), checkedInAt: NOW, voiceMs: MINUTE }
            ];

            // Act.
            const lists = attendance.buildLists( attendees, [ "short", "long", "late", "missing" ], NOW, true );

            // Assert.
            expect( lists.onTime.lines ).toEqual( [ "<@long> · 1:00", "<@short> · 0:01" ] );
            expect( lists.late.lines ).toEqual( [ "<@late> · 0:01" ] );
            expect( lists.noShow.lines ).toEqual( [ "<@missing>" ] );
            expect( lists.walkIns.lines ).toEqual( [ "<@walk-in> · 0:01" ] );
        } );

        it( "should list whoever is in, and who on the roster is not yet, while check-in is open", () => {
            // Arrange.
            const attendees = [ { ... attendance.createAttendee( "in" ), checkedInAt: NOW, sessionStartedAt: NOW } ];

            // Act.
            const lists = attendance.buildLists( attendees, [ "in", "not-yet" ], NOW, false );

            // Assert.
            expect( lists.checkedIn.lines ).toEqual( [ "<@in>" ] );
            expect( lists.waiting.lines ).toEqual( [ "<@not-yet>" ] );
        } );

        it( "should leave the times out while a board is still going", () => {
            // Arrange.
            const attendees = [ { ... attendance.createAttendee( "in", true ), checkedInAt: NOW, voiceMs: 30 * MINUTE } ];

            // Act.
            const lists = attendance.buildLists( attendees, [ "in" ], NOW, false );

            // Assert.
            expect( lists.onTime.lines ).toEqual( [ "<@in>" ] );
        } );

        it( "should show only so many of a list and count the rest", () => {
            // Arrange.
            const rosterIds = Array.from( { length: GUILD_EVENTS_LIMITS.BOARD_LIST_MAX + 3 }, ( _, index ) => String( index ) );

            // Act.
            const lists = attendance.buildLists( [], rosterIds, NOW, false );

            // Assert.
            expect( lists.waiting.lines ).toHaveLength( GUILD_EVENTS_LIMITS.BOARD_LIST_MAX );
            expect( lists.waiting.count ).toBe( GUILD_EVENTS_LIMITS.BOARD_LIST_MAX + 3 );
            expect( lists.waiting.hiddenCount ).toBe( 3 );
        } );

        it( "should keep four full lists of the longest lines inside one embed description", () => {
            // Arrange - the room a board's headings and wording take, generously.
            const wordingAllowance = 1000,
                longestLine = `<@${ LONGEST_USER_ID }> · 99:59`,
                listLength = GUILD_EVENTS_LIMITS.BOARD_LIST_MAX * ( longestLine.length + 1 );

            // Assert.
            expect( 4 * listLength + wordingAllowance ).toBeLessThanOrEqual( DISCORD_EMBED_DESCRIPTION_LIMIT );
        } );
    } );
} );
