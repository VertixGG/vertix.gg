import util from "node:util";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { DataVersioningModelFactory } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type { TWithOptionalProps } from "@vertix.gg/utils/src/common-types";

import type {
    TVersionType,
    TDataVersioningDefaultUniqueKeys
} from "@vertix.gg/base/src/factory/data-versioning-model-factory";
import type { TDataType, TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";

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

    protected async create<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.create<T>( this.normalizeKeys( keys ), value );
    }

    protected async update<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.update<T>( this.normalizeKeys( keys ), value );
    }

    protected async upsert<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, value: T ) {
        return this.dataVersioningModel.upsert<T>( this.normalizeKeys( keys ), value );
    }

    protected async get<T extends TDataType>( keys: TWithOptionalProps<TDataKeys, "version">, cache = true ) {
        return await this.dataVersioningModel.get( this.normalizeKeys( keys ), { cache } ) as T;
    }

    protected async createByOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeysWithOwner( keys, args, this.createByOwner );
        if ( ! keysWithOwner ) return null;

        return this.create<T>( keysWithOwner, value );
    }

    protected async updateByOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeysWithOwner( keys, args, this.updateByOwner );
        if ( ! keysWithOwner ) return null;

        return this.update<T>( keysWithOwner, value );
    }

    protected async upsertByOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        value: T
    ) {
        const keysWithOwner = await this.getKeysWithOwner( keys, args, this.upsertByOwner );
        if ( ! keysWithOwner ) return null;

        return this.upsert<T>( keysWithOwner, value );
    }

    protected async getByOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TWithOptionalProps<TDataKeys, "version" | "ownerId">,
        cache = true
    ) {
        const keysWithOwner = await this.getKeysWithOwner( keys, args, this.getByOwner );
        if ( ! keysWithOwner ) return null;

        return this.get<T>( keysWithOwner, cache );
    }

    protected async getKeysWithOwner(
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
            ...keys,

            version: keys.version ?? this.getDataVersion(),
            key: `${this.getName()}/${keys.key}`
        };

        return keys as TDataKeys;
    };
}
