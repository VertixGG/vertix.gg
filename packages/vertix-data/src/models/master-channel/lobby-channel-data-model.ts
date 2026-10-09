import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { MasterChannelDataModelBase } from "@vertix.gg/data/src/models/master-channel/master-channel-data-model-base";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { VERSION_LOBBY_CHANNEL_UI_V1 } from "@vertix.gg/data/src/config/lobby-channel-config";

import type { LobbyChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";

/**
 * Class `LobbyChannelDataModel` - A team lobby's own settings, one row per lobby.
 *
 * Its name is the key the row is filed under, so it is a storage contract rather than a label.
 */
export class LobbyChannelDataModel extends MasterChannelDataModelBase<LobbyChannelConfigInterface> {
    private static instance: LobbyChannelDataModel;

    public static get $() {
        if ( !this.instance ) {
            this.instance = new LobbyChannelDataModel();
        }

        return this.instance;
    }

    public static getName() {
        return "VertixData/Models/LobbyChannelData";
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", "VertixData/Models/LobbyChannelData" ),
            isDebugEnabled( "MODEL", "VertixData/Models/LobbyChannelData" )
        );
    }

    /**
     * Function getLobbySettings() :: A lobby's settings, with the defaults filling whatever it never set.
     *
     * `ownerId` is the lobby's **row** id, as for every master's settings row.
     */
    public async getLobbySettings( ownerId: string ) {
        return this.getSettings( ownerId, true, true );
    }

    public async setLobbySettings( ownerId: string, settings: Partial<LobbyChannelConfigInterface[ "data" ]> ) {
        return this.setSettings( ownerId, settings );
    }

    protected getDataVersion() {
        return VERSION_LOBBY_CHANNEL_UI_V1;
    }

    protected getConfig() {
        return ConfigManager.$.get<LobbyChannelConfigInterface>( "Vertix/Config/LobbyChannel", VERSION_LOBBY_CHANNEL_UI_V1 );
    }
}

export default LobbyChannelDataModel;
