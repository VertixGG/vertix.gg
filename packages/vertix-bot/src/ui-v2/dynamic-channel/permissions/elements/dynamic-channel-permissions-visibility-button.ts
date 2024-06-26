import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix.gg/base/src/definitions/dynamic-channel-defaults";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsVisibilityButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton";
    }

    public getId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getId( DynamicChannelPermissionsVisibilityButton.getName() );
    }

    public getSortId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getSortId( DynamicChannelPermissionsVisibilityButton.getName() );
    }

    public getLabelForEmbed() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForEmbed( DynamicChannelPermissionsVisibilityButton.getName() );
    }

    public async getLabelForMenu() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForMenu( DynamicChannelPermissionsVisibilityButton.getName() );
    }

    public async getLabel(): Promise<string> {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    public async getEmoji() {
        const emojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA
            .getEmoji( DynamicChannelPermissionsVisibilityButton.getName() ) as string[];

        if ( ! this.uiArgs?.isHidden ) {
            return emojis[ 0 ];
        }

        return emojis[ 1 ];
    }

    protected getOptions() {
        return {
            shownText: "Shown",
            hiddenText: "Hidden",
        };
    }

    protected async getLogic() {
        const result: any = {};

        if ( this.uiArgs?.isHidden ) {
            result.displayText = uiUtilsWrapAsTemplate( "shownText" );
        } else {
            result.displayText = uiUtilsWrapAsTemplate( "hiddenText" );
        }

        return result;
    }
}
