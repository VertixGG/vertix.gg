import { ModelDataOwnerStrictDataBase } from "@vertix.gg/data/src/bases/model-data-owner-strict-data-base";

import type { ConfigBaseInterface, ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/data/src/bases/model-data-owner-base";
import type { TDataDefaultResult } from "@vertix.gg/data/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/data/src/interfaces/base-model-stub";

/**
 * An owner whose stored settings are described by a configuration.
 *
 * The configuration is the whole of it: what it carries is what the row may hold, which is what
 * `setStrictData()` filters a write against, and what an unset setting falls back to. It used to
 * be one named slice of a configuration that also held other things, so the two had to be kept in
 * step by hand and nothing checked that they were.
 */
export abstract class ModelDataOwnerConfigBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDataDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys,
    TDataConfig extends ConfigBaseInterface
> extends ModelDataOwnerStrictDataBase<
        TModel,
        TDataModel,
        TDataModelResult,
        TDataModelUniqueKeys,
        TDataConfig[ "data" ]
    > {
    public static getName() {
        return "VertixData/Bases/ModelDataOwnerConfigBase";
    }

    protected abstract getConfig(): ConfigBase<TDataConfig>;

    protected getStrictDataFactor(): TDataConfig[ "data" ] {
        return this.getConfig().data;
    }

    protected async getSliceData(
        args: Parameters<TModel[ "findUnique" ]>[ 0 ],
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
        args: Parameters<TModel[ "findUnique" ]>[ 0 ],
        key: string,
        data: Partial<TDataConfig[ "data" ]>,
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
        returnDefaults: ( ( result: Partial<TDataConfig[ "data" ]> | null ) => TDataConfig[ "data" ] ) | boolean = false
    ): Promise<TDataConfig[ "data" ] | null> {
        const isReturnDefaultCallback = "function" === typeof returnDefaults;

        const defaultSettings = !isReturnDefaultCallback && returnDefaults ? this.getConfig().data : null;

        const queryArgs = { where: { id } };

        let result = await this.getSliceData( queryArgs, "settings", cache, false ) as TDataConfig[ "data" ] | null;

        if ( defaultSettings ) {
            result = Object.assign( {}, defaultSettings, result );
        } else if ( isReturnDefaultCallback ) {
            result = returnDefaults( result );
        }

        // this.debugger.dumpDown( this.getSettings,
        //     value,
        //     `ownerId: '${ ownerId }' returnDefault: '${ !! returnDefault }' - ${ key }`
        // );

        return result;
    }

    public async setSettings( id: string, settings: Partial<TDataConfig[ "data" ]>, assignDefaults = false ) {
        const queryArgs = { where: { id } };

        return this.setSliceData( queryArgs, "settings", settings, assignDefaults );
    }
}
