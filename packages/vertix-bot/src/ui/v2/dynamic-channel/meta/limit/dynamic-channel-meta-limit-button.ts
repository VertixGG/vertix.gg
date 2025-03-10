import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaLimitButton extends DynamicChannelButtonBase {
    public static getName () {
        return "Vertix/UI-V2/DynamicChannelMetaLimitButton";
    }

    public getId () {
        return 1;
    }

    public getSortId () {
        return 1;
    }

    public getLabelForEmbed () {
        return "✋ ∙ **User Limit**";
    }

    public async getLabelForMenu () {
        return await this.getLabel();
    }

    public async getLabel () {
        return "Limit";
    }

    public async getEmoji () {
        return "✋";
    }

    public getEmojiForEmbed () {
        return "✋";
    }
}
