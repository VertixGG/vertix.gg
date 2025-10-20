import healthRoutePlugin from "@vertix.gg/flow/src/server/routes/health-route";
import uiModulesRoutePlugin from "@vertix.gg/flow/src/server/routes/ui-modules-route";
import guildRoutePlugin from "@vertix.gg/flow/src/server/routes/guild-route";

import type { FastifyInstance } from "fastify";

/**
 * Register all API routes with a Fastify instance
 * This maintains backward compatibility with the original API endpoints
 */
export const registerAllRoutes = async( server: FastifyInstance, apiPrefix = "/api" ): Promise<void> => {
    // Register health route directly under /api
    server.register( healthRoutePlugin, { prefix: apiPrefix } );

    // Register UI modules routes directly under /api
    server.register( uiModulesRoutePlugin, { prefix: apiPrefix } );

    // Register guilds route directly under /api
    server.register( guildRoutePlugin, { prefix: apiPrefix } );
};
