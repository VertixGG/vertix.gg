import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Where to go that is not a guide: the dashboard, the site, and a person.
 *
 * Kept apart from the guide buttons because they answer a different question. The guides are for
 * someone reading; these are for someone who has read enough and wants to do something, or who
 * needs to ask.
 *
 * Links, like everything else on this screen, so none of them needs the bot to hold anything.
 */
export class HelpDashboardButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpDashboardButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Dashboard";
    }

    protected async getURL(): Promise<string> {
        return "https://dashboard.voicechannels.online";
    }
}

export class HelpWebsiteButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpWebsiteButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Website";
    }

    protected async getURL(): Promise<string> {
        return "https://voicechannels.online";
    }
}
