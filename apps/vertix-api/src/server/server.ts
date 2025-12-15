import { Logger } from "@vertix.gg/base/src/modules/logger";

import { createApp } from "@vertix.gg/api/src/server/app";
import { environment } from "@vertix.gg/api/src/server/config/environment";

const logger = new Logger( "VertixAPI/Server", { skipEventBusHook: true } );

const DEFAULT_HOST = "0.0.0.0";
const LOCALHOST = "localhost";

export class Server {
    private app: Awaited<ReturnType<typeof createApp>> | null = null;

    public async start(): Promise<void> {
        const port = environment.getPort();
        const host = environment.getHost();

        try {
            this.app = await createApp();

            await this.app.listen( { port, host } );

            const displayHost = host === DEFAULT_HOST ? LOCALHOST : host;
            logger.info( this.start, `Server running at http://${ displayHost }:${ port }` );
        } catch( error ) {
            logger.error( this.start, "Failed to start server", error );
            process.exit( 1 );
        }
    }

    public async stop(): Promise<void> {
        if ( this.app ) {
            await this.app.close();
        }
    }
}

