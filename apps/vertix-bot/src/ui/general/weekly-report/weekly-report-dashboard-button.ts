import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The way from a weekly summary to the rest of the server's figures - the month, the hours, every generator.
 */
export class WeeklyReportDashboardButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/WeeklyReportDashboardButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Open dashboard";
    }

    protected async getURL(): Promise<string> {
        return "https://dashboard.voicechannels.online";
    }
}
