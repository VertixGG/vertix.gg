import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { entryPoint as vertixBotEntrypoint } from "@vertix.gg/bot/src/entrypoint";

import { ServerFactory } from "@vertix.gg/flow/src/server/core/server-factory";
import { registerAllRoutes } from "@vertix.gg/flow/src/server/routes";

import type { FastifyInstance } from "fastify";

declare global {
    // Ensure that the bot entrypoint is only initialized once, even across HMR reloads
    var __vertixBotInitialized: boolean | undefined;
}

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

    public constructor() {
        super();

        this.serverFactory = new ServerFactory();
    }

    protected initialize(): void {
        this.logger.log( this.initialize, "Application factory initialized" );
    }

    /**
     * Create and configure the application server
     */
    public async create(): Promise<FastifyInstance> {
        // Initialize vertixBot only once, not on every hot reload
        if ( !globalThis.__vertixBotInitialized ) {
            await vertixBotEntrypoint( {
                enableListeners: false,
            } );
            globalThis.__vertixBotInitialized = true;
        }

        try {
            const server = this.serverFactory.getInstance();

            // Register all API routes
            await registerAllRoutes( server );

            this.logger.info( this.create, "Application server created successfully" );

            return server;
        } catch ( error ) {
            this.logger.error( this.create, "Failed to create application server", error );
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
