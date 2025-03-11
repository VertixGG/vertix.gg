import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupMasterEditButton extends UIElementButtonBase {
    public static getName () {
        return "VertixBot/UI-General/SetupMasterEditButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async isAvailable (): Promise<boolean> {
        return !!this.uiArgs?.index;
    }

    protected getLabel (): Promise<string> {
        return Promise.resolve( uiUtilsWrapAsTemplate( "masterChannel" ) + uiUtilsWrapAsTemplate( "index" ) );
    }

    protected getStyle (): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getEmoji (): Promise<string> {
        return "🔧";
    }

    protected getOptions () {
        return {
            masterChannel: "Edit Master Channel #"
        };
    }

    protected async getLogic () {
        return {
            index: this.uiArgs?.index
        };
    }
}
