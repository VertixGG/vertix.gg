import process from "process";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { entryPoint } from "@vertix.gg/bot/src/entrypoint";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { ErrorAlertService } from "@vertix.gg/base/src/modules/alerting/error-alert-service";

Error.stackTraceLimit = Infinity;

/**
 * Lets an alert that is already on the wire land before the process goes away.
 *
 * `logger.error()` hands the alert service a promise it does not wait for, which is right for every
 * line but the last one - exiting here would drop the only report of the failure that caused it.
 */
async function flushErrorAlerts(): Promise<void> {
    const service = ServiceLocator.$.get<ErrorAlertService>( "VertixBase/Modules/ErrorAlertService", { silent: true } );

    if ( ! service ) {
        return;
    }

    await service.flush();
}

process.on( "unhandledRejection", ( reason ) => {
    const error = reason instanceof Error ? reason : new Error( String( reason ) );

    console.error( error );

    GlobalLogger.$.error( entryPoint, "Unhandled rejection", error );
} );

process.on( "uncaughtException", ( error ) => {
    console.error( error );

    GlobalLogger.$.error( entryPoint, "Uncaught exception", error );
} );

try {
    await entryPoint( {} );
} catch( error ) {
    console.error( error );

    GlobalLogger.$.error( entryPoint, "Fatal error", error );

    await flushErrorAlerts();

    process.exit( 1 );
}
