import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaStatusButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaStatusButton";
    }

    public getId() {
        return 13;
    }

    public getSortId() {
        return 8;
    }

    public getLabelForEmbed() {
        return "📣 ∙ **Status**";
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Status";
    }

    public async getEmoji() {
        return "📣";
    }

    public getEmojiForEmbed() {
        return "📣";
    }
}
