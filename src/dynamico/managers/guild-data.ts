import GuildModel from "../models/guild";

import DynamicoManager from "@dynamico/managers/dynamico";

import { ManagerDataBase } from "@dynamico/bases/manager-data-base";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@dynamico/constants/master-channel";

interface IGuildSettings {
    maxMasterChannels: number;
}

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

    public constructor( shouldDebugCache = DynamicoManager.isDebugOn( "CACHE", GuildDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getAllSettings( guildId: string ): Promise<IGuildSettings> {
        const data = await this.getSettingsData(
            guildId,
            null,
            false,
            true
        );

        if ( data?.object ) {
            return data.object;
        }

        return {
            maxMasterChannels: DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS,
        };
    }

    public removeFromCache( ownerId: string ) {
        this.logger.info( this.removeFromCache,
            `Removing guild data from cache for ownerId: '${ ownerId }'`
        );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return GuildModel.getInstance();
    }
}

export default GuildDataManager;
