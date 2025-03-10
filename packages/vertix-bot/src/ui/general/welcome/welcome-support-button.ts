import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class WelcomeSupportButton extends UIElementButtonUrlBase {
    public static getName () {
        return "VertixBot/UI-General/WelcomeSupportButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Static;
    }

    protected async getLabel () {
        return "Community Server";
    }

    protected async getURL (): Promise<string> {
        return "https://discord.gg/dEwKeQefUU";
    }
}
