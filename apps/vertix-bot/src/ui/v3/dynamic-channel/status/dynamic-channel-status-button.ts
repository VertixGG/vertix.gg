import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelStatusButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelStatusButton";
    }

    public static getBaseName() {
        return "Megaphone";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelStatusButton.getBaseName() );
    }

    public static getSortId() {
        return 9;
    }

    public getId() {
        return "status";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelStatusButton.getEmoji() }  ∙ **Status**`;
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Status";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelStatusButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelStatusButton.getEmoji();
    }
}
