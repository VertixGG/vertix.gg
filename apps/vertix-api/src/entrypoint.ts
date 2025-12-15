import { Logger } from "@vertix.gg/base/src/modules/logger";

import { Server } from "@vertix.gg/api/src/server/server";

const logger = new Logger( "VertixAPI/Entrypoint", { skipEventBusHook: true } );

export async function entryPoint() {
    logger.info( entryPoint, "Starting Vertix API..." );

    const server = new Server();
    await server.start();
}
