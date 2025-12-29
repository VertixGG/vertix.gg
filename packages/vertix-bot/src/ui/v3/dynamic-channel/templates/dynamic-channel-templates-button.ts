import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelTemplatesButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesButton";
    }

    public static getBaseName() {
        return "ChannelTemplates";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelTemplatesButton.getBaseName() );
    }

    public static getSortId() {
        return 9;
    }

    public getId() {
        return "templates";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelTemplatesButton.getEmoji() }  ∙ **Templates**`;
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Templates";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelTemplatesButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelTemplatesButton.getEmoji();
    }
}





