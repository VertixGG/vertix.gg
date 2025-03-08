import "@vertix.gg/prisma/bot-client";

type TDataDataTypes = keyof typeof PrismaBot.E_DATA_TYPES;

export type defaultDataTypes = string | string[] | object;

export interface IDataSelectUniqueArgs {
    ownerId: string;
    version: string;
    key: string;
}

export interface TDataWhereUnique {
    where: {
        ownerId_key_version: IDataSelectUniqueArgs;
    };
}

export interface IDataCreateArgs extends IDataSelectUniqueArgs {
    value: defaultDataTypes;
}

export interface IDataGetArgs extends IDataSelectUniqueArgs {
    default: defaultDataTypes | null;
    cache?: boolean;
}

export interface IDataUpdateArgs extends IDataGetArgs {
    skipGet?: boolean;
}

export interface DataResult {
    object: PrismaBot.Prisma.JsonValue | any;
    id: string;
    key: string;
    type: string;
    values: string[];
    version: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;

    // Exist when included, via prisma mechanism.
    data?: DataResult[];
}

export interface IDataManager {
    getData(args: IDataGetArgs): Promise<DataResult | void>;

    setData(args: IDataUpdateArgs): Promise<DataResult | void>;

    updateData(args: IDataUpdateArgs, dbData: DataResult): Promise<void>;

    deleteData(args: IDataSelectUniqueArgs): Promise<DataResult>;
}

export interface IDataModel {
    getOwnerId(ownerId: string): Promise<{ id: string }>;

    createData(args: Omit<IDataCreateArgs, "version">): Promise<DataResult>;

    getData(args: Omit<IDataUpdateArgs, "version">): Promise<DataResult | null>;

    setData(args: Omit<IDataUpdateArgs, "version">): Promise<DataResult | void>;

    getAllData(): Promise<DataResult[]>;

    getInternalNormalizedData(args: IDataCreateArgs): DataResult;

    deleteData(args: Omit<IDataSelectUniqueArgs, "version">): Promise<DataResult>;

    isDataExist(args: IDataSelectUniqueArgs): Promise<boolean>;
}

export interface IOwnerInnerModel {
    findUnique(args: { where: any; include?: any }): Promise<any>;
}

export interface IDataInnerModel {
    create(args: {
        data: {
            ownerId: string;
            key: string;
            version: string;
            type: TDataDataTypes;
            values?: string[];
            object?: Record<string, any>;
        };
    }): Promise<any>;

    update(
        args: TDataWhereUnique & {
            data: {
                type: TDataDataTypes;
                values?: string[];
                object?: Record<string, any>;
            };
        }
    ): Promise<any>;

    delete(args: TDataWhereUnique): Promise<any>;

    findMany(args?: { where?: any; include?: any }): Promise<any>;

    findUnique(
        args: TDataWhereUnique & {
            include?: any;
        }
    ): Promise<any>;
}
