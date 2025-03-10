import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPremiumResetChannelButton extends DynamicChannelButtonBase {
    public static getName () {
        return "Vertix/UI-V2/DynamicChannelPremiumResetChannelButton";
    }

    public getId () {
        return 6;
    }

    public getSortId () {
        return 6;
    }

    public getLabelForEmbed () {
        return "🔃 ∙ **Reset**";
    }

    public async getLabelForMenu () {
        return await this.getLabel();
    }

    public async getLabel () {
        return "Reset";
    }

    public async getEmoji () {
        return "🔃";
    }

    public getEmojiForEmbed () {
        return "🔃";
    }
}
