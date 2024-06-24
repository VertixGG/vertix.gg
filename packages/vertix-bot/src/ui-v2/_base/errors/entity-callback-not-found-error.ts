import type { UIEntityBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-entity-base";
import type { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";

export class EntityCallbackNotFoundError extends Error {
    public constructor( component: UIComponentBase, entity: typeof UIEntityBase ) {
        super( `Callback for entity: '${ entity.getName() }' does not exist in component: '${ component.getName() }'` );
    }
}
