import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { createApp } from "@vertix.gg/flow/src/server/app";
import { environment } from "@vertix.gg/flow/src/server/config/environment";
import { handler } from "@vertix.gg/flow/src/server/handler";

/**
 * Server class responsible for starting and managing the server
 */
export class Server extends InitializeBase {
    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Server";
    }

    public constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.info( "initialize", "Server initialized" );
    }

    /**
     * Start the server with optional port and host configuration
     */
    public async start( options?: { port?: number; host?: string } ): Promise<void> {
        try {
            const {  serverFactory } = await createApp();

            // Configure server with provided options or environment defaults
            const port = options?.port || environment.getPort();
            const host = options?.host || environment.getHost();

            serverFactory.configure( { port, host } );

            // Start listening
            await serverFactory.start();

            this.logger.info( "start", `Server running at http://${ host === "0.0.0.0" ? "localhost" : host }:${ port }` );
        } catch ( error ) {
            this.logger.error( "start", "Failed to start server", error );
            process.exit( 1 );
        }
    }
}

// Create server instance
const server = new Server();

// Start server if this file is run directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
    if ( process.env.BUN_ENV === "development" ) {
        // Use Bun's hot reloading in development
        Bun.serve( handler );
    } else {
        // Use traditional server start in other environments
        server.start();
    }
}

export { handler };
