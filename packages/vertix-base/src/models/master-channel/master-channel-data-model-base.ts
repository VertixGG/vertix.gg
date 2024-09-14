import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelDataOwnerConfigBase } from "@vertix.gg/base/src/bases/model-data-owner-config-base";

import type { MasterChannelSettingsInterface } from "src/interfaces/master-channel-config";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";

const client = PrismaBotClient.$.getClient();

export abstract class MasterChannelDataModelBase<T extends ConfigBaseInterface<{
    constants: Record<string, any>;
    settings: Record<string, any>;
}>> extends ModelDataOwnerConfigBase<
    typeof client.channel,
    typeof client.channelData,
    PrismaBot.UserData,
    TDataOwnerDefaultUniqueKeys,
    T,
    "settings"
> {
    public static getName() {
        return "VertixBase/Models/MasterChannelDataModelBase";
    }

    protected getModel() {
        return client.channel;
    }

    protected getDataModel() {
        return client.channelData;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }

    protected getConfigSlice() {
        return "settings" as const;
    }

    /**
     * Function `getSettings()` - Retrieves configuration settings for a specific ID
     * This method is used to retrieve settings for a given ID.
     * It constructs a query object with the provided ID, then calls the `getSliceData` method with the query object,
     * cache preference, and a flag indicating whether to return defaults.
     *
     * If the `returnDefaults` parameter is a function, it applies the function to the
     * result before returning it.
     *
     * Otherwise, it returns the result directly.
     * If no result is found and caching is disabled, the method returns the default settings
     * from the configuration.
     **/
    public async getSettings( id: string, cache = true, returnDefaults: ( ( result: any ) => any ) | boolean = false ) {
        const queryArgs = { where: { id } };

        const result = this.getSliceData( queryArgs, cache, !! returnDefaults );

        // this.debugger.dumpDown( this.getSettings,
        //     value,
        //     `ownerId: '${ ownerId }' returnDefault: '${ !! returnDefault }' - ${ key }`
        // );

        if ( typeof returnDefaults === "function" ) {
            return returnDefaults( result );
        }

        return result || ( ! cache && returnDefaults ? this.getConfig().data.settings : null );
    }

    public async setSettings( id: string, settings: Partial<MasterChannelSettingsInterface>, assignDefaults = false ) {
        const queryArgs = { where: { id } },
            keys =  { key: "settings" };

        return assignDefaults ?
            await this.setStrictDataWithDefaults( queryArgs, keys, settings ) :
            await this.setStrictData( queryArgs, keys, settings );
    }
}
