/**
 * @author Leonid Vinikov <leonidvinikov@gmail.com>
 *
 * @see https://discord.com/developers/docs/topics/gateway#sharding-for-very-large-bots
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=8&scope=bot%20applications.commands - Vertix Administrator
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286354576&scope=bot%20applications.commands - Vertix
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286346264&scope=bot%20applications.commands - Vertix + Admin
 * @see https://discord.com/api/oauth2/authorize?client_id=1114586106491572254&permissions=286346264&scope=bot%20applications.commands - Vertix Test
 */

import { fileURLToPath } from "node:url";
import * as util from "node:util";

import path from "path";
import process from "process";

import { config } from "dotenv";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import { initWorker } from "@vertix.gg/bot/src/_workers/cleanup-worker";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

async function registerServices() {
    const services = await Promise.all( [
        import("@vertix.gg/bot/src/services/app-service"),
        import("@vertix.gg/bot/src/ui-v2/ui-service"),
        import("@vertix.gg/bot/src/ui-v2/ui-adapter-service"),
        import("@vertix.gg/bot/src/services/direct-message-service"),
        import("@vertix.gg/bot/src/services/channel-service"),
        import("@vertix.gg/bot/src/services/dynamic-channel-service"),
        import("@vertix.gg/bot/src/services/master-channel-service")
    ] );

    services.forEach( service => {
        ServiceLocator.$.register<ServiceBase>( service.default );
    } );

    await ServiceLocator.$.waitForAll();
}

async function createCleanupWorker() {
    try {
        const thread = await initWorker();
        await thread.run();
        GlobalLogger.$.admin( createCleanupWorker, "Cleanup worker finished" );
    } catch ( error ) {
        GlobalLogger.$.error( createCleanupWorker, "", error );
    }
}

export async function entryPoint() {
    const envArg = process.argv.find(
        arg => arg.startsWith( "--env=" )
    ) || `--env=${ process.env.DOTENV_CONFIG_PATH || ".env" }`;

    const envPath = path.join( process.cwd(), envArg.split( "=" )[ 1 ] );
    const envOutput = config( { path: envPath } );

    if ( envOutput.error ) {
        GlobalLogger.$.error( entryPoint, "fail to load environment file:\n" + util.inspect( envOutput.error ) );
        process.exit( 1 );
    }

    GlobalLogger.$.info( entryPoint, `Loading environment variables from: 'file://${ envPath }'` );
    GlobalLogger.$.info( entryPoint, `Current log level: '${ Logger.getLogLevelString() }'` );

    if ( process.argv.includes( "--dump-env" ) ) {
        GlobalLogger.$.info( entryPoint, `Environment file variables:\n${ util.inspect( envOutput.parsed ) }` );
        process.exit( 0 );
    }

    await PrismaBotClient.$.connect();

    GlobalLogger.$.info( entryPoint, "Database is connected" );
    GlobalLogger.$.info( entryPoint, "Registering services..." );

    await registerServices();

    GlobalLogger.$.info( entryPoint, "Services are registered" );

    const { default: botInitialize } = await import("./vertix");

    await botInitialize();

    process.env.Z_RUN_TSCONFIG_PATH = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), "../tsconfig.json" );

    await createCleanupWorker();

    GlobalLogger.$.info( entryPoint, "Bot is initialized" );
}
