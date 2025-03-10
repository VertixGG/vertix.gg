import { ModelDataOwnerBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";

import type { TDataDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";
import type { TWithOptionalProps } from "@vertix.gg/utils/src/common-types";

export abstract class ModelDataOwnerStrictDataBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDataDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys,
    TDataModelStrictData extends Record<string, any>
> extends ModelDataOwnerBase<TModel, TDataModel, TDataModelResult, TDataModelUniqueKeys> {
    public static getName () {
        return "VertixBase/Bases/ModelDataOwnerStrictDataBase";
    }

    protected abstract getStrictDataFactor(): TDataModelStrictData;

    protected async setStrictData (
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        data: Partial<TDataModelStrictData>
    ) {
        const dataFactor = this.getStrictDataFactor();

        // Pick only the keys that are defined in the config.
        const filteredData = Object.fromEntries(
            Object.entries( data ).filter( ( [ key ] ) => key in dataFactor )
        ) as Partial<TDataModelStrictData>;

        return this.upsert( args, keys, filteredData );
    }

    protected async setStrictDataWithDefaults (
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        data: Partial<TDataModelStrictData>
    ) {
        const defaults = this.getStrictDataFactor();

        const dataWithDefaults = Object.fromEntries(
            Object.entries( defaults ).map( ( [ key, value ] ) => [ key, data[ key as keyof typeof defaults ] ?? value ] )
        ) as Partial<TDataModelStrictData>;

        return this.setStrictData( args, keys, dataWithDefaults );
    }

    public async getStrictData (
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        cache = true
    ) {
        let result: TDataModelStrictData | null = null;

        const data = await this.get<TDataModelStrictData>( args, keys, cache );

        if ( data ) {
            const keys = Object.keys( this.getStrictDataFactor() ) as ( keyof TDataModelStrictData )[];

            result = {} as TDataModelStrictData;

            keys.forEach( ( key ) => {
                const value = data[ key ];

                if ( !value ) {
                    return;
                }

                result![ key ] = value;
            } );
        }

        return result;
    }

    protected async getStrictDataWithDefaults (
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        cache = true
    ) {
        const defaults = this.getStrictDataFactor(),
            data = await this.getStrictData( args, keys, cache );

        if ( !data ) {
            return defaults;
        }

        return {
            ...defaults,
            ...data
        };
    }
}
