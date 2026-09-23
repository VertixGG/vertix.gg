import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type { TLogLevelName } from "@vertix.gg/base/src/modules/logger";

const DEFAULT_DEDUPE_WINDOW_MS = 300000;
const DEFAULT_MAX_ALERTS_PER_MINUTE = 5;

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_TRACKED_KEYS = 512;

const DISCORD_EMBED_TITLE_LIMIT = 256;
const DISCORD_EMBED_DESCRIPTION_LIMIT = 4096;
const DISCORD_EMBED_FIELD_VALUE_LIMIT = 1024;
const DISCORD_EMBED_ERROR_COLOR = 0xED4245;

const CODE_FENCE_OVERHEAD = 8;

const WEBHOOK_TIMEOUT_MS = 5000;

const ANSI_ESCAPE_PATTERN = new RegExp( String.fromCharCode( 27 ) + "\\[[0-9;]*m", "g" );

const STACK_FRAME_LIMIT = 6;

const CONTEXT_LINES_KEPT = 24;
const CONTEXT_LINES_REPORTED = 8;
const CONTEXT_LINE_LIMIT = 140;

const ABSOLUTE_PREFIX_PATTERN = /\/\S*\/(?=(?:apps|packages|scripts)\/)/g;

/**
 * What a log line carries beside its message.
 *
 * Narrower than the `any[]` the logger emits, which it can be because the event bus hands a
 * listener its arguments untyped - so this states what is read here rather than what was sent.
 * Nothing below does more than test for `Error` and stringify, both of which hold for any value.
 */
type TAlertParam = Error | string | number | boolean | null | undefined | object;

type TLogOutputArgs = [
    level: TLogLevelName,
    prefix: string,
    timeDiff: string,
    source: string,
    messagePrefix: string,
    message: string,
    params: TAlertParam[]
];

/**
 * Each service's bus subscription, held here rather than on the instance.
 *
 * `ServiceBase` calls `initialize()` from its constructor, and a subclass's field initializers run
 * after `super()` returns - so anything `initialize()` assigns to a field of its own is overwritten
 * a moment later by that field's declaration. A subscription lost that way cannot be removed again,
 * and the listeners accumulate silently. Module scope is not subject to that ordering.
 */
const subscriptions = new WeakMap<ErrorAlertService, ( ... args: TLogOutputArgs ) => void>();

interface IDedupeEntry {
    lastSentAt: number;
    suppressed: number;
}

interface IAlert {
    preceding: string[];
    source: string;
    messagePrefix: string;
    message: string;
    params: TAlertParam[];
    suppressedRepeats: number;
    droppedByRateLimit: number;
}

function stripAnsi( value: string ): string {
    return value.replace( ANSI_ESCAPE_PATTERN, "" );
}

function truncate( value: string, limit: number ): string {
    return value.length > limit ? value.slice( 0, limit - 1 ) + "…" : value;
}

/**
 * A heading for a line that was logged without one.
 *
 * Fifty-one call sites read `logger.error( caller, "", error )` - the message is empty and the
 * error is a parameter - and they are the "something threw" ones, which is most of what is worth
 * being told about. Discord takes an empty title and draws the embed without a heading at all, so
 * the error the line was carrying is used instead.
 */
function describeFailure( params: TAlertParam[] ): string {
    const error = params.find( ( param ): param is Error => param instanceof Error );

    return error ? `${ error.name }: ${ error.message }` : "";
}

/**
 * The frames of a stack, as short as they can be and still be followed.
 *
 * A raw stack is mostly the absolute path of the machine it ran on, repeated on every line - in a
 * discord embed that wraps over three lines per frame and buries the two or three that say
 * anything. Paths are cut back to their place in the repo, frames inside `node_modules` and node
 * itself are dropped, and only the first few are kept: the ones below are the runtime calling in,
 * which is the same for every failure.
 */
function formatStack( stack: string ): string {
    const [ , ... frames ] = stack.split( "\n" );

    return frames
        .filter( ( frame ) => ! frame.includes( "node_modules" ) && ! frame.includes( "(node:" ) )
        .slice( 0, STACK_FRAME_LIMIT )
        .map( ( frame ) => frame.trim().replace( ABSOLUTE_PREFIX_PATTERN, "" ) )
        .join( "\n" );
}

/**
 * What the line carried, under its heading.
 *
 * An error whose text is already the heading contributes only its frames - printed again it is the
 * same sentence twice, once as the title and once as the first line of the block under it.
 */
function describeParams( params: TAlertParam[], heading: string ): string {
    const described = params.map( ( param ) => {
        if ( param instanceof Error ) {
            const summary = `${ param.name }: ${ param.message }`;
            const frames = formatStack( param.stack ?? "" );

            return summary === heading ? frames : [ summary, frames ].filter( Boolean ).join( "\n" );
        }

        if ( "object" === typeof param && null !== param ) {
            try {
                return JSON.stringify( param );
            } catch {
                return String( param );
            }
        }

        return String( param );
    } );

    return stripAnsi( described.filter( Boolean ).join( "\n" ) ).trim();
}

/**
 * Reports error lines to a discord webhook, so a failure does not wait for somebody to read a log.
 *
 * Subscribes to the same event the logger client uses, keeps the `ERROR` lines, and drops anything
 * it has already reported recently or anything over the per-minute cap - a failure that repeats a
 * thousand times is one alert, and the counts it held back ride along on the next one rather than
 * being lost.
 *
 * Its own failures go to `console.error`. Reporting them through the logger would re-enter here and
 * a webhook outage would become a loop.
 */
export class ErrorAlertService extends ServiceBase {
    private readonly dedupe = new Map<string, IDedupeEntry>();

    private readonly inFlight = new Set<Promise<void>>();

    private rateWindowStartedAt = 0;

    private sentInRateWindow = 0;

    private droppedByRateLimit = 0;

    private readonly recent: string[] = [];

    public static getName(): string {
        return "VertixBase/Modules/ErrorAlertService";
    }

    protected async initialize(): Promise<void> {
        if ( "true" === process.env.LOGGER_DISABLED ) {
            return;
        }

        const subscription = this.onLoggerOutput.bind( this );

        subscriptions.set( this, subscription );

        EventBus.$.on( "VertixBase/Modules/Logger", "outputEvent", subscription );
    }

    public async stop(): Promise<void> {
        const subscription = subscriptions.get( this );

        if ( ! subscription ) {
            return;
        }

        EventBus.$.off( "VertixBase/Modules/Logger", "outputEvent", subscription );

        subscriptions.delete( this );

        await this.flush();
    }

    /**
     * Waits for everything an already-logged error may still turn into.
     *
     * The event bus hooks `outputEvent` with an `async` wrapper that awaits before it emits, so a
     * line is still only a pending microtask when `logger.error()` returns - waiting on the
     * in-flight set alone finds it empty and answers immediately. Yielding a turn first is what
     * makes this mean anything on the fatal path, where the next statement ends the process.
     */
    public async flush(): Promise<void> {
        await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

        while ( this.inFlight.size ) {
            await Promise.allSettled( Array.from( this.inFlight ) );
        }
    }

    private getWebhookUrl(): string {
        return process.env.DISCORD_ERROR_WEBHOOK_URL || "";
    }

    private getProcessName(): string {
        return process.env.LOGGER_PROCESS_NAME || process.env.npm_package_name || "unknown";
    }

    private getDedupeWindowMs(): number {
        return this.readPositiveInt( process.env.ERROR_ALERT_DEDUPE_WINDOW_MS, DEFAULT_DEDUPE_WINDOW_MS );
    }

    private getMaxAlertsPerMinute(): number {
        return this.readPositiveInt( process.env.ERROR_ALERT_MAX_PER_MINUTE, DEFAULT_MAX_ALERTS_PER_MINUTE );
    }

    private readPositiveInt( value: string | undefined, fallback: number ): number {
        const parsed = parseInt( value || "", 10 );

        return Number.isFinite( parsed ) && parsed > 0 ? parsed : fallback;
    }

    private onLoggerOutput( ... [ level, , , source, messagePrefix, message, params ]: TLogOutputArgs ): void {
        const plainSource = stripAnsi( source );

        if ( plainSource.includes( "VertixBase/Modules/ErrorAlertService" ) ) {
            return;
        }

        /*
         * Every level is remembered and only `ERROR` is reported, so this runs before the filter
         * below - the point of keeping them is that the lines leading up to an error are the ones
         * that were not themselves errors. Read before the current line is added, so an alert does
         * not open with a copy of its own heading.
         */
        const preceding = this.recent.slice( - CONTEXT_LINES_REPORTED );

        this.remember( level, plainSource, messagePrefix, message );

        if ( "ERROR" !== level ) {
            return;
        }

        if ( ! this.getWebhookUrl() ) {
            return;
        }

        const suppressedRepeats = this.takeDedupeSlot( `${ plainSource }::${ message }` );

        if ( null === suppressedRepeats ) {
            return;
        }

        if ( ! this.takeRateLimitSlot() ) {
            return;
        }

        const droppedByRateLimit = this.droppedByRateLimit;

        this.droppedByRateLimit = 0;

        this.track( this.send( {
            preceding,
            source: plainSource,
            messagePrefix,
            message,
            params: params ?? [],
            suppressedRepeats,
            droppedByRateLimit
        } ) );
    }

    /**
     * Holds the last few lines this process logged, at any level.
     *
     * An error on its own says what broke and not what the process was doing - which is usually the
     * question. Every line passes through here already, so the few before an error are in hand
     * without asking anything to keep a second copy.
     */
    private remember( level: TLogLevelName, source: string, messagePrefix: string, message: string ): void {
        this.recent.push( truncate( `[${ level }] ${ source }${ messagePrefix }: ${ message }`, CONTEXT_LINE_LIMIT ) );

        if ( this.recent.length > CONTEXT_LINES_KEPT ) {
            this.recent.splice( 0, this.recent.length - CONTEXT_LINES_KEPT );
        }
    }

    /**
     * Answers how many repeats were held back since this key was last reported, or `null` when this
     * one is itself a repeat and should not be reported at all.
     */
    private takeDedupeSlot( key: string ): number | null {
        const now = Date.now();
        const windowMs = this.getDedupeWindowMs();
        const seen = this.dedupe.get( key );

        if ( seen && now - seen.lastSentAt < windowMs ) {
            seen.suppressed++;

            return null;
        }

        this.dedupe.set( key, { lastSentAt: now, suppressed: 0 } );

        this.prune( now, windowMs );

        return seen?.suppressed ?? 0;
    }

    private takeRateLimitSlot(): boolean {
        const now = Date.now();

        if ( now - this.rateWindowStartedAt >= RATE_LIMIT_WINDOW_MS ) {
            this.rateWindowStartedAt = now;
            this.sentInRateWindow = 0;
        }

        if ( this.sentInRateWindow >= this.getMaxAlertsPerMinute() ) {
            this.droppedByRateLimit++;

            return false;
        }

        this.sentInRateWindow++;

        return true;
    }

    private prune( now: number, windowMs: number ): void {
        if ( this.dedupe.size <= MAX_TRACKED_KEYS ) {
            return;
        }

        for ( const [ key, entry ] of this.dedupe ) {
            if ( now - entry.lastSentAt >= windowMs ) {
                this.dedupe.delete( key );
            }
        }
    }

    private track( promise: Promise<void> ): void {
        this.inFlight.add( promise );

        void promise.finally( () => this.inFlight.delete( promise ) );
    }

    private async send( alert: IAlert ): Promise<void> {
        const webhookUrl = this.getWebhookUrl();

        if ( ! webhookUrl ) {
            return;
        }

        try {
            const response = await fetch( webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( this.buildPayload( alert ) ),
                signal: AbortSignal.timeout( WEBHOOK_TIMEOUT_MS )
            } );

            if ( ! response.ok ) {
                console.error( `VertixBase/Modules/ErrorAlertService: webhook answered ${ response.status } ${ response.statusText }` );
            }
        } catch( error ) {
            console.error( "VertixBase/Modules/ErrorAlertService: failed to deliver an alert", error );
        }
    }

    private buildPayload( alert: IAlert ) {
        const heading = ( alert.messagePrefix + alert.message )
            || describeFailure( alert.params )
            || alert.source;

        const details = describeParams( alert.params, heading );

        const heldBack: string[] = [];

        if ( alert.suppressedRepeats > 0 ) {
            heldBack.push( `${ alert.suppressedRepeats } repeat(s) suppressed` );
        }

        if ( alert.droppedByRateLimit > 0 ) {
            heldBack.push( `${ alert.droppedByRateLimit } other alert(s) dropped by the rate limit` );
        }

        return {
            username: this.getProcessName(),
            embeds: [ {
                title: truncate( heading, DISCORD_EMBED_TITLE_LIMIT ),
                description: details
                    ? "```\n" + truncate( details, DISCORD_EMBED_DESCRIPTION_LIMIT - CODE_FENCE_OVERHEAD ) + "\n```"
                    : undefined,
                color: DISCORD_EMBED_ERROR_COLOR,
                fields: [
                    {
                        name: "Source",
                        value: truncate( alert.source, DISCORD_EMBED_FIELD_VALUE_LIMIT )
                    },
                    ... alert.preceding.length
                        ? [ {
                            name: "Just before",
                            value: truncate(
                                "```\n" + alert.preceding.join( "\n" ) + "\n```",
                                DISCORD_EMBED_FIELD_VALUE_LIMIT
                            )
                        } ]
                        : []
                ],
                footer: heldBack.length ? { text: heldBack.join( " · " ) } : undefined,
                timestamp: new Date().toISOString()
            } ]
        };
    }
}

export default ErrorAlertService;
