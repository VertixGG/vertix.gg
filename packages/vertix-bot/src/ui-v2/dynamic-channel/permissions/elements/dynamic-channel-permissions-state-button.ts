import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix.gg/base/src/definitions/dynamic-channel-defaults";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsStateButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsStateButton";
    }

    public getId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getId( DynamicChannelPermissionsStateButton.getName() );
    }

    public getSortId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getSortId( DynamicChannelPermissionsStateButton.getName() );
    }

    public getLabelForEmbed() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForEmbed( DynamicChannelPermissionsStateButton.getName() );
    }

    public async getLabelForMenu() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForMenu( DynamicChannelPermissionsStateButton.getName() );
    }

    public async getLabel() {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    public async getEmoji() {
        const emojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA
            .getEmoji( DynamicChannelPermissionsStateButton.getName() ) as string[];

        if ( ! this.uiArgs?.isPrivate ) {
            return emojis[ 0 ];
        }

        return emojis[ 1 ];
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
