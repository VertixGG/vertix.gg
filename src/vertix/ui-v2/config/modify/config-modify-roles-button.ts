import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";

import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class ConfigModifyRolesButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigModifyRolesButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async getLabel() {
        return "Modify Verified Roles";
    }
}
