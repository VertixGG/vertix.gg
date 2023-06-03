import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsAccessButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAccessButton";
    }

    public getId() {
        return 5;
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getEmoji() + " " + await this.getLabel();
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Access" );
    }

    public getEmoji(): Promise<string> {
        return Promise.resolve( "👥" );
    }
}
