import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

/**
 * Health check response interface
 */
interface HealthResponse {
    status: string;
    timestamp: string;
    version: string;
}

/**
 * Health route handler
 */
export class HealthRoute extends InitializeBase {
    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Routes/HealthRoute";
    }

    constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.info( "initialize", "Health route initialized" );
    }

    /**
     * Handle health check request
     */
    public handler = async(): Promise<HealthResponse> => {
        this.logger.info( "handler", "Health check requested" );

        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || "0.0.0"
        };
    }

    /**
     * Register route with Fastify instance
     */
    public async register( instance: FastifyInstance ): Promise<void> {
        // Response schema for validation
        const responseSchema = {
            response: {
                200: Type.Object( {
                    status: Type.String(),
                    timestamp: Type.String(),
                    version: Type.String()
                } )
            }
        };

        instance.get( "/health", { schema: responseSchema }, this.handler );
    }
}

/**
 * Health route plugin for Fastify
 */
const healthRoutePlugin: FastifyPluginAsync = async( fastify ): Promise<void> => {
    const route = new HealthRoute();
    await route.register( fastify );
};

export default healthRoutePlugin;
