import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditOpenVerifiedRolesButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/SetupEditOpenVerifiedRolesButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Edit Verified Roles";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getEmoji(): Promise<string> {
        return "🛡️";
    }
}

