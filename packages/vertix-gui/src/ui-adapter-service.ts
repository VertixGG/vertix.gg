import EventEmitter from "node:events";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { UI_GENERIC_SEPARATOR  } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import type { Client } from "discord.js";

import type { UIService } from "src/ui-service";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import type { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import type { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

type ManagedClass =
    UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIWizardAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>;

type MangedClassType = typeof UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
type MangedClassConstructor = { new( uiManager: UIAdapterService ): ManagedClass };

export class UIAdapterService extends ServiceWithDependenciesBase<{
    uiService: UIService;
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

    private uiAdaptersTypes = new Map<string, MangedClassType | MangedClassConstructor>;
    private uiStaticInstances = new Map<string, ManagedClass>;

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
            uiService: "VertixGUI/UIService"
        };
    }

    public getClient() {
        return this.client;
    }

    public get( uiName: string, silent = false ) {
        // TODO: Use constants for the separator.
        uiName = uiName.split( UI_GENERIC_SEPARATOR )[ 0 ];

        const UIClass = this.uiAdaptersTypes.get( uiName ) as MangedClassType;

        if ( ! UIClass ) {
            if ( ! silent ) {
                throw new Error( `User interface: '${ uiName }' does not exist` );
            }

            return;
        }

        if ( UIClass.isDynamic() ) {
            return this.createInstance( uiName );
        }

        return this.uiStaticInstances.get( uiName );
    }

    public async registerInternalAdapters() {
        const internalAdapters = await import( "@vertix.gg/gui/src/internal-adapters/index" );

        await this.registerAdapters( Object.values( internalAdapters ) );

        this.$$.emitter.emit( "internal-adapters-registered" );
    }

    public async registerAdapters( adapters: MangedClassType[] ) {
        adapters.forEach( adapter => {
            this.registerAdapter( adapter );
        } );
    }

    public registerAdapter( UIClass: MangedClassType ) {
        const uiName = UIClass.getName();

        if ( this.uiAdaptersTypes.has( uiName ) ) {
            throw new Error( `User interface '${ uiName }' already exists` );
        }

        // Each entity must be validated before it is registered.
        UIClass.validate();

        const entities = UIClass.getComponent().getEntities();

        for ( const entity of entities ) {
            this.services.uiService.generateCustomIdHash( UIClass.getName() + UI_GENERIC_SEPARATOR + entity.getName() );
        }

        this.storeClass( UIClass );

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
    private storeClass( UIClass: MangedClassType ) {
        const uiName = UIClass.getName();

        this.uiAdaptersTypes.set( uiName, UIClass );
    }

    /**
     * Function storeInstance() :: Stores only static entity instances.
     */
    private storeInstance( UIClass: MangedClassType ) {
        const instance = this.createInstance( UIClass.getName() );

        this.uiStaticInstances.set( UIClass.getName(), instance );
    }

    /**
     * Function createInstance() :: Creates a new instance of the entity for `get()` and `register()`.
     */
    private createInstance( uiName: string ) {
        const UIClass = this.uiAdaptersTypes.get( uiName ) as MangedClassConstructor;

        if ( ! UIClass ) {
            throw new Error( `User interface '${ uiName }' does not exist` );
        }

        return new UIClass( this );
    }
}

export default UIAdapterService;
