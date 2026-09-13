import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelLfmButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelLfmButton";
    }

    public getId() {
        return 15;
    }

    public getSortId() {
        return 9;
    }

    public getLabelForEmbed() {
        return "🔎 ∙ **LFM**";
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "LFM";
    }

    public async getEmoji() {
        return "🔎";
    }

    public getEmojiForEmbed() {
        return "🔎";
    }
}
