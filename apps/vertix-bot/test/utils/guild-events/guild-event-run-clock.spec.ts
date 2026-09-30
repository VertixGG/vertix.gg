import { GuildScheduledEventStatus } from "discord.js";

import {
    GUILD_EVENT_RUN_PHASES,
    resolveGuildEventsSettings,
    toGuildEventsClockTimings
} from "@vertix.gg/definitions/src/guild-events-definitions";

import {
    GUILD_EVENT_CLOCK_ACTIONS,
    GuildEventRunClock
} from "@vertix.gg/bot/src/utils/guild-events/guild-event-run-clock";

import type {
    IGuildEventClockEvent,
    IGuildEventClockRun
} from "@vertix.gg/bot/src/utils/guild-events/guild-event-run-clock";

const START = Date.UTC( 2026, 9, 3, 18, 0, 0 );
const MINUTE = 60 * 1000;

/** The clock of a server that never set any of its timing. */
const TIMINGS = toGuildEventsClockTimings( resolveGuildEventsSettings( null ) );

function anEvent( overrides: Partial<IGuildEventClockEvent> = {} ): IGuildEventClockEvent {
    return {
        status: GuildScheduledEventStatus.Scheduled,
        scheduledStartAt: START,
        scheduledEndAt: null,
        ... overrides
    };
}

function aRun( overrides: Partial<IGuildEventClockRun> = {} ): IGuildEventClockRun {
    return {
        phase: GUILD_EVENT_RUN_PHASES.CHECK_IN,
        occurrenceStartAt: START,
        frozenAt: null,
        wasActive: false,
        emptySince: null,
        hasAttendance: false,
        ... overrides
    };
}

function aFrozenRun( overrides: Partial<IGuildEventClockRun> = {} ) {
    return aRun( {
        phase: GUILD_EVENT_RUN_PHASES.RUNNING,
        frozenAt: START + TIMINGS.lateAfterMs,
        hasAttendance: true,
        ... overrides
    } );
}

describe( "VertixBot/Utils/GuildEventRunClock", () => {
    const clock = GuildEventRunClock.$;

    describe( "an event with no run", () => {
        it( "should open check-in as the lead before the start begins, and not before", () => {
            // Act.
            const early = clock.decide( START - TIMINGS.checkInLeadMs - 1, anEvent(), null, TIMINGS ),
                onTime = clock.decide( START - TIMINGS.checkInLeadMs, anEvent(), null, TIMINGS );

            // Assert.
            expect( early ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( onTime ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
        } );

        it( "should open at once when a member starts the event early", () => {
            // Act.
            const action = clock.decide( START - 60 * MINUTE, anEvent( { status: GuildScheduledEventStatus.Active } ), null, TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
        } );

        it( "should not open once its no-shows would already be due", () => {
            // Act.
            const justBefore = clock.decide( START + TIMINGS.lateAfterMs - 1, anEvent(), null, TIMINGS ),
                due = clock.decide( START + TIMINGS.lateAfterMs, anEvent(), null, TIMINGS );

            // Assert.
            expect( justBefore ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
            expect( due ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should not open an event that is canceled or completed", () => {
            // Act.
            const canceled = clock.decide( START, anEvent( { status: GuildScheduledEventStatus.Canceled } ), null, TIMINGS ),
                completed = clock.decide( START, anEvent( { status: GuildScheduledEventStatus.Completed } ), null, TIMINGS );

            // Assert.
            expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( completed ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );
    } );

    describe( "a run taking check-ins", () => {
        it( "should freeze the roster once no-shows are due, and not a moment before", () => {
            // Act.
            const before = clock.decide( START + TIMINGS.lateAfterMs - 1, anEvent(), aRun(), TIMINGS ),
                due = clock.decide( START + TIMINGS.lateAfterMs, anEvent(), aRun(), TIMINGS );

            // Assert.
            expect( before ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( due ).toBe( GUILD_EVENT_CLOCK_ACTIONS.FREEZE );
        } );

        it( "should cancel when the event is called off or deleted before it starts", () => {
            // Act.
            const canceled = clock.decide( START - MINUTE, anEvent( { status: GuildScheduledEventStatus.Canceled } ), aRun( { hasAttendance: true } ), TIMINGS ),
                deleted = clock.decide( START - MINUTE, null, aRun(), TIMINGS );

            // Assert.
            expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
            expect( deleted ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
        } );

        it( "should give way to a new board when the event is moved before it starts", () => {
            // Act.
            const action = clock.decide( START - MINUTE, anEvent( { scheduledStartAt: START + 60 * MINUTE } ), aRun(), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.WITHDRAW );
        } );

        it( "should keep going when the event is started early", () => {
            // Act.
            const action = clock.decide( START - MINUTE, anEvent( { status: GuildScheduledEventStatus.Active } ), aRun(), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should cancel an event called off after its start that nobody came to", () => {
            // Act.
            const action = clock.decide( START + MINUTE, anEvent( { status: GuildScheduledEventStatus.Canceled } ), aRun(), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
        } );

        it( "should freeze early an event over already that people came to, so its attendance is kept", () => {
            // Act.
            const action = clock.decide(
                START + MINUTE,
                anEvent( { status: GuildScheduledEventStatus.Canceled } ),
                aRun( { hasAttendance: true } ),
                TIMINGS
            );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.FREEZE );
        } );
    } );

    describe( "a frozen run", () => {
        const now = START + 30 * MINUTE;

        it( "should not end while anybody is still in the event's channels, even once discord completed it", () => {
            // Act.
            const action = clock.decide( now, anEvent( { status: GuildScheduledEventStatus.Completed } ), aFrozenRun(), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should end as soon as the channels are empty once discord completed it", () => {
            // Act.
            const action = clock.decide(
                now,
                anEvent( { status: GuildScheduledEventStatus.Completed } ),
                aFrozenRun( { emptySince: now - MINUTE } ),
                TIMINGS
            );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end once the channels stayed empty for the whole wait", () => {
            // Act.
            const waiting = clock.decide( now, anEvent(), aFrozenRun( { emptySince: now - TIMINGS.endAfterEmptyMs + 1 } ), TIMINGS ),
                done = clock.decide( now, anEvent(), aFrozenRun( { emptySince: now - TIMINGS.endAfterEmptyMs } ), TIMINGS );

            // Assert.
            expect( waiting ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( done ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should count an empty wait from the freeze when nobody came at all", () => {
            // Arrange.
            const frozenAt = START + TIMINGS.lateAfterMs,
                run = aFrozenRun( { frozenAt, emptySince: START - TIMINGS.checkInLeadMs } );

            // Act.
            const justFrozen = clock.decide( frozenAt + MINUTE, anEvent(), run, TIMINGS ),
                waited = clock.decide( frozenAt + TIMINGS.endAfterEmptyMs, anEvent(), run, TIMINGS );

            // Assert.
            expect( justFrozen ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( waited ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end once its scheduled end passed and the channels are empty", () => {
            // Act.
            const action = clock.decide( now, anEvent( { scheduledEndAt: now - MINUTE } ), aFrozenRun( { emptySince: now } ), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end a recurring occurrence that went back to scheduled, or moved its start on", () => {
            // Arrange.
            const empty = { emptySince: now };

            // Act.
            const backToScheduled = clock.decide( now, anEvent(), aFrozenRun( { ... empty, wasActive: true } ), TIMINGS ),
                movedOn = clock.decide( now, anEvent( { scheduledStartAt: START + 7 * 24 * 60 * MINUTE } ), aFrozenRun( empty ), TIMINGS );

            // Assert.
            expect( backToScheduled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
            expect( movedOn ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end at the longest a run may last, with people still in it", () => {
            // Act.
            const action = clock.decide( START + TIMINGS.runMaxMs, anEvent(), aFrozenRun(), TIMINGS );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );
    } );

    it( "should leave a finished run alone", () => {
        // Act.
        const ended = clock.decide( START, anEvent(), aRun( { phase: GUILD_EVENT_RUN_PHASES.ENDED } ), TIMINGS ),
            canceled = clock.decide( START, anEvent(), aRun( { phase: GUILD_EVENT_RUN_PHASES.CANCELED } ), TIMINGS );

        // Assert.
        expect( ended ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
    } );

    describe( "a server's own timing", () => {
        const own = toGuildEventsClockTimings( resolveGuildEventsSettings( {
            checkInLeadMinutes: 60,
            lateAfterMinutes: 0,
            endAfterEmptyMinutes: 2,
            maxDurationHours: 1
        } ) );

        it( "should open check-in as far ahead as the server asked", () => {
            // Act.
            const early = clock.decide( START - 60 * MINUTE - 1, anEvent(), null, own ),
                onTime = clock.decide( START - 60 * MINUTE, anEvent(), null, own );

            // Assert.
            expect( early ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( onTime ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
        } );

        it( "should lock the roster at the very start when nobody is allowed to be late", () => {
            // Act.
            const before = clock.decide( START - 1, anEvent(), aRun(), own ),
                atStart = clock.decide( START, anEvent(), aRun(), own ),
                tooLateToOpen = clock.decide( START, anEvent(), null, own );

            // Assert.
            expect( before ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( atStart ).toBe( GUILD_EVENT_CLOCK_ACTIONS.FREEZE );
            expect( tooLateToOpen ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should end after the server's own empty wait", () => {
            // Arrange.
            const now = START + 30 * MINUTE,
                frozen = { frozenAt: START };

            // Act.
            const waiting = clock.decide( now, anEvent(), aFrozenRun( { ... frozen, emptySince: now - 2 * MINUTE + 1 } ), own ),
                done = clock.decide( now, anEvent(), aFrozenRun( { ... frozen, emptySince: now - 2 * MINUTE } ), own );

            // Assert.
            expect( waiting ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( done ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end at the server's own longest, with people still in it", () => {
            // Act.
            const justBefore = clock.decide( START + 60 * MINUTE - 1, anEvent(), aFrozenRun( { frozenAt: START } ), own ),
                atLongest = clock.decide( START + 60 * MINUTE, anEvent(), aFrozenRun( { frozenAt: START } ), own );

            // Assert.
            expect( justBefore ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( atLongest ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );
    } );
} );
