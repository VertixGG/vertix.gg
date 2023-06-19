import { DynamicChannelUserMenuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsBlockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsBlockMenu";
    }

    public getId() {
        return 10;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "🫵 Block User Access" );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
