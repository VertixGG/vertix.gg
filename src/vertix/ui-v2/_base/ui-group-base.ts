import { ForceMethodImplementation } from "@vertix-base/errors";

import { UIBase } from "@vertix/ui-v2/_base/ui-base";
import { UIArgs, UIEntityTypesConstructor } from "@vertix/ui-v2/_base/ui-definitions";

import { UIEntityBase } from "@vertix/ui-v2/_base/ui-entity-base";

export abstract class UIGroupBase extends UIBase {
    public static getName() {
        return "Vertix/UI-V2/UIGroupBase";
    }

    public static getItems( args?: UIArgs ): UIEntityTypesConstructor {
        throw new ForceMethodImplementation( this, this.getItems.name );
    }

    public static getGroupTypeName(): string {
        throw new ForceMethodImplementation( this, this.getGroupTypeName.name );
    }

    public static createSingleGroup( EntityClass: typeof UIEntityBase ) {
        return class extends UIGroupBase {
            public static getName() {
                return EntityClass.getName() + "Group";
            }

            public static getItems() {
                return [ EntityClass ];
            }
        };
    }

    public static createEmptyGroup( baseName: string ) {
        return class extends UIGroupBase {
            public static getName() {
                return baseName + "/EmptyGroup" + this.getGroupTypeName();
            }

            public static getItems() {
                return [];
            }
        };
    }
}
