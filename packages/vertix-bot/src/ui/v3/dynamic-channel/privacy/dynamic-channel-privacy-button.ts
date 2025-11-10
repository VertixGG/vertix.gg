import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelPermissionsAccessButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPrivacyButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrivacyButton";
    }

    public static getBaseName() {
        return "ChannelPrivacy";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelPrivacyButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelPermissionsAccessButton );
    }

    public getId() {
        return "privacy";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelPrivacyButton.getEmoji() } ∙ **Privacy**`;
    }

    public async getLabelForMenu() {
        return "Privacy";
    }

    public async getLabel() {
        return "Privacy";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelPrivacyButton.getBaseName() );
    }

    public getEmojiForEmbed(): string {
        return DynamicChannelPrivacyButton.getEmoji();
    }
}
