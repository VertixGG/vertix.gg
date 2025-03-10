import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ClaimVoteAddButton extends UIElementButtonBase {
    public static getName () {
        return "Vertix/UI-V3/ClaimVoteAddButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle (): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel (): Promise<string> {
        return `Vote ${ uiUtilsWrapAsTemplate( "displayName" ) }`;
    }

    protected async getEmoji (): Promise<string> {
        return "🗳️";
    }

    protected async getLogic () {
        return {
            displayName: this.uiArgs?.displayName
        };
    }
}
