import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import type { UIButtonStyleTypes, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingPrefixButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingPrefixButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public async build( uiArgs?: UIArgs ) {
        return super.build( uiArgs );
    }

    protected async getLabel(): Promise<string> {
        return `${ uiUtilsWrapAsTemplate( "prefixAction" ) } Channel Prefix${ uiUtilsWrapAsTemplate( "prefixValue" ) }`;
    }

    protected async getEmoji(): Promise<string> {
        return "🏷️";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        // Use the channelPrefix value to determine button style
        const hasPrefix = !!this.uiArgs?.channelPrefix;
        return hasPrefix ? "success" : "primary";
    }

    protected getOptions() {
        return {
            prefixAction: {
                edit: "Edit",
                set: "Set"
            }
        };
    }

    protected async getLogic() {
        const result: any = {};
        // Get the channelPrefix from args
        const prefix = this.uiArgs?.channelPrefix;

        if ( prefix ) {
            result.prefixAction = "edit";
            result.prefixValue = `: ${ prefix }`;
        } else {
            result.prefixAction = "set";
            result.prefixValue = "";
        }

        return result;
    }
}
