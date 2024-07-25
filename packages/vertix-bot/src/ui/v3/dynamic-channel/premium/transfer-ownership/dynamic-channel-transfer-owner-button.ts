import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelTransferOwnerButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelTransferOwnerButton";
    }

    public getId() {
        return 12;
    }

    public getSortId() {
        return 7;
    }

    public getLabelForEmbed() {
        return "🔀 ∙ **Transfer**";
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Transfer";
    }

    public async getEmoji() {
        return "🔀";
    }

    public getEmojiForEmbed() {
        return "🔀";
    }
}