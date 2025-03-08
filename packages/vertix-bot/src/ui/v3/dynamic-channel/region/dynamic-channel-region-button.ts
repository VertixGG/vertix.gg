import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelRegionButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRegionButton";
    }

    public static getBaseName() {
        return "ChannelRegion";
    }

    public static getEmoji() {
        return EmojiManager.$.getCachedMarkdown(DynamicChannelRegionButton.getBaseName());
    }

    public static getSortId() {
        return this.getSortIdAfter(DynamicChannelPrivacyButton);
    }

    public getId() {
        return "region";
    }

    public getLabelForEmbed() {
        return `${DynamicChannelRegionButton.getEmoji()} ∙ **Region**`;
    }

    public async getLabelForMenu() {
        return "Region";
    }

    public async getLabel() {
        return "Region";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown(DynamicChannelRegionButton.getBaseName());
    }

    public getEmojiForEmbed(): string {
        return DynamicChannelRegionButton.getEmoji();
    }
}
