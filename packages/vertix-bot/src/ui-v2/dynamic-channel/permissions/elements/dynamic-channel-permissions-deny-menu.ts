import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsDenyMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsDenyMenu";
    }

    public getId() {
        return 9;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "👎 Remove Access" );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
