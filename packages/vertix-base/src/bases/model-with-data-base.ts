import { ModelBaseCachedWithModel } from "@vertix.gg/base/src/bases/model-base";

import type { ModelDataOwnerBase, TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { TDataDefaultResult, TDataType } from "@vertix.gg/base/src/factory/data-type-factory";
import type { TBaseModelStub } from "@vertix.gg/base/src/interfaces/base-model-stub";
import type { TWithOptionalProps } from "@vertix.gg/utils/src/common-types";

type AbstractConstructor<T> = abstract new ( ...args: any[] ) => T;

type TPossibleOwnerModels = PrismaBot.Channel | PrismaBot.Guild | PrismaBot.User;

/**
 * This is a "nice hack" for the wrapping of the models.
 */
export abstract class ModelWithDataBase<
    TOwnerModel extends TBaseModelStub,
    TDataModel extends TBaseModelStub,
    TOwnerModelResult extends TPossibleOwnerModels,
    TDataModelResult extends TDataDefaultResult,
    TDataModelUniqueKeys extends TDataOwnerDefaultUniqueKeys
> extends ModelBaseCachedWithModel<TOwnerModel, TOwnerModelResult> {
    protected dataModels;

    public static getName () {
        return "VertixBase/Bases/ModelWithDataBase";
    }

    protected constructor () {
        super();

        function WrapperMixin<
            T extends AbstractConstructor<
                ModelDataOwnerBase<TOwnerModel, TDataModel, TDataModelResult, TDataModelUniqueKeys>
            >
        > ( Ctor: T ) {
            abstract class ModelDataOwnerWrapper extends Ctor {
                public async create<T extends TDataType> (
                    args: Parameters<TOwnerModel["findUnique"]>[0],
                    keys: TWithOptionalProps<TDataModelUniqueKeys, "version" | "ownerId">,
                    value: T
                ) {
                    return super.create( args, keys, value );
                }

                // TODO: Rename or find more consistent names
                public async getData<T extends TDataType> (
                    keys: TWithOptionalProps<TDataModelUniqueKeys, "version">,
                    options: {
                        cache: boolean;
                    }
                ) {
                    return await this.dataGet<T>( keys, options.cache );
                }

                public getVersion () {
                    return this.getDataVersion();
                }
            }

            return ModelDataOwnerWrapper;
        }

        this.dataModels = this.getDataModels().map( ( ModelClass ) => {
            const WrappedModelClass = WrapperMixin( ModelClass );

            return new WrappedModelClass();
        } );
    }

    protected abstract getDataModels(): ( new () => ModelDataOwnerBase<
        TOwnerModel,
        TDataModel,
        TDataModelResult,
        TDataModelUniqueKeys
    > )[];
}
