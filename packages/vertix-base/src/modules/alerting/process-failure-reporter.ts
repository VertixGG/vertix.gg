import process from "process";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { ErrorAlertService } from "@vertix.gg/base/src/modules/alerting/error-alert-service";
import type { ICaller, Logger } from "@vertix.gg/base/src/modules/logger";

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

/**
 * Routes what would otherwise end the process silently through the logger, and so to the alerts.
 *
 * Both handlers keep their `console.error`, because these fire at times the logger may not be
 * able to answer for - before the log level is read, or while the thing that failed is the
 * logging itself.
 */
export function reportProcessFailures( logger: Logger, caller: ICaller ): void {
    process.on( "unhandledRejection", ( reason ) => {
        const error = reason instanceof Error ? reason : new Error( String( reason ) );

        console.error( error );

        logger.error( caller, "Unhandled rejection", error );
    } );

    process.on( "uncaughtException", ( error ) => {
        console.error( error );

        logger.error( caller, "Uncaught exception", error );
    } );
}
