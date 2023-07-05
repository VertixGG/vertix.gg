import { Prisma } from "@vertix-base-prisma-bot";

export type defaultDataTypes = string | string[] | object;

export interface IDataSelectUniqueArgs {
    ownerId: string,
    key: string,
}

export interface IDataCreateArgs extends IDataSelectUniqueArgs {
    value: defaultDataTypes,
}

export interface IDataGetArgs extends IDataSelectUniqueArgs {
    default: defaultDataTypes | null,
    cache?: boolean,
}

export interface IDataUpdateArgs extends IDataGetArgs {
    skipGet?: boolean,
}

export interface DataResult {
    object: Prisma.JsonValue | any,
    id: string,
    key: string,
    type: string,
    values: string[],
    version: string,
    ownerId: string,
    createdAt: Date,
    updatedAt: Date

    // Exist when included, via prisma mechanism.
    data?: DataResult[]
}

export interface IDataManager {
    getData( args: IDataGetArgs ): Promise<DataResult | void>;

    setData( args: IDataUpdateArgs ): Promise<DataResult | void>;

    updateData( args: IDataUpdateArgs, dbData: DataResult ): Promise<void>;

    deleteData( args: IDataSelectUniqueArgs ): Promise<DataResult>;
}

export interface IDataModel {
    getOwnerId( ownerId: string ): Promise<{ id: string }>

    createData( args: IDataCreateArgs ): Promise<DataResult>;

    getData( args: IDataSelectUniqueArgs ): Promise<DataResult | null>;

    setData( args: IDataUpdateArgs ): Promise<DataResult | void>

    deleteData( args: IDataSelectUniqueArgs ): Promise<DataResult>

    getAllData(): Promise<DataResult[]>

    getInternalNormalizedData( args: IDataCreateArgs ): DataResult;
}

export interface IOwnerInnerModel {
    findUnique( args: {
        where: any,
        include?: any,
    } ): Promise<any>
}

export interface IDataInnerModel {
    create( args: {
        data: {
            ownerId: string,
            key: string,
            type: "string" | "array" | "object",
            values?: string[],
            object?: Record<string, any>
        }
    } ): Promise<any>,

    update( args: {
        where: {
            ownerId_key: {
                ownerId: string,
                key: string
            }
        },
        data: {
            type: "string" | "array" | "object",
            values?: string[],
            object?: Record<string, any>
        }
    } ): Promise<any>,

    delete( args: {
        where: {
            ownerId_key: {
                ownerId: string,
                key: string
            }
        }
    } ): Promise<any>,

    findMany( args?: {
        where?: any,
        include?: any
    } ): Promise<any>,
}

