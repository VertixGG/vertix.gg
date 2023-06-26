import { DynamicChannelUserMenuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsKickMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsKickMenu";
    }

    public getId() {
        return 14;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "👢 Kick User" );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
