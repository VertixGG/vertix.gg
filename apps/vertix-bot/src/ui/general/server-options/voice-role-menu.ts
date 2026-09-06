import { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Selecting nothing clears the role, hence the minimum of zero, and a member can only be in one
 * channel at a time so there is nothing to gain from more than one.
 */
export class VoiceRoleMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/VoiceRoleMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🎙️ ∙ Select Voice Role";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }
}
