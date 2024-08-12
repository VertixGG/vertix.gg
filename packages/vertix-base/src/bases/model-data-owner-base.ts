import util from "node:util";

import {
    DataVersioningModelFactory
} from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type { TVersionType , TDataVersioningDefaultUniqueKeys } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type { TDataType, TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

import type { TWithOptionalProps } from "@vertix.gg/utils/src/common-types";

interface TDataOwnerDefaultUniqueKeys extends TDataVersioningDefaultUniqueKeys {
    ownerId: string;
}

export abstract class DataOwnerModelBase<
    TModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TDataModelResult extends TDefaultResult = TDefaultResult,
    TDataKeys extends TDataOwnerDefaultUniqueKeys = TDataOwnerDefaultUniqueKeys
> extends InitializeBase {
    private dataVersioningModel;

    public static getName() {
        return "VertixBase/Factory/DataModelBase";
    }

    protected constructor( shouldDebugCache: boolean, shouldDebugModel: boolean ) {
        super();

        const dataModel = this.getDataModel(),
            dataModelOptions = {
                modelNamespace: ( this.constructor as typeof DataOwnerModelBase ).getName(),
                meta: this.getModel().name.toLowerCase(),
                shouldDebugCache,
                shouldDebugModel
            };

        const self = this;

        const DataModelVersioning = class extends DataVersioningModelFactory<
            TDataModelResult,
            TDataModel,
            TDataKeys
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

    protected async dataCreate<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.create<T>( this.normalizeKeys( keys ), value );
    }

    protected async dataUpdate<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.update<T>( this.normalizeKeys( keys ), value );
    }

    protected async dataUpsert<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.upsert<T>( this.normalizeKeys( keys ), value );
    }

    protected async dataGet<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, cache = true ) {
        return await this.dataVersioningModel.get( this.normalizeKeys( keys ), { cache } ) as T;
    }

    protected async dataGetWithMeta<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, cache = true ) {
        return await this.dataVersioningModel.getWithMeta<T, Awaited<ReturnType<TModel["findUnique"]>>>( this.normalizeKeys( keys ), { cache } );
    }

    protected async create<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeys( keys, args, this.create );
        if ( ! keysWithOwner ) return null;

        return this.dataCreate<T>( keysWithOwner, value );
    }

    protected async update<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeys( keys, args, this.update );
        if ( ! keysWithOwner ) return null;

        return this.dataUpdate<T>( keysWithOwner, value );
    }

    protected async upsert<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeys( keys, args, this.upsert );
        if ( ! keysWithOwner ) return null;

        return this.dataUpsert<T>( keysWithOwner, value );
    }

    protected async get<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        cache = true,
    ) {
        const keysWithOwner = await this.getKeys( keys, args, this.get );
        if ( ! keysWithOwner ) return null;

        return this.dataGet<T>( keysWithOwner, cache );
    }

    protected async getWithMeta<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        cache = true,
    ) {
        const keysWithOwner = await this.getKeys( keys, args, this.getWithMeta );
        if ( ! keysWithOwner ) return null;

        return this.dataGetWithMeta<T>( keysWithOwner, cache );
    }

    protected async getAll<T extends TDataType>(
        args: Parameters<TModel["findMany"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        cache = true,
    ) {
        let result: T[] | undefined;

        const owners = await this.getModel().findMany( args );

        if ( ! owners ) {
            this.logger.error( this.getAll, `Owners not found: ${ util.inspect( args ) }` );
            return null;
        }

        for ( const owner of owners ) {
            const keysWithOwner = { ... keys, ... this.getOwnerKeys( owner ) } as TWithOptionalProps<TDataKeys, "version">;

            if ( ! keysWithOwner ) continue;

            const data = await this.dataGet<T>( keysWithOwner, cache );

            if ( ! data ) continue;

            if ( ! result ) result = [];

            result.push( data );
        }

        return result;
    }

    protected async getAllWithMeta<T extends TDataType>(
        args: Parameters<TModel["findMany"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        cache = true,
    ) {
        let result;

        const owners = await this.getModel().findMany( args );

        if ( ! owners ) {
            this.logger.error( this.getAll, `Owners not found: ${ util.inspect( args ) }` );
            return null;
        }

        for ( const owner of owners ) {
            const keysWithOwner = { ... keys, ... this.getOwnerKeys( owner ) } as TWithOptionalProps<TDataKeys, "version">;

            if ( ! keysWithOwner ) continue;

            const data = await this.dataGetWithMeta<T>( keysWithOwner, cache );

            if ( ! data ) continue;

            if ( ! result ) result = [];

            result.push( data );
        }

        return result;
    }

    protected async getKeys(
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        args: Parameters<TModel["findUnique"]>[0],
        method: Function
    ) {
        const owner = await this.getModel().findUnique( args );

        if ( ! owner ) {
            this.logger.error( method, `Owner not found: ${ util.inspect( args ) }` );
            return null;
        }

        return { ... keys, ... this.getOwnerKeys( owner ) } as TWithOptionalProps<TDataKeys, "version">;
    }

    protected getOwnerKeys( context: any ): object {
        return {
            ownerId: context.id,
        };
    };

    private normalizeKeys( keys: TWithOptionalProps<TDataKeys, "version"> ): TDataKeys {
        keys = {
            ... keys,

            version: keys.version ?? this.getDataVersion(),
            key: `${ this.getName() }/${ keys.key }`
        };

        return keys as TDataKeys;
    };
}
