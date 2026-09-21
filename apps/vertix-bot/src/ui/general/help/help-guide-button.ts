import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class HelpGuideButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpGuideButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Setup Guide";
    }

    protected async getURL(): Promise<string> {
        return "https://voicechannels.online/posts/how-to-setup";
    }
}
