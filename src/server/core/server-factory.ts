import fastify, { FastifyInstance, FastifyPluginAsync, FastifyRegisterOptions } from "fastify";
import cors from "@fastify/cors";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { ServerConfig, ServerOptions } from "../interfaces/server-config.interface";

export class ServerFactory extends InitializeBase {
    private readonly server: FastifyInstance;
    private config: ServerConfig = {
        port: 3000,
        host: "0.0.0.0"
    };

    constructor() {
        super();

        this.server = fastify({
            logger: true,
        });

        // Register plugins
        this.server.register(cors, {
            origin: true,
        });
    }

    protected initialize(): void {
        this.logger.info("Server factory initialized", {});
    }

    /**
     * Configure server with options
     */
    public configure(options: ServerOptions): this {
        if (options.port) {
            this.config.port = options.port;
        }

        if (options.host) {
            this.config.host = options.host;
        }

        return this;
    }

    /**
     * Register route plugin with optional prefix
     */
    public registerRoute(routePlugin: FastifyPluginAsync, options?: FastifyRegisterOptions<{prefix?: string}>): this {
        this.server.register(routePlugin, options);
        return this;
    }

    /**
     * Start the server
     */
    public async start(): Promise<void> {
        try {
            await this.server.listen({
                port: this.config.port,
                host: this.config.host
            });

            this.logger.info(`Server running at http://localhost:${this.config.port}`, {});
        } catch (error) {
            this.logger.error("Failed to start server", { error });
            process.exit(1);
        }
    }

    /**
     * Get the server instance
     */
    public getInstance(): FastifyInstance {
        return this.server;
    }
}
