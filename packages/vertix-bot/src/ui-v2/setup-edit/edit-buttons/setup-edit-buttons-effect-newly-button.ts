import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class SetupEditButtonsEffectNewlyButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsEffectNewlyButton";
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
