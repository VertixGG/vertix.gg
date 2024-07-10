import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

export class DynamicChannelPremiumClaimChannelButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton";
    }

    public getId() {
        return 7;
    }

    public getSortId() {
        return 8;
    }

    public getLabelForEmbed() {
        return "😈 ∙ **Claim**";
    }

    public async getLabelForMenu() {
        return await this.getLabel();
    }

    public async getLabel() {
        return "Claim";
    }

    public async getEmoji() {
        return "😈";
    }

    public getEmojiForEmbed(): string {
        return "😈";
    }

    protected async isDisabled(): Promise<boolean> {
        if ( [ "starting", "active" ].includes( DynamicChannelVoteManager.$.getState( this.uiArgs?.channelId ) ) ) {
            return true;
        }

        return ! DynamicChannelClaimManager.$.isChannelClaimable( this.uiArgs?.channelId );
    }
}
