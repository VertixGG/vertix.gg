import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type { UIType } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIInstanceTypeBase extends UIBase {
    public static getName() {
        return "VertixGUI/UIInstanceTypeBase";
    }

    public static getInstanceType(): UIInstancesTypes {
        throw new ForceMethodImplementation( this, this.getInstanceType.name );
    }

    public static getType(): UIType {
        throw new ForceMethodImplementation( this, this.getType.name );
    }

    public static isStatic(): boolean {
        return this.getInstanceType() === UIInstancesTypes.Static;
    }

    public static isDynamic(): boolean {
        return this.getInstanceType() === UIInstancesTypes.Dynamic;
    }

    public isStatic(): boolean {
        return ( this.constructor as typeof UIInstanceTypeBase ).isStatic();
    }

    public isDynamic(): boolean {
        return ( this.constructor as typeof UIInstanceTypeBase ).isDynamic();
    }
}
