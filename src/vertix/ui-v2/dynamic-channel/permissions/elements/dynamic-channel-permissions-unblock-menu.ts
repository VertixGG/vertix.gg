import { DynamicChannelUserMenuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsUnblockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsUnblockMenu";
    }

    public getId() {
        return 11;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "🤙 Un-Block User Access" );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
