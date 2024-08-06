import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelTransferOwnerUserMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelTransferOwnerUserMenu";
    }

    public getId() {
        return 13;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "🔀 Select User" );
    }
}
