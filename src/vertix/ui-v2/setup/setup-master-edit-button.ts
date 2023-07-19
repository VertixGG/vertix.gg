import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class SetupMasterEditButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/SetupMasterEditButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async isAvailable(): Promise<boolean> {
        return !! this.uiArgs?.index;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( uiUtilsWrapAsTemplate( "masterChannel" ) + uiUtilsWrapAsTemplate( "index" ) );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getEmoji(): Promise<string> {
        return "🔧";
    }

    protected getOptions() {
        return {
            masterChannel: "Edit Master Channel #"
        };
    }

    protected async getLogic() {
        return {
            index: this.uiArgs?.index
        };
    }
}
