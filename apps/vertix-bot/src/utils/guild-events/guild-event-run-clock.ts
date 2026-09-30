import { GuildScheduledEventStatus } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { GUILD_EVENT_RUN_PHASES } from "@vertix.gg/definitions/src/guild-events-definitions";

import type { IGuildEventsClockTimings, TGuildEventRunPhase } from "@vertix.gg/definitions/src/guild-events-definitions";

/**
 * What the clock says a run should do next.
 */
export const GUILD_EVENT_CLOCK_ACTIONS = {
    NONE: "none",
    /** Put the board up and start taking check-ins. */
    OPEN: "open",
    /** Stop following the roster and mark whoever has not come. */
    FREEZE: "freeze",
    /** Turn the board into the attendance. */
    END: "end",
    /** Called off before it began: say so, and keep no attendance. */
    CANCEL: "cancel",
    /** Moved before it began: this board gives way to the one the new time gets. */
    WITHDRAW: "withdraw"
} as const;

export type TGuildEventClockAction = typeof GUILD_EVENT_CLOCK_ACTIONS[ keyof typeof GUILD_EVENT_CLOCK_ACTIONS ];

/** The event as the clock needs to see it - discord's own view of it, as the cache holds it now. */
export interface IGuildEventClockEvent {
    status: GuildScheduledEventStatus;
    scheduledStartAt: number;
    scheduledEndAt: number | null;
}

/** The run as the clock needs to see it. */
export interface IGuildEventClockRun {
    phase: TGuildEventRunPhase;
    occurrenceStartAt: number;
    frozenAt: number | null;
    /** Seen active while this run was open - how a recurring event that has moved on is told apart. */
    wasActive: boolean;
    /** Since when nobody has been in the event's voice channels, or null while somebody is. */
    emptySince: number | null;
    /** Whether anybody at all has checked in. */
    hasAttendance: boolean;
}

/**
 * Decides, from the time and what discord says about an event, what its run does next.
 *
 * Nothing here reads or writes anything: it is the whole of the timing, held apart from the service
 * that acts on it, so every rule can be pinned down without a server.
 *
 * The clock is the start discord has for the event. Discord's own status is a signal - an early
 * start, a cancel, an end - and not the truth: a voice event is only active once a member presses
 * Start, which plenty of servers never do, and one nobody started is canceled by discord hours
 * after its time whether or not anybody came.
 *
 * How long each stretch lasts is the server's to set, so every decision is made against the
 * timings it is handed rather than against constants.
 */
export class GuildEventRunClock extends InitializeBase {
    private static instance: GuildEventRunClock;

    public static getName() {
        return "VertixBot/Utils/GuildEventRunClock";
    }

    public static get $() {
        if ( ! GuildEventRunClock.instance ) {
            GuildEventRunClock.instance = new GuildEventRunClock();
        }

        return GuildEventRunClock.instance;
    }

    public constructor() {
        super();
    }

    public decide(
        now: number,
        event: IGuildEventClockEvent | null,
        run: IGuildEventClockRun | null,
        timings: IGuildEventsClockTimings
    ): TGuildEventClockAction {
        if ( ! run ) {
            return event && this.shouldOpen( now, event, timings ) ? GUILD_EVENT_CLOCK_ACTIONS.OPEN : GUILD_EVENT_CLOCK_ACTIONS.NONE;
        }

        if ( GUILD_EVENT_RUN_PHASES.CHECK_IN !== run.phase && GUILD_EVENT_RUN_PHASES.RUNNING !== run.phase ) {
            return GUILD_EVENT_CLOCK_ACTIONS.NONE;
        }

        if ( now >= run.occurrenceStartAt + timings.runMaxMs ) {
            return GUILD_EVENT_CLOCK_ACTIONS.END;
        }

        if ( now < run.occurrenceStartAt ) {
            return this.decideBeforeStart( event, run );
        }

        const isOver = this.isOver( event, run );

        if ( GUILD_EVENT_RUN_PHASES.CHECK_IN === run.phase ) {
            if ( isOver && ! run.hasAttendance ) {
                return GUILD_EVENT_CLOCK_ACTIONS.CANCEL;
            }

            // Over already, with people in it: freeze now, so the attendance it ends as says who
            // never came, and let the next look end it once the channels are empty.
            if ( isOver || now >= run.occurrenceStartAt + timings.lateAfterMs ) {
                return GUILD_EVENT_CLOCK_ACTIONS.FREEZE;
            }

            return GUILD_EVENT_CLOCK_ACTIONS.NONE;
        }

        return this.decideWhileRunning( now, event, run, isOver, timings );
    }

    /**
     * Function shouldOpen() :: Whether an event with no run is in its check-in window.
     *
     * Never once its no-shows would already be due: a run opened that late - Events turned on half
     * way through, or the bot down across the start - would mark everybody not there that second as
     * never having come.
     */
    private shouldOpen( now: number, event: IGuildEventClockEvent, timings: IGuildEventsClockTimings ) {
        if ( GuildScheduledEventStatus.Scheduled !== event.status && GuildScheduledEventStatus.Active !== event.status ) {
            return false;
        }

        if ( now >= event.scheduledStartAt + timings.lateAfterMs ) {
            return false;
        }

        return GuildScheduledEventStatus.Active === event.status ||
            now >= event.scheduledStartAt - timings.checkInLeadMs;
    }

    private decideBeforeStart( event: IGuildEventClockEvent | null, run: IGuildEventClockRun ) {
        if ( ! event || GuildScheduledEventStatus.Canceled === event.status ) {
            return GUILD_EVENT_CLOCK_ACTIONS.CANCEL;
        }

        if ( event.scheduledStartAt !== run.occurrenceStartAt ) {
            return GUILD_EVENT_CLOCK_ACTIONS.WITHDRAW;
        }

        return GUILD_EVENT_CLOCK_ACTIONS.NONE;
    }

    /**
     * Function decideWhileRunning() :: A frozen run ends only once its channels are empty.
     *
     * Discord completing a started event is not enough on its own: it does that a few minutes after
     * the event's own channel empties, and an event held at a generator has an empty channel all
     * along - everybody is in the rooms it opened.
     */
    private decideWhileRunning(
        now: number,
        event: IGuildEventClockEvent | null,
        run: IGuildEventClockRun,
        isOver: boolean,
        timings: IGuildEventsClockTimings
    ) {
        if ( null === run.emptySince ) {
            return GUILD_EVENT_CLOCK_ACTIONS.NONE;
        }

        if ( isOver ) {
            return GUILD_EVENT_CLOCK_ACTIONS.END;
        }

        if ( event?.scheduledEndAt && now >= event.scheduledEndAt ) {
            return GUILD_EVENT_CLOCK_ACTIONS.END;
        }

        const emptyFrom = Math.max( run.emptySince, run.frozenAt ?? run.emptySince );

        if ( now - emptyFrom >= timings.endAfterEmptyMs ) {
            return GUILD_EVENT_CLOCK_ACTIONS.END;
        }

        return GUILD_EVENT_CLOCK_ACTIONS.NONE;
    }

    /**
     * Function isOver() :: Whether discord says the occurrence a started run is for has finished.
     *
     * Completed, canceled or deleted; or moved on - a recurring event keeps its id, goes back to
     * scheduled and takes the next occurrence's start when one ends.
     */
    private isOver( event: IGuildEventClockEvent | null, run: IGuildEventClockRun ) {
        if ( ! event ) {
            return true;
        }

        if ( GuildScheduledEventStatus.Completed === event.status || GuildScheduledEventStatus.Canceled === event.status ) {
            return true;
        }

        if ( event.scheduledStartAt !== run.occurrenceStartAt ) {
            return true;
        }

        return run.wasActive && GuildScheduledEventStatus.Scheduled === event.status;
    }
}
