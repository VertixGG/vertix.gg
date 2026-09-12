import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { PrismaAPIClient } from "@vertix.gg/prisma/api-client";

import { Server } from "@vertix.gg/api/src/server/server";
import { uiRuntimeLoader } from "@vertix.gg/api/src/bootstrap";

const logger = new Logger( "VertixAPI/Entrypoint", { skipEventBusHook: true } );

async function registerServices() {
    logger.info( registerServices, "Registering services..." );

    // Logger client first, so the registrations below are forwarded too. The bot
    // does the same in its own entrypoint; without it the API logs only to its
    // own stdout and never reaches vertix-logger.
    const loggerServerPort = process.env.LOGGER_SERVER_HTTP_PORT ? parseInt( process.env.LOGGER_SERVER_HTTP_PORT, 10 ) : 3090;
    const loggerServerHost = process.env.LOGGER_SERVER_HOST || "localhost";

    const { MCPService } = await import( "@vertix.gg/base/src/modules/mcp-server/mcp-service" );

    // Force re-registration to pick up code changes
    ServiceLocator.$.unregister( MCPService.getName() );
    ServiceLocator.$.register( MCPService, { loggerServerUrl: `http://${ loggerServerHost }:${ loggerServerPort }` } );

    await ServiceLocator.$.waitFor( MCPService.getName(), { timeout: 5000 } );
    logger.info( registerServices, "MCP service (Logger Client) ready" );

    // Register and wait for IPC service (needs Redis connection)
    const { IPCService } = await import( "@vertix.gg/base/src/modules/ipc" );

    // Force re-registration to pick up code changes
    ServiceLocator.$.unregister( IPCService.getName() );
    ServiceLocator.$.register( IPCService );

    await ServiceLocator.$.waitFor( IPCService.getName(), { timeout: 10000 } );
    logger.info( registerServices, "IPC service ready" );

    // Register and wait for Discord service
    const { DiscordService } = await import( "@vertix.gg/api/src/server/services/discord-service" );

    // Force re-registration to pick up code changes
    ServiceLocator.$.unregister( DiscordService.getName() );
    ServiceLocator.$.register( DiscordService );

    await ServiceLocator.$.waitFor( DiscordService.getName(), { timeout: 5000 } );
    logger.info( registerServices, "Discord service ready" );

    // Register Management service (depends on Discord and IPC - both already ready)
    const { ManagementService } = await import( "@vertix.gg/api/src/server/services/management-service" );

    // Force re-registration to pick up code changes
    ServiceLocator.$.unregister( ManagementService.getName() );
    ServiceLocator.$.register( ManagementService );

    await ServiceLocator.$.waitFor( ManagementService.getName(), { timeout: 5000 } );
    logger.info( registerServices, "Management service ready" );

    // Register Management route
    const { ManagementRoute } = await import( "@vertix.gg/api/src/server/routes/management-route" );

    // Force re-registration to pick up code changes
    ServiceLocator.$.unregister( ManagementRoute.getName() );
    ServiceLocator.$.register( ManagementRoute );

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

    // Bootstrap headless UI runtime and load exports eagerly
    // Reloads automatically when UI source files change (file watcher)
    logger.info( entryPoint, "Loading UI runtime exports..." );
    await uiRuntimeLoader.loadExports();
    logger.info( entryPoint, "UI runtime exports loaded" );

    const server = new Server();
    await server.start();
}
