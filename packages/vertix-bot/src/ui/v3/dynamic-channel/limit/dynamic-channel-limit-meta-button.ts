import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelLimitMetaButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelLimitMetaButton";
    }

    public static getBaseName() {
        return "UserLimit";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelLimitMetaButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelRenameButton );
    }

    public getId() {
        return "limit";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelLimitMetaButton.getEmoji() } ∙ **User Limit**`;
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Limit";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelLimitMetaButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelLimitMetaButton.getEmoji();
    }
}
