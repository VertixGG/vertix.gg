import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class FeedbackInviteDeveloperButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackInviteDeveloperButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getLabel() {
        return "Invite Vertix Developer";
    }

    protected async getEmoji() {
        return "💌";
    }
}
