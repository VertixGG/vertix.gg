import { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { UIAdapterExecutionStepsBase } from "@vertix/ui-v2/_base/ui-adapter-execution-steps-base";
import { UIWizardAdapterBase } from "@vertix/ui-v2/_base/ui-wizard-adapter-base";

import { UI_GENERIC_SEPARATOR } from "@vertix/ui-v2/_base/ui-definitions";

import { InitializeBase } from "@internal/bases/initialize-base";

type ManagedClass =
    UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIWizardAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>;

type MangedClassType = typeof UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
type MangedClassConstructor = { new( uiManager: UIAdapterManager ): ManagedClass };

export class UIAdapterManager extends InitializeBase {
    private static instance: UIAdapterManager;

    private uiAdaptersTypes = new Map<string, MangedClassType | MangedClassConstructor>;
    private uiStaticInstances = new Map<string, ManagedClass>;

    public static getName() {
        return "Vertix/UI-V2/UIManager";
    }

    public static getInstance() {
        if ( ! UIAdapterManager.instance ) {
            UIAdapterManager.instance = new UIAdapterManager();
        }

        return UIAdapterManager.instance;
    }

    public static get $() {
        return UIAdapterManager.getInstance();
    }

    public constructor() {
        super();
    }

    public getAll() {
        return this.uiAdaptersTypes;
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

    public async register() {
        const adapters = [
            ( await import ("@vertix/ui-v2/_general/not-your-channel/not-your-channel-adapter") ).NotYourChannelAdapter,
            ( await import ("@vertix/ui-v2/_general/invalid-channel-type/invalid-channel-type-adapter") ).InvalidChannelTypeAdapter,
            ( await import ("@vertix/ui-v2/_general/missing-permissions/missing-permissions-adapter") ).MissingPermissionsAdapter,

            ( await import ("@vertix/ui-v2/claim/result/claim-result-adapter") ).ClaimResultAdapter,
            ( await import ("@vertix/ui-v2/claim/start/claim-start-adapter") ).ClaimStartAdapter,
            ( await import ("@vertix/ui-v2/claim/vote/claim-vote-adapter") ).ClaimVoteAdapter,

            ( await import ("@vertix/ui-v2/config/config-adapter") ).ConfigAdapter,

            ( await import ("@vertix/ui-v2/dynamic-channel/dynamic-channel-adapter") ).DynamicChannelAdapter,

            ( await import ("@vertix/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-adapter") ).DynamicChannelMetaLimitAdapter,
            ( await import ("@vertix/ui-v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-adapter") ).DynamicChannelMetaClearChatAdapter,
            ( await import ("@vertix/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-adapter") ).DynamicChannelMetaRenameAdapter,

            ( await import ("@vertix/ui-v2/dynamic-channel/permissions/dynamic-channel-permissions-adapter") ).DynamicChannelPermissionsAdapter,

            ( await import ("@vertix/ui-v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-adapter") ).DynamicChannelPremiumResetChannelAdapter,

            ( await import ("@vertix/ui-v2/language/language-adapter") ).LanguageAdapter,

            ( await import ("@vertix/ui-v2/setup/setup-adapter") ).SetupAdapter,
            ( await import ("@vertix/ui-v2/setup/setup-new-wizard-adapter") ).SetupNewWizardAdapter,

            ( await import ("@vertix/ui-v2/welcome/welcome-adapter") ).WelcomeAdapter,
        ];

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

        this.storeClass( UIClass );

        // Store only instances that are static.
        if ( UIClass.isStatic() ) {
            this.storeInstance( UIClass );
        }

        this.logger.log( this.registerAdapter,
            `Register entity: '${ uiName }' instanceType: '${ UIClass.getInstanceType() }'`
        );
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
        this.uiStaticInstances.set( UIClass.getName(), this.createInstance( UIClass.getName() ) );
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
