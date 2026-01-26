import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { PrismaAPIClient } from "@vertix.gg/prisma/api-client";

import { Server } from "@vertix.gg/api/src/server/server";

const logger = new Logger( "VertixAPI/Entrypoint", { skipEventBusHook: true } );

async function registerServices() {
    logger.info( registerServices, "Registering services..." );

    // Register and wait for IPC service (needs Redis connection)
    const { IPCService } = await import( "@vertix.gg/base/src/modules/ipc" );

    if ( !ServiceLocator.$.get( IPCService.getName(), { silent: true } ) ) {
        ServiceLocator.$.register( IPCService );
    }

    await ServiceLocator.$.waitFor( IPCService.getName(), { timeout: 10000 } );
    logger.info( registerServices, "IPC service ready" );

    // Register and wait for Discord service
    const { DiscordService } = await import( "@vertix.gg/api/src/server/services/discord-service" );

    if ( !ServiceLocator.$.get( DiscordService.getName(), { silent: true } ) ) {
        ServiceLocator.$.register( DiscordService );
    }

    await ServiceLocator.$.waitFor( DiscordService.getName(), { timeout: 5000 } );
    logger.info( registerServices, "Discord service ready" );

    // Register Management service (depends on Discord and IPC - both already ready)
    const { ManagementService } = await import( "@vertix.gg/api/src/server/services/management-service" );

    if ( !ServiceLocator.$.get( ManagementService.getName(), { silent: true } ) ) {
        ServiceLocator.$.register( ManagementService );
    }

    await ServiceLocator.$.waitFor( ManagementService.getName(), { timeout: 5000 } );
    logger.info( registerServices, "Management service ready" );

    // Register Management route
    const { ManagementRoute } = await import( "@vertix.gg/api/src/server/routes/management-route" );

    if ( !ServiceLocator.$.get( ManagementRoute.getName(), { silent: true } ) ) {
        ServiceLocator.$.register( ManagementRoute );
    }

    await ServiceLocator.$.waitFor( ManagementRoute.getName(), { timeout: 5000 } );
    logger.info( registerServices, "Management route ready" );

    logger.info( registerServices, "All services registered and initialized" );
}

export async function entryPoint() {
    logger.info( entryPoint, "Starting Vertix API..." );

    logger.info( entryPoint, "Connecting to bot database..." );
    await PrismaBotClient.$.connect();
    logger.info( entryPoint, "Bot database connected" );

    logger.info( entryPoint, "Connecting to API database..." );
    await PrismaAPIClient.$.connect();
    logger.info( entryPoint, "API database connected" );

    // Initialize services
    await registerServices();

    const server = new Server();
    await server.start();
}
