import EventEmitter from "node:events";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { UI_GENERIC_SEPARATOR  } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { Client } from "discord.js";

import type { UIService } from "src/ui-service";

import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    TPossibleAdapters,
    TAdapterConstructor,
    TAdapterClassType,
    TAdapterRegisterOptions,
} from "src/definitions/ui-adapter-declaration";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { TModuleConstructor } from "@vertix.gg/gui/src/definitions/ui-module-declration";

export class UIAdapterService extends ServiceWithDependenciesBase<{
    uiService: UIService,
    uiHashService: UIHashService,
}> {
    // TODO: Maybe system entities should be in UI-Service
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

    private static emitter = new EventEmitter();

    public static getName() {
        return "VertixGUI/UIAdapterService";
    }

    public static registerSystemElements( systemElements: typeof UIAdapterService.uiSystemElements ) {
        if ( ! Object.keys( systemElements ).length ) {
            throw new Error( "System elements already registered" );
        }

        Object.assign( UIAdapterService.uiSystemElements, systemElements );

        this.emitter.emit( "system-elements-registered", systemElements );
    }

    public static registerSystemComponents( systemComponents: typeof UIAdapterService.uiSystemComponents ) {
        if ( ! Object.keys( systemComponents ).length ) {
            throw new Error( "System components already registered" );
        }

        Object.assign( UIAdapterService.uiSystemComponents, systemComponents );

        this.emitter.emit( "system-components-registered", systemComponents );
    }

    public static getSystemElements() {
        return UIAdapterService.uiSystemElements;
    }

    public static getSystemComponents() {
        return UIAdapterService.uiSystemComponents;
    }

    public constructor( protected client: Client<true>) {
        super( arguments );

        if ( ! client ) {
            throw new Error( "Client is required" );
        }
    }

    // TODO: use '$$' every where to get the static.
    public get $$() {
        return this.constructor as typeof UIAdapterService;
    }

    public getAll() {
        return this.uiAdaptersTypes;
    }

    public getDependencies() {
        return {
            uiService: "VertixGUI/UIService",
            uiHashService: "VertixGUI/UIHashService"
        };
    }

    public getClient() {
        return this.client;
    }

    public get( uiName: string, silent = false ) {
        uiName = uiName.split( UI_GENERIC_SEPARATOR )[ 0 ];

        const UIClass = this.uiAdaptersTypes.get( uiName ) as TAdapterClassType;

        if ( ! UIClass ) {
            if ( ! silent ) {
                throw new Error( `User interface: '${ uiName }' does not exist` );
            }

            return;
        }

        if ( UIClass.isDynamic() ) {
            return this.createInstance( uiName );
        }

        return this.uiAdaptersStaticInstances.get( uiName );
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
                UIClass.getName() + UI_GENERIC_SEPARATOR + entity.getName()
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

export default UIAdapterService;
