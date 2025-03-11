import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

export class DynamicChannelClaimChannelButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelClaimChannelButton";
    }

    public static getBaseName() {
        return "ClaimChannel";
    }

    public static getEmoji() {
        return EmojiManager.$.getCachedMarkdown( DynamicChannelClaimChannelButton.getBaseName() );
    }

    public static getSortId() {
        return 8;
    }

    public getId() {
        return "claim-button";
    }

    public getLabelForEmbed() {
        return `${ DynamicChannelClaimChannelButton.getEmoji() } ∙ **Claim**`;
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Claim";
    }

    public async getEmoji() {
        return DynamicChannelClaimChannelButton.getEmoji();
    }

    public getEmojiForEmbed(): string {
        return DynamicChannelClaimChannelButton.getEmoji();
    }

    protected async isDisabled(): Promise<boolean> {
        if ( [ "starting", "active" ].includes( DynamicChannelVoteManager.$.getState( this.uiArgs?.channelId ) ) ) {
            return true;
        }

        return !DynamicChannelClaimManager.get( "Vertix/UI-V3/DynamicChannelClaimManager" ).isChannelClaimable(
            this.uiArgs?.channelId
        );
    }
}
