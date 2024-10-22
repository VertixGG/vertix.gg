import { UIElementButtonUrlBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-url-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class WelcomeInviteButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-V2/WelcomeInviteButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Invite Vertix";
    }

    protected async getURL(): Promise<string> {
        return "https://discord.com/oauth2/authorize?client_id=1111283172378955867&permissions=286354576&scope=bot%20applications.commands";
    }
}
