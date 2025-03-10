import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type { UIArgs, UIEntityTypesConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIEntityBase } from "@vertix.gg/gui/src/bases/ui-entity-base";

export abstract class UIGroupBase extends UIBase {
    public static getName () {
        return "VertixGUI/UIGroupBase";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getItems ( args?: UIArgs ): UIEntityTypesConstructor {
        throw new ForceMethodImplementation( this, this.getItems.name );
    }

    public static getGroupTypeName (): string {
        throw new ForceMethodImplementation( this, this.getGroupTypeName.name );
    }

    public static createSingleGroup ( EntityClass: typeof UIEntityBase ) {
        return class extends UIGroupBase {
            public static getName () {
                return EntityClass.getName() + "Group";
            }

            public static getItems () {
                return [ EntityClass ];
            }
        };
    }

    public static createEmptyGroup ( baseName: string ) {
        return class extends UIGroupBase {
            public static getName () {
                return baseName + "/EmptyGroup" + this.getGroupTypeName();
            }

            public static getItems () {
                return [];
            }
        };
    }
}
