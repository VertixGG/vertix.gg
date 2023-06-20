import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelTransferOwnerButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelTransferOwnerButton";
    }

    public getId() {
        return 12;
    }

    public getSortId() {
        return 7;
    }

    public getLabelForEmbed() {
        return "🔀 ∙ **Transfer Ownership**";
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "Transfer Ownership" );
    }

    public getEmoji(): Promise<string> {
        return Promise.resolve( "🔀" );
    }
}
