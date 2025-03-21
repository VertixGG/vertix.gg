import { entryPoint } from "@vertix.gg/bot/src/entrypoint";

Error.stackTraceLimit = Infinity;

const promise = entryPoint();

promise.catch( ( error ) => {
    console.error( error );

    process.exit( 1 );
} );
