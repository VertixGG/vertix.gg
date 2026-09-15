import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

import { DynamicChannelKnockButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-button";

export class DynamicChannelLfmButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelLfmButton";
    }

    public static getBaseName() {
        return "LfmChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelLfmButton.getBaseName() );
    }

    public static getSortId() {
        return this.getSortIdAfter( DynamicChannelKnockButton );
    }

    public getId() {
        return "lfm";
    }

    /**
     * Out of the set a new generator is given: there is nowhere to post until an admin picks a
     * destination, and a button that can only say so is worse than one nobody switched on yet.
     */
    public override isInDefaultSet() {
        return false;
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelLfmButton.getEmoji() } ∙ **LFM**`;
    }

    public async getLabelForMenu() {
        return "LFM";
    }

    public async getLabel() {
        return this.getLabelForMenu();
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( DynamicChannelLfmButton.getBaseName() );
    }

    public getEmojiForEmbed() {
        return DynamicChannelLfmButton.getEmoji();
    }
}
