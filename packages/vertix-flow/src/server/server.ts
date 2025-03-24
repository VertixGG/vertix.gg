import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { createApp } from "./app";
import { environment } from "./config/environment";
import type { HTTPMethods, InjectOptions, LightMyRequestResponse } from "fastify";

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

    constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.info("initialize", "Server initialized");
    }

    /**
     * Start the server with optional port and host configuration
     */
    public async start(options?: { port?: number; host?: string }): Promise<void> {
        try {
            const { app, serverFactory } = await createApp();

            // Configure server with provided options or environment defaults
            const port = options?.port || environment.getPort();
            const host = options?.host || environment.getHost();

            serverFactory.configure({ port, host });

            // Start listening
            await serverFactory.start();

            this.logger.info("start", `Server running at http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
        } catch (error) {
            this.logger.error("start", "Failed to start server", error);
            process.exit(1);
        }
    }
}

// Create server instance
const server = new Server();

// Export handler for Bun's hot reloading
export const handler = {
    port: environment.getPort(),
    async fetch(request: Request) {
        try {
            const { app } = await createApp();
            const url = new URL(request.url);

            const method = request.method.toUpperCase();
            const allowedMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'] as const;
            const validMethod = allowedMethods.find(m => m === method);
            if (!validMethod) {
                return new Response('Method Not Allowed', { status: 405 });
            }

            const injectOptions: Partial<InjectOptions> = {
                method: validMethod,
                url: url.pathname + url.search,
                headers: Object.fromEntries(request.headers),
                ...(method !== 'GET' && method !== 'HEAD' && {
                    payload: await request.text()
                })
            };

            const response = await app.inject(injectOptions as InjectOptions) as LightMyRequestResponse;

            // Convert response to format Bun expects
            const headers = new Headers();
            for (const [key, value] of Object.entries(response.headers)) {
                if (value) {
                    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
                }
            }

            return new Response(String(response.payload), {
                status: response.statusCode,
                headers
            });
        } catch (error) {
            console.error('Server error:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    if (process.env.BUN_ENV === 'development') {
        // Use Bun's hot reloading in development
        Bun.serve(handler);
    } else {
        // Use traditional server start in other environments
        server.start();
    }
}
