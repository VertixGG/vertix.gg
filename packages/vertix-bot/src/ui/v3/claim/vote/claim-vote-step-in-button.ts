import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ClaimVoteStepInButton extends UIElementButtonBase {
    public static getName () {
        return "Vertix/UI-V3/ClaimVoteStepInButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle (): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel (): Promise<string> {
        return "Step in";
    }

    protected async getEmoji (): Promise<string> {
        return "😈";
    }
}
