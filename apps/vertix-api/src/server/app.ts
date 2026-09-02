import Fastify from "fastify";

import healthRoutePlugin from "@vertix.gg/api/src/server/routes/health-route";
import modulesRoutePlugin from "@vertix.gg/api/src/server/routes/modules-route";
import flowsRoutePlugin from "@vertix.gg/api/src/server/routes/flows-route";
import authRoutePlugin from "@vertix.gg/api/src/server/routes/auth-route";
import dashboardRoutePlugin from "@vertix.gg/api/src/server/routes/dashboard-route";
import managementRoutePlugin from "@vertix.gg/api/src/server/routes/management-route";
import customizationRoutePlugin from "@vertix.gg/api/src/server/routes/customization-route";
import languageRoutePlugin from "@vertix.gg/api/src/server/routes/language-route";
import { requireAuth } from "@vertix.gg/api/src/server/middleware/auth-middleware";
import { discordConfig } from "@vertix.gg/api/src/server/config/discord";
import { API_PREFIX } from "@vertix.gg/api/src/server/constants";
import { PrismaSessionStore } from "@vertix.gg/api/src/server/services/session-store";
import { registerFastifyPlugins } from "@vertix.gg/api/src/server/plugins";

import type { FastifyInstance } from "fastify";

const LOGGER_LEVEL = "info";

const FRONTEND_URL = process.env.DASHBOARD_URL || "http://localhost:3020";
const DASHBOARD_PROD_URL = process.env.DASHBOARD_PROD_URL || "https://dashboard.voicechannnels.gg";

const CORS_CONFIG = {
    origin: [ FRONTEND_URL, DASHBOARD_PROD_URL, "http://localhost:3020" ],
    credentials: true,
    methods: [ "GET", "POST", "PUT", "DELETE", "OPTIONS" ],
    allowedHeaders: [ "Content-Type", "Authorization" ]
};

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify( {
        trustProxy: true,
        logger: {
            level: LOGGER_LEVEL
        }
    } );

    await registerFastifyPlugins( fastify, {
        cors: CORS_CONFIG,
        session: {
            secret: discordConfig.getSessionSecret(),
            store: new PrismaSessionStore(),
            cookie: {
                secure: true,
                httpOnly: true,
                sameSite: "none",
                maxAge: SESSION_MAX_AGE
            },
            saveUninitialized: false
        }
    } );

    await fastify.register( authRoutePlugin, { prefix: API_PREFIX } );

    await fastify.register( healthRoutePlugin, { prefix: API_PREFIX } );

    await fastify.register( async( protectedRoutes ) => {
        protectedRoutes.addHook( "preHandler", requireAuth );

        await protectedRoutes.register( modulesRoutePlugin );
        await protectedRoutes.register( flowsRoutePlugin );
        await protectedRoutes.register( dashboardRoutePlugin );
        await protectedRoutes.register( managementRoutePlugin );
        await protectedRoutes.register( customizationRoutePlugin );
        await protectedRoutes.register( languageRoutePlugin );
    }, { prefix: API_PREFIX } );

    return fastify;
}

