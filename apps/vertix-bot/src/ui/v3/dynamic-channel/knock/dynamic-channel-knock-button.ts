import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

import { registerSelfGatedEntity } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-self-gated-entities";

import { DynamicChannelStatusButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/status/dynamic-channel-status-button";

export class DynamicChannelKnockButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelKnockButton";
    }

    public static getBaseName() {
        return "KnockChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelKnockButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelStatusButton );
    }

    public getId() {
        return "knock";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelKnockButton.getEmoji() } ∙ **Knock**`;
    }

    public async getLabelForMenu() {
        return "Knock";
    }

    public async getLabel() {
        return this.getLabelForMenu();
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelKnockButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelKnockButton.getEmoji();
    }
}

registerSelfGatedEntity( DynamicChannelKnockButton.getName() );
