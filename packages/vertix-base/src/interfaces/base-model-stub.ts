import "@vertix.gg/prisma/bot-client";

export interface TBaseModelStub {
    name?: PrismaBot.Prisma.ModelName;
    create(...args: any[]): any;
    create<T>(...args: any[]): Promise<T>;
    update(...args: any[]): any;
    update<T>(...args: any[]): Promise<T>;
    upsert(...args: any[]): any;
    upsert<T>(...args: any[]): Promise<T>;
    delete(...args: any[]): any;
    delete<T>(...args: any[]): Promise<T>;
    findUnique(...args: any[]): any;
    findMany(...args: any[]): any;
    findMany<T>(...args: any[]): Promise<T[]>;
}
