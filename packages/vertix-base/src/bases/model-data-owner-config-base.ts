import { ModelDataOwnerStrictDataBase } from "@vertix.gg/base/src/bases/model-data-owner-strict-data-base";

import type { ConfigBaseInterface, ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { TDataDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

/**
 * TODO: Refactor for readability, currently its hard to understand the interaction between config and settings.
 * And... there is no validation of selected slice of config against the settings in the data collection.
 */
export abstract class ModelDataOwnerConfigBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDataDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys,
    TDataConfig extends ConfigBaseInterface,
    TDataConfigSlice extends keyof TDataConfig["data"],
    TDataSlice extends TDataConfig["data"][TDataConfigSlice] = TDataConfig["data"][TDataConfigSlice]
> extends ModelDataOwnerStrictDataBase<
        TModel,
        TDataModel,
        TDataModelResult,
        TDataModelUniqueKeys,
        TDataConfig["data"][TDataConfigSlice]
    > {
    public static getName() {
        return "VertixBase/Bases/ModelDataOwnerConfigBase";
    }

    protected abstract getConfig(): ConfigBase<TDataConfig>;

    protected abstract getConfigSlice(): TDataConfigSlice;

    protected getStrictDataFactor(): TDataSlice {
        return this.getConfig().data[ this.getConfigSlice() ];
    }

    protected async getSliceData(
        args: Parameters<TModel["findUnique"]>[0],
        key: string,
        cache = true,
        returnDefaults = false
    ) {
        const keys = { key } as TDataModelUniqueKeys;

        return returnDefaults
            ? this.getStrictDataWithDefaults( args, keys, cache )
            : this.getStrictData( args, keys, cache );
    }

    protected async setSliceData(
        args: Parameters<TModel["findUnique"]>[0],
        key: string,
        data: Partial<TDataConfig["data"][TDataConfigSlice]>,
        assignDefaults = true
    ) {
        const keys = { key } as TDataModelUniqueKeys;

        return assignDefaults ? this.setStrictDataWithDefaults( args, keys, data ) : this.setStrictData( args, keys, data );
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
    public async getSettings(
        id: string,
        cache = true,
        returnDefaults: ( ( result: any ) => TDataSlice ) | boolean = false
    ): Promise<TDataSlice | null> {
        const isReturnDefaultCallback = "function" === typeof returnDefaults;

        const defaultSettings = !isReturnDefaultCallback && returnDefaults ? this.getConfig().data.settings : null;

        const queryArgs = { where: { id } };

        let result = await this.getSliceData( queryArgs, "settings", cache, false );

        if ( defaultSettings ) {
            result = Object.assign( defaultSettings, result );
        } else if ( isReturnDefaultCallback ) {
            result = returnDefaults( result || {} );
        }

        // this.debugger.dumpDown( this.getSettings,
        //     value,
        //     `ownerId: '${ ownerId }' returnDefault: '${ !! returnDefault }' - ${ key }`
        // );

        return result;
    }

    public async setSettings( id: string, settings: Partial<TDataSlice>, assignDefaults = false ) {
        const queryArgs = { where: { id } };

        return this.setSliceData( queryArgs, "settings", settings, assignDefaults );
    }
}
