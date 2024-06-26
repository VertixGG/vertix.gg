import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix.gg/base/src/definitions/dynamic-channel-defaults";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelTransferOwnerButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerButton";
    }

    public getId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getId( DynamicChannelTransferOwnerButton.getName() );
    }

    public getSortId() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getSortId( DynamicChannelTransferOwnerButton.getName() );
    }

    public getLabelForEmbed() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForEmbed( DynamicChannelTransferOwnerButton.getName() );
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getLabelForMenu( DynamicChannelTransferOwnerButton.getName() );
    }

    public async getEmoji() {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA
            .getEmoji( DynamicChannelTransferOwnerButton.getName() ) as string;
    }
}
