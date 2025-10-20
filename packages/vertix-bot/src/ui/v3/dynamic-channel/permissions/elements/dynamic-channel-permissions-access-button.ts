import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsAccessButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton";
    }

    public static getBaseName() {
        return "ChannelPermissions";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelPermissionsAccessButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelRenameButton );
    }

    public getId() {
        return "access";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelPermissionsAccessButton.getEmoji() } ∙ **Access**`;
    }

    public async getLabelForMenu() {
        return "Access";
    }

    public async getLabel() {
        return this.getLabelForMenu();
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelPermissionsAccessButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelPermissionsAccessButton.getEmoji();
    }
}
