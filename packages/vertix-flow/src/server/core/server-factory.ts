import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { environment } from "../config/environment";

// Define interfaces locally since they can't be imported
interface ServerConfig {
    port: number;
    host: string;
}

interface ServerOptions {
    port?: number;
    host?: string;
}

export class ServerFactory extends InitializeBase {
    private readonly server: FastifyInstance;
    private config: ServerConfig = {
        port: environment.getPort(),
        host: environment.getHost()
    };

    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Core/ServerFactory";
    }

    constructor() {
        super();

        // Create server instance with TypeBox support for JSON Schema validation
        this.server = fastify( {
            logger: true,
            disableRequestLogging: environment.isProduction()
        } ).withTypeProvider<TypeBoxTypeProvider>();

        // Register plugins
        this.server.register( cors, {
            origin: !environment.isProduction()
        } );
    }

    protected initialize(): void {
        this.logger.info( "initialize", "Server factory initialized" );
    }

    /**
     * Configure server with options
     */
    public configure( options: ServerOptions ): this {
        if ( options.port ) {
            this.config.port = options.port;
        }

        if ( options.host ) {
            this.config.host = options.host;
        }

        return this;
    }

    /**
     * Register route plugin with optional prefix
     */
    public registerRoute( routePlugin: FastifyPluginAsync, prefix?: string ): this {
        if ( prefix ) {
            this.server.register( routePlugin, { prefix } );
        } else {
            this.server.register( routePlugin );
        }
        return this;
    }

    /**
     * Start the server
     */
    public async start(): Promise<void> {
        try {
            await this.server.listen( {
                port: this.config.port,
                host: this.config.host
            } );

            const displayHost = this.config.host === "0.0.0.0" ? "localhost" : this.config.host;
            this.logger.info( "start", `Server running at http://${ displayHost }:${ this.config.port }` );
        } catch ( error ) {
            this.logger.error( "start", "Failed to start server", error );
            process.exit( 1 );
        }
    }

    /**
     * Get the server instance
     */
    public getInstance(): FastifyInstance {
        return this.server;
    }
}
