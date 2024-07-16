import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaClearChatButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatButton";
    }

    public getId() {
        return 2;
    }

    public getSortId() {
        return 2;
    }

    public getLabelForEmbed() {
        return "🧹 ∙ **Clear Chat**";
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Clear Chat";
    }

    public async getEmoji() {
        return "🧹";
    }

    public getEmojiForEmbed() {
        return "🧹";
    }
}
