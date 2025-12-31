import { entryPoint } from "@vertix.gg/bot/src/entrypoint";

import process from "process";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

Error.stackTraceLimit = Infinity;

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

    process.exit( 1 );
}
