import EventEmitter from "node:events";
import process from "process";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { UI_CUSTOM_ID_SEPARATOR  } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { Client } from "discord.js";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    TPossibleAdapters,
    TAdapterConstructor,
    TAdapterClassType,
    TAdapterRegisterOptions,
} from "src/definitions/ui-adapter-declaration";

import type { TModuleConstructor } from "@vertix.gg/gui/src/definitions/ui-module-declration";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { UIElementChannelSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-channel-select-menu";
import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import type { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";
import type { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import type { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

import type {
    UIElementButtonLanguageContent,
    UIElementSelectMenuLanguageContent,
    UIElementTextInputLanguageContent,
    UIEmbedLanguageContent,
    UIMarkdownLanguageContent,
    UIModalLanguageContent
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

const ADAPTER_CLEANUP_TIMER_INTERVAL = Number( process.env.ADAPTER_CLEANUP_TIMER_INTERVAL ) ||
    300000; // 5 minutes.

export type TAdapterMapping = {
    "base": UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>,
    "execution": UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext>,
    "wizard": UIWizardAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
}

export class UIService extends ServiceWithDependenciesBase<{
    uiHashService: UIHashService,
}> {
    private static cleanupTimerInterval: NodeJS.Timeout;

    private static uiSystemElements: {
        RegenerateButton?: new () => UIElementButtonBase
        WizardBackButton?: new () => UIElementButtonBase;
        WizardNextButton?: new () => UIElementButtonBase;
        WizardFinishButton?: new () => UIElementButtonBase;
    } = {};

    private static uiSystemComponents: {
        InvalidChannelTypeComponent?: UIComponentTypeConstructor;
        MissingPermissionsComponent?: UIComponentTypeConstructor;
    } = {};

    private uiAdaptersTypes = new Map<string, TAdapterClassType | TAdapterConstructor>;
    private uiAdaptersStaticInstances = new Map<string, TPossibleAdapters>;
    private uiAdaptersRegisterOptions = new Map<string, TAdapterRegisterOptions>();

    private uiLanguageManager: UILanguageManagerInterface | null = null;

    private static emitter = new EventEmitter();

    public static getName() {
        return "VertixGUI/UIService";
    }

    public static registerSystemElements( systemElements: typeof UIService.uiSystemElements ) {
        if ( ! Object.keys( systemElements ).length ) {
            throw new Error( "System elements already registered" );
        }

        Object.assign( UIService.uiSystemElements, systemElements );

        this.emitter.emit( "system-elements-registered", systemElements );
    }

    public static registerSystemComponents( systemComponents: typeof UIService.uiSystemComponents ) {
        if ( ! Object.keys( systemComponents ).length ) {
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
        if ( ! UIService.cleanupTimerInterval ) {
            UIService.cleanupTimerInterval = setInterval( UIAdapterBase.cleanupTimer, ADAPTER_CLEANUP_TIMER_INTERVAL );
        }
    }

    public constructor( protected client: Client<true>) {
        super( arguments );

        if ( ! client ) {
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

    public get<T extends keyof TAdapterMapping = "base">( uiName: string, silent = false ): TAdapterMapping[T] | undefined {
        uiName = uiName.split( UI_CUSTOM_ID_SEPARATOR )[ 0 ];

        const UIClass = this.uiAdaptersTypes.get( uiName ) as TAdapterClassType;

        if ( ! UIClass ) {
            if ( ! silent ) {
                throw new Error( `User interface: '${ uiName }' does not exist` );
            }

            return;
        }

        if ( UIClass.isDynamic() ) {
            return this.createInstance( uiName ) as TAdapterMapping[T];
        }

        return this.uiAdaptersStaticInstances.get( uiName ) as TAdapterMapping[T];
    }

    public async registerModule( Module: TModuleConstructor ) {
        Module.validate();

        const adapters = Module.getAdapters();

        await this.registerAdapters( adapters, { module: new Module() } );
    }

    public async registerInternalAdapters() {
        const internalAdapters = await import( "@vertix.gg/gui/src/internal-adapters/index" );

        await this.registerAdapters( Object.values( internalAdapters ) );

        this.$$.emitter.emit( "internal-adapters-registered" );
    }

    public async registerAdapters( adapters: TAdapterClassType[], options: TAdapterRegisterOptions = {} ) {
        adapters.forEach( adapter => {
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

        const entities = UIClass.getComponent().getEntities();

        // In order to have all hashes generated before the UI is created.
        for ( const entity of entities ) {
            this.services.uiHashService.generateId(
                UIClass.getName() + UI_CUSTOM_ID_SEPARATOR + entity.getName()
            );
        }

        this.storeClass( UIClass, options );

        // Store only instances that are static.
        if ( UIClass.isStatic() ) {
            this.storeInstance( UIClass );
        }

        this.$$.emitter.emit( "adapter-registered", uiName );

        this.logger.log( this.registerAdapter,
            `Register entity: '${ uiName }' instanceType: '${ UIClass.getInstanceType() }'`
        );
    }

    public async waitForAdapter( uiName: string, options = { timeout: 0 } ) {
        return new Promise<void>( ( resolve, reject ) => {
            const callback = ( name: string ) => {
                if ( name === uiName ) {
                    this.$$.emitter.off( "adapter-registered", callback );
                    resolve();
                }

                setTimeout( () => {
                    reject( new Error( `User interface '${ uiName }' does not exist` ) );
                }, options.timeout );
            };

            this.$$.emitter.on( "adapter-registered", callback );
        } );
    }

    public registerUILanguageManager( uiLanguageManager: UILanguageManagerInterface ) {
        if ( this.uiLanguageManager ) {
            throw new Error( "UI Language Manager is already registered" );
        }

        this.uiLanguageManager = uiLanguageManager;
    }

    public getUILanguageManager() {
        return this.uiLanguageManager || new class NullLanguageManager extends InitializeBase implements UILanguageManagerInterface {
            public constructor() {
                super();
            }

            public static getName() {
                return "VertixGUI/NullLanguageManager";
            }

            public getButtonTranslatedContent( button: UIElementButtonBase, _languageCode: string | undefined ): Promise<UIElementButtonLanguageContent> {
                return Promise.resolve( button.getTranslatableContent() );
            }

            public getEmbedTranslatedContent( embed: UIEmbedBase, _languageCode: string | undefined ): Promise<UIEmbedLanguageContent> {
                return Promise.resolve( embed.getTranslatableContent() );
            }

            public getMarkdownTranslatedContent( markdown: UIMarkdownBase, _languageCode: string | undefined ): Promise<UIMarkdownLanguageContent> {
                return Promise.resolve( markdown.getTranslatableContent() );
            }

            public getModalTranslatedContent( modal: UIModalBase, _languageCode: string | undefined ): Promise<UIModalLanguageContent> {
                return Promise.resolve( modal.getTranslatableContent() );
            }

            public getSelectMenuTranslatedContent( selectMenu: UIElementStringSelectMenu | UIElementUserSelectMenu | UIElementRoleSelectMenu | UIElementChannelSelectMenu, _languageCode: string | undefined ): Promise<UIElementSelectMenuLanguageContent> {
                return Promise.resolve( selectMenu.getTranslatableContent() );
            }

            public getTextInputTranslatedContent( textInput: UIElementInputBase, _languageCode: string | undefined ): Promise<UIElementTextInputLanguageContent> {
                return Promise.resolve( textInput.getTranslatableContent() );
            }

            public register(): Promise<void> {
                return Promise.resolve( undefined );
            }
        }();
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

        if ( ! UIClass ) {
            throw new Error( `Adapter: '${ uiName }' does not exist` );
        }

        const options = this.uiAdaptersRegisterOptions.get( uiName );

        if ( ! options ) {
            throw new Error( `Adapter: '${ uiName }' options do not exist` );
        }

        return new UIClass( options );
    }
}

export default UIService;
