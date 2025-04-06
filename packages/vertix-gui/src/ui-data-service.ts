import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

// Define a type for the constructor of classes extending UIDataBase
type UIDataComponentConstructor<TData extends Object = any> = new ( ...args: any[] ) => UIDataBase<TData>;

export class UIDataService extends ServiceBase {
    private dataComponentTypes = new Map<string, UIDataComponentConstructor>();
    // For simplicity, let's assume data components are stateless or managed externally for now.
    // If stateful instances are needed, we can add an instances map later.
    // private dataComponentInstances = new Map<string, UIDataBase<any>>();

    public static getName(): string {
        return "VertixGUI/UIDataService";
    }

    public constructor() {
        super( arguments );
        this.logger.log( this.constructor, "Initialized." );
    }

    /**
     * Registers a data component class.
     * @param DataComponent - The class constructor extending UIDataBase.
     */
    public registerDataComponent<TData extends Object>( DataComponent: UIDataComponentConstructor<TData> ): void {
        const componentName = ( DataComponent as any ).getName(); // Static method access

        if ( typeof componentName !== "string" || !componentName ) {
            throw new Error( "Data component is missing static getName() method." );
        }

        if ( this.dataComponentTypes.has( componentName ) ) {
            this.logger.warn( this.registerDataComponent, `Data component '${ componentName }' is already registered. Overwriting.` );
            // Decide if overwriting should throw an error instead
            // throw new Error(`Data component '${componentName}' already exists.`);
        }

        // TODO: Add validation similar to UIClass.validate() if needed for UIDataBase components?
        // DataComponent.validate?.();

        this.dataComponentTypes.set( componentName, DataComponent );

        this.logger.log( this.registerDataComponent, `Registered data component: '${ componentName }'` );
    }

    /**
     * Retrieves an instance of a registered data component.
     * For now, it returns a new instance each time. Consider caching if components are stateless or singletons.
     * @param componentName - The unique name of the data component.
     * @param silent - If true, returns undefined instead of throwing an error if not found.
     * @returns An instance of the requested UIDataBase, or undefined.
     */
    public getDataComponent<T extends UIDataBase<any>>( componentName: string, silent = false ): T | undefined {
        const DataComponent = this.dataComponentTypes.get( componentName );

        if ( !DataComponent ) {
            if ( silent ) {
                return undefined;
            }
            throw new Error( `Data component '${ componentName }' not found.` );
        }

        try {
            // Assuming UIDataBase constructors don't require arguments or use ServiceLocator internally
            // If they need specific args or dependencies passed, this needs adjustment.
            const instance = new DataComponent() as T;
            return instance;
        } catch ( error ) {
            this.logger.error( this.getDataComponent, `Failed to instantiate data component '${ componentName }'`, error );
            if ( silent ) {
                return undefined;
            }
            throw error; // Re-throw the instantiation error
        }
    }

    /**
     * Registers multiple data components.
     * @param components - An array of UIDataBase constructors.
     */
    public registerDataComponents( components: UIDataComponentConstructor[] ): void {
        components.forEach( ( component ) => this.registerDataComponent( component ) );
    }
}

export default UIDataService;
