import { UIEntityBase } from "@vertix/ui-v2/_base/ui-entity-base";
import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";

export class EntityCallbackNotFoundError extends Error {
    public constructor( component: UIComponentBase, entity: typeof UIEntityBase ) {
        super( `Callback for entity: '${ entity.getName() }' does not exist in component: '${ component.getName() }'` );
    }
}
