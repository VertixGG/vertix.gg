import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class ClaimVoteStepInButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/ClaimVoteStepInButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel(): Promise<string> {
        return "Step in";
    }

    protected async getEmoji(): Promise<string> {
        return "😈";
    }
}
