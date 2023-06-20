import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";
import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";
import { DynamicChannelVoteManager } from "@vertix/managers/dynamic-channel-vote-manager";

export class DynamicChannelPremiumClaimChannelButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPremiumClaimChannelButton";
    }

    public static getId() {
        return 7;
    }

    public getId() {
        return DynamicChannelPremiumClaimChannelButton.getId();
    }

    public getSortId() {
        return 8;
    }

    public getLabelForEmbed() {
        return "😈 ∙ **Claim Channel**";
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public async getLabel(): Promise<string> {
        return "Claim Channel";
    }

    public getEmoji(): Promise<string> {
        return Promise.resolve( "😈" );
    }

    protected async isDisabled(): Promise<boolean> {
        if ( [ "starting", "active" ].includes( DynamicChannelVoteManager.$.getState( this.uiArgs?.channelId ) ) ) {
            return true;
        }

        return ! DynamicChannelClaimManager.$.isChannelClaimable( this.uiArgs?.channelId );
    }
}
