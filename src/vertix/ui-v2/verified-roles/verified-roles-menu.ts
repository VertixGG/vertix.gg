import { UIElementRoleSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class VerifiedRolesMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/VerifiedRolesMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "Select Verified Roles";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 3;
    }
}
