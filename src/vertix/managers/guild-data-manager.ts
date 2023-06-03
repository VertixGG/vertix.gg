import { GuildModel } from "@vertix/models";

import { AppManager } from "@vertix/managers/app-manager";

import { ManagerDataBase } from "@vertix/bases/manager-data-base";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "@vertix/definitions/master-channel";

interface IGuildSettings {
    maxMasterChannels: number;
}

export class GuildDataManager extends ManagerDataBase<GuildModel> {
    private static instance: GuildDataManager;

    public static getName() {
        return "Vertix/Managers/GuildData";
    }

    public static getInstance(): GuildDataManager {
        if ( ! GuildDataManager.instance ) {
            GuildDataManager.instance = new GuildDataManager();
        }
        return GuildDataManager.instance;
    }

    public static get $() {
        return GuildDataManager.getInstance();
    }

    public constructor( shouldDebugCache = AppManager.isDebugOn( "CACHE", GuildDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    // TODO: Cache always false.
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
        this.logger.debug( this.removeFromCache,
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
