import { FastifyInstance } from "fastify";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ServerFactory } from "./core/server-factory";
import { registerAllRoutes } from "./routes";

/**
 * Application factory class that creates and configures the server
 */
export class AppFactory extends InitializeBase {
    private readonly serverFactory: ServerFactory;

    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/AppFactory";
    }

    constructor() {
        super();

        this.serverFactory = new ServerFactory();
    }

    protected initialize(): void {
        this.logger.info( "initialize", "Application factory initialized" );
    }

    /**
     * Create and configure the application server
     */
    public async create(): Promise<FastifyInstance> {
        try {
            const server = this.serverFactory.getInstance();

            // Register all API routes
            await registerAllRoutes( server );

            this.logger.info( "create", "Application server created successfully" );

            return server;
        } catch ( error ) {
            this.logger.error( "create", "Failed to create application server", error );
            throw error;
        }
    }

    /**
     * Get the server factory
     */
    public getServerFactory(): ServerFactory {
        return this.serverFactory;
    }
}

// Factory function to create a new application
export const createApp = async(): Promise<{
    app: FastifyInstance;
    serverFactory: ServerFactory;
}> => {
    const appFactory = new AppFactory();
    const app = await appFactory.create();

    return {
        app,
        serverFactory: appFactory.getServerFactory()
    };
};
