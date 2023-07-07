import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class ClaimVoteAddButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimVoteAddButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel(): Promise<string> {
        return `Vote ${ uiUtilsWrapAsTemplate( "displayName" ) }`;
    }

    protected async getEmoji(): Promise<string> {
        return "🗳️";
    }

    protected async getLogic() {
        return {
            displayName: this.uiArgs?.displayName
        };
    }
}
