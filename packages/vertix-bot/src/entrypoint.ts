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

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { config } from "dotenv";

import { UI_LANGUAGES_PATH, UI_LANGUAGES_FILE_EXTENSION } from "@vertix.gg/gui/src/bases/ui-language-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { initWorker } from "@vertix.gg/bot/src/_workers/cleanup-worker";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { ConfigBase, ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

import type { Client } from "discord.js";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIAdapterVersioningService } from "@vertix.gg/gui/src/ui-adapter-versioning-service";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

async function registerUIServices( client: Client<true> ) {
    const uiServices = await Promise.all( [
        import( "@vertix.gg/gui/src/ui-service" ),
        import( "@vertix.gg/gui/src/ui-hash-service" ),
        import( "@vertix.gg/gui/src/ui-adapter-versioning-service" )
    ] );

    uiServices.forEach( ( service ) => {
        GlobalLogger.$.debug( registerUIServices, `Registering service: '${ service.default.getName() }'` );

        ServiceLocator.$.register<ServiceBase>( service.default, client );

        GlobalLogger.$.debug( registerUIServices, `Service registered: '${ service.default.getName() }'` );
    } );

    await ServiceLocator.$.waitForAll();
}

export async function registerServices() {
    const services = await Promise.all( [
        import( "@vertix.gg/bot/src/services/app-service" ),

        import( "@vertix.gg/bot/src/services/direct-message-service" ),

        import( "@vertix.gg/bot/src/services/channel-service" ),
        import( "@vertix.gg/bot/src/services/dynamic-channel-service" ),
        import( "@vertix.gg/bot/src/services/master-channel-service" )
    ] );

    services.forEach( ( service ) => {
        GlobalLogger.$.debug( registerServices, `Registering service: '${ service.default.getName() }'` );

        ServiceLocator.$.register<ServiceBase>( service.default );

        GlobalLogger.$.debug( registerServices, `Service registered: '${ service.default.getName() }'` );
    } );

    await ServiceLocator.$.waitForAll();
}

async function registerSystemUI() {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    // TODO: Current wizard buttons for V3, are unused, those should become module specific.
    const { UIRegenerateButton } = await import( "@vertix.gg/bot/src/ui/general/regenerate/ui-regenerate-button" ),
        { UIWizardBackButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-back-button" ),
        { UIWizardNextButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-next-button" ),
        { UIWizardFinishButton } = await import( "@vertix.gg/bot/src/ui/general/wizard/ui-wizard-finish-button" );

    uiService.$$.registerSystemElements( {
        RegenerateButton: UIRegenerateButton,
        WizardBackButton: UIWizardBackButton,
        WizardNextButton: UIWizardNextButton,
        WizardFinishButton: UIWizardFinishButton
    } );

    const { InvalidChannelTypeComponent } = await import( "@vertix.gg/bot/src/ui/general/invalid-channel-type/invalid-channel-type-component" ),
        { MissingPermissionsComponent } = await import( "@vertix.gg/bot/src/ui/general/missing-permissions/missing-permissions-component" );

    uiService.$$.registerSystemComponents( {
        InvalidChannelTypeComponent: InvalidChannelTypeComponent,
        MissingPermissionsComponent: MissingPermissionsComponent
    } );

    await uiService.registerSystemUIAdapters();
}

async function registerUIAdapters() {
    const uiModules = await Promise.all( [
        import( "@vertix.gg/bot/src/ui/general/ui-module" ),
        import( "@vertix.gg/bot/src/ui/v2/ui-module" ),
        import( "@vertix.gg/bot/src/ui/v3/ui-module" )
    ] );

    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    await registerSystemUI();

    uiModules.forEach( ( module ) => {
        GlobalLogger.$.debug( registerUIAdapters, `Registering UI module: '${ module.default.getName() }'` );

        uiService.registerModule( module.default );

        GlobalLogger.$.debug( registerUIAdapters, `UI module registered: '${ module.default.getName() }'` );
    } );
}

async function registerUILanguageManager( options: {
    shouldImport?: boolean;
    shouldValidate?: boolean;
} = {} ) {
    options = Object.assign( {
        shouldImport: true,
        shouldValidate: true
    }, options );

    const { UILanguageManager } = await import( "@vertix.gg/bot/src/ui/ui-language-manager" );

    // Register UI language manager
    await UILanguageManager.$.register( options );

    // Register UI language manager in UIService
    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).registerUILanguageManager( UILanguageManager.$ );
}

async function registerConfigs() {
    GlobalLogger.$.info( registerConfigs, "Registering configs ..." );

    const { ConfigManager } = await import( "@vertix.gg/base/src/managers/config-manager" );

    const configs = await Promise.all( [
        import( "@vertix.gg/bot/src/config/master-channel-config" ),
        import( "@vertix.gg/bot/src/config/master-channel-config-v3" )
    ] );

    await Promise.all(
        configs.map( async( config ) => {
            GlobalLogger.$.debug( registerConfigs, `Registering config: '${ config.default.getName() }'` );

            await ConfigManager.$.register<ConfigBase<ConfigBaseInterface>>( config.default );

            GlobalLogger.$.debug( registerConfigs, `Config registered: '${ config.default.getName() }'` );
        } )
    );

    GlobalLogger.$.info( registerConfigs, "Configs are registered" );
}

async function registerUIVersionStrategies() {
    GlobalLogger.$.info( registerUIVersionStrategies, "Registering version strategies ..." );

    const versionStrategies = await Promise.all( [
            await import( "@vertix.gg/base/src/version-strategies/ui-master-channel-version-strategy" )
        ] ),
        uiVersioningAdapterService = ServiceLocator.$.get<UIAdapterVersioningService>(
            "VertixGUI/UIVersioningAdapterService"
        );

    uiVersioningAdapterService.registerVersions( [ 2, 3 ] );

    versionStrategies.forEach( ( strategy ) => {
        GlobalLogger.$.debug(
            registerUIVersionStrategies,
            `Registering version strategy: '${ strategy.UIMasterChannelVersionStrategy.getName() }'`
        );

        uiVersioningAdapterService.registerStrategy( strategy.UIMasterChannelVersionStrategy );

        GlobalLogger.$.debug(
            registerUIVersionStrategies,
            `Version strategy registered: '${ strategy.UIMasterChannelVersionStrategy.getName() }'`
        );
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

/**
 * Exports all available language files to the language directory
 * @param languageCodes Optional array of language codes to export. If not provided, exports all languages.
 */
async function exportLanguages( languageCodes: string[] ) {
    GlobalLogger.$.info( exportLanguages, "Exporting languages..." );

    // Import the language manager and utils
    const { UILanguageManager } = await import( "@vertix.gg/bot/src/ui/ui-language-manager" );
    const { LanguageUtils } = await import( "@vertix.gg/bot/src/utils/language" );

    const { default: botInitialize } = await import( "./vertix" );
    const client = await botInitialize();

    // Register required services
    await registerUIServices( client );

    await registerConfigs();
    await registerServices();

    await EmojiManager.$.promise();

    await registerUIAdapters();
    await registerUILanguageManager( { shouldImport: false, shouldValidate: false } );
    await registerUIVersionStrategies();

    const initialLanguage = UILanguageManager.$.getInitialLanguage();

    // Get all available languages from the manager
    const availableLanguages = UILanguageManager.$.getAvailableLanguages();

    availableLanguages.set( initialLanguage.code, initialLanguage );

    // If specific languages were requested, validate them
    if ( languageCodes?.length ) {
        const invalidCodes = languageCodes.filter( code => !availableLanguages.has( code ) );
        if ( invalidCodes.length ) {
            throw new Error( `Invalid language code(s): ${ invalidCodes.join( ", " ) }. Available codes: ${ Array.from( availableLanguages.keys() ).join( ", " ) }` );
        }
    }

    // Filter languages if specific codes were requested
    const languages = languageCodes.length
        ? new Map( [ ...availableLanguages ].filter( ( [ code ] ) => languageCodes.includes( code ) ) )
        : availableLanguages;

    GlobalLogger.$.info( exportLanguages, `Found ${ languages.size } languages to export` );

    // Export each language
    for ( const [ code, language ] of languages.entries() ) {
        const exportPath = path.join( UI_LANGUAGES_PATH, `${ code }.export${ UI_LANGUAGES_FILE_EXTENSION }` );
        await LanguageUtils.$.export( language, exportPath );
        GlobalLogger.$.info( exportLanguages, `Exported language: '${ code }' to ${ exportPath }` );
    }

    GlobalLogger.$.info( exportLanguages, "Language export completed successfully" );

    return languages.size;
}

export async function entryPoint( options: {
    enableListeners?: boolean;
} ) {
    options = Object.assign( {
        enableListeners: true
    }, options );

    const envArg =
        process.argv.find( ( arg ) => arg.startsWith( "--env=" ) ) || `--env=${ process.env.DOTENV_CONFIG_PATH || ".env" }`;

    const envPath = path.join( process.cwd(), "../../", envArg.split( "=" )[ 1 ] );

    GlobalLogger.$.log( entryPoint,"ENV PATH:", envPath );
    GlobalLogger.$.log( entryPoint, "CWD:", process.cwd() );

    const envOutput = config( {
        path: envPath,
        override: true
    } );

    if ( envOutput.parsed ) {
        Object.entries( envOutput.parsed ).forEach( ( [ key, value ] ) => {
            process.env[ key ] = value;
        } );
    }

    GlobalLogger.$.log( entryPoint,"ENV OUTPUT:", {
        error: envOutput.error,
        parsed: envOutput.parsed,
        env: process.env
    } );

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

    // Handle export-languages command
    const exportArg = process.argv.find( arg => arg.startsWith( "--export-languages" ) );
    if ( exportArg ) {
        GlobalLogger.$.info( entryPoint, "Export languages command detected" );
        try {
            // Parse language codes if provided (format: --export-languages=en,ru)
            const languageCodes = exportArg.includes( "=" )
                ? exportArg.split( "=" )[ 1 ].split( "," ).map( code => code.trim() )
                : undefined;

            const languageCount = await exportLanguages( languageCodes ?? [ "en" ] );
            GlobalLogger.$.info( entryPoint, `Successfully exported ${ languageCount } languages` );
            process.exit( 0 );
        } catch ( error ) {
            GlobalLogger.$.error( entryPoint, "Failed to export languages", error );
            process.exit( 1 );
        }
    }

    await PrismaBotClient.$.connect();

    GlobalLogger.$.info( entryPoint, "Database is connected" );
    GlobalLogger.$.info( entryPoint, "Registering services..." );
    GlobalLogger.$.info( entryPoint, "Establishing bot connection ..." );

    const { default: botInitialize } = await import( "./vertix" );
    const client = await botInitialize( {
        enableListeners: options.enableListeners
    } );

    await registerUIServices( client );
    await registerConfigs();
    await registerServices();

    GlobalLogger.$.info( entryPoint, "Services are registered" );

    await registerUIAdapters();

    await EmojiManager.$.promise().then( () => {
        GlobalLogger.$.info( entryPoint,"Emoji manager is initialized" );
    } );

    await registerUILanguageManager( {
        shouldImport: false,
        shouldValidate: false
    } );

    await registerUIVersionStrategies();

    process.env.Z_RUN_TSCONFIG_PATH = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), "../tsconfig.json" );

    //await createCleanupWorker();

    GlobalLogger.$.info( entryPoint, "Bot is initialized" );
}
