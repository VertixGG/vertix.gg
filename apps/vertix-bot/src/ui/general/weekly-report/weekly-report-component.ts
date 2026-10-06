import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { WeeklyReportEmbed } from "@vertix.gg/bot/src/ui/general/weekly-report/weekly-report-embed";
import { WeeklyReportDashboardButton } from "@vertix.gg/bot/src/ui/general/weekly-report/weekly-report-dashboard-button";

export class WeeklyReportComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/WeeklyReportComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [ [ WeeklyReportDashboardButton ] ];
    }

    public static getEmbeds() {
        return [ WeeklyReportEmbed ];
    }
}
