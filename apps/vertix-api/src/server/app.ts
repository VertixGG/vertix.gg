import Fastify from "fastify";
import cors from "@fastify/cors";

import healthRoutePlugin from "@vertix.gg/api/src/server/routes/health-route";
import modulesRoutePlugin from "@vertix.gg/api/src/server/routes/modules-route";
import flowsRoutePlugin from "@vertix.gg/api/src/server/routes/flows-route";
import { API_PREFIX } from "@vertix.gg/api/src/server/constants";

import type { FastifyInstance } from "fastify";

const LOGGER_LEVEL = "info";

const CORS_CONFIG = {
    origin: true,
    credentials: true
} as const;

export async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify( {
        logger: {
            level: LOGGER_LEVEL
        }
    } );

    await fastify.register( cors, CORS_CONFIG );

    await fastify.register( healthRoutePlugin, { prefix: API_PREFIX } );
    await fastify.register( modulesRoutePlugin, { prefix: API_PREFIX } );
    await fastify.register( flowsRoutePlugin, { prefix: API_PREFIX } );

    return fastify;
}

