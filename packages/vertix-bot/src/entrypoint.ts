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

import { collectUIDefinitions, exportUIDefinitions } from "@vertix.gg/gui/src/runtime/ui-definition-exporter";
import { UIArgsProviderRegistry } from "@vertix.gg/gui/src/runtime/ui-args-provider-registry";
import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import { interactionHandlerRegistry  } from "@vertix.gg/gui/src/runtime/interaction-handler-registry";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import { initWorker } from "@vertix.gg/bot/src/_workers/cleanup-worker";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { BotCustomizationProvider } from "@vertix.gg/bot/src/providers/bot-customization-provider";

import type { InteractionHandler } from "@vertix.gg/gui/src/runtime/interaction-handler-registry";

import type { ConfigBase, ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

import type { Client } from "discord.js";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIAdapterVersioningService } from "@vertix.gg/gui/src/ui-adapter-versioning-service";
import type { UIDataService } from "@vertix.gg/gui/src/ui-data-service";
import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";
import type { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";
import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";

type AdapterWithComponent = {
    getComponent?: () => {
        getEntities?: () => unknown[];
    };
};

type EntityConstructor = {
    getName?: () => string;
    prototype?: unknown;
};

type AdapterCtor = {
    getName?: () => string;
};

type BindingRegistrationOptions = {
    flowTriggers?: readonly {
        transition?: string;
    }[];
};

type ExportBinder = {
    bindButton: (
        name: string,
        callback: ( context: object, interaction: object ) => Promise<void>,
        options?: BindingRegistrationOptions
    ) => void;
    bindModal: (
        name: string,
        callback: ( context: object, interaction: object ) => Promise<void>,
        options?: BindingRegistrationOptions
    ) => void;
    bindModalWithButton: (
        button: string,
        modal: string,
        callback: ( context: object, interaction: object ) => Promise<void>,
        options?: BindingRegistrationOptions
    ) => void;
    bindSelectMenu: (
        name: string,
        callback: ( context: object, interaction: object ) => Promise<void>,
        options?: BindingRegistrationOptions
    ) => void;
    bindUserSelectMenu: (
        name: string,
        callback: ( context: object, interaction: object ) => Promise<void>,
        options?: BindingRegistrationOptions
    ) => void;
};

function registerHandlerIfMissing(
    id: string,
    handler: InteractionHandler
): void {
    if ( interactionHandlerRegistry.has( id ) ) {
        return;
    }

    interactionHandlerRegistry.register( id, handler );
}

function registerExportHandlersFromModules( modules: Array<{ default?: object }> ): void {
    modules.forEach( ( moduleEntry ) => {
        const ModuleCtor = ( moduleEntry as { default?: object } ).default ?? moduleEntry;

        if ( !ModuleCtor || "function" !== typeof ( ModuleCtor as { getAdapters?: () => object[] } ).getAdapters ) {
            return;
        }

        const adapters = ( ModuleCtor as { getAdapters: () => object[] } ).getAdapters() ?? [];

        adapters.forEach( ( adapter ) => {
            if ( !adapter || "function" !== typeof adapter ) {
                return;
            }

            const adapterCtor = adapter as AdapterCtor;
            const adapterName = adapterCtor.getName?.();

            if ( !adapterName ) {
                return;
            }

            const metadata = Reflect.get( adapterCtor, BUILDER_METADATA_SYMBOL ) as object | undefined;

            if ( !metadata ) {
                return;
            }

            const entityMapHandler = Reflect.get( metadata, "entityMapHandler" ) as ( ( binder: ExportBinder ) => Promise<void> | void ) | undefined;

            const registerBinding = (
                id: string,
                callback: ( context: object, interaction: object ) => Promise<void>,
                options?: BindingRegistrationOptions
            ) => {
                registerHandlerIfMissing( id, async( ...args ) => {
                    const [ context, interaction ] = args;
                    if ( typeof context === "object" && context !== null && typeof interaction === "object" && interaction !== null ) {
                        await callback( context, interaction );
                    }
                } );

                const transitions = options?.flowTriggers?.map( ( trigger ) => trigger.transition ).filter( ( entry ): entry is string => typeof entry === "string" && entry.length > 0 ) ?? [];

                transitions.forEach( ( transition ) => {
                    const flowHandlerId = `${ id }/${ transition }`;
                    registerHandlerIfMissing( flowHandlerId, async( ...args ) => {
                        const [ context, interaction ] = args;
                        if ( typeof context === "object" && context !== null && typeof interaction === "object" && interaction !== null ) {
                            await callback( context, interaction );
                        }
                    } );
                } );
            };

            if ( entityMapHandler ) {
                const binder: ExportBinder = {
                    bindButton: ( name, callback, options ) => {
                        registerBinding( `${ adapterName }/Bindings/Button/${ name }`, callback, options );
                    },
                    bindModal: ( name, callback, options ) => {
                        registerBinding( `${ adapterName }/Bindings/Modal/${ name }`, callback, options );
                    },
                    bindModalWithButton: ( button, _modal, callback, options ) => {
                        registerBinding( `${ adapterName }/Bindings/ModalWithButton/${ button }`, callback, options );
                    },
                    bindSelectMenu: ( name, callback, options ) => {
                        registerBinding( `${ adapterName }/Bindings/StringSelect/${ name }`, callback, options );
                    },
                    bindUserSelectMenu: ( name, callback, options ) => {
                        registerBinding( `${ adapterName }/Bindings/UserSelect/${ name }`, callback, options );
                    }
                };

                void entityMapHandler( binder );
            }

            const hookHandler = ( suffix: string, key: string ) => {
                const handler = Reflect.get( metadata, key ) as InteractionHandler | undefined;

                if ( "function" !== typeof handler ) {
                    return;
                }

                const id = `${ adapterName }/Hooks/${ suffix }`;

                registerHandlerIfMissing( id, handler );
            };

            hookHandler( "GetStartArgs", "startArgsHandler" );
            hookHandler( "GetReplyArgs", "replyArgsHandler" );
            hookHandler( "OnBeforeBuild", "beforeBuildHandler" );
            hookHandler( "OnBeforeFinish", "beforeFinishHandler" );
            hookHandler( "OnStep", "onStepHandler" );
        } );
    } );
}

function preloadUiRegistryFromModules( modules: Array<{ default?: unknown }> ) {
    const toRegister = new Set<unknown>();

    modules.forEach( ( moduleEntry ) => {
        const ModuleCtor = ( moduleEntry as { default?: unknown } ).default ?? moduleEntry;

        if ( !ModuleCtor || "function" !== typeof ( ModuleCtor as { getAdapters?: () => unknown[] } ).getAdapters ) {
            return;
        }

        const adapters = ( ModuleCtor as { getAdapters: () => unknown[] } ).getAdapters() ?? [];

        adapters.forEach( ( adapter: unknown ) => {
            const adapterWithComponent = adapter as AdapterWithComponent;
            const component = adapterWithComponent?.getComponent?.();

            if ( component?.getEntities ) {
                const entities = component.getEntities();

                entities.forEach( ( entity: unknown ) => {
                    toRegister.add( entity );
                } );
            }
        } );
    } );

    toRegister.forEach( ( classCtor: unknown ) => {
        const ClassCtor = classCtor as EntityConstructor;
        const name = ClassCtor?.getName?.();

        if ( !name || uiClassRegistry.has( name ) ) {
            return;
        }

        if (
            ClassCtor.prototype instanceof UIElementBase ||
            ClassCtor.prototype instanceof UIEmbedBase ||
            ClassCtor.prototype instanceof UIModalBase ||
            ClassCtor.prototype instanceof UIMarkdownBase
        ) {
            const name = ClassCtor.getName?.();
            if ( name ) {
                uiClassRegistry.register( ClassCtor as RegisterableClass<object> );
            }
        }
    } );
}

function registerFlowDataProvidersFromModules(
    modules: Array<{ getFlows?: () => unknown[]; getSystemFlows?: () => unknown[] }>
) {
    const flows = modules.flatMap( ( mod ) => [
        ...( mod.getFlows?.() ?? [] ),
        ...( mod.getSystemFlows?.() ?? [] )
    ] );

    flows.forEach( ( flow ) => {
        if ( !flow || typeof flow !== "function" ) {
            return;
        }

        const providers = ( ( flow as { getArgsDataProviders?: () => Array<[ string, string ]> } ).getArgsDataProviders?.() ?? [] );
        providers.forEach( ( [ adapterName, dataComponentName ]: [ string, string ] ) => {
            if ( !UIArgsProviderRegistry.$.has( adapterName ) ) {
                UIArgsProviderRegistry.$.registerDataProvider( adapterName, dataComponentName );
            }
        } );
    } );
}

async function _registerDynamicChannelClaimManagerFromExports(
    uiService: UIService,
    loaderService: { getLoader: () => unknown }
) {
    const { DynamicChannelPrimaryMessageElementsGroup } = await import(
        "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group"
    );
    const { DynamicChannelElementsGroup } = await import(
        "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group"
    );

    const claimButtonV3 = DynamicChannelPrimaryMessageElementsGroup.getByName?.(
        "VertixBot/UI-V3/DynamicChannelClaimChannelButton"
    );

    const claimButtonV2 = DynamicChannelElementsGroup.getByName?.(
        "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton"
    );

    const v3ButtonId = String( claimButtonV3?.getId?.() ?? "claim-button-v3" );
    const v2ButtonId = String( claimButtonV2?.getId?.() ?? "claim-button-v2" );

    // V3
    try {
        DynamicChannelClaimManager.register( "VertixBot/UI-V3/DynamicChannelClaimManager", {
            adapters: {
                claimStartAdapter: () => uiService.get( "VertixBot/UI-V3/ClaimStartAdapter" )!,
                claimVoteAdapter: () => uiService.get<"execution">( "VertixBot/UI-V3/ClaimVoteAdapter" )!,
                claimResultAdapter: () => uiService.get<"execution">( "VertixBot/UI-V3/ClaimResultAdapter" )!
            },
            dynamicChannelClaimButtonId: v3ButtonId,
            definitionLoader: loaderService.getLoader() as never
        } );
    } catch {
        // Instance already exists, ignore
    }

    // V2
    try {
        DynamicChannelClaimManager.register( "VertixBot/UI-V2/DynamicChannelClaimManager", {
            adapters: {
                claimStartAdapter: () => uiService.get( "VertixBot/UI-V2/ClaimStartAdapter" )!,
                claimVoteAdapter: () => uiService.get<"execution">( "VertixBot/UI-V2/ClaimVoteAdapter" )!,
                claimResultAdapter: () => uiService.get<"execution">( "VertixBot/UI-V2/ClaimResultAdapter" )!
            },
            dynamicChannelClaimButtonId: v2ButtonId,
            definitionLoader: loaderService.getLoader() as never
        } );
    } catch {
        // Instance already exists, ignore
    }
}

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
        import( "@vertix.gg/bot/src/services/channel-cleanup-service" ),
        import( "@vertix.gg/bot/src/services/dynamic-channel-service" ),
        import( "@vertix.gg/bot/src/services/master-channel-service" ),
        import( "@vertix.gg/bot/src/services/scaling-channel-service" ),
        import( "@vertix.gg/bot/src/services/management-ipc-service" ),
        import( "@vertix.gg/bot/src/services/ui-definition-loader-service" )
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
    const registerCodeModules = () => {
        uiModules.forEach( ( module ) => {
            GlobalLogger.$.debug( registerUIAdapters, `Registering UI module: '${ module.default.getName() }'` );

            uiService.registerModule( module.default );

            GlobalLogger.$.debug( registerUIAdapters, `UI module registered: '${ module.default.getName() }'` );
        } );
    };

    await registerSystemUI();
    registerExportHandlersFromModules( uiModules );
    preloadUiRegistryFromModules( uiModules );
    registerCodeModules();
    registerFlowDataProvidersFromModules( uiModules.map( ( m ) => m.default ) );
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
        import( "@vertix.gg/bot/src/config/master-channel-config-v3" ),
        import( "@vertix.gg/bot/src/config/scaling-channel-config" )
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
        await initWorker();
        GlobalLogger.$.admin( createCleanupWorker, "Cleanup worker finished" );
    } catch( error ) {
        GlobalLogger.$.error( createCleanupWorker, "", error );
    }
}

async function registerLoggerServerService() {
    GlobalLogger.$.info( registerLoggerServerService, "Logger Server is now a standalone process. Services will connect as clients." );
}

async function registerIPCService() {
    GlobalLogger.$.info( registerIPCService, "Registering IPC service..." );

    const { IPCService } = await import( "@vertix.gg/base/src/modules/ipc" );

    // Check if already registered (for hot reload)
    const existing = ServiceLocator.$.get<typeof IPCService.prototype>( IPCService.getName(), { silent: true } );

    if ( existing ) {
        if ( existing.isReady() ) {
            GlobalLogger.$.info( registerIPCService, "IPC service already registered and connected to Redis" );
        } else {
            GlobalLogger.$.warn( registerIPCService, "IPC service already registered but Redis not available" );
        }
        return;
    }

    ServiceLocator.$.register( IPCService );

    const ipcService = await ServiceLocator.$.waitFor<typeof IPCService.prototype>( IPCService.getName(), {
        timeout: 5000
    } );

    if ( ipcService.isReady() ) {
        GlobalLogger.$.info( registerIPCService, "IPC service is registered and connected to Redis" );
    } else {
        GlobalLogger.$.warn( registerIPCService, "IPC service registered but Redis not available - dashboard management features will be disabled" );
    }
}

async function registerDummyIPCService() {
    GlobalLogger.$.info( registerDummyIPCService, "Registering dummy IPC service for export commands..." );

    const { ServiceBase } = await import( "@vertix.gg/base/src/modules/service/service-base" );

    // Check if already registered
    const existing = ServiceLocator.$.get( "VertixBase/Modules/IPCService", { silent: true } );
    if ( existing ) {
        GlobalLogger.$.info( registerDummyIPCService, "IPC service already registered" );
        return;
    }

    // Create a dummy IPC service that does nothing
    class DummyIPCService extends ServiceBase {
        public static getName(): string {
            return "VertixBase/Modules/IPCService";
        }

        protected async initialize(): Promise<void> {
            this.logger.info( this.initialize, "Dummy IPC Service initialized (no Redis connection)" );
        }

        public async shutdown(): Promise<void> {
            // No-op
        }

        public async publish(): Promise<void> {
            // No-op
        }

        public async subscribe(): Promise<void> {
            // No-op
        }

        public unsubscribe(): void {
            // No-op
        }

        public isReady(): boolean {
            return false;
        }

        public async request(): Promise<never> {
            throw new Error( "Dummy IPC service does not support requests" );
        }

        public async onRequest(): Promise<void> {
            // No-op
        }
    }

    ServiceLocator.$.register( DummyIPCService );

    await ServiceLocator.$.waitFor( "VertixBase/Modules/IPCService", { timeout: 5000 } );

    GlobalLogger.$.info( registerDummyIPCService, "Dummy IPC service registered" );
}

async function registerMCPService() {
    GlobalLogger.$.info( registerMCPService, "Registering MCP service (Logger Client) ..." );

    const LOGGER_SERVER_HTTP_PORT = process.env.LOGGER_SERVER_HTTP_PORT ? parseInt( process.env.LOGGER_SERVER_HTTP_PORT, 10 ) : 3090;
    const LOGGER_SERVER_HOST = process.env.LOGGER_SERVER_HOST || "localhost";
    const loggerServerUrl = `http://${ LOGGER_SERVER_HOST }:${ LOGGER_SERVER_HTTP_PORT }`;

    const { MCPService } = await import( "@vertix.gg/base/src/modules/mcp-server/mcp-service" );

    ServiceLocator.$.register( MCPService, { loggerServerUrl } );

    await ServiceLocator.$.waitFor( MCPService.getName() );

    GlobalLogger.$.info( registerMCPService, "MCP service (Logger Client) is registered" );
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
    const client = await botInitialize( { enableListeners: false } );

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

async function bootstrapUIRuntime(): Promise<UIService> {
    const { default: botInitialize } = await import( "./vertix" );
    const client = await botInitialize( { enableListeners: false } );
    await registerUIServices( client );
    await registerConfigs();

    // Register dummy IPC service for export commands (doesn't need real Redis connection)
    await registerDummyIPCService();

    await registerServices();
    await EmojiManager.$.promise();
    await registerUIAdapters();
    await registerUILanguageManager( { shouldImport: false, shouldValidate: false } );
    await registerUIVersionStrategies();
    await registerDataServicesAndComponents();
    return ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
}

async function exportUIDefinitionsCommand( outputDirArg?: string ) {
    const outputDir = outputDirArg ?? path.join( "exports", "ui" );
    const resolvedOutputDir = path.isAbsolute( outputDir )
        ? outputDir
        : path.resolve( process.cwd(), "../../", outputDir );
    const uiService = await bootstrapUIRuntime();
    await exportUIDefinitions( uiService, {
        outputDir: resolvedOutputDir,
        includeAdapters: true,
        includeComponents: true,
        includeFlows: true
    } );
    return resolvedOutputDir;
}

async function testFlowCommand( flowNameArg?: string ) {
    const targetFlow = flowNameArg && flowNameArg.length ? flowNameArg : "VertixBot/UI-V3/SetupEditFlow";
    GlobalLogger.$.info( testFlowCommand, `Testing flow '${ targetFlow }'` );
    const uiService = await bootstrapUIRuntime();
    const collections = await collectUIDefinitions( uiService, {
        outputDir: "",
        includeAdapters: true,
        includeComponents: true,
        includeFlows: true
    } );
    const definition = collections.flows.find( ( flow ) => flow.name === targetFlow );
    if ( !definition ) {
        GlobalLogger.$.error( testFlowCommand, `Flow '${ targetFlow }' not found in collected definitions` );
        return;
    }
    const requirements = definition.inputRequirements ?? [];
    GlobalLogger.$.info( testFlowCommand, `Input requirements: ${ JSON.stringify( requirements, null, 2 ) }` );
    GlobalLogger.$.info( testFlowCommand, `Components count: ${ definition.states?.length ?? 0 } states` );
}

// Function to register Data Service and Components
async function registerDataServicesAndComponents() {
    GlobalLogger.$.info( registerDataServicesAndComponents, "Registering data services and components..." );

    // Import the service and components
    const { UIDataService } = await import( "@vertix.gg/gui/src/ui-data-service" );
    const { GuildUIData } = await import( "@vertix.gg/bot/src/data/guild/guild-ui-data" );
    const dataComponents = await Promise.all( [
        import( "@vertix.gg/bot/src/data/guild/master-channels-data" ),
        import( "@vertix.gg/bot/src/data/guild/badwords-data" ),
        import( "@vertix.gg/bot/src/data/guild/max-master-channels-data" ),
        import( "@vertix.gg/bot/src/data/setup/setup-wizard-master-channels-data" ),
        import( "@vertix.gg/bot/src/data/dynamic-channel/dynamic-channel-ui-data" ),
        import( "@vertix.gg/bot/src/data/dynamic-channel/setup-edit-requirements-data" ),
    ] );

    ServiceLocator.$.register( GuildUIData as unknown as new ( ...args: unknown[] ) => ServiceBase );
    GlobalLogger.$.debug( registerDataServicesAndComponents, "Registered service: 'VertixBot/Data/Guild/GuildUIData'" );

    // Register the UIDataService itself
    GlobalLogger.$.debug( registerDataServicesAndComponents, "Registering service: 'VertixGUI/UIDataService'" );
    ServiceLocator.$.register<UIDataService>( UIDataService );
    GlobalLogger.$.debug( registerDataServicesAndComponents, "Service registered: 'VertixGUI/UIDataService'" );

    // Wait for UIDataService to be ready (if it has async initialization)
    await ServiceLocator.$.waitFor( "VertixGUI/UIDataService" );

    // Get the UIDataService instance
    const uiDataService = ServiceLocator.$.get<UIDataService>( UIDataService.getName() );

    type UIDataComponentConstructor = new ( ...args: unknown[] ) => UIDataBase<Record<string, unknown>>;

    // Register the data components with the service
    const componentConstructors = dataComponents.map( module => Object.values( module )[ 0 ] as UIDataComponentConstructor );
    uiDataService.registerDataComponents( componentConstructors );

    componentConstructors.forEach( comp => {
        const componentName = ( comp as { getName?: () => string } ).getName?.();
        if ( componentName ) {
            GlobalLogger.$.debug( registerDataServicesAndComponents, `Registered data component: '${ componentName }'` );
        }
    } );

    GlobalLogger.$.info( registerDataServicesAndComponents, "Data services and components registered." );
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

    GlobalLogger.$.log( entryPoint, "ENV PATH:", envPath );
    GlobalLogger.$.log( entryPoint, "CWD:", process.cwd() );

    await registerLoggerServerService();
    await registerMCPService();

    const envOutput = config( {
        path: envPath,
        override: true
    } );

    if ( envOutput.parsed ) {
        Object.entries( envOutput.parsed ).forEach( ( [ key, value ] ) => {
            process.env[ key ] = value;
        } );
    }

    GlobalLogger.$.log( entryPoint, "ENV OUTPUT:", {
        error: envOutput.error,
        parsedKeysCount: envOutput.parsed ? Object.keys( envOutput.parsed ).length : 0
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
        } catch( error ) {
            GlobalLogger.$.error( entryPoint, "Failed to export languages", error );
            process.exit( 1 );
        }
    }

    const exportUiArg = process.argv.find( ( arg ) => arg.startsWith( "--export-ui" ) );
    if ( exportUiArg ) {
        GlobalLogger.$.info( entryPoint, "Export UI definitions command detected" );
        try {
            const outputDirArg = exportUiArg.includes( "=" )
                ? exportUiArg.split( "=" )[ 1 ]
                : undefined;

            const resolvedOutputDir = await exportUIDefinitionsCommand( outputDirArg );

            GlobalLogger.$.info( entryPoint, `UI definitions exported to '${ resolvedOutputDir }'` );
            process.exit( 0 );
        } catch( error ) {
            GlobalLogger.$.error( entryPoint, "Failed to export UI definitions", error );
            process.exit( 1 );
        }
    }

    const cleanupArg = process.argv.find( arg => arg.startsWith( "--cleanup" ) );
    if ( cleanupArg ) {
        GlobalLogger.$.info( entryPoint, "Cleanup command detected" );
        await createCleanupWorker();
        process.exit( 0 );
    }

    const testFlowArg = process.argv.find( arg => arg.startsWith( "--test-flow" ) );
    if ( testFlowArg ) {
        GlobalLogger.$.info( entryPoint, "Test flow command detected" );
        try {
            const flowName = testFlowArg.includes( "=" )
                ? testFlowArg.split( "=" )[ 1 ]
                : undefined;
            await testFlowCommand( flowName );
            process.exit( 0 );
        } catch( error ) {
            GlobalLogger.$.error( entryPoint, "Failed to run test flow command", error );
            process.exit( 1 );
        }
    }

    await PrismaBotClient.$.connect();

    GlobalLogger.$.info( entryPoint, "Database is connected" );

    // Initialize IPC service (non-blocking, will warn if Redis unavailable)
    await registerIPCService();

    GlobalLogger.$.info( entryPoint, "Registering services..." );
    GlobalLogger.$.info( entryPoint, "Establishing bot connection ..." );

    EmojiManager.$.promise().then( () => {
        GlobalLogger.$.info( entryPoint, "Emoji manager is initialized" );
    } );

    const { default: botInitialize } = await import( "./vertix" );
    const client = await botInitialize( {
        enableListeners: options.enableListeners
    } );

    await registerUIServices( client );

    // Register customization provider for guild-specific UI customizations
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    uiService.registerCustomizationProvider( new BotCustomizationProvider() );
    GlobalLogger.$.info( entryPoint, "Customization provider is registered" );

    await registerConfigs();
    await registerServices();
    await registerDataServicesAndComponents();

    GlobalLogger.$.info( entryPoint, "Services are registered" );

    await EmojiManager.$.promise();

    await registerUIAdapters();

    await registerUILanguageManager( {
        shouldImport: false,
        shouldValidate: false
    } );

    await registerUIVersionStrategies();

    process.env.Z_RUN_TSCONFIG_PATH = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), "../tsconfig.json" );

    GlobalLogger.$.info( entryPoint, "Bot is initialized" );
}
