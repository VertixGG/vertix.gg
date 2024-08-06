import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsUnblockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsUnblockMenu";
    }

    public getId() {
        return 11;
    }

    protected async getPlaceholder() {
        return "🤙 Un-Block User Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
