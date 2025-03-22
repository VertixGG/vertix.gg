import { FastifyInstance } from "fastify";
import healthRoutePlugin from "./health-route";
import uiModulesRoutePlugin from "./ui-modules-route";

/**
 * Register all API routes with a Fastify instance
 * This maintains backward compatibility with the original API endpoints
 */
export const registerAllRoutes = async( server: FastifyInstance, apiPrefix = "/api" ): Promise<void> => {
    // Register health route directly under /api
    server.register( healthRoutePlugin, { prefix: apiPrefix } );

    // Register UI modules routes directly under /api
    server.register( uiModulesRoutePlugin, { prefix: apiPrefix } );
};
