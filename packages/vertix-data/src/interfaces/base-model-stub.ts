import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * The shape every model base is generic over - a prisma delegate, described loosely enough that a
 * real one satisfies it.
 *
 * **The `any`s here are load-bearing, and the project's rule against them is knowingly set aside
 * for this file.** A delegate's real signature is `create<T extends ChannelCreateArgs>( args:
 * SelectSubset<T, ChannelCreateArgs> )`, wrapped again by the model extensions this schema
 * declares. Restating that is not possible without restating prisma's generated types, and
 * anything narrower stops admitting them.
 *
 * Tightened to `create<TResult>( args: object )`, `vertix-data` still compiles - it never
 * instantiates these generics itself - and `vertix-bot`, `vertix-api` and `vertix-gui` all fail
 * with `Type 'DynamicModelExtensionThis<...>' does not satisfy the constraint`. Check against a
 * dependent, not this package, if you try again.
 */
export interface TBaseModelStub {
    name?: PrismaBot.Prisma.ModelName;
    create( ...args: any[] ): any;
    create<T>( ...args: any[] ): Promise<T>;
    update( ...args: any[] ): any;
    update<T>( ...args: any[] ): Promise<T>;
    upsert( ...args: any[] ): any;
    upsert<T>( ...args: any[] ): Promise<T>;
    delete( ...args: any[] ): any;
    delete<T>( ...args: any[] ): Promise<T>;
    findUnique( ...args: any[] ): any;
    findMany( ...args: any[] ): any;
    findMany<T>( ...args: any[] ): Promise<T[]>;
}
