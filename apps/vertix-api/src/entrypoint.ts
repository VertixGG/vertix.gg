import { Logger } from "@vertix.gg/base/src/modules/logger";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { Server } from "@vertix.gg/api/src/server/server";

const logger = new Logger( "VertixAPI/Entrypoint", { skipEventBusHook: true } );

export async function entryPoint() {
    logger.info( entryPoint, "Starting Vertix API..." );

    logger.info( entryPoint, "Connecting to database..." );
    await PrismaBotClient.$.connect();
    logger.info( entryPoint, "Database connected" );

    const server = new Server();
    await server.start();
}
