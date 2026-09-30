import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import type { TGuildEventRunPhase } from "@vertix.gg/definitions/src/guild-events-definitions";

import type { IGuildEventAttendeeState } from "@vertix.gg/bot/src/utils/guild-events/guild-event-attendance";

/**
 * Where the rooms of an event held at a generator or a pool come from.
 *
 * The two store different ids on their rooms: a generator's rooms carry its **discord** channel id,
 * a pool's rooms the **row** id of the pool.
 */
export type TGuildEventRoomSource =
    | { kind: "generator"; generatorChannelId: string }
    | { kind: "pool"; poolRowId: string };

/** One open run as this process keeps it. */
export interface IGuildEventRunState {
    runId: string;
    guildId: string;
    scheduledEventId: string;
    occurrenceStartAt: number;
    name: string;
    voiceChannelId: string;
    postChannelId: string;
    phase: TGuildEventRunPhase;
    boardMessageId: string | null;
    subPostMessageId: string | null;
    subsNeeded: number;
    frozenAt: number | null;
    lastError: string | null;

    /** The event's "Interested" list - followed until the roster freezes, and fixed after. */
    rosterIds: Set<string>;
    /** The name the server shows for each member the run has seen, written with their attendance. */
    names: Map<string, string>;
    attendees: Map<string, IGuildEventAttendeeState>;
    /** The event's own channel and the rooms confirmed to be the event's. */
    watchedChannelIds: Set<string>;
    roomSource: TGuildEventRoomSource | null;
    wasActive: boolean;
    emptySince: number | null;

    /** What the board and the sub post last said, so an edit that would change nothing is not sent. */
    boardHash: string | null;
    subPostHash: string | null;
    lastBoardEditAt: number;
    boardEditTimer: NodeJS.Timeout | null;
}

/**
 * The runs this process has open, and what it has finished.
 *
 * Held apart from the service so the voice handlers can ask whether a move concerns any run at all
 * without anything else being touched: every move in every voice channel of every server comes
 * through here, and almost none of them do.
 */
export class GuildEventsManager extends InitializeBase {
    private static instance: GuildEventsManager;

    private readonly debugger: Debugger;

    private readonly runs = new Map<string, IGuildEventRunState>();

    /** Occurrences already run to the end - `<event id>:<start>` - so a sweep does not open them again. */
    private readonly done = new Set<string>();

    /** The work in progress per run, so a sweep and a voice move never change the same run at once. */
    private readonly chains = new Map<string, Promise<void>>();

    public static getName() {
        return "VertixBot/Managers/GuildEvents";
    }

    public static get $() {
        if ( ! GuildEventsManager.instance ) {
            GuildEventsManager.instance = new GuildEventsManager();
        }

        return GuildEventsManager.instance;
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", "VertixBot/Managers/GuildEvents" ) );
    }

    public getOccurrenceKey( scheduledEventId: string, occurrenceStartAt: number ) {
        return `${ scheduledEventId }:${ occurrenceStartAt }`;
    }

    public add( run: IGuildEventRunState ) {
        this.debugger.log( this.add, `Guild id: '${ run.guildId }' - Run '${ run.runId }' is open` );

        this.runs.set( run.runId, run );
    }

    /**
     * Function finish() :: Forget a run, and remember its occurrence as done.
     */
    public finish( run: IGuildEventRunState ) {
        this.debugger.log( this.finish, `Guild id: '${ run.guildId }' - Run '${ run.runId }' is over` );

        if ( run.boardEditTimer ) {
            clearTimeout( run.boardEditTimer );
            run.boardEditTimer = null;
        }

        this.runs.delete( run.runId );

        this.done.add( this.getOccurrenceKey( run.scheduledEventId, run.occurrenceStartAt ) );
    }

    public markDone( scheduledEventId: string, occurrenceStartAt: number ) {
        this.done.add( this.getOccurrenceKey( scheduledEventId, occurrenceStartAt ) );
    }

    public isDone( scheduledEventId: string, occurrenceStartAt: number ) {
        return this.done.has( this.getOccurrenceKey( scheduledEventId, occurrenceStartAt ) );
    }

    public getAll() {
        return [ ... this.runs.values() ];
    }

    public getForGuild( guildId: string ) {
        return this.getAll().filter( ( run ) => run.guildId === guildId );
    }

    public getForEvent( scheduledEventId: string ) {
        return this.getAll().find( ( run ) => run.scheduledEventId === scheduledEventId );
    }

    /**
     * Function chain() :: Run a piece of work on a run once the work before it is done.
     *
     * A failure is the work's own to report; the chain carries on so the next piece still runs.
     */
    public chain( runId: string, work: () => Promise<void> ) {
        const previous = this.chains.get( runId ) ?? Promise.resolve();

        const next = previous
            .catch( () => undefined )
            .then( work )
            .finally( () => {
                if ( this.chains.get( runId ) === next ) {
                    this.chains.delete( runId );
                }
            } );

        this.chains.set( runId, next );

        return next;
    }
}
