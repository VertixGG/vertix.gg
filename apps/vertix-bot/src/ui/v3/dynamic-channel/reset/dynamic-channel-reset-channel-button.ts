import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelResetChannelButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelResetChannelButton";
    }

    public static getSortId() {
        return 6;
    }

    public static getBaseName() {
        return "ResetChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelResetChannelButton.getBaseName() );
    }

    public getId() {
        return "rest-channel";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelResetChannelButton.getEmoji() }  ∙ **Reset**`;
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Reset";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelResetChannelButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelResetChannelButton.getEmoji();
    }
}
