import { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditButtonsRoleSelectMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsRoleSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "➕ Give a role its own buttons";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }
}

