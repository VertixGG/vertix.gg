import { Logger } from "@vertix.gg/base/src/modules/logger";

import {
    flushErrorAlerts,
    reportProcessFailures
} from "@vertix.gg/base/src/modules/alerting/process-failure-reporter";

import { entryPoint } from "@vertix.gg/api/src/entrypoint";

/**
 * Hooked to the event bus, unlike the entrypoint's own logger.
 *
 * A logger built with `skipEventBusHook` never reaches the alert service, so a crash reported
 * through one would be written to stdout and nowhere else - which is the state this file exists
 * to end.
 */
const logger = new Logger( "VertixAPI/Index" );

reportProcessFailures( logger, entryPoint );

try {
    await entryPoint();
} catch( error ) {
    console.error( error );

    logger.error( entryPoint, "Fatal error", error );

    await flushErrorAlerts();

    process.exit( 1 );
}
