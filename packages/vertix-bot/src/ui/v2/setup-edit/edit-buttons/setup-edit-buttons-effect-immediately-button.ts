import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditButtonsEffectImmediatelyButton extends UIElementButtonBase {
    public static getName () {
        return "Vertix/UI-V2/SetupEditButtonsEffectImmediatelyButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected async getLabel () {
        return "Immediately";
    }

    protected async getStyle (): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async getEmoji (): Promise<string> {
        return "🌟";
    }
}
