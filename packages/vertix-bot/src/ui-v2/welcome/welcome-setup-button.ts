import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class WelcomeSetupButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/WelcomeSetupButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve("Setup");
    }

    protected async getEmoji(): Promise<string> {
        return "🛠";
    }
}
