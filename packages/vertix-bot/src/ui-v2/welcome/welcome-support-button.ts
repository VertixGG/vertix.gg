import { UIElementButtonUrlBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-url-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class WelcomeSupportButton extends UIElementButtonUrlBase {
    public static getName() {
        return "Vertix/UI-V2/WelcomeSupportButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Community Server";
    }

    protected async getURL(): Promise<string> {
        return "https://discord.gg/dEwKeQefUU";
    }
}
