import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import type { LobbyChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";

/**
 * The version a team lobby and its rooms are written with.
 *
 * Its last segment is zero on purpose. A master's version doubles as the interface it was built
 * with - its last segment names one, `2` or `3` - and a lobby is not built with either: a version
 * ending in a number some interface could one day take would one day read as that interface.
 * Nothing ever registers an interface `0`.
 */
export const VERSION_LOBBY_CHANNEL_UI_V1 = "0.0.1.0" as const;

export class LobbyChannelConfig extends ConfigBase<LobbyChannelConfigInterface> {
    public static getName() {
        return "VertixData/Config/LobbyChannel";
    }

    public getConfigName() {
        return "Vertix/Config/LobbyChannel";
    }

    public getVersion() {
        return VERSION_LOBBY_CHANNEL_UI_V1;
    }

    protected getDefaults(): LobbyChannelConfigInterface[ "defaults" ] {
        return {
            lobbyHostRoleIds: [],
            lobbyPanelChannelId: null,
            lobbyPanelMessageId: null,
            lobbyPanelMessageHash: null,
            lobbyChatPanelMessageId: null,
            lobbyChatPanelMessageHash: null,
            lobbySessionCategoryId: null,
            lobbySplitMode: null
        };
    }
}

export default LobbyChannelConfig;
