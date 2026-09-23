import process from "process";

import {
    flushErrorAlerts,
    reportProcessFailures
} from "@vertix.gg/base/src/modules/alerting/process-failure-reporter";

import { entryPoint } from "@vertix.gg/bot/src/entrypoint";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

Error.stackTraceLimit = Infinity;

reportProcessFailures( GlobalLogger.$, entryPoint );

try {
    await entryPoint( {} );
} catch( error ) {
    console.error( error );

    GlobalLogger.$.error( entryPoint, "Fatal error", error );

    await flushErrorAlerts();

    process.exit( 1 );
}
