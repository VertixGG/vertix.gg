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

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { config } from "dotenv";

import { initWorker } from "@vertix.gg/bot/src/_workers/cleanup-worker";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import type UIVersioningAdapterService from "@vertix.gg/gui/src/ui-versioning-adapter-service";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { Client } from "discord.js";

async function registerUIServices( client: Client<true> ) {
    const uiServices = await Promise.all( [
        import("@vertix.gg/gui/src/ui-service"),
        import("@vertix.gg/gui/src/ui-adapter-service"),
        import("@vertix.gg/gui/src/ui-hash-service"),
        import("@vertix.gg/gui/src/ui-versioning-adapter-service"),
    ] );

    uiServices.forEach( service => {
        GlobalLogger.$.debug( registerUIServices, `Registering service: '${ service.default.getName() }'` );

        ServiceLocator.$.register<ServiceBase>( service.default, client );

        GlobalLogger.$.debug( registerUIServices, `Service registered: '${ service.default.getName() }'` );
    } );

    await ServiceLocator.$.waitForAll();
}

async function registerServices() {
    const services = await Promise.all( [
        import("@vertix.gg/bot/src/services/app-service"),

        import("@vertix.gg/bot/src/services/direct-message-service"),

        import("@vertix.gg/bot/src/services/channel-service"),
        import("@vertix.gg/bot/src/services/dynamic-channel-service"),
        import("@vertix.gg/bot/src/services/dynamic-channel-claim-service"),
        import("@vertix.gg/bot/src/services/master-channel-service")
    ] );

    services.forEach( service => {
        GlobalLogger.$.debug( registerServices, `Registering service: '${ service.default.getName() }'` );

        ServiceLocator.$.register<ServiceBase>( service.default );

        GlobalLogger.$.debug( registerServices, `Service registered: '${ service.default.getName() }'` );
    } );

    await ServiceLocator.$.waitForAll();
}

async function registerUIAdapters() {
    // Register UI adapters
    const uiModuleV2 = await import("@vertix.gg/bot/src/ui-v2/ui-module"),
        uiAdapterService = ServiceLocator.$.get<UIAdapterService>( "VertixGUI/UIAdapterService" );

    const { UIRegenerateButton } = await import( "@vertix.gg/bot/src/ui-v2/_general/regenerate/ui-regenerate-button" ),
        { UIWizardBackButton } = await import( "@vertix.gg/bot/src/ui-v2/_general/wizard/ui-wizard-back-button" ),
        { UIWizardNextButton } = await import( "@vertix.gg/bot/src/ui-v2/_general/wizard/ui-wizard-next-button" ),
        { UIWizardFinishButton } = await import( "@vertix.gg/bot/src/ui-v2/_general/wizard/ui-wizard-finish-button" );

    uiAdapterService.$$.registerSystemElements( {
        RegenerateButton: UIRegenerateButton,
        WizardBackButton: UIWizardBackButton,
        WizardNextButton: UIWizardNextButton,
        WizardFinishButton: UIWizardFinishButton
    } );

    const { InvalidChannelTypeComponent } = await import( "@vertix.gg/bot/src/ui-v2/_general/invalid-channel-type/invalid-channel-type-component" ),
        { MissingPermissionsComponent } = await import( "@vertix.gg/bot/src/ui-v2/_general/missing-permissions/missing-permissions-component" );

    uiAdapterService.$$.registerSystemComponents( {
        InvalidChannelTypeComponent: InvalidChannelTypeComponent,
        MissingPermissionsComponent: MissingPermissionsComponent
    } );

    await uiAdapterService.registerInternalAdapters();

    await uiAdapterService.registerModule( uiModuleV2.default );
}

async function registerUILanguageManager() {
    // Register UI language manager
    await UILanguageManager.$.register();

    // Register UI language manager in UIService
    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .registerUILanguageManager( UILanguageManager.$ );
}

async function registerConfigs() {
    GlobalLogger.$.info( registerConfigs, "Registering configs ..." );

    const configs = await Promise.all( [
        import("@vertix.gg/bot/src/config/master-channel-config")
    ] );

    configs.forEach( config => {
        GlobalLogger.$.debug( registerConfigs, `Registering config: '${ config.default.getName() }'` );

        ConfigManager.$.register( config.default );

        GlobalLogger.$.debug( registerConfigs, `Config registered: '${ config.default.getName() }'` );
    } );

    GlobalLogger.$.info( registerConfigs, "Configs are registered" );
}

async function registerUIVersionStrategies() {
    GlobalLogger.$.info( registerUIVersionStrategies, "Registering version strategies ..." );

    const versionStrategies = await Promise.all( [
            await import("@vertix.gg/base/src/version-strategies/ui-guild-version-strategy"),
        ]),
        uiVersioningAdapterService = ServiceLocator.$.get<UIVersioningAdapterService>( "VertixGUI/UIVersioningAdapterService" );

    uiVersioningAdapterService.registerVersions( [ 2, 3 ] );

    versionStrategies.forEach( strategy => {
        GlobalLogger.$.debug( registerUIVersionStrategies, `Registering version strategy: '${ strategy.default.getName() }'` );

        uiVersioningAdapterService.registerStrategy( strategy.default );

        GlobalLogger.$.debug( registerUIVersionStrategies, `Version strategy registered: '${ strategy.default.getName() }'` );
    } );

    GlobalLogger.$.info( registerUIVersionStrategies, "Version strategies are registered" );
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

    GlobalLogger.$.info( entryPoint, "Establishing bot connection ..." );

    const { default: botInitialize } = await import("./vertix");

    const client = await botInitialize();

    // TODO Check what happened if no services are registered, and adapter are requested,
    await registerUIServices( client );
    await registerConfigs();

    await registerServices();

    GlobalLogger.$.info( entryPoint, "Services are registered" );

    await registerUIAdapters();
    await registerUILanguageManager();

    await registerUIVersionStrategies();

    process.env.Z_RUN_TSCONFIG_PATH = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), "../tsconfig.json" );

    await createCleanupWorker();

    GlobalLogger.$.info( entryPoint, "Bot is initialized" );
}
