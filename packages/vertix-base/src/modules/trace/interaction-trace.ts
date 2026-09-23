import { AsyncLocalStorage } from "node:async_hooks";
import { performance } from "node:perf_hooks";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

// A press slower than this is logged with everything it waited on. Discord gives an interaction
// three seconds to be acknowledged, so half of that is already a press somebody felt.
export const INTERACTION_TRACE_SLOW_MS = Number( process.env.VERTIX_TRACE_SLOW_MS ) || 1500;

// How often the totals are written out: what took the most time across every press, not only the
// slow ones. A bottleneck that costs 80ms a thousand times never shows up as one slow press.
export const INTERACTION_TRACE_SUMMARY_INTERVAL_MS = Number( process.env.VERTIX_TRACE_SUMMARY_INTERVAL_MS ) || 600000;

// The event loop is sampled on a timer, and a tick arriving this much later than asked for means
// something held the loop. Every press waiting at that moment waited with it.
const EVENT_LOOP_SAMPLE_INTERVAL_MS = 100;
const EVENT_LOOP_STALL_THRESHOLD_MS = 50;
const EVENT_LOOP_STALLS_KEPT = 256;

const SUMMARY_TOP_SPANS = 15;
const SLOW_LINE_TOP_LABELS = 3;

export type TInteractionTraceSpanKind =
    | "db"
    | "discord"
    | "discord-rate-limit"
    | "gui-build"
    | "gui-args";

interface IInteractionTraceSpan {
    kind: TInteractionTraceSpanKind;
    label: string;
    ms: number;
}

interface IInteractionTraceContext {
    name: string;
    id: string;
    startedAt: number;
    queuedMs: number;
    ackMs: number | undefined;
    spans: IInteractionTraceSpan[];
}

interface IInteractionTraceTotal {
    count: number;
    totalMs: number;
    maxMs: number;
}

interface IEventLoopStall {
    at: number;
    ms: number;
}

/**
 * Times what a press actually waits on, and says so when it was slow.
 *
 * Each interaction runs inside `run()`, which opens a context that follows it through every await -
 * so a database query or a discord request made anywhere below, however deep, is filed under the
 * press that caused it without anything being passed down. The hooks that record them sit at the
 * two doors everything goes through: the prisma client and the discord REST manager.
 *
 * Spans nest. A `gui-args` span is the whole of an adapter's `getReplyArgs()`, and the queries it
 * made are in it as well as in `db`. Read the kinds side by side, not added together.
 */
export class InteractionTrace extends InitializeBase {
    private static instance: InteractionTrace | undefined;

    private readonly storage = new AsyncLocalStorage<IInteractionTraceContext>();

    private readonly spanTotals = new Map<string, IInteractionTraceTotal>();
    private readonly interactionTotals = new Map<string, IInteractionTraceTotal & { slow: number }>();

    private readonly stalls: IEventLoopStall[] = [];
    private stallsSinceSummary: IInteractionTraceTotal = { count: 0, totalMs: 0, maxMs: 0 };

    private readonly enabled = "true" !== process.env.VERTIX_TRACE_DISABLED;

    private started = false;

    public static getName() {
        return "VertixBase/InteractionTrace";
    }

    public static get $(): InteractionTrace {
        if ( ! InteractionTrace.instance ) {
            InteractionTrace.instance = new InteractionTrace();
        }

        return InteractionTrace.instance;
    }

    /**
     * A route as a kind of request rather than one request: ids and interaction tokens out, so
     * every channel edit is counted together.
     */
    public static normalizeRoute( route: string ) {
        return route
            .replace( /\/(interactions|webhooks)\/[^/]+\/[^/?]+/, "/$1/:id/:token" )
            .replace( /\d{16,20}/g, ":id" )
            .replace( /\?.*$/, "" );
    }

    private constructor() {
        super();
    }

    public isEnabled() {
        return this.enabled;
    }

    /**
     * Starts the event loop sampler and the periodic summary. Timers are unref'd, so neither keeps
     * a process alive that is otherwise done.
     */
    public start() {
        if ( ! this.enabled || this.started ) {
            return;
        }

        this.started = true;

        let expectedAt = performance.now() + EVENT_LOOP_SAMPLE_INTERVAL_MS;

        setInterval( () => {
            const now = performance.now(),
                lateMs = now - expectedAt;

            expectedAt = now + EVENT_LOOP_SAMPLE_INTERVAL_MS;

            if ( lateMs >= EVENT_LOOP_STALL_THRESHOLD_MS ) {
                this.recordStall( now, lateMs );
            }
        }, EVENT_LOOP_SAMPLE_INTERVAL_MS ).unref();

        setInterval( () => this.logSummary(), INTERACTION_TRACE_SUMMARY_INTERVAL_MS ).unref();
    }

    /**
     * Runs one interaction's handling inside its own trace.
     *
     * `queuedMs` is how long ago discord created the interaction - time spent before any code of
     * ours ran for it: the gateway, and the event loop being busy with something else.
     */
    public async run<T>( name: string, id: string, queuedMs: number, work: () => Promise<T> ): Promise<T> {
        if ( ! this.enabled ) {
            return work();
        }

        const context: IInteractionTraceContext = {
            name,
            id,
            startedAt: performance.now(),
            queuedMs,
            ackMs: undefined,
            spans: []
        };

        try {
            return await this.storage.run( context, work );
        } finally {
            this.finish( context );
        }
    }

    /**
     * Times one wait. Counted into the running totals always, and into the current press when
     * there is one - a query made by a background job still belongs in the summary.
     */
    public async span<T>( kind: TInteractionTraceSpanKind, label: string, work: () => Promise<T> ): Promise<T> {
        if ( ! this.enabled ) {
            return work();
        }

        const startedAt = performance.now();

        try {
            return await work();
        } finally {
            this.record( kind, label, performance.now() - startedAt );
        }
    }

    /**
     * Something that was waited on without being awaited here - a rate limit, which the REST
     * manager reports as it starts sleeping.
     */
    public record( kind: TInteractionTraceSpanKind, label: string, ms: number ) {
        if ( ! this.enabled ) {
            return;
        }

        this.addTotal( this.spanTotals, `${ kind } ${ label }`, ms );

        this.storage.getStore()?.spans.push( { kind, label, ms } );
    }

    /**
     * The press was answered. Discord shows "this interaction failed" at three seconds without
     * one, however fast the rest of the handling is.
     */
    public markAcknowledged() {
        const context = this.storage.getStore();

        if ( context && undefined === context.ackMs ) {
            context.ackMs = performance.now() - context.startedAt;
        }
    }

    public getCurrent(): Readonly<IInteractionTraceContext> | undefined {
        return this.storage.getStore();
    }

    public getSpanTotals(): ReadonlyMap<string, IInteractionTraceTotal> {
        return this.spanTotals;
    }

    public reset() {
        this.spanTotals.clear();
        this.interactionTotals.clear();
        this.stalls.length = 0;
        this.stallsSinceSummary = { count: 0, totalMs: 0, maxMs: 0 };
    }

    public recordStall( at: number, ms: number ) {
        this.stalls.push( { at, ms } );

        if ( this.stalls.length > EVENT_LOOP_STALLS_KEPT ) {
            this.stalls.shift();
        }

        this.stallsSinceSummary.count++;
        this.stallsSinceSummary.totalMs += ms;
        this.stallsSinceSummary.maxMs = Math.max( this.stallsSinceSummary.maxMs, ms );
    }

    /**
     * The line a slow press is logged with: its total, when it was answered, and per kind of wait
     * how many, how long, and which labels cost the most.
     */
    public describe( context: IInteractionTraceContext, totalMs: number ) {
        const parts = [
            `queued ${ Math.round( context.queuedMs ) }ms`,
            undefined === context.ackMs ? "never acknowledged" : `acknowledged at ${ Math.round( context.ackMs ) }ms`
        ];

        const kinds = new Map<TInteractionTraceSpanKind, IInteractionTraceSpan[]>();

        for ( const span of context.spans ) {
            kinds.set( span.kind, [ ... ( kinds.get( span.kind ) ?? [] ), span ] );
        }

        for ( const [ kind, spans ] of kinds ) {
            const byLabel = new Map<string, IInteractionTraceTotal>();

            for ( const span of spans ) {
                this.addTotal( byLabel, span.label, span.ms );
            }

            const top = [ ... byLabel ]
                .sort( ( a, b ) => b[ 1 ].totalMs - a[ 1 ].totalMs )
                .slice( 0, SLOW_LINE_TOP_LABELS )
                .map( ( [ label, total ] ) => `${ label } ${ total.count }x ${ Math.round( total.totalMs ) }ms` )
                .join( ", " );

            const kindMs = spans.reduce( ( sum, span ) => sum + span.ms, 0 );

            parts.push( `${ kind } ${ spans.length }x ${ Math.round( kindMs ) }ms ( ${ top } )` );
        }

        const stallMs = this.getMaxStallBetween( context.startedAt, context.startedAt + totalMs );

        if ( stallMs ) {
            parts.push( `event loop stalled ${ Math.round( stallMs ) }ms` );
        }

        return `'${ context.name }' ( ${ context.id } ) took ${ Math.round( totalMs ) }ms - ${ parts.join( " | " ) }`;
    }

    public logSummary() {
        const interactions = [ ... this.interactionTotals ]
            .sort( ( a, b ) => b[ 1 ].totalMs - a[ 1 ].totalMs )
            .slice( 0, SUMMARY_TOP_SPANS )
            .map( ( [ name, total ] ) => this.formatTotal( name, total ) + `, slow ${ total.slow }` );

        const spans = [ ... this.spanTotals ]
            .sort( ( a, b ) => b[ 1 ].totalMs - a[ 1 ].totalMs )
            .slice( 0, SUMMARY_TOP_SPANS )
            .map( ( [ label, total ] ) => this.formatTotal( label, total ) );

        const stalls = this.stallsSinceSummary;

        this.logger.info(
            this.logSummary,
            [
                `Where the time went, last ${ Math.round( INTERACTION_TRACE_SUMMARY_INTERVAL_MS / 60000 ) } minutes:`,
                `  event loop stalls: ${ stalls.count }x, ${ Math.round( stalls.totalMs ) }ms total, worst ${ Math.round( stalls.maxMs ) }ms`,
                "  interactions ( by total time ):",
                ... interactions.map( ( line ) => `    ${ line }` ),
                "  waits ( by total time ):",
                ... spans.map( ( line ) => `    ${ line }` )
            ].join( "\n" )
        );

        this.spanTotals.clear();
        this.interactionTotals.clear();
        this.stallsSinceSummary = { count: 0, totalMs: 0, maxMs: 0 };
    }

    private finish( context: IInteractionTraceContext ) {
        const totalMs = performance.now() - context.startedAt,
            isSlow = totalMs + context.queuedMs >= INTERACTION_TRACE_SLOW_MS;

        this.addTotal( this.interactionTotals, context.name, totalMs );

        const total = this.interactionTotals.get( context.name )!;

        total.slow = ( total.slow ?? 0 ) + ( isSlow ? 1 : 0 );

        if ( isSlow ) {
            this.logger.warn( this.finish, `Slow interaction ${ this.describe( context, totalMs ) }` );
        }
    }

    private getMaxStallBetween( from: number, to: number ) {
        let max = 0;

        for ( const stall of this.stalls ) {
            // A stall is recorded when it ends, so one that began inside the window may be
            // recorded just after it.
            if ( stall.at >= from && stall.at - stall.ms <= to ) {
                max = Math.max( max, stall.ms );
            }
        }

        return max;
    }

    private addTotal<TTotal extends IInteractionTraceTotal>( totals: Map<string, TTotal>, key: string, ms: number ) {
        const total = totals.get( key ) ?? { count: 0, totalMs: 0, maxMs: 0 } as TTotal;

        total.count++;
        total.totalMs += ms;
        total.maxMs = Math.max( total.maxMs, ms );

        totals.set( key, total );
    }

    private formatTotal( label: string, total: IInteractionTraceTotal ) {
        return `${ label } - ${ total.count }x, ${ Math.round( total.totalMs ) }ms total, ` +
            `avg ${ Math.round( total.totalMs / total.count ) }ms, max ${ Math.round( total.maxMs ) }ms`;
    }
}
