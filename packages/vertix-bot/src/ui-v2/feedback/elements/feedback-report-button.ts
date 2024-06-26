import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class FeedbackReportButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/FeedbackReportButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getLabel() {
        return "Report a problem";
    }

    protected async getEmoji() {
        return "💥";
    }
}
