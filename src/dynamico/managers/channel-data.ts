import ChannelModel from "../models/channel";

import { ManagerDataBase } from "@dynamico/bases/manager-data-base";

export class ChannelDataManager extends ManagerDataBase<ChannelModel> {
    private static instance: ChannelDataManager;

    public static getInstance(): ChannelDataManager {
        if ( ! ChannelDataManager.instance ) {
            ChannelDataManager.instance = new ChannelDataManager();
        }
        return ChannelDataManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/ChannelData";
    }

    public removeFromCache( ownerId: string ) {
        this.logger.info( this.removeFromCache,
            `Removing channel data from cache for ownerId: '${ ownerId }'` );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getDataSourceModel() {
        return ChannelModel.getInstance();
    }
}

export default ChannelDataManager;
