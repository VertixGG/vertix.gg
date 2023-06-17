import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

export class DynamicChannelPermissionsAccessButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAccessButton";
    }

    public static getId() {
        return 5;
    }

    public getId() {
        return DynamicChannelPermissionsAccessButton.getId();
    }

    public async getLabelForMenu(): Promise<string> {
        return await this.getLabel();
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "Access" );
    }

    public getEmoji(): Promise<string> {
        return Promise.resolve( "👥" );
    }
}
