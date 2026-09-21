import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class HelpSupportButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpSupportButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Support Server";
    }

    protected async getURL(): Promise<string> {
        return "https://discord.gg/dEwKeQefUU";
    }
}
