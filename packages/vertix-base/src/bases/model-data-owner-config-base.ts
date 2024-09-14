import { ModelDataOwnerStrictDataBase } from "@vertix.gg/base/src/bases/model-data-owner-strict-data-base";

import type { ConfigBaseInterface, ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { TDataDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

export abstract class ModelDataOwnerConfigBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDataDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys,
    TDataConfig extends ConfigBaseInterface,
    TDataConfigSlice extends keyof TDataConfig["data"]
> extends ModelDataOwnerStrictDataBase<TModel, TDataModel, TDataModelResult, TDataModelUniqueKeys, TDataConfig["data"][TDataConfigSlice]> {
    public static getName() {
        return "VertixBase/Bases/ModelDataOwnerConfigBase";
    }

    protected abstract getConfig(): ConfigBase<TDataConfig>;

    protected abstract getConfigSlice(): TDataConfigSlice;

    protected getStrictDataFactor(): TDataConfig["data"][TDataConfigSlice] {
        return this.getConfig().data[ this.getConfigSlice() ];
    }

    protected getSliceData(
        args: Parameters<TModel["findUnique"]>[0],
        cache = true,
        returnDefaults = false,
    ) {
        const keys =  { key: "settings" } as TDataModelUniqueKeys;

        return returnDefaults ?
            this.getStrictDataWithDefaults( args, keys, cache ) :
            this.getStrictData( args, keys, cache );
    }

    protected async setSliceData(
        args: Parameters<TModel["findUnique"]>[0],
        data: Partial<TDataConfig["data"][TDataConfigSlice]>,
        assignDefaults = true,
    ) {
        const keys = { key: "settings" } as TDataModelUniqueKeys;

        return assignDefaults ?
            this.setStrictDataWithDefaults( args, keys, data ) :
            this.setStrictData( args, keys, data );
    }
}

