import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaLimitButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitButton";
    }

    public getId() {
        return 1;
    }

    public getSortId() {
        return 1;
    }

    public getLabelForEmbed() {
        return "✋ ∙ **User Limit**";
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "Limit" );
    }

    public async getEmoji(): Promise<string> {
        return "✋";
    }
}
