import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsDenyMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsDenyMenu";
    }

    public getId() {
        return "remove-user-access";
    }

    protected async getPlaceholder() {
        return "👎 Remove Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
