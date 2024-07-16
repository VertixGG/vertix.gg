import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsDenyMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsDenyMenu";
    }

    public getId() {
        return 9;
    }

    protected async getPlaceholder() {
        return "👎 Remove Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
