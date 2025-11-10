import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsBlockMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsBlockMenu";
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
