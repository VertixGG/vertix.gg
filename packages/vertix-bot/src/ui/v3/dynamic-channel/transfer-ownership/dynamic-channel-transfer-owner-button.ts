import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelTransferOwnerButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelTransferOwnerButton";
    }

    public static getBaseName() {
        return "TransferChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelTransferOwnerButton.getBaseName() );
    }

    public static getSortId() {
        return 7;
    }

    public getId() {
        return "transfer";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelTransferOwnerButton.getEmoji() } ∙ **Transfer**`;
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Transfer";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelTransferOwnerButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelTransferOwnerButton.getEmoji();
    }
}
