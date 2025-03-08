import type { UIEntityBase } from "@vertix.gg/gui/src/bases/ui-entity-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

export class EntityCallbackNotFoundError extends Error {
    public constructor(component: UIComponentBase, entity: typeof UIEntityBase) {
        super(
            `Callback for entity: '${entity.getName()}' does not exist in component: '${(component as unknown as typeof UIComponentBase).getName()}'`
        );
    }
}
