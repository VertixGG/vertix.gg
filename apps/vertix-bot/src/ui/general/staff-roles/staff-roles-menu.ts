import { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The mirror of `VerifiedRolesMenu`: the verified roles are the audience a privacy state can shut
 * out, the staff roles are the ones it can never shut out.
 *
 * Selecting nothing is a valid answer and clears the list, hence the minimum of zero.
 */
export class StaffRolesMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/StaffRolesMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🔑 ∙ Select Staff Roles";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 5;
    }
}
