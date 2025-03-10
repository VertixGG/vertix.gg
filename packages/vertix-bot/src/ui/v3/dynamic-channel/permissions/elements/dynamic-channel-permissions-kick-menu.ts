import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelPermissionsKickMenu extends DynamicChannelUserMenuBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPermissionsKickMenu";
    }

    public getId () {
        return "kick-user";
    }

    protected async getPlaceholder () {
        return "👢 Kick User";
    }

    protected async isAvailable () {
        return this.uiArgs?.dynamicChannelButtonsIsAccessButtonAvailable;
    }
}
