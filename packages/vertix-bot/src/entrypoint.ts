/**
 * @see https://discord.com/developers/docs/topics/gateway#sharding-for-very-large-bots
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=8&scope=bot%20applications.commands - Vertix Administrator
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286354576&scope=bot%20applications.commands - Vertix
 * @see https://discord.com/api/oauth2/authorize?client_id=1111283172378955867&permissions=286346264&scope=bot%20applications.commands - Vertix + Admin
 * @see https://discord.com/api/oauth2/authorize?client_id=1114586106491572254&permissions=286346264&scope=bot%20applications.commands - Vertix Test
 */
import * as util from "node:util";

import path from "path";
import process from "process";

import { Logger } from "@vertix.gg/base/src/modules/logger";

// @ts-ignore
// import { spawn, Thread, Worker } from "threads";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { config } from "dotenv";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

async function registerServices() {
    const { AppService } = await import( "@vertix.gg/bot/src/services/app-service" );
    const { UIService } = await import( "@vertix.gg/bot/src/ui-v2/ui-service" );
    const { UIAdapterService } = await import( "@vertix.gg/bot/src/ui-v2/ui-adapter-service" );
    const { DirectMessageService } = await import( "@vertix.gg/bot/src/services/direct-message-service" );
    const { ChannelService } = await import( "@vertix.gg/bot/src/services/channel-service" );
    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );
    const { MasterChannelService } = await import( "@vertix.gg/bot/src/services/master-channel-service" );

    ServiceLocator.$.register( AppService );
    ServiceLocator.$.register( UIService );
    ServiceLocator.$.register( UIAdapterService );
    ServiceLocator.$.register( DirectMessageService );
    ServiceLocator.$.register( ChannelService );
    ServiceLocator.$.register( DynamicChannelService );
    ServiceLocator.$.register( MasterChannelService );
}

async function createCleanupWorker() {
    // const worker = await spawn( new Worker( "./_workers/cleanup-worker.ts" ) );
    //
    // worker.handle().then( () => {
    //     GlobalLogger.$.log( createCleanupWorker, "terminate worker" );
    //
    //     Thread.terminate( worker );
    // } );
}

export async function entryPoint() {
    // Load environment variables.
    const envArg = process.argv.find( ( arg ) => arg.startsWith( "--env=" ) ) || `--env=${ process.env.DOTENV_CONFIG_PATH || ".env" }`,
        envPath = path.join( process.cwd(), envArg.split( "=" )[ 1 ] );

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

    // Try to connect to the database.
    await PrismaBotClient.$.connect();

    GlobalLogger.$.info( entryPoint, "Database is connected" );

    GlobalLogger.$.info( entryPoint, "Registering services..." );

    await registerServices();

    await ServiceLocator.$.waitForAll();

    GlobalLogger.$.info( entryPoint, "Services are registered" );

    import( "./vertix" ).then( ( { default: botInitialize } ) => {
        botInitialize().then( () => {
            createCleanupWorker();

            GlobalLogger.$.info( entryPoint, "Bot is initialized" );
        } );
    } );
}
