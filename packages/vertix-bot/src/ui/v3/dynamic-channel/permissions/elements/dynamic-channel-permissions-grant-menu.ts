import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsGrantMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsGrantMenu";
    }

    public getId() {
        return 8;
    }

    protected async getPlaceholder() {
        return "👍 Grant Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
