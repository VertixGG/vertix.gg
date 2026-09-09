
import { DynamicChannelUserMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base";

export class DynamicChannelInviteUserMenu extends DynamicChannelUserMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelInviteUserMenu";
    }

    public getId() {
        return "invite-user";
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "📨 Select User" );
    }
}
