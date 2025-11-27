import { LoggerServer } from "./logger-server";

const httpPort = process.env.LOGGER_SERVER_HTTP_PORT ? parseInt( process.env.LOGGER_SERVER_HTTP_PORT, 10 ) : 3090;
const host = process.env.LOGGER_SERVER_HOST || "0.0.0.0";

const server = new LoggerServer( {
    httpPort,
    host
} );

server.start().catch( ( error ) => {
    console.error( "Failed to start logger server:", error );
    process.exit( 1 );
} );

process.on( "SIGINT", async() => {
    console.log( "\nShutting down logger server..." );
    await server.stop();
    process.exit( 0 );
} );

process.on( "SIGTERM", async() => {
    console.log( "\nShutting down logger server..." );
    await server.stop();
    process.exit( 0 );
} );

