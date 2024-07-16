import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsBlockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsBlockMenu";
    }

    public getId() {
        return 10;
    }

    protected async getPlaceholder() {
        return "🫵 Block User Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
