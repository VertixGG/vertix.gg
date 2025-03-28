import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelClearChatButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelClearChatButton";
    }

    public static getBaseName() {
        return "ClearChat";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelClearChatButton.getBaseName() );
    }

    public static getSortId() {
        return 6;
    }

    public getId() {
        return "clear-chat";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelClearChatButton.getEmoji() } ∙ **Clear Chat**`;
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Clear Chat";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelClearChatButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelClearChatButton.getEmoji();
    }
}
