import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsGrantMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsGrantMenu";
    }

    public getId() {
        return 8;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "👍 Grant Access" );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
