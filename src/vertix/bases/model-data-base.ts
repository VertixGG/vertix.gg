import {
    IDataCreateArgs,
    IDataGetArgs,
    IDataInnerModel,
    IDataModel,
    IDataSelectUniqueArgs,
    IDataUpdateArgs,
    IOwnerInnerModel
} from "@vertix/interfaces/data";

import { CURRENT_VERSION } from "@vertix/definitions/version";

import { ModelBaseCached } from "@internal/bases/model-base";

export abstract class ModelDataBase<
    TOwnerModel extends IOwnerInnerModel,
    TDataModel extends IDataInnerModel,
    TCacheResult = undefined,
>
    extends ModelBaseCached<TCacheResult> implements IDataModel
{

    protected ownerModel: TOwnerModel;
    protected dataModel: TDataModel;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super( shouldDebugCache, shouldDebugModel );

        this.ownerModel = this.getOwnerModel();
        this.dataModel = this.getDataModel();
    }

    public async createData( args: IDataCreateArgs ) {
        const data = {
            ... this.getInternalNormalizedData( args ),

            // # CRITICAL: This is the version of the content.
            version: CURRENT_VERSION,
        };

        this.debugger.dumpDown( this.createData, { data, args } );

        return this.dataModel.create( {
            data: {
                ... data,
                ownerId: args.ownerId,
                key: args.key,
            }
        } );
    }

    public async setData( args: IDataUpdateArgs ) {
        if ( null === args.default ) {
            return this.logger.error( this.setData,
                `Cannot set data for: '${ args.key }' to null.`
            );
        }

        const createArgs: IDataCreateArgs = {
            ownerId: args.ownerId,
            key: args.key,
            value: args.default,
        };

        let result;

        try {
            result = await this.dataModel.update( {
                where: {
                    ownerId_key: {
                        ownerId: args.ownerId,
                        key: args.key,
                    },
                },
                data: this.getInternalNormalizedData( createArgs )
            } );
        } catch ( e ) {
            this.logger.warn( this.setData,
                `Issue for data for key: '${ args.key }' ownerId: '${ args.ownerId }'`
            );

            return e;
        }

        return result;
    }

    public async deleteData( args: IDataSelectUniqueArgs ) {
        return this.dataModel.delete( {
            where: {
                ownerId_key: {
                    ownerId: args.ownerId,
                    key: args.key,
                },
            },
        } );
    }

    public async getData( args: IDataGetArgs ) {
        this.debugger.log( this.getData, "Getting content for:", args );

        return this.ownerModel.findUnique( {
            where: {
                id: args.ownerId,
            },
            include: {
                data: { where: { key: args.key } },
            }
        } );
    }

    public async getAllData() {
        return this.dataModel.findMany();
    }

    public getInternalNormalizedData( args: IDataCreateArgs ) {
        const data: any = {};

        if ( "string" === typeof args.value ) {
            data.type = "string";
        } else if ( Array.isArray( args.value ) ) {
            data.type = "array";
        } else if ( "object" === typeof args.value ) {
            data.type = "object";
        }

        switch ( data.type ) {
            case "object":
                data.object = args.value;
                break;
            case "array":
                data.values = args.value;
                break;
            default:
            case "string":
                data.values = [ args.value ];
        }

        return data;
    }

    public getOwnerId( ownerId: string ): Promise<{ id: string }> {
        return this.ownerModel.findUnique( {
            where: {
                [ this.getOwnerIdFieldName() ]: ownerId,
            },
        } );
    }

    protected abstract getOwnerIdFieldName(): string;

    protected abstract getOwnerModel(): TOwnerModel;

    protected abstract getDataModel(): TDataModel;
}
