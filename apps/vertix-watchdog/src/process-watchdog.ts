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

    /**
     * Apps pm2 was asked to stop, and how many settle rounds each has waited.
     *
     * Held rather than reported, because at the moment of the `exit` a deliberate stop and the first
     * half of a redeploy are the same event - the difference is whether the app comes back, which is
     * only knowable later.
     */
    private readonly settling = new Map<string, number>();

    private settleTimer?: ReturnType<typeof setTimeout>;

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

        if ( this.settleTimer ) {
            clearTimeout( this.settleTimer );

            this.settleTimer = undefined;
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

    private getSettleMs(): number {
        return this.readPositiveInt(
            process.env.WATCHDOG_DELIBERATE_SETTLE_MS,
            WATCHDOG_DEFAULTS.DELIBERATE_SETTLE_MS
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
        /*
         * A deliberate stop emits `exit` twice - once while the status is still `stopping`, and
         * again from the stop itself once it is `stopped`. The second is indistinguishable from a
         * crash, so an app already waiting to settle ignores anything further.
         */
        if ( this.settling.has( name ) ) {
            return;
        }

        if ( PM2_STATUS.STOPPING === description?.status ) {
            this.deferSettle( name );

            return;
        }

        const app = this.entry( name );

        // A crash loop emits one of these per restart, and they are one event to anyone reading the
        // channel, so the window collapses them and the next alert carries the count.
        if ( Date.now() - app.reportedDownAt < this.getDedupeWindowMs() ) {
            app.suppressedRepeats++;

            return;
        }

        const suppressedRepeats = app.suppressedRepeats;

        app.reportedDownAt = Date.now();
        app.suppressedRepeats = 0;

        void this.reporter.report( {
            kind: "down",
            apps: [ name ],
            detail: "pm2 is restarting it.",
            status: description?.status,
            exitCode: description?.exit_code,
            restarts: description?.restart_time,
            suppressedRepeats
        } );
    }

    /**
     * Holds a deliberate stop back until it is clear what it was.
     *
     * One timer for all of them, started by the first and joined by whatever follows: a deploy takes
     * every app down within a few seconds of each other, so batching by time is what turns six
     * notices into one. Reported late on purpose - none of this is an incident, and a notice that is
     * right ninety seconds on beats six that are wrong immediately.
     */
    private deferSettle( name: string ): void {
        this.settling.set( name, 0 );

        if ( this.settleTimer ) {
            return;
        }

        this.settleTimer = setTimeout( () => {
            this.settleTimer = undefined;

            void this.settle();
        }, this.getSettleMs() );
    }

    private async settle(): Promise<void> {
        let apps: IPm2ProcessDescription[];

        try {
            apps = await this.supervisor.list();
        } catch( error ) {
            this.logger.error( this.settle, "Could not list pm2 apps", error );

            this.settling.clear();

            return;
        }

        const statuses = new Map( apps.map( ( app ) => [ app.name ?? "", app.status ] ) );

        const redeployed: string[] = [];
        const stopped: string[] = [];

        for ( const [ name, rounds ] of Array.from( this.settling ) ) {
            const status = statuses.get( name );

            if ( PM2_STATUS.ONLINE === status ) {
                redeployed.push( name );
                this.settling.delete( name );

                continue;
            }

            /*
             * Still on its way up - the ordered restart waits for each app's port before starting the
             * next, so the last of them can be a minute behind the first.
             *
             * An app pm2 does not have at all counts as on its way up rather than gone, because the
             * deploy everybody runs deletes every app and starts it again: absent is what the middle
             * of a redeploy looks like, and reading it as gone reported a healthy deploy as an
             * outage. It is only called stopped once the rounds run out.
             */
            const isSettled = PM2_STATUS.STOPPED === status || PM2_STATUS.ERRORED === status;

            if ( ! isSettled && rounds + 1 < WATCHDOG_DEFAULTS.DELIBERATE_SETTLE_ROUNDS ) {
                this.settling.set( name, rounds + 1 );

                continue;
            }

            stopped.push( name );
            this.settling.delete( name );
        }

        if ( redeployed.length ) {
            void this.reporter.report( {
                kind: "redeployed",
                apps: redeployed,
                detail: "Stopped and came back, so this was a restart rather than an outage."
            } );
        }

        if ( stopped.length ) {
            void this.reporter.report( {
                kind: "stopped",
                apps: stopped,
                detail: "pm2 was asked to stop these and they have not come back. Nothing will be started back.",
                status: PM2_STATUS.STOPPED
            } );
        }

        if ( this.settling.size ) {
            this.settleTimer = setTimeout( () => {
                this.settleTimer = undefined;

                void this.settle();
            }, this.getSettleMs() );
        }
    }

    private onGaveUp( name: string, description?: IPm2ProcessDescription ): void {
        void this.reporter.report( {
            kind: "gave-up",
            apps: [ name ],
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
            apps: [ name ],
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
            apps: [ name ],
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
