import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";
import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsStateButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsStateButton";
    }

    public getId() {
        return 3;
    }

    public async getLabelForMenu(): Promise<string> {
        return "Public/Private"; // - ( 🚫 / 🌐 )
    }

    public async getLabel() {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    public async getEmoji(): Promise<string> {
        if ( ! this.uiArgs?.isPrivate ) {
            return "🚫";
        }

        return "🌐";
    }

    protected getOptions() {
        return {
            publicText: "Public",
            privateText: "Private",
        };
    }

    protected async getLogic() {
        const result: any = {};

        if ( this.uiArgs?.isPrivate ) {
            result.displayText = uiUtilsWrapAsTemplate( "publicText" );
        } else {
            result.displayText = uiUtilsWrapAsTemplate( "privateText" );
        }

        return result;
    }
}
