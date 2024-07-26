import util from "node:util";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { DataVersioningModelFactory } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type { TVersionType , TDataVersioningDefaultUniqueKeys } from "@vertix.gg/base/src/factory/data-versioning-model-factory";
import type { TDataType, TDefaultResult } from "@vertix.gg/base/src/factory/data-type-factory";

// TODO: Duplicate code, should be moved to a shared location
interface TBaseModel {
    create( ... args: any[] ): any;
    create<T>( ... args: any[] ): Promise<T>;
    findUnique( ... args: any[] ): any,
}

interface TDataOwnerDefaultUniqueKeys extends TDataVersioningDefaultUniqueKeys {
    ownerId: string;
}

interface TDataOwnerUniqueKeysVersionOptional extends Omit<TDataOwnerDefaultUniqueKeys, "version"> {
    version?: string;
}

interface TDataOwnerUniqueKeysWithoutOwner extends Omit<TDataOwnerUniqueKeysVersionOptional, "ownerId"> {
}
export abstract class DataOwnerModelBase<
    TModel extends TBaseModel,
    TDataModel extends TBaseModel,
    TDataModelResult extends TDefaultResult = TDefaultResult,
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
            TDataOwnerDefaultUniqueKeys
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

    protected async create<T extends TDataType>( keys: TDataOwnerUniqueKeysVersionOptional, value: T ) {
        return this.dataVersioningModel.create<T>( { ... keys, version: this.getDataVersion() }, value );
    }

    protected async createByOwner<T extends TDataType>(
        args: Parameters<TModel["findUnique"]>[0],
        keys: TDataOwnerUniqueKeysWithoutOwner,
        value: T
    ) {
        const owner = await this.getModel().findUnique( args );

        if ( ! owner ) {
            this.logger.error( this.createByOwner, `Owner not found: ${ util.inspect( args ) }` );
            return null;
        }

        return this.create<T>( { ... keys, ownerId: owner.id }, value );
    }

    protected async get( keys: TDataOwnerUniqueKeysVersionOptional, cache = true ) {
        keys.version = keys.version ?? this.getDataVersion();

        return this.dataVersioningModel.get( keys as TDataOwnerDefaultUniqueKeys, { cache } );
    }

    protected async getByOwner( args: Parameters<TModel["findUnique"]>[0], keys: TDataOwnerUniqueKeysWithoutOwner, cache = true ) {
        const owner = await this.getModel().findUnique( args );

        if ( ! owner ) {
            this.logger.error( this.getByOwner, `Owner not found: ${ util.inspect( args ) }` );
            return null;
        }

        return this.get( { ... keys, ownerId: owner.id }, cache );
    }
}
