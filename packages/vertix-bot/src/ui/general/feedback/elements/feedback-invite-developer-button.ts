import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class FeedbackInviteDeveloperButton extends UIElementButtonBase {
    public static getName () {
        return "VertixBot/UI-General/FeedbackInviteDeveloperButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Static;
    }

    protected getStyle (): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getLabel () {
        return "Invite Vertix Developer";
    }

    protected async getEmoji () {
        return "💌";
    }
}
