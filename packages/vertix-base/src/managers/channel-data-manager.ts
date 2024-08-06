import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ManagerDataBase } from "@vertix.gg/base/src/bases/manager-data-base";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

export class ChannelDataManager extends ManagerDataBase<ChannelModel> {
    public static getName() {
        return "VertixBase/Managers/ChannelData";
    }

    public static get $() {
        return ChannelDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", ChannelDataManager.getName() ) ) {
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
