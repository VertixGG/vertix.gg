import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class YesButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/YesButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected async getLabel() {
        return "👍 Yes";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }
}
