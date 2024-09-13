import "@vertix.gg/prisma/bot-client";

import { ModelBaseCachedWithClient } from "@vertix.gg/base/src/bases/model-base";

import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import type {
    IDataCreateArgs,
    IDataGetArgs,
    IDataInnerModel,
    IDataModel,
    IDataSelectUniqueArgs,
    IDataUpdateArgs,
    IOwnerInnerModel
} from "@vertix.gg/base/src/interfaces/data";

export abstract class ModelDataBase<
    TOwnerModel extends IOwnerInnerModel,
    TDataModel extends IDataInnerModel,
    TCacheResult = undefined,
>
    extends ModelBaseCachedWithClient<PrismaBot.PrismaClient, TCacheResult> implements IDataModel
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
            version: VERSION_UI_V2,
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
            version: VERSION_UI_V2,
            key: args.key,

            value: args.default,
        };

        let result;

        try {
            result = await this.dataModel.update( {
                where: {
                    ownerId_key_version: {
                        ownerId: args.ownerId,
                        version: args.version,
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

    public async deleteData( args: Omit<IDataSelectUniqueArgs, "version"> ) {
        return this.dataModel.delete( {
            where: this.getWhereUnique( {
                version: VERSION_UI_V2,
                ...args
            } )
        } );
    }

    // TODO: `version` should not be omitted.
    public async getData( args: Omit<IDataGetArgs, "version"> ) {
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

    public async isDataExist( args: IDataSelectUniqueArgs ) {
        const result = await this.dataModel.findUnique( {
            where: this.getWhereUnique( args )
        } );

        return !! result;
    }

    protected abstract getOwnerIdFieldName(): string;

    protected abstract getOwnerModel(): TOwnerModel;

    protected abstract getDataModel(): TDataModel;

    private getWhereUnique( args: IDataSelectUniqueArgs ) {
        return {
            ownerId_key_version: {
                ownerId: args.ownerId,
                version: args.version,
                key: args.key,
            },
        };
    }
}
