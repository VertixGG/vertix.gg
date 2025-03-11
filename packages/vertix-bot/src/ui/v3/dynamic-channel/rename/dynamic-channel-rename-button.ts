import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelRenameButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRenameButton";
    }

    public static getBaseName() {
        return "ChannelRename";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelRenameButton.getBaseName() );
    }

    public static getSortId() {
        return 0;
    }

    public getId() {
        return "rename";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelRenameButton.getEmoji() }  ∙ **Rename**`;
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Rename";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelRenameButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelRenameButton.getEmoji();
    }
}
