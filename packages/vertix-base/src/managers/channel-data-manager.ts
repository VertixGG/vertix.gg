import { ManagerDataBase } from "@vertix.gg/base/src/bases/manager-data-base";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { isDebugOn } from "@vertix.gg/base/src/utils/debug";

export class ChannelDataManager extends ManagerDataBase<ChannelModel> {
    private static instance: ChannelDataManager;

    public static getName() {
        return "VertixBase/Managers/ChannelData";
    }

    public static getInstance(): ChannelDataManager {
        if ( ! ChannelDataManager.instance ) {
            ChannelDataManager.instance = new ChannelDataManager();
        }
        return ChannelDataManager.instance;
    }

    public static get $() {
        return ChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugOn( "CACHE", ChannelDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.debug( this.removeFromCache,
            `Removing channel data from cache for ownerId: '${ ownerId }'`
        );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return ChannelModel.getInstance();
    }
}
