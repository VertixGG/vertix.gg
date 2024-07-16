import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class NoButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V3/NoButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected async getLabel() {
        return "👎 No";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }
}
