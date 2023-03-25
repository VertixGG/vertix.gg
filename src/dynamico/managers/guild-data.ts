import GuildModel from "../models/guild";

import { ManagerDataBase } from "@dynamico/bases/manager-data-base";

export class GuildDataManager extends ManagerDataBase<GuildModel> {
    private static instance: GuildDataManager;

    public static getInstance(): GuildDataManager {
        if ( ! GuildDataManager.instance ) {
            GuildDataManager.instance = new GuildDataManager();
        }
        return GuildDataManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/GuildData";
    }

    public removeFromCache( ownerId: string ) {
        this.logger.info( this.removeFromCache,
            `Removing guild data from cache for ownerId: '${ ownerId }'` );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getDataSourceModel() {
        return GuildModel.getInstance();
    }
}

export default GuildDataManager;
