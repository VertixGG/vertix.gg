import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix-base/definitions/dynamic-channel-defaults";

import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsAccessButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAccessButton";
    }

    public static getId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getId( DynamicChannelPermissionsAccessButton.getName() );
    }

    public getId() {
        return DynamicChannelPermissionsAccessButton.getId();
    }

    public getSortId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getSortId( DynamicChannelPermissionsAccessButton.getName() );
    }

    public getLabelForEmbed() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForEmbed( DynamicChannelPermissionsAccessButton.getName() );
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForMenu( DynamicChannelPermissionsAccessButton.getName() );
    }

    public async getEmoji() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA
            .getEmoji( DynamicChannelPermissionsAccessButton.getName() ) as string;
    }
}
