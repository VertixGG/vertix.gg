import { ObjectBase } from "@internal/bases/object-base";

export abstract class UIBase extends ObjectBase {
    protected readonly hierarchyNames: string[];

    public static getName() {
        return "Vertix/UI-V2/UIBase";
    }

    public constructor() {
        super();

        this.hierarchyNames = this.getHierarchyNames();

        this.ensureGetNameExtended();

        this.initialize?.();
    }

    protected initialize?(): void;

    /**
     * Function ensureGetNameExtended() :: Ensures parent extends `static getName()` correctly.
     */
    private ensureGetNameExtended(): void {
        // Remove last part of `this.getName()`.
        const namespace = ( this.constructor as typeof UIBase ).getName()
            .split( "/" ).filter( ( i ) => i ).pop();

        const parentName = this.hierarchyNames[ 0 ];

        // Remove namespace from parent name.
        const name = parentName.replace( `${ namespace }/`, "" );

        // Check if name includes 'Base' at the end.
        if ( name.endsWith( "Base" ) ) {
            throw new Error( `Error with name of '${ name }', UI subclasses should extend 'static getName()' method and not have 'Base' suffix at their name` );
        }
    }
}
