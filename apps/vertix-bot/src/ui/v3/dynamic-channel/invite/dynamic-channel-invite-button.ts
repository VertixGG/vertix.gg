import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

import { registerSelfGatedEntity } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-self-gated-entities";

export class DynamicChannelInviteButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelInviteButton";
    }

    public static getBaseName() {
        return "InviteChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelInviteButton.getBaseName() );
    }

    public static getSortId() {
        return 2;
    }

    public getId() {
        return "invite";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelInviteButton.getEmoji() } ∙ **Invite**`;
    }

    public async getLabelForMenu() {
        return "Invite";
    }

    public async getLabel() {
        return this.getLabelForMenu();
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelInviteButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelInviteButton.getEmoji();
    }
}

registerSelfGatedEntity( DynamicChannelInviteButton.getName() );
