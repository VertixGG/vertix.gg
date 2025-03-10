import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class FeedbackReportButton extends UIElementButtonBase {
    public static getName () {
        return "VertixBot/UI-General/FeedbackReportButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Static;
    }

    protected getStyle (): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getLabel () {
        return "Report a problem";
    }

    protected async getEmoji () {
        return "💥";
    }
}
