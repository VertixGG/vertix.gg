import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPrimaryMessageEditTitleButton extends UIElementButtonBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel () {
        return "Edit ✏️";
    }

    protected async getStyle (): Promise<UIButtonStyleTypes> {
        return "secondary";
    }
}
