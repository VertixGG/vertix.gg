import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsBlockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu";
    }

    public getId() {
        return "block-user-access";
    }

    protected async getPlaceholder() {
        return "🫵 Block User Access";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
