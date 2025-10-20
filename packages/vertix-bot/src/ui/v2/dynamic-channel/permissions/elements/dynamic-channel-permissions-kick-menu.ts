import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsKickMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsKickMenu";
    }

    public getId() {
        return 14;
    }

    protected async getPlaceholder() {
        return "👢 Kick User";
    }

    protected async isAvailable() {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
