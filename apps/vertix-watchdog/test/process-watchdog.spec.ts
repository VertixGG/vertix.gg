import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { ProcessWatchdog } from "@vertix.gg/watchdog/src/process-watchdog";

import type {
    IAlertReporter,
    ICrashAlert,
    IPm2ProcessDescription,
    IProcessSupervisor
} from "@vertix.gg/watchdog/src/watchdog-definitions";

const REVIVE_INITIAL_DELAY_MS = 30000;

class FakeReporter implements IAlertReporter {
    public readonly alerts: ICrashAlert[] = [];

    public async report( alert: ICrashAlert ): Promise<void> {
        this.alerts.push( alert );
    }

    public async flush(): Promise<void> {
        return;
    }

    public kinds(): string[] {
        return this.alerts.map( ( alert ) => alert.kind );
    }
}

class FakeSupervisor implements IProcessSupervisor {
    public readonly restarted: string[] = [];

    public listed: IPm2ProcessDescription[] = [];

    public listError?: Error;

    public restartError?: Error;

    public async onEvent(): Promise<void> {
        return;
    }

    public async list(): Promise<IPm2ProcessDescription[]> {
        if ( this.listError ) {
            throw this.listError;
        }

        return this.listed;
    }

    public async restart( name: string ): Promise<void> {
        if ( this.restartError ) {
            throw this.restartError;
        }

        this.restarted.push( name );
    }
}

describe( "VertixWatchdog/ProcessWatchdog", () => {
    let supervisor: FakeSupervisor;
    let reporter: FakeReporter;
    let watchdog: ProcessWatchdog;

    beforeEach( () => {
        jest.useFakeTimers();

        delete process.env.WATCHDOG_IGNORED_APPS;

        supervisor = new FakeSupervisor();
        reporter = new FakeReporter();
        watchdog = new ProcessWatchdog( { supervisor, reporter } );
    } );

    describe( "handleEvent()", () => {
        it( "should report an app that exited", () => {
            watchdog.handleEvent( {
                event: "exit",
                process: { name: "vertix-api", status: "stopped", exit_code: 1, restart_time: 3 }
            } );

            expect( reporter.alerts ).toHaveLength( 1 );
            expect( reporter.alerts[ 0 ] ).toMatchObject( {
                kind: "down",
                app: "vertix-api",
                exitCode: 1,
                restarts: 3
            } );
        } );

        it( "should collapse repeated exits into one alert and carry the count", () => {
            const exit = {
                event: "exit",
                process: { name: "vertix-api", status: "stopped" }
            };

            watchdog.handleEvent( exit );
            watchdog.handleEvent( exit );
            watchdog.handleEvent( exit );

            expect( reporter.alerts ).toHaveLength( 1 );

            jest.advanceTimersByTime( 60000 );

            watchdog.handleEvent( exit );

            expect( reporter.alerts ).toHaveLength( 2 );
            expect( reporter.alerts[ 1 ].suppressedRepeats ).toBe( 2 );
        } );

        it( "should say nothing will be started back when the stop was asked for", () => {
            watchdog.handleEvent( {
                event: "exit",
                process: { name: "vertix-api", status: "stopping" }
            } );

            expect( reporter.alerts[ 0 ].detail ).toContain( "nothing will be started back" );
        } );

        it( "should report and revive when pm2 gives up", async() => {
            watchdog.handleEvent( {
                event: "restart overlimit",
                process: { name: "vertix-bot-0", restart_time: 10 }
            } );

            expect( reporter.kinds() ).toEqual( [ "gave-up" ] );
            expect( supervisor.restarted ).toEqual( [] );

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [ "vertix-bot-0" ] );
            expect( reporter.kinds() ).toEqual( [ "gave-up", "revived" ] );
        } );

        it( "should double the wait each time pm2 gives up again", async() => {
            const gaveUp = { event: "restart overlimit", process: { name: "vertix-api" } };

            watchdog.handleEvent( gaveUp );
            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            watchdog.handleEvent( gaveUp );
            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [ "vertix-api" ] );

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [ "vertix-api", "vertix-api" ] );
        } );

        it( "should not read a spawn as a recovery", () => {
            watchdog.handleEvent( { event: "exit", process: { name: "vertix-api", status: "stopped" } } );
            watchdog.handleEvent( { event: "online", process: { name: "vertix-api" } } );

            expect( reporter.kinds() ).toEqual( [ "down" ] );
        } );

        it( "should not watch itself", () => {
            watchdog.handleEvent( {
                event: "restart overlimit",
                process: { name: "vertix-watchdog" }
            } );

            expect( reporter.alerts ).toHaveLength( 0 );
        } );

        it( "should not watch an app named in WATCHDOG_IGNORED_APPS", () => {
            process.env.WATCHDOG_IGNORED_APPS = "pm2-dashboard, vertix-redis";

            watchdog.handleEvent( { event: "exit", process: { name: "vertix-redis", status: "stopped" } } );

            expect( reporter.alerts ).toHaveLength( 0 );
        } );

        it( "should ignore a packet carrying no app name", () => {
            watchdog.handleEvent( { event: "exit", process: {} } );

            expect( reporter.alerts ).toHaveLength( 0 );
        } );
    } );

    describe( "reconcile()", () => {
        it( "should revive an app already errored before the watchdog started", async() => {
            supervisor.listed = [ { name: "vertix-api", status: "errored" } ];

            await watchdog.reconcile();

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [ "vertix-api" ] );
        } );

        it( "should leave a stopped app alone", async() => {
            supervisor.listed = [ { name: "vertix-api", status: "stopped" } ];

            await watchdog.reconcile();

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [] );
        } );

        it( "should clear the back-off once an app has held online", async() => {
            watchdog.handleEvent( { event: "restart overlimit", process: { name: "vertix-api" } } );

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            supervisor.listed = [ {
                name: "vertix-api",
                status: "online",
                pm_uptime: Date.now() - 3600000
            } ];

            await watchdog.reconcile();

            watchdog.handleEvent( { event: "restart overlimit", process: { name: "vertix-api" } } );

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( supervisor.restarted ).toEqual( [ "vertix-api", "vertix-api" ] );
        } );

        it( "should report a recovery once a downed app has held", async() => {
            watchdog.handleEvent( { event: "exit", process: { name: "vertix-api", status: "stopped" } } );

            supervisor.listed = [ { name: "vertix-api", status: "online", pm_uptime: Date.now() - 1000 } ];

            await watchdog.reconcile();

            expect( reporter.kinds() ).toEqual( [ "down" ] );

            supervisor.listed = [ { name: "vertix-api", status: "online", pm_uptime: Date.now() - 120000 } ];

            await watchdog.reconcile();

            expect( reporter.kinds() ).toEqual( [ "down", "recovered" ] );
        } );

        it( "should report a recovery once only", async() => {
            watchdog.handleEvent( { event: "exit", process: { name: "vertix-api", status: "stopped" } } );

            supervisor.listed = [ { name: "vertix-api", status: "online", pm_uptime: Date.now() - 120000 } ];

            await watchdog.reconcile();
            await watchdog.reconcile();

            expect( reporter.kinds() ).toEqual( [ "down", "recovered" ] );
        } );

        it( "should say nothing about an app it never reported down", async() => {
            supervisor.listed = [ { name: "vertix-api", status: "online", pm_uptime: Date.now() - 120000 } ];

            await watchdog.reconcile();

            expect( reporter.alerts ).toHaveLength( 0 );
        } );

        it( "should survive pm2 refusing to list", async() => {
            supervisor.listError = new Error( "daemon is not running" );

            await expect( watchdog.reconcile() ).resolves.toBeUndefined();
        } );

        it( "should not report a revival pm2 refused", async() => {
            supervisor.restartError = new Error( "no such process" );

            watchdog.handleEvent( { event: "restart overlimit", process: { name: "vertix-api" } } );

            await jest.advanceTimersByTimeAsync( REVIVE_INITIAL_DELAY_MS );

            expect( reporter.kinds() ).toEqual( [ "gave-up" ] );
        } );
    } );
} );
