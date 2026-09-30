import { GuildScheduledEventStatus } from "discord.js";

import {
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_TIMINGS
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
        frozenAt: START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS,
        hasAttendance: true,
        ... overrides
    } );
}

describe( "VertixBot/Utils/GuildEventRunClock", () => {
    const clock = GuildEventRunClock.$;

    describe( "an event with no run", () => {
        it( "should open check-in as the lead before the start begins, and not before", () => {
            // Act.
            const early = clock.decide( START - GUILD_EVENTS_TIMINGS.CHECK_IN_LEAD_MS - 1, anEvent(), null ),
                onTime = clock.decide( START - GUILD_EVENTS_TIMINGS.CHECK_IN_LEAD_MS, anEvent(), null );

            // Assert.
            expect( early ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( onTime ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
        } );

        it( "should open at once when a member starts the event early", () => {
            // Act.
            const action = clock.decide( START - 60 * MINUTE, anEvent( { status: GuildScheduledEventStatus.Active } ), null );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
        } );

        it( "should not open once its no-shows would already be due", () => {
            // Act.
            const justBefore = clock.decide( START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS - 1, anEvent(), null ),
                due = clock.decide( START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS, anEvent(), null );

            // Assert.
            expect( justBefore ).toBe( GUILD_EVENT_CLOCK_ACTIONS.OPEN );
            expect( due ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should not open an event that is canceled or completed", () => {
            // Act.
            const canceled = clock.decide( START, anEvent( { status: GuildScheduledEventStatus.Canceled } ), null ),
                completed = clock.decide( START, anEvent( { status: GuildScheduledEventStatus.Completed } ), null );

            // Assert.
            expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( completed ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );
    } );

    describe( "a run taking check-ins", () => {
        it( "should freeze the roster once no-shows are due, and not a moment before", () => {
            // Act.
            const before = clock.decide( START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS - 1, anEvent(), aRun() ),
                due = clock.decide( START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS, anEvent(), aRun() );

            // Assert.
            expect( before ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( due ).toBe( GUILD_EVENT_CLOCK_ACTIONS.FREEZE );
        } );

        it( "should cancel when the event is called off or deleted before it starts", () => {
            // Act.
            const canceled = clock.decide( START - MINUTE, anEvent( { status: GuildScheduledEventStatus.Canceled } ), aRun( { hasAttendance: true } ) ),
                deleted = clock.decide( START - MINUTE, null, aRun() );

            // Assert.
            expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
            expect( deleted ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
        } );

        it( "should give way to a new board when the event is moved before it starts", () => {
            // Act.
            const action = clock.decide( START - MINUTE, anEvent( { scheduledStartAt: START + 60 * MINUTE } ), aRun() );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.WITHDRAW );
        } );

        it( "should keep going when the event is started early", () => {
            // Act.
            const action = clock.decide( START - MINUTE, anEvent( { status: GuildScheduledEventStatus.Active } ), aRun() );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should cancel an event called off after its start that nobody came to", () => {
            // Act.
            const action = clock.decide( START + MINUTE, anEvent( { status: GuildScheduledEventStatus.Canceled } ), aRun() );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.CANCEL );
        } );

        it( "should freeze early an event over already that people came to, so its attendance is kept", () => {
            // Act.
            const action = clock.decide(
                START + MINUTE,
                anEvent( { status: GuildScheduledEventStatus.Canceled } ),
                aRun( { hasAttendance: true } )
            );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.FREEZE );
        } );
    } );

    describe( "a frozen run", () => {
        const now = START + 30 * MINUTE;

        it( "should not end while anybody is still in the event's channels, even once discord completed it", () => {
            // Act.
            const action = clock.decide( now, anEvent( { status: GuildScheduledEventStatus.Completed } ), aFrozenRun() );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        } );

        it( "should end as soon as the channels are empty once discord completed it", () => {
            // Act.
            const action = clock.decide(
                now,
                anEvent( { status: GuildScheduledEventStatus.Completed } ),
                aFrozenRun( { emptySince: now - MINUTE } )
            );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end once the channels stayed empty for the whole wait", () => {
            // Act.
            const waiting = clock.decide( now, anEvent(), aFrozenRun( { emptySince: now - GUILD_EVENTS_TIMINGS.EMPTY_END_AFTER_MS + 1 } ) ),
                done = clock.decide( now, anEvent(), aFrozenRun( { emptySince: now - GUILD_EVENTS_TIMINGS.EMPTY_END_AFTER_MS } ) );

            // Assert.
            expect( waiting ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( done ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should count an empty wait from the freeze when nobody came at all", () => {
            // Arrange.
            const frozenAt = START + GUILD_EVENTS_TIMINGS.NO_SHOW_AFTER_MS,
                run = aFrozenRun( { frozenAt, emptySince: START - GUILD_EVENTS_TIMINGS.CHECK_IN_LEAD_MS } );

            // Act.
            const justFrozen = clock.decide( frozenAt + MINUTE, anEvent(), run ),
                waited = clock.decide( frozenAt + GUILD_EVENTS_TIMINGS.EMPTY_END_AFTER_MS, anEvent(), run );

            // Assert.
            expect( justFrozen ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
            expect( waited ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end once its scheduled end passed and the channels are empty", () => {
            // Act.
            const action = clock.decide( now, anEvent( { scheduledEndAt: now - MINUTE } ), aFrozenRun( { emptySince: now } ) );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end a recurring occurrence that went back to scheduled, or moved its start on", () => {
            // Arrange.
            const empty = { emptySince: now };

            // Act.
            const backToScheduled = clock.decide( now, anEvent(), aFrozenRun( { ... empty, wasActive: true } ) ),
                movedOn = clock.decide( now, anEvent( { scheduledStartAt: START + 7 * 24 * 60 * MINUTE } ), aFrozenRun( empty ) );

            // Assert.
            expect( backToScheduled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
            expect( movedOn ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );

        it( "should end at the longest a run may last, with people still in it", () => {
            // Act.
            const action = clock.decide( START + GUILD_EVENTS_TIMINGS.RUN_MAX_MS, anEvent(), aFrozenRun() );

            // Assert.
            expect( action ).toBe( GUILD_EVENT_CLOCK_ACTIONS.END );
        } );
    } );

    it( "should leave a finished run alone", () => {
        // Act.
        const ended = clock.decide( START, anEvent(), aRun( { phase: GUILD_EVENT_RUN_PHASES.ENDED } ) ),
            canceled = clock.decide( START, anEvent(), aRun( { phase: GUILD_EVENT_RUN_PHASES.CANCELED } ) );

        // Assert.
        expect( ended ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
        expect( canceled ).toBe( GUILD_EVENT_CLOCK_ACTIONS.NONE );
    } );
} );
