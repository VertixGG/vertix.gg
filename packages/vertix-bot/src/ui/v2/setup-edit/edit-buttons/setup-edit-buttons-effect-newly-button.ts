import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditButtonsEffectNewlyButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/SetupEditButtonsEffectNewlyButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected async getLabel() {
        return "Apply Only";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "success";
    }

    protected async getEmoji(): Promise<string> {
        return "💾";
    }
}
