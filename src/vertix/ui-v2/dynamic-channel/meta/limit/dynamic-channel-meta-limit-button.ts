import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelMetaLimitButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitButton";
    }

    public getId() {
        return 1;
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
