import util from "node:util";

import {
    DataVersioningModelFactory
} from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type { TVersionType , TDataVersioningDefaultUniqueKeys } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type { TDataType, TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

import type { TWithOptionalProps } from "@vertix.gg/utils/src/common-types";

export interface TDataOwnerDefaultUniqueKeys extends TDataVersioningDefaultUniqueKeys {
    ownerId: string;
}

export abstract class ModelDataOwnerBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys
> extends InitializeBase {
    private dataVersioningModel;

    public static getName() {
        return "VertixBase/Bases/DataModelBase";
    }

    protected constructor( shouldDebugCache: boolean, shouldDebugModel: boolean ) {
        super();

        const dataModel = this.getDataModel(),
            dataModelOptions = {
                modelOwnerName: this.getModel().name,
                modelNamespace: ( this.constructor as typeof ModelDataOwnerBase ).getName(),

                shouldDebugCache,
                shouldDebugModel
            };

        const self = this;

        const DataModelVersioning = class extends DataVersioningModelFactory<
            TDataModelResult,
            TDataModel,
            TDataModelUniqueKeys
        >( dataModel, dataModelOptions ) {

            protected getUniqueKeyName() {
                return self.getDataUniqueKeyName();
            }
        };

        this.dataVersioningModel = new DataModelVersioning();
    }

    protected abstract getModel(): TModel;

    protected abstract getDataModel(): TDataModel;

    protected abstract getDataVersion(): TVersionType;

    protected abstract getDataUniqueKeyName(): string;

    protected async dataCreate<T extends TDataType>( keys: TWithOptionalProps<TDataModelUniqueKeys, "version">, value: T ) {
        return this.dataVersioningModel.create<T>( this.normalizeUniqueKeys( keys ), value );
    }

    protected async dataUpdate<T extends TDataType>( keys: TWithOptionalProps<TDataModelUniqueKeys, "version">, value: T ) {
        return this.dataVersioningModel.update<T>( this.normalizeUniqueKeys( keys ), value );
    }

    protected async dataUpsert<T extends TDataType>( keys: TWithOptionalProps<TDataModelUniqueKeys, "version">, value: T ) {
        return this.dataVersioningModel.upsert<T>( this.normalizeUniqueKeys( keys ), value );
    }

    protected async dataGet<T extends TDataType>( keys: TWithOptionalProps<TDataModelUniqueKeys, "version">, cache = true ) {
        return await this.dataVersioningModel.get( this.normalizeUniqueKeys( keys ), { cache } ) as T;
    }

    protected async dataGetWithOwner<T extends TDataType>( keys: TWithOptionalProps<TDataModelUniqueKeys, "version">, cache = false ) {
        return await this.dataVersioningModel.getWithOwner<T, Awaited<ReturnType<TModel["findUnique"]>>>( this.normalizeUniqueKeys( keys ), { cache } );
    }

    protected async create<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner =
            await this.getUniqueKeys( keys, args, this.create );

        if ( ! keysWithOwner ) return null;

        return this.dataCreate<T>( keysWithOwner, value );
    }

    protected async update<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner =
            await this.getUniqueKeys( keys, args, this.update );

        if ( ! keysWithOwner ) return null;

        return this.dataUpdate<T>( keysWithOwner, value );
    }

    protected async upsert<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner =
            await this.getUniqueKeys( keys, args, this.upsert );

        if ( ! keysWithOwner ) return null;

        return this.dataUpsert<T>( keysWithOwner, value );
    }

    protected async get<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        cache = true,
    ) {
        const keysWithOwner =
            await this.getUniqueKeys( keys, args, this.get );

        if ( ! keysWithOwner ) return null;

        return this.dataGet<T>( keysWithOwner, cache );
    }

    protected async getWithOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        cache = false,
    ) {
        const keysWithOwner =
            await this.getUniqueKeys( keys, args, this.getWithOwner );

        if ( ! keysWithOwner ) return null;

        return this.dataGetWithOwner<T>( keysWithOwner, cache );
    }

    protected async getAll<T extends TDataType>(
        args: Parameters<TModel["findMany"]>[0],
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        cacheUnits = true,
    ) {
        let result: T[] | null = null;

        const owners = await this.getModel().findMany( args );

        if ( owners?.length ) {
            result = [];

            for ( const owner of owners ) {
                const keysWithOwner = { ... keys, ... this.getOwnerUniqueKeys( owner ) } as TWithOptionalProps<TDataModelUniqueKeys, "version">;

                if ( ! keysWithOwner ) continue;

                const data = await this.dataGet<T>( keysWithOwner, cacheUnits );

                if ( ! data ) continue;

                result.push( data );
            }
        } else {
            this.logger.error( this.getAll, `Owners not found: ${ util.inspect( args ) }` );
        }

        return result;
    }

    protected async getUniqueKeys(
        keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
        args: Parameters<TModel["findUnique"]>[0],
        method: Function
    ) {
        const owner = await this.getModel().findUnique( args );

        if ( ! owner ) {
            this.logger.error( method, `Owner not found: ${ util.inspect( args ) }` );
            return null;
        }

        return { ... keys, ... this.getOwnerUniqueKeys( owner ) } as TWithOptionalProps<TDataModelUniqueKeys, "version">;
    }

    protected getOwnerUniqueKeys( context: any ): object {
        return {
            ownerId: context.id,
        };
    };

    private normalizeUniqueKeys( keys: TWithOptionalProps<TDataModelUniqueKeys, "version"> ): TDataModelUniqueKeys {
        keys = {
            ... keys,

            version: keys.version ?? this.getDataVersion(),
            key: `${ this.getName() }/${ keys.key }`
        };

        return keys as TDataModelUniqueKeys;
    };
}
