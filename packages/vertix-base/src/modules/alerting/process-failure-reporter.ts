import process from "process";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { ErrorAlertService } from "@vertix.gg/base/src/modules/alerting/error-alert-service";
import type { ICaller, Logger } from "@vertix.gg/base/src/modules/logger";

/**
 * How long a dying process waits for its last alert before going anyway.
 *
 * The flush is the whole point of the delay, but it talks to a webhook, and a webhook that is down
 * is exactly the sort of thing that happens during an outage. Without a cap the process would sit
 * broken and unrestarted for as long as discord stayed unreachable.
 */
const FATAL_FLUSH_TIMEOUT_MS = 5000;

export interface IProcessFailureOptions {
    /**
     * How the process ends. Named so a spec can watch for the exit instead of taking the runner
     * down with it; nothing in the apps passes it.
     */
    exit?: ( code: number ) => void;
}

/**
 * Lets an alert that is already on the wire land before the process goes away.
 *
 * `logger.error()` hands the alert service a promise it does not wait for, which is right for
 * every line but the last one - exiting without this drops the only report of the failure that
 * caused the exit. Answers immediately when no alert service is registered, which is every
 * process that has not got as far as registering one.
 */
export async function flushErrorAlerts(): Promise<void> {
    const service = ServiceLocator.$.get<ErrorAlertService>(
        "VertixBase/Modules/ErrorAlertService",
        { silent: true }
    );

    if ( ! service ) {
        return;
    }

    await service.flush();
}

async function flushThenExit( exit: ( code: number ) => void ): Promise<void> {
    try {
        await Promise.race( [
            flushErrorAlerts(),
            new Promise( ( resolve ) => {
                const timer = setTimeout( resolve, FATAL_FLUSH_TIMEOUT_MS );

                // Nothing should be held open by the cap itself when the flush wins the race.
                timer.unref?.();
            } )
        ] );
    } catch( error ) {
        console.error( error );
    }

    exit( 1 );
}

/**
 * Routes what would otherwise end the process silently through the logger, and so to the alerts.
 *
 * Both handlers keep their `console.error`, because these fire at times the logger may not be
 * able to answer for - before the log level is read, or while the thing that failed is the
 * logging itself.
 *
 * Then the process ends. Installing a handler for either of these events replaces the runtime's
 * own, whose job was to stop a process whose state can no longer be reasoned about; without an
 * exit of our own, that job simply stops being done. What that looked like in practice is an app
 * that had thrown out of its own bootstrap and stayed up: pm2 reads a running process as `online`,
 * so nothing restarted it, and the alert said something had broken while the dashboard said
 * everything was fine. Exiting hands it back to pm2, which starts a process that is whole.
 */
export function reportProcessFailures( logger: Logger, caller: ICaller, options: IProcessFailureOptions = {} ): void {
    const exit = options.exit ?? ( ( code: number ) => process.exit( code ) );

    process.on( "unhandledRejection", ( reason ) => {
        const error = reason instanceof Error ? reason : new Error( String( reason ) );

        console.error( error );

        logger.error( caller, "Unhandled rejection", error );

        void flushThenExit( exit );
    } );

    process.on( "uncaughtException", ( error ) => {
        console.error( error );

        logger.error( caller, "Uncaught exception", error );

        void flushThenExit( exit );
    } );
}
