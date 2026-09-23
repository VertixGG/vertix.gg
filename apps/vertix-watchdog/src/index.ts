import process from "process";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { CrashAlertReporter } from "@vertix.gg/watchdog/src/crash-alert-reporter";
import { Pm2Supervisor } from "@vertix.gg/watchdog/src/pm2-supervisor";
import { ProcessWatchdog } from "@vertix.gg/watchdog/src/process-watchdog";

const logger = new Logger( "VertixWatchdog/Index" );

const reporter = new CrashAlertReporter();
const supervisor = new Pm2Supervisor();
const watchdog = new ProcessWatchdog( { supervisor, reporter } );

/**
 * The watchdog's own failures go to the webhook directly.
 *
 * Every other app in the repo reports through `ErrorAlertService`, which listens on the logger's
 * event bus. That is the right seam for a process whose logger is up - but this one exists to speak
 * when things are down, so it carries its own line to discord rather than borrowing that one.
 */
async function reportOwnFailure( heading: string, error: Error ): Promise<void> {
    console.error( error );

    logger.error( reportOwnFailure, heading, error );

    await reporter.report( {
        kind: "gave-up",
        apps: [ "vertix-watchdog" ],
        detail: `${ heading }: ${ error.name }: ${ error.message }`
    } );

    await reporter.flush();
}

process.on( "unhandledRejection", ( reason ) => {
    const error = reason instanceof Error ? reason : new Error( String( reason ) );

    void reportOwnFailure( "Unhandled rejection", error ).finally( () => process.exit( 1 ) );
} );

process.on( "uncaughtException", ( error ) => {
    void reportOwnFailure( "Uncaught exception", error ).finally( () => process.exit( 1 ) );
} );

for ( const signal of [ "SIGINT", "SIGTERM" ] as const ) {
    process.on( signal, () => {
        void watchdog.stop().finally( () => {
            supervisor.disconnect();

            process.exit( 0 );
        } );
    } );
}

try {
    await supervisor.connect();

    await watchdog.start();

    // Apps that went errored before this process existed never emitted an event it could hear.
    await watchdog.reconcile();
} catch( error ) {
    const failure = error instanceof Error ? error : new Error( String( error ) );

    await reportOwnFailure( "Fatal error", failure );

    process.exit( 1 );
}
