import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPrimaryMessageEditButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditButton";
    }

    public static getBaseName() {
        return "EditChannelMessage";
    }

    public static getEmoji() {
        return EmojiManager.$.getCachedMarkdown( DynamicChannelPrimaryMessageEditButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelRegionButton );
    }

    public getId() {
        return "edit-primary-message";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelPrimaryMessageEditButton.getEmoji() } ∙ **Edit Primary Message**`;
    }

    public async getLabelForMenu() {
        return "Edit Primary Message";
    }

    public async getLabel() {
        return "Edit Primary Message";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelPrimaryMessageEditButton.getBaseName() );
    }

    public getEmojiForEmbed(): string {
        return DynamicChannelPrimaryMessageEditButton.getEmoji();
    }
}
