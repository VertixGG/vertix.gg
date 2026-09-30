import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The way from the Events screen to the rest of its settings.
 *
 * The screen in discord keeps to what it takes to get going - a channel and a switch. The timing,
 * the pings, which events count and where the attendance is copied are set on the dashboard, and
 * this is how an admin who only ever met the bot here finds out there is more.
 */
export class EventsDashboardButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/EventsDashboardButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "More options";
    }

    protected async getURL(): Promise<string> {
        return "https://dashboard.voicechannels.online/events";
    }
}
