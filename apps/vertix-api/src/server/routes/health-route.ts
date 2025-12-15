import { API_ROUTES } from "@vertix.gg/api/src/server/constants";

import type { HealthResponse } from "@vertix.gg/api/src/server/types";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

const healthRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Reply: HealthResponse }>( API_ROUTES.HEALTH, async() => {
        return {
            status: "ok",
            timestamp: new Date().toISOString()
        };
    } );
};

export default healthRoutePlugin;

