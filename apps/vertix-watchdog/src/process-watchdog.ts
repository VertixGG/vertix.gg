import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PM2_EVENT, PM2_STATUS, WATCHDOG_DEFAULTS } from "@vertix.gg/watchdog/src/constants";

import type {
    IAlertReporter,
    IPm2EventPacket,
    IPm2ProcessDescription,
    IProcessSupervisor
} from "@vertix.gg/watchdog/src/watchdog-definitions";

interface IWatchedApp {
    reportedDownAt: number;
    suppressedRepeats: number;
    reviveAttempts: number;
    reviveTimer?: ReturnType<typeof setTimeout>;
}

/**
 * The one app never watched: it cannot report its own death, and reviving itself is a contradiction.
 * pm2's own `autorestart` is what covers this process.
 */
const SELF_APP_NAME = "vertix-watchdog";

export interface IProcessWatchdogArgs {
    supervisor: IProcessSupervisor;
    reporter: IAlertReporter;
}

/**
 * Reports pm2 app deaths to discord, and starts back what pm2 has stopped starting.
 *
 * pm2 already restarts a crashed app, so that is not what this is for. It exists for the two things
 * pm2 does silently: it tells nobody, and after `max_restarts` unstable restarts it marks the app
 * `errored` and stops trying - which is the state an app is in when it has been down all night.
 *
 * Reviving is deliberately tied to that one signal rather than to any app that is merely not
 * running. An app somebody stopped by hand is `stopped`, not `errored`, and starting it back would
 * be the watchdog fighting whoever stopped it.
 */
export class ProcessWatchdog extends InitializeBase {
    private readonly supervisor: IProcessSupervisor;

    private readonly reporter: IAlertReporter;

    private readonly watched = new Map<string, IWatchedApp>();

    private reconcileTimer?: ReturnType<typeof setInterval>;

    public constructor( args: IProcessWatchdogArgs ) {
        super();

        this.supervisor = args.supervisor;
        this.reporter = args.reporter;
    }

    public static getName(): string {
        return "VertixWatchdog/ProcessWatchdog";
    }

    public async start(): Promise<void> {
        await this.supervisor.onEvent( ( packet ) => this.handleEvent( packet ) );

        this.reconcileTimer = setInterval(
            () => void this.reconcile(),
            this.getReconcileIntervalMs()
        );

        this.logger.info( this.start, "Watching pm2 for crashes" );
    }

    public async stop(): Promise<void> {
        if ( this.reconcileTimer ) {
            clearInterval( this.reconcileTimer );

            this.reconcileTimer = undefined;
        }

        for ( const app of this.watched.values() ) {
            if ( app.reviveTimer ) {
                clearTimeout( app.reviveTimer );

                app.reviveTimer = undefined;
            }
        }

        await this.reporter.flush();
    }

    public handleEvent( packet: IPm2EventPacket ): void {
        const name = packet.process?.name;

        if ( ! name || ! this.shouldWatch( name ) ) {
            return;
        }

        switch ( packet.event ) {
            case PM2_EVENT.RESTART_OVERLIMIT:
                this.onGaveUp( name, packet.process );
                break;

            case PM2_EVENT.EXIT:
                this.onExit( name, packet.process );
                break;
        }
    }

    /**
     * Sweeps for the states the bus cannot tell us about.
     *
     * A watchdog that started after an app had already gone `errored` never saw its
     * `restart overlimit`, and one whose bus dropped a packet never will. The status pm2 reports now
     * is the thing that is true either way.
     */
    public async reconcile(): Promise<void> {
        let apps: IPm2ProcessDescription[];

        try {
            apps = await this.supervisor.list();
        } catch( error ) {
            this.logger.error( this.reconcile, "Could not list pm2 apps", error );

            return;
        }

        for ( const app of apps ) {
            const name = app.name;

            if ( ! name || ! this.shouldWatch( name ) ) {
                continue;
            }

            if ( PM2_STATUS.ERRORED === app.status ) {
                this.scheduleRevive( name );

                continue;
            }

            if ( PM2_STATUS.ONLINE !== app.status ) {
                continue;
            }

            if ( this.hasHeldFor( app, WATCHDOG_DEFAULTS.RECOVERY_UPTIME_MS ) ) {
                this.reportRecovery( name );
            }

            if ( this.hasHeldFor( app, WATCHDOG_DEFAULTS.STABLE_UPTIME_MS ) ) {
                this.forget( name );
            }
        }
    }

    private shouldWatch( name: string ): boolean {
        if ( SELF_APP_NAME === name ) {
            return false;
        }

        return ! this.getIgnoredApps().includes( name );
    }

    private getIgnoredApps(): string[] {
        return ( process.env.WATCHDOG_IGNORED_APPS || "" )
            .split( "," )
            .map( ( name ) => name.trim() )
            .filter( Boolean );
    }

    private getReconcileIntervalMs(): number {
        return this.readPositiveInt(
            process.env.WATCHDOG_RECONCILE_INTERVAL_MS,
            WATCHDOG_DEFAULTS.RECONCILE_INTERVAL_MS
        );
    }

    private getDedupeWindowMs(): number {
        return this.readPositiveInt(
            process.env.WATCHDOG_DEDUPE_WINDOW_MS,
            WATCHDOG_DEFAULTS.DEDUPE_WINDOW_MS
        );
    }

    private getReviveInitialDelayMs(): number {
        return this.readPositiveInt(
            process.env.WATCHDOG_REVIVE_INITIAL_DELAY_MS,
            WATCHDOG_DEFAULTS.REVIVE_INITIAL_DELAY_MS
        );
    }

    private getReviveMaxDelayMs(): number {
        return this.readPositiveInt(
            process.env.WATCHDOG_REVIVE_MAX_DELAY_MS,
            WATCHDOG_DEFAULTS.REVIVE_MAX_DELAY_MS
        );
    }

    private readPositiveInt( value: string | undefined, fallback: number ): number {
        const parsed = parseInt( value || "", 10 );

        return Number.isFinite( parsed ) && parsed > 0 ? parsed : fallback;
    }

    private entry( name: string ): IWatchedApp {
        let app = this.watched.get( name );

        if ( ! app ) {
            app = { reportedDownAt: 0, suppressedRepeats: 0, reviveAttempts: 0 };

            this.watched.set( name, app );
        }

        return app;
    }

    private hasHeldFor( app: IPm2ProcessDescription, ms: number ): boolean {
        if ( ! app.pm_uptime ) {
            return false;
        }

        return Date.now() - app.pm_uptime >= ms;
    }

    private onExit( name: string, description?: IPm2ProcessDescription ): void {
        const app = this.entry( name );

        /*
         * A deliberate `pm2 stop` emits `exit` twice - once while the status is still `stopping` and
         * again once it is `stopped` - and a crash loop emits one per restart. Both are the same
         * event to anyone reading the channel, so the window collapses them and the next alert
         * carries the count.
         */
        if ( Date.now() - app.reportedDownAt < this.getDedupeWindowMs() ) {
            app.suppressedRepeats++;

            return;
        }

        const suppressedRepeats = app.suppressedRepeats;

        app.reportedDownAt = Date.now();
        app.suppressedRepeats = 0;

        void this.reporter.report( {
            kind: "down",
            app: name,
            detail: PM2_STATUS.STOPPING === description?.status
                ? "Stopped. pm2 was asked for this, so nothing will be started back."
                : "pm2 is restarting it.",
            status: description?.status,
            exitCode: description?.exit_code,
            restarts: description?.restart_time,
            suppressedRepeats
        } );
    }

    private onGaveUp( name: string, description?: IPm2ProcessDescription ): void {
        void this.reporter.report( {
            kind: "gave-up",
            app: name,
            detail: "Too many unstable restarts - pm2 marked it errored and stopped trying. The watchdog will start it back.",
            status: PM2_STATUS.ERRORED,
            exitCode: description?.exit_code,
            restarts: description?.restart_time
        } );

        this.scheduleRevive( name );
    }

    /**
     * Says an app is back only once it has stayed back.
     *
     * pm2's `online` event fires the moment it spawns the process, which for an app that dies on
     * startup is true for about as long as it takes to read. Reporting from that event turned a
     * crash loop into a column of alternating "went down" and "is back" - every one of them
     * accurate at the instant it was sent, and the pair of them together saying nothing. Uptime is
     * the thing that distinguishes a process that started from one that recovered.
     */
    private reportRecovery( name: string ): void {
        const app = this.watched.get( name );

        if ( ! app?.reportedDownAt ) {
            return;
        }

        app.reportedDownAt = 0;
        app.suppressedRepeats = 0;

        void this.reporter.report( {
            kind: "recovered",
            app: name,
            detail: "Running again, and has stayed up.",
            status: PM2_STATUS.ONLINE
        } );
    }

    /**
     * Backs off rather than hammering: an app that goes straight back to `errored` is one that is
     * broken rather than unlucky, and starting it every thirty seconds turns one outage into a
     * channel full of alerts. The delay doubles up to the cap, and `reconcile()` clears the count
     * once the app has held for long enough to call it recovered.
     */
    private scheduleRevive( name: string ): void {
        const app = this.entry( name );

        if ( app.reviveTimer ) {
            return;
        }

        const delay = Math.min(
            this.getReviveInitialDelayMs() * Math.pow( WATCHDOG_DEFAULTS.REVIVE_BACKOFF_FACTOR, app.reviveAttempts ),
            this.getReviveMaxDelayMs()
        );

        app.reviveAttempts++;

        app.reviveTimer = setTimeout( () => {
            app.reviveTimer = undefined;

            void this.revive( name, delay );
        }, delay );
    }

    private async revive( name: string, waitedMs: number ): Promise<void> {
        try {
            await this.supervisor.restart( name );
        } catch( error ) {
            this.logger.error( this.revive, `Could not restart ${ name }`, error );

            return;
        }

        void this.reporter.report( {
            kind: "revived",
            app: name,
            detail: `Started back after waiting ${ Math.round( waitedMs / 1000 ) }s.`
        } );
    }

    private forget( name: string ): void {
        const app = this.watched.get( name );

        if ( ! app || app.reviveTimer ) {
            return;
        }

        this.watched.delete( name );
    }
}

export default ProcessWatchdog;
