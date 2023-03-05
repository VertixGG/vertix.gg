import InitializeBase from "@internal/bases/initialize-base";

import ObjectBase from "@internal/bases/object-base";

import ComponentUIBase from "../ui/base/component-ui-base";

export default class GUIManager extends InitializeBase {
    private static instance: GUIManager;

    private userInterfaces = new Map<string, ComponentUIBase>;
    private callbacks = new Map<string, Function>;

    public static getName() {
        return "Dynamico/Managers/GUI";
    }

    public static getInstance() {
        if ( ! GUIManager.instance ) {
            GUIManager.instance = new GUIManager();
        }

        return GUIManager.instance;
    }

    public static getLogger() {
        return GUIManager.getInstance().logger;
    }

    public register( ui: typeof ComponentUIBase ) {
        const uiName = ui.getName();

        if ( this.userInterfaces.has( uiName ) ) {
            throw new Error( `User interface '${ uiName }' already exists` );
        }

        this.userInterfaces.set( uiName, new ui() );

        this.logger.info( this.register, `Registered user interface '${ uiName }'` );
    }

    public get( name: string ) {
        const result = this.userInterfaces.get( name );

        if ( ! result ) {
            throw new Error( `User interface '${ name }' does not exist` );
        }

        return result;
    }

    public storeCallback( sourceUI: ObjectBase, callback: Function, suffix = "" ) {
        let unique = sourceUI.getName() + ":" + callback.name.replace( "bound ", "" );

        if ( suffix ) {
            unique = unique + ":" + suffix;
        }

        if ( unique.length > 100 ) {
            this.logger.warn( this.storeCallback, `Callback '${ unique }' is too long` );

            unique = unique.replace( "Dynamico/", "" );

            if ( unique.length > 100 ) {
                unique = unique.substring( 0, 100 );

                this.logger.error( this.storeCallback, `Callback '${ unique }' is still too long` );
            }
        }

        this.logger.debug( this.storeCallback, `Storing callback '${ unique }'` );

        this.callbacks.set( unique, callback );

        return unique;
    }

    public getCallback( unique: string ) {
        const result = this.callbacks.get( unique );

        if ( ! result ) {
            throw new Error( `Callback '${ unique }' does not exist` );
        }

        return result;
    }

    public getLogger() {
        return this.logger;
    }
}
