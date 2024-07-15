import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type UIService from "@vertix.gg/gui/src/ui-service";

export abstract class UIBase extends ObjectBase {
    protected readonly hierarchyNames: string[];

    protected readonly uiService: UIService;

    public static getName() {
        return "VertixGUI/UIBase";
    }

    public constructor() {
        super();

        this.hierarchyNames = this.getHierarchyNames();

        this.ensureGetNameExtended();

        this.uiService = ServiceLocator.$.get( "VertixGUI/UIService");

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
