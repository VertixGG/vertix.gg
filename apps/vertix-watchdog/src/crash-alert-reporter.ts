import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { WATCHDOG_DEFAULTS, WATCHDOG_EMBED } from "@vertix.gg/watchdog/src/constants";

import type { IAlertReporter, ICrashAlert, TCrashAlertKind } from "@vertix.gg/watchdog/src/watchdog-definitions";

/**
 * `apps` holds more than one only for the kinds that collapse a whole deploy into a single notice,
 * so the rest read the first and ignore the shape.
 */
const HEADLINES: Record<TCrashAlertKind, ( apps: string[] ) => string> = {
    "down": ( apps ) => `${ apps[ 0 ] } went down`,
    "gave-up": ( apps ) => `pm2 gave up on ${ apps[ 0 ] }`,
    "revived": ( apps ) => `${ apps[ 0 ] } restarted by the watchdog`,
    "recovered": ( apps ) => `${ apps[ 0 ] } is back`,
    "redeployed": ( apps ) => apps.length > 1
        ? `${ apps.length } apps redeployed`
        : `${ apps[ 0 ] } redeployed`,
    "stopped": ( apps ) => apps.length > 1
        ? `${ apps.length } apps stopped`
        : `${ apps[ 0 ] } stopped`
};

const COLORS: Record<TCrashAlertKind, number> = {
    "down": WATCHDOG_EMBED.COLOR_DOWN,
    "gave-up": WATCHDOG_EMBED.COLOR_GAVE_UP,
    "revived": WATCHDOG_EMBED.COLOR_REVIVED,
    "recovered": WATCHDOG_EMBED.COLOR_RECOVERED,
    "redeployed": WATCHDOG_EMBED.COLOR_REDEPLOYED,
    "stopped": WATCHDOG_EMBED.COLOR_STOPPED
};

/**
 * Only these two are worth interrupting somebody for. A revival and a recovery are the watchdog
 * reporting that it handled something, which is worth a line in the channel and not a ping.
 */
const MENTIONED_KINDS: ReadonlySet<TCrashAlertKind> = new Set<TCrashAlertKind>( [ "down", "gave-up" ] );

function truncate( value: string, limit: number ): string {
    return value.length > limit ? value.slice( 0, limit - 1 ) + "…" : value;
}

/**
 * Posts crash notices straight to the discord webhook.
 *
 * Deliberately not routed through `Logger` and the event bus the way `ErrorAlertService` is. That
 * service reports what a *living* process logged, so it can afford to depend on the logger being
 * up; this one reports that a process died, and the logger is one of the things that can have died
 * with it. Its own failures go to `console.error` for the same reason.
 */
export class CrashAlertReporter extends InitializeBase implements IAlertReporter {
    private readonly inFlight = new Set<Promise<void>>();

    public constructor() {
        super();
    }

    public static getName(): string {
        return "VertixWatchdog/CrashAlertReporter";
    }

    public async report( alert: ICrashAlert ): Promise<void> {
        const webhookUrl = this.getWebhookUrl();

        if ( ! webhookUrl ) {
            return;
        }

        const promise = this.send( webhookUrl, alert );

        this.inFlight.add( promise );

        void promise.finally( () => this.inFlight.delete( promise ) );

        return promise;
    }

    public async flush(): Promise<void> {
        while ( this.inFlight.size ) {
            await Promise.allSettled( Array.from( this.inFlight ) );
        }
    }

    private getWebhookUrl(): string {
        return process.env.WATCHDOG_WEBHOOK_URL || process.env.DISCORD_ERROR_WEBHOOK_URL || "";
    }

    private getMention(): string {
        return process.env.WATCHDOG_ALERT_MENTION || "";
    }

    private async send( webhookUrl: string, alert: ICrashAlert ): Promise<void> {
        try {
            const response = await fetch( webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( this.buildPayload( alert ) ),
                signal: AbortSignal.timeout( WATCHDOG_DEFAULTS.WEBHOOK_TIMEOUT_MS )
            } );

            if ( ! response.ok ) {
                console.error( `VertixWatchdog/CrashAlertReporter: webhook answered ${ response.status } ${ response.statusText }` );
            }
        } catch( error ) {
            console.error( "VertixWatchdog/CrashAlertReporter: failed to deliver an alert", error );
        }
    }

    private buildPayload( alert: ICrashAlert ) {
        const mention = MENTIONED_KINDS.has( alert.kind ) ? this.getMention() : "";

        const fields = [
            ... alert.apps.length > 1
                ? [ { name: "Apps", value: truncate( alert.apps.join( ", " ), WATCHDOG_EMBED.FIELD_VALUE_LIMIT ) } ]
                : [],
            ... alert.status ? [ { name: "Status", value: alert.status, inline: true } ] : [],
            ... undefined !== alert.exitCode ? [ { name: "Exit code", value: String( alert.exitCode ), inline: true } ] : [],
            ... undefined !== alert.restarts ? [ { name: "Restarts", value: String( alert.restarts ), inline: true } ] : []
        ];

        const heldBack = alert.suppressedRepeats
            ? `${ alert.suppressedRepeats } repeat(s) suppressed`
            : "";

        return {
            username: "vertix-watchdog",
            content: mention || undefined,
            allowed_mentions: mention ? { parse: [ "users", "roles" ] } : { parse: [] },
            embeds: [ {
                title: truncate( HEADLINES[ alert.kind ]( alert.apps ), WATCHDOG_EMBED.TITLE_LIMIT ),
                description: truncate( alert.detail, WATCHDOG_EMBED.FIELD_VALUE_LIMIT ),
                color: COLORS[ alert.kind ],
                fields,
                footer: heldBack ? { text: heldBack } : undefined,
                timestamp: new Date().toISOString()
            } ]
        };
    }
}

export default CrashAlertReporter;
