import EventEmitter from "node:events";

import process from "process";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import type { UIDefinitionLoader } from "@vertix.gg/gui/src/runtime/ui-definition-loader";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";

import type { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIMarkdownLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

import type { TModuleConstructor } from "@vertix.gg/gui/src/definitions/ui-module-declration";

import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";
import type { Client } from "discord.js";
import type {
    TAdapterClassType,
    TAdapterConstructor,
    TAdapterRegisterOptions,
    TPossibleAdapters
} from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowClassType } from "@vertix.gg/definitions/src/ui-flow-definitions";

export type TAdapterMapping = {
    base: UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>;
    execution: UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext>;
    wizard: UIWizardAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>;
};

interface WaitForAdapterOptions {
    timeout?: number;
    silent?: boolean;
}

const ADAPTER_CLEANUP_TIMER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_TIMER_INTERVAL ) || 300000; // 5 minutes.

const ADAPTER_WAITFOR_DEFAULT_OPTIONS: WaitForAdapterOptions = {
    timeout: 0,
    silent: false
};

export class UIService extends ServiceWithDependenciesBase<{
    uiHashService: UIHashService;
}> {
    private static cleanupTimerInterval: NodeJS.Timeout;

    private static uiSystemElements: {
        RegenerateButton?: new () => UIElementButtonBase;
        WizardBackButton?: new () => UIElementButtonBase;
        WizardNextButton?: new () => UIElementButtonBase;
        WizardFinishButton?: new () => UIElementButtonBase;
    } = {};

    private static uiSystemComponents: {
        InvalidChannelTypeComponent?: UIComponentTypeConstructor;
        MissingPermissionsComponent?: UIComponentTypeConstructor;
    } = {};

    private uiModulesTypes = new Map<string, TModuleConstructor>();
    private uiModulesInstances = new Map<string, UIModuleBase>();

    // When definitions are loaded from exports, we synthesize module entries here
    private uiModulesFromDefs = new Set<string>();
    private usingExports = false;

    private uiAdaptersTypes = new Map<string, TAdapterClassType | TAdapterConstructor>();
    private uiAdaptersStaticInstances = new Map<string, TPossibleAdapters>();
    private uiAdaptersRegisterOptions = new Map<string, TAdapterRegisterOptions>();

    private uiLanguageManager: UILanguageManagerInterface | null = null;

    private static emitter = new EventEmitter();

    public static getName() {
        return "VertixGUI/UIService";
    }

    public static registerSystemElements( systemElements: typeof UIService.uiSystemElements ) {
        if ( !Object.keys( systemElements ).length ) {
            throw new Error( "System elements already registered" );
        }

        Object.assign( UIService.uiSystemElements, systemElements );

        this.emitter.emit( "system-elements-registered", systemElements );
    }

    public static registerSystemComponents( systemComponents: typeof UIService.uiSystemComponents ) {
        if ( !Object.keys( systemComponents ).length ) {
            throw new Error( "System components already registered" );
        }

        Object.assign( UIService.uiSystemComponents, systemComponents );

        this.emitter.emit( "system-components-registered", systemComponents );
    }

    public static getSystemElements() {
        return UIService.uiSystemElements;
    }

    public static getSystemComponents() {
        return UIService.uiSystemComponents;
    }

    protected static setupCleanupTimerInterval() {
        if ( !UIService.cleanupTimerInterval ) {
            UIService.cleanupTimerInterval = setInterval( UIAdapterBase.cleanupTimer, ADAPTER_CLEANUP_TIMER_INTERVAL );
        }
    }

    public constructor( protected client: Client<true> ) {
        super( arguments );

        if ( !client ) {
            throw new Error( "Client is required" );
        }

        this.$$.setupCleanupTimerInterval();
    }

    // TODO: use '$$' every where to get the static.
    public get $$() {
        return this.constructor as typeof UIService;
    }

    public getAll() {
        return this.uiAdaptersTypes;
    }

    public getDependencies() {
        return {
            uiHashService: "VertixGUI/UIHashService"
        };
    }

    public getClient() {
        return this.client;
    }

    public getUIModules() {
        return this.uiModulesTypes;
    }

    public isUsingExports(): boolean {
        return this.usingExports;
    }

    // TODO: Rename to getUIAdapter
    public get<T extends keyof TAdapterMapping = "base">(
        uiName: string,
        silent = false
    ): TAdapterMapping[ T ] | undefined {
        uiName = uiName.split( UI_CUSTOM_ID_SEPARATOR )[ 0 ];

        const UIClass = this.uiAdaptersTypes.get( uiName ) as TAdapterClassType;

        if ( !UIClass ) {
            if ( !silent ) {
                throw new Error( `Adapter: '${ uiName }' does not exist` );
            }

            return;
        }

        if ( UIClass.isDynamic() ) {
            return this.createInstance( uiName ) as TAdapterMapping[ T ];
        }

        return this.uiAdaptersStaticInstances.get( uiName ) as TAdapterMapping[ T ];
    }

    public getUIModule<T extends UIModuleBase>( name: string, silent = false ): T | undefined {
        const module = this.uiModulesInstances.get( name ) as T | undefined;

        if ( !module && !silent ) {
            throw new Error( `Module: '${ name }' does not exist` );
        }

        return module;
    }

    public registerModule<T extends TModuleConstructor>( Module: T ) {
        const moduleName = Module.getName();

        if ( this.uiModulesTypes.has( moduleName ) ) {
            throw new Error( `Module: '${ moduleName }' already exists` );
        }
        Module.validate?.(); // Use optional chaining for validate

        const adapters = Module.getAdapters();

        const module = new Module();

        this.uiModulesTypes.set( moduleName, Module );
        this.uiModulesInstances.set( moduleName, module );

        // Register Adapters
        this.registerAdapters( adapters, { module } );

    }

    /**
     * Register adapters/flows/components directly from exported definitions
     * without relying on code modules. The loader must provide runtime classes.
     */
    public async registerFromDefinitions( loader: UIDefinitionLoader, options?: { adapterNames?: string[]; flowNames?: string[]; componentNames?: string[]; moduleName?: string } ) {
        this.usingExports = true;

        const adapterNames = options?.adapterNames || [];
        const flowNames = options?.flowNames || [];
        const componentNames = options?.componentNames || [];
        const moduleName = options?.moduleName || "VertixGUI/ExportsModule";

        const loadedAdapters: TAdapterClassType[] = [];
        const loadedFlows: Array<{ getName: () => string }> = [];

        // Preload components so adapters can reference their classes (no registry needed)
        for ( const name of componentNames ) {
            await loader.loadComponent( name );
        }

        for ( const name of adapterNames ) {
            const hydrated = await loader.loadAdapter( name );
            if ( this.uiAdaptersTypes.has( name ) ) {
                loadedAdapters.push( this.uiAdaptersTypes.get( name ) as TAdapterClassType );
                continue;
            }
            const adapterClass = hydrated.adapterClass;
            if ( !adapterClass ) {
                throw new Error( `UIService/registerFromDefinitions: adapter '${ name }' missing runtime class` );
            }
            this.registerAdapter( adapterClass, { module: { getName: () => moduleName } as unknown as UIModuleBase } );
            loadedAdapters.push( adapterClass );
        }

        // Touch flows so they are cached/hydrated; registry not required
        for ( const name of flowNames ) {
            const hydrated = await loader.loadFlow( name );
            if ( hydrated.flowClass ) {
                loadedFlows.push( hydrated.flowClass );
            }
        }

        // Register module placeholder if not present
        if ( !this.uiModulesTypes.has( moduleName ) ) {
            // Avoid creating empty placeholder modules when no classes were exported.
            if ( loadedAdapters.length === 0 && loadedFlows.length === 0 ) {
                return;
            }

            this.uiModulesFromDefs.add( moduleName );

            class ExportsModule extends UIModuleBase {
                public static override getName() {
                    return moduleName;
                }

                public static override getAdapters() {
                    return loadedAdapters;
                }

                public static override getFlows() {
                    return loadedFlows as unknown as UIFlowClassType[];
                }

                public static override getSystemFlows() {
                    return [];
                }

                public static override getSourcePath() {
                    return moduleName;
                }

                protected override getCustomIdStrategy() {
                    return new UICustomIdPlainStrategy();
                }
            }

            this.uiModulesTypes.set( moduleName, ExportsModule as unknown as TModuleConstructor );
            this.uiModulesInstances.set( moduleName, new ExportsModule() );
        }
    }

    public async registerSystemUIAdapters() {
        const internalAdapters = await import( "@vertix.gg/gui/src/internal-adapters/index" );

        this.registerAdapters( Object.values( internalAdapters ) );

        this.$$.emitter.emit( "internal-adapters-registered" );
    }

    public registerAdapters( adapters: ReadonlyArray<TAdapterClassType>, options: TAdapterRegisterOptions = {} ) {
        adapters.forEach( ( adapter: TAdapterClassType ) => {
            this.registerAdapter( adapter, options );
        } );
    }

    public registerAdapter( UIClass: TAdapterClassType, options: TAdapterRegisterOptions = {} ) {
        const uiName = UIClass.getName();

        if ( this.uiAdaptersTypes.has( uiName ) ) {
            throw new Error( `User interface '${ uiName }' already exists` );
        }

        // Each entity must be validated before it is registered.
        UIClass.validate();

        const entities = ( UIClass.getComponent() as UIComponentTypeConstructor ).getEntities();

        // To have all hashes generated before the UI is created.
        for ( const entity of entities ) {
            this.services.uiHashService.generateId( UIClass.getName() + UI_CUSTOM_ID_SEPARATOR + entity.getName() );
        }

        this.storeClass( UIClass, options );

        // Store only instances that are static.
        if ( UIClass.isStatic() ) {
            this.storeInstance( UIClass );
        }

        this.$$.emitter.emit( "adapter-registered", uiName );

        this.logger.log(
            this.registerAdapter,
            `Register entity: '${ uiName }' instanceType: '${ UIClass.getInstanceType() }'`
        );
    }

    public async waitForAdapter<T extends keyof TAdapterMapping = "base">(
        uiName: string,
        options = ADAPTER_WAITFOR_DEFAULT_OPTIONS
    ): Promise<TAdapterMapping[ T ] | undefined> {
        return new Promise( ( resolve, reject ) => {
            const adapter = this.get<T>( uiName, true );

            if ( adapter ) {
                return resolve( adapter );
            }

            const handleAdapterRegisteredEvent = ( name: string ) => {
                if ( name === uiName ) {
                    this.$$.emitter.off( "adapter-registered", handleAdapterRegisteredEvent );
                    return resolve( this.get<T>( uiName, true )! );
                }
            };

            this.$$.emitter.on( "adapter-registered", handleAdapterRegisteredEvent );

            const handleTimeout = () => {
                this.$$.emitter.off( "adapter-registered", handleAdapterRegisteredEvent );
                if ( options.silent ) {
                    return resolve( undefined );
                }
                reject( new Error( `User interface '${ uiName }' not found in timeout of ${ options.timeout }ms` ) );
            };

            setTimeout( handleTimeout, options.timeout );
        } );
    }

    public async waitForAdapters<T extends keyof TAdapterMapping = "base">(
        uiNames: string[],
        options = ADAPTER_WAITFOR_DEFAULT_OPTIONS
    ) {
        if ( !uiNames.length ) {
            throw new Error( "Requested adapters array is empty" );
        }

        const result = ( await Promise.all( uiNames.map( ( uiName ) => this.waitForAdapter( uiName, options ) ) ) ).filter(
            Boolean
        );

        return result as TAdapterMapping[ T ][];
    }

    public registerUILanguageManager( uiLanguageManager: UILanguageManagerInterface ) {
        if ( this.uiLanguageManager ) {
            throw new Error( "UI Language Manager is already registered" );
        }

        this.uiLanguageManager = uiLanguageManager;
    }

    public getUILanguageManager() {
        return (
            this.uiLanguageManager ||
            new ( class NullLanguageManager extends InitializeBase implements UILanguageManagerInterface {
                public constructor() {
                    super();
                }

                public static getName() {
                    return "VertixGUI/NullLanguageManager";
                }

                public getButtonTranslatedContent(
                    button: UIElementButtonBase,
                    _languageCode: string | undefined
                ): Promise<UIElementButtonLanguageContent> {
                    return Promise.resolve( button.getTranslatableContent() );
                }

                public getEmbedTranslatedContent(
                    embed: UIEmbedBase,
                    _languageCode: string | undefined
                ): Promise<UIEmbedLanguageContent> {
                    return Promise.resolve( embed.getTranslatableContent() );
                }

                public getMarkdownTranslatedContent(
                    markdown: UIMarkdownBase,
                    _languageCode: string | undefined
                ): Promise<UIMarkdownLanguageContent> {
                    return Promise.resolve( markdown.getTranslatableContent() );
                }

                public getModalTranslatedContent(
                    modal: UIModalBase,
                    _languageCode: string | undefined
                ): Promise<UIModalLanguageContent> {
                    return Promise.resolve( modal.getTranslatableContent() );
                }

                public getSelectMenuTranslatedContent(
                    selectMenu:
                        | UIElementStringSelectMenu
                        | UIElementUserSelectMenu
                        | UIElementRoleSelectMenu
                        | UIElementChannelSelectMenu,
                    _languageCode: string | undefined
                ): Promise<UIElementSelectMenuLanguageContent> {
                    return Promise.resolve( selectMenu.getTranslatableContent() );
                }

                public getTextInputTranslatedContent(
                    textInput: UIElementInputBase,
                    _languageCode: string | undefined
                ): Promise<UIElementTextInputLanguageContent> {
                    return Promise.resolve( textInput.getTranslatableContent() );
                }

                public register(): Promise<void> {
                    return Promise.resolve( undefined );
                }
            } )()
        );
    }

    /**
     * Function storeClass() :: Stores the class of the entity, the actual registration.
     */
    private storeClass( UIClass: TAdapterClassType, options: TAdapterRegisterOptions ) {
        const uiName = UIClass.getName();

        this.uiAdaptersTypes.set( uiName, UIClass );
        this.uiAdaptersRegisterOptions.set( uiName, options );
    }

    /**
     * Function storeInstance() :: Stores only static entity instances.
     */
    private storeInstance( UIClass: TAdapterClassType ) {
        const instance = this.createInstance( UIClass.getName() );

        this.uiAdaptersStaticInstances.set( UIClass.getName(), instance );
    }

    /**
     * Function createInstance() :: Creates a new instance of the entity for `get()` and `register()`.
     */
    private createInstance( uiName: string ) {
        const UIClass = this.uiAdaptersTypes.get( uiName ) as TAdapterConstructor;

        if ( !UIClass ) {
            throw new Error( `Adapter: '${ uiName }' does not exist` );
        }

        const options = this.uiAdaptersRegisterOptions.get( uiName );

        if ( !options ) {
            throw new Error( `Adapter: '${ uiName }' options do not exist` );
        }

        return new UIClass( options );
    }
}

export default UIService;
