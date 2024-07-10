import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaRenameButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaRenameButton";
    }

    public getId() {
        return 0;
    }

    public getSortId() {
        return 0;
    }

    public getLabelForEmbed() {
        return "✏️ ∙ **Rename**";
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Rename";
    }

    public async getEmoji() {
        return "✏️";
    }

    public getEmojiForEmbed() {
        return "✏️";
    }
}
