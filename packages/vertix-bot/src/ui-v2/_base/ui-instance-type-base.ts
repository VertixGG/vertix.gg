import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIType } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class UIInstanceTypeBase extends UIBase {
    public static getName() {
        return "VertixBot/UI-V2/UIInstanceTypeBase";
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
