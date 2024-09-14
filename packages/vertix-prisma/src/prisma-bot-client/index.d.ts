
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Language
 * 
 */
export type Language = $Result.DefaultSelection<Prisma.$LanguagePayload>
/**
 * Model ElementButtonContent
 * 
 */
export type ElementButtonContent = $Result.DefaultSelection<Prisma.$ElementButtonContentPayload>
/**
 * Model ElementTextInputContentLanguage
 * 
 */
export type ElementTextInputContentLanguage = $Result.DefaultSelection<Prisma.$ElementTextInputContentLanguagePayload>
/**
 * Model ElementSelectMenuOptionsLanguage
 * 
 */
export type ElementSelectMenuOptionsLanguage = $Result.DefaultSelection<Prisma.$ElementSelectMenuOptionsLanguagePayload>
/**
 * Model ElementSelectMenuLanguageContent
 * 
 */
export type ElementSelectMenuLanguageContent = $Result.DefaultSelection<Prisma.$ElementSelectMenuLanguageContentPayload>
/**
 * Model EmbedContentLanguage
 * 
 */
export type EmbedContentLanguage = $Result.DefaultSelection<Prisma.$EmbedContentLanguagePayload>
/**
 * Model MarkdownContentLanguage
 * 
 */
export type MarkdownContentLanguage = $Result.DefaultSelection<Prisma.$MarkdownContentLanguagePayload>
/**
 * Model ModalContentLanguage
 * 
 */
export type ModalContentLanguage = $Result.DefaultSelection<Prisma.$ModalContentLanguagePayload>
/**
 * Model Config
 * 
 */
export type Config = $Result.DefaultSelection<Prisma.$ConfigPayload>
/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Guild
 * 
 */
export type Guild = $Result.DefaultSelection<Prisma.$GuildPayload>
/**
 * Model GuildData
 * 
 */
export type GuildData = $Result.DefaultSelection<Prisma.$GuildDataPayload>
/**
 * Model Channel
 * 
 */
export type Channel = $Result.DefaultSelection<Prisma.$ChannelPayload>
/**
 * Model ChannelData
 * 
 */
export type ChannelData = $Result.DefaultSelection<Prisma.$ChannelDataPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserData
 * 
 */
export type UserData = $Result.DefaultSelection<Prisma.$UserDataPayload>
/**
 * Model UserChannelData
 * 
 */
export type UserChannelData = $Result.DefaultSelection<Prisma.$UserChannelDataPayload>
/**
 * Model ElementButtonLanguage
 * 
 */
export type ElementButtonLanguage = $Result.DefaultSelection<Prisma.$ElementButtonLanguagePayload>
/**
 * Model ElementTextInputLanguage
 * 
 */
export type ElementTextInputLanguage = $Result.DefaultSelection<Prisma.$ElementTextInputLanguagePayload>
/**
 * Model ElementSelectMenuLanguage
 * 
 */
export type ElementSelectMenuLanguage = $Result.DefaultSelection<Prisma.$ElementSelectMenuLanguagePayload>
/**
 * Model EmbedLanguage
 * 
 */
export type EmbedLanguage = $Result.DefaultSelection<Prisma.$EmbedLanguagePayload>
/**
 * Model MarkdownLanguage
 * 
 */
export type MarkdownLanguage = $Result.DefaultSelection<Prisma.$MarkdownLanguagePayload>
/**
 * Model ModalLanguage
 * 
 */
export type ModalLanguage = $Result.DefaultSelection<Prisma.$ModalLanguagePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const E_DATA_TYPES: {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array'
};

export type E_DATA_TYPES = (typeof E_DATA_TYPES)[keyof typeof E_DATA_TYPES]


export const E_INTERNAL_CHANNEL_TYPES: {
  DEFAULT_CHANNEL: 'DEFAULT_CHANNEL',
  DYNAMIC_CHANNEL: 'DYNAMIC_CHANNEL',
  MASTER_CREATE_CHANNEL: 'MASTER_CREATE_CHANNEL'
};

export type E_INTERNAL_CHANNEL_TYPES = (typeof E_INTERNAL_CHANNEL_TYPES)[keyof typeof E_INTERNAL_CHANNEL_TYPES]

}

export type E_DATA_TYPES = $Enums.E_DATA_TYPES

export const E_DATA_TYPES: typeof $Enums.E_DATA_TYPES

export type E_INTERNAL_CHANNEL_TYPES = $Enums.E_INTERNAL_CHANNEL_TYPES

export const E_INTERNAL_CHANNEL_TYPES: typeof $Enums.E_INTERNAL_CHANNEL_TYPES

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Configs
 * const configs = await prisma.config.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Configs
   * const configs = await prisma.config.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.config`: Exposes CRUD operations for the **Config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Configs
    * const configs = await prisma.config.findMany()
    * ```
    */
  get config(): Prisma.ConfigDelegate<ExtArgs>;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs>;

  /**
   * `prisma.guild`: Exposes CRUD operations for the **Guild** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Guilds
    * const guilds = await prisma.guild.findMany()
    * ```
    */
  get guild(): Prisma.GuildDelegate<ExtArgs>;

  /**
   * `prisma.guildData`: Exposes CRUD operations for the **GuildData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GuildData
    * const guildData = await prisma.guildData.findMany()
    * ```
    */
  get guildData(): Prisma.GuildDataDelegate<ExtArgs>;

  /**
   * `prisma.channel`: Exposes CRUD operations for the **Channel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Channels
    * const channels = await prisma.channel.findMany()
    * ```
    */
  get channel(): Prisma.ChannelDelegate<ExtArgs>;

  /**
   * `prisma.channelData`: Exposes CRUD operations for the **ChannelData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChannelData
    * const channelData = await prisma.channelData.findMany()
    * ```
    */
  get channelData(): Prisma.ChannelDataDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.userData`: Exposes CRUD operations for the **UserData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserData
    * const userData = await prisma.userData.findMany()
    * ```
    */
  get userData(): Prisma.UserDataDelegate<ExtArgs>;

  /**
   * `prisma.userChannelData`: Exposes CRUD operations for the **UserChannelData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserChannelData
    * const userChannelData = await prisma.userChannelData.findMany()
    * ```
    */
  get userChannelData(): Prisma.UserChannelDataDelegate<ExtArgs>;

  /**
   * `prisma.elementButtonLanguage`: Exposes CRUD operations for the **ElementButtonLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ElementButtonLanguages
    * const elementButtonLanguages = await prisma.elementButtonLanguage.findMany()
    * ```
    */
  get elementButtonLanguage(): Prisma.ElementButtonLanguageDelegate<ExtArgs>;

  /**
   * `prisma.elementTextInputLanguage`: Exposes CRUD operations for the **ElementTextInputLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ElementTextInputLanguages
    * const elementTextInputLanguages = await prisma.elementTextInputLanguage.findMany()
    * ```
    */
  get elementTextInputLanguage(): Prisma.ElementTextInputLanguageDelegate<ExtArgs>;

  /**
   * `prisma.elementSelectMenuLanguage`: Exposes CRUD operations for the **ElementSelectMenuLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ElementSelectMenuLanguages
    * const elementSelectMenuLanguages = await prisma.elementSelectMenuLanguage.findMany()
    * ```
    */
  get elementSelectMenuLanguage(): Prisma.ElementSelectMenuLanguageDelegate<ExtArgs>;

  /**
   * `prisma.embedLanguage`: Exposes CRUD operations for the **EmbedLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmbedLanguages
    * const embedLanguages = await prisma.embedLanguage.findMany()
    * ```
    */
  get embedLanguage(): Prisma.EmbedLanguageDelegate<ExtArgs>;

  /**
   * `prisma.markdownLanguage`: Exposes CRUD operations for the **MarkdownLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarkdownLanguages
    * const markdownLanguages = await prisma.markdownLanguage.findMany()
    * ```
    */
  get markdownLanguage(): Prisma.MarkdownLanguageDelegate<ExtArgs>;

  /**
   * `prisma.modalLanguage`: Exposes CRUD operations for the **ModalLanguage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ModalLanguages
    * const modalLanguages = await prisma.modalLanguage.findMany()
    * ```
    */
  get modalLanguage(): Prisma.ModalLanguageDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.17.0
   * Query Engine version: 393aa359c9ad4a4bb28630fb5613f9c281cde053
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Config: 'Config',
    Category: 'Category',
    Guild: 'Guild',
    GuildData: 'GuildData',
    Channel: 'Channel',
    ChannelData: 'ChannelData',
    User: 'User',
    UserData: 'UserData',
    UserChannelData: 'UserChannelData',
    ElementButtonLanguage: 'ElementButtonLanguage',
    ElementTextInputLanguage: 'ElementTextInputLanguage',
    ElementSelectMenuLanguage: 'ElementSelectMenuLanguage',
    EmbedLanguage: 'EmbedLanguage',
    MarkdownLanguage: 'MarkdownLanguage',
    ModalLanguage: 'ModalLanguage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "config" | "category" | "guild" | "guildData" | "channel" | "channelData" | "user" | "userData" | "userChannelData" | "elementButtonLanguage" | "elementTextInputLanguage" | "elementSelectMenuLanguage" | "embedLanguage" | "markdownLanguage" | "modalLanguage"
      txIsolationLevel: never
    }
    model: {
      Config: {
        payload: Prisma.$ConfigPayload<ExtArgs>
        fields: Prisma.ConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findFirst: {
            args: Prisma.ConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findMany: {
            args: Prisma.ConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          create: {
            args: Prisma.ConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          createMany: {
            args: Prisma.ConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          update: {
            args: Prisma.ConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          deleteMany: {
            args: Prisma.ConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          aggregate: {
            args: Prisma.ConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConfig>
          }
          groupBy: {
            args: Prisma.ConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConfigGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ConfigFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ConfigAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ConfigCountAggregateOutputType> | number
          }
        }
      }
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.CategoryFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.CategoryAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Guild: {
        payload: Prisma.$GuildPayload<ExtArgs>
        fields: Prisma.GuildFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuildFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuildFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          findFirst: {
            args: Prisma.GuildFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuildFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          findMany: {
            args: Prisma.GuildFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>[]
          }
          create: {
            args: Prisma.GuildCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          createMany: {
            args: Prisma.GuildCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GuildDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          update: {
            args: Prisma.GuildUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          deleteMany: {
            args: Prisma.GuildDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuildUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GuildUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildPayload>
          }
          aggregate: {
            args: Prisma.GuildAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuild>
          }
          groupBy: {
            args: Prisma.GuildGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuildGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GuildFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GuildAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GuildCountArgs<ExtArgs>
            result: $Utils.Optional<GuildCountAggregateOutputType> | number
          }
        }
      }
      GuildData: {
        payload: Prisma.$GuildDataPayload<ExtArgs>
        fields: Prisma.GuildDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuildDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuildDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          findFirst: {
            args: Prisma.GuildDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuildDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          findMany: {
            args: Prisma.GuildDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>[]
          }
          create: {
            args: Prisma.GuildDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          createMany: {
            args: Prisma.GuildDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GuildDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          update: {
            args: Prisma.GuildDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          deleteMany: {
            args: Prisma.GuildDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuildDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GuildDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuildDataPayload>
          }
          aggregate: {
            args: Prisma.GuildDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuildData>
          }
          groupBy: {
            args: Prisma.GuildDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuildDataGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GuildDataFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GuildDataAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GuildDataCountArgs<ExtArgs>
            result: $Utils.Optional<GuildDataCountAggregateOutputType> | number
          }
        }
      }
      Channel: {
        payload: Prisma.$ChannelPayload<ExtArgs>
        fields: Prisma.ChannelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChannelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChannelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          findFirst: {
            args: Prisma.ChannelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChannelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          findMany: {
            args: Prisma.ChannelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>[]
          }
          create: {
            args: Prisma.ChannelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          createMany: {
            args: Prisma.ChannelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChannelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          update: {
            args: Prisma.ChannelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          deleteMany: {
            args: Prisma.ChannelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChannelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChannelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          aggregate: {
            args: Prisma.ChannelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChannel>
          }
          groupBy: {
            args: Prisma.ChannelGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChannelGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ChannelFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ChannelAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ChannelCountArgs<ExtArgs>
            result: $Utils.Optional<ChannelCountAggregateOutputType> | number
          }
        }
      }
      ChannelData: {
        payload: Prisma.$ChannelDataPayload<ExtArgs>
        fields: Prisma.ChannelDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChannelDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChannelDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          findFirst: {
            args: Prisma.ChannelDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChannelDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          findMany: {
            args: Prisma.ChannelDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>[]
          }
          create: {
            args: Prisma.ChannelDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          createMany: {
            args: Prisma.ChannelDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChannelDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          update: {
            args: Prisma.ChannelDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          deleteMany: {
            args: Prisma.ChannelDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChannelDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChannelDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelDataPayload>
          }
          aggregate: {
            args: Prisma.ChannelDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChannelData>
          }
          groupBy: {
            args: Prisma.ChannelDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChannelDataGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ChannelDataFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ChannelDataAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ChannelDataCountArgs<ExtArgs>
            result: $Utils.Optional<ChannelDataCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserData: {
        payload: Prisma.$UserDataPayload<ExtArgs>
        fields: Prisma.UserDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          findFirst: {
            args: Prisma.UserDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          findMany: {
            args: Prisma.UserDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>[]
          }
          create: {
            args: Prisma.UserDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          createMany: {
            args: Prisma.UserDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          update: {
            args: Prisma.UserDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          deleteMany: {
            args: Prisma.UserDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserDataPayload>
          }
          aggregate: {
            args: Prisma.UserDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserData>
          }
          groupBy: {
            args: Prisma.UserDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserDataGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserDataFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserDataAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserDataCountArgs<ExtArgs>
            result: $Utils.Optional<UserDataCountAggregateOutputType> | number
          }
        }
      }
      UserChannelData: {
        payload: Prisma.$UserChannelDataPayload<ExtArgs>
        fields: Prisma.UserChannelDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserChannelDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserChannelDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          findFirst: {
            args: Prisma.UserChannelDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserChannelDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          findMany: {
            args: Prisma.UserChannelDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>[]
          }
          create: {
            args: Prisma.UserChannelDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          createMany: {
            args: Prisma.UserChannelDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserChannelDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          update: {
            args: Prisma.UserChannelDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          deleteMany: {
            args: Prisma.UserChannelDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserChannelDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserChannelDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserChannelDataPayload>
          }
          aggregate: {
            args: Prisma.UserChannelDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserChannelData>
          }
          groupBy: {
            args: Prisma.UserChannelDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserChannelDataGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserChannelDataFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserChannelDataAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserChannelDataCountArgs<ExtArgs>
            result: $Utils.Optional<UserChannelDataCountAggregateOutputType> | number
          }
        }
      }
      ElementButtonLanguage: {
        payload: Prisma.$ElementButtonLanguagePayload<ExtArgs>
        fields: Prisma.ElementButtonLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ElementButtonLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ElementButtonLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          findFirst: {
            args: Prisma.ElementButtonLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ElementButtonLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          findMany: {
            args: Prisma.ElementButtonLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>[]
          }
          create: {
            args: Prisma.ElementButtonLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          createMany: {
            args: Prisma.ElementButtonLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ElementButtonLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          update: {
            args: Prisma.ElementButtonLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          deleteMany: {
            args: Prisma.ElementButtonLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ElementButtonLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ElementButtonLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementButtonLanguagePayload>
          }
          aggregate: {
            args: Prisma.ElementButtonLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateElementButtonLanguage>
          }
          groupBy: {
            args: Prisma.ElementButtonLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ElementButtonLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ElementButtonLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ElementButtonLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ElementButtonLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<ElementButtonLanguageCountAggregateOutputType> | number
          }
        }
      }
      ElementTextInputLanguage: {
        payload: Prisma.$ElementTextInputLanguagePayload<ExtArgs>
        fields: Prisma.ElementTextInputLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ElementTextInputLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ElementTextInputLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          findFirst: {
            args: Prisma.ElementTextInputLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ElementTextInputLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          findMany: {
            args: Prisma.ElementTextInputLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>[]
          }
          create: {
            args: Prisma.ElementTextInputLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          createMany: {
            args: Prisma.ElementTextInputLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ElementTextInputLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          update: {
            args: Prisma.ElementTextInputLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          deleteMany: {
            args: Prisma.ElementTextInputLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ElementTextInputLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ElementTextInputLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementTextInputLanguagePayload>
          }
          aggregate: {
            args: Prisma.ElementTextInputLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateElementTextInputLanguage>
          }
          groupBy: {
            args: Prisma.ElementTextInputLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ElementTextInputLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ElementTextInputLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ElementTextInputLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ElementTextInputLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<ElementTextInputLanguageCountAggregateOutputType> | number
          }
        }
      }
      ElementSelectMenuLanguage: {
        payload: Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>
        fields: Prisma.ElementSelectMenuLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ElementSelectMenuLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ElementSelectMenuLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          findFirst: {
            args: Prisma.ElementSelectMenuLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ElementSelectMenuLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          findMany: {
            args: Prisma.ElementSelectMenuLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>[]
          }
          create: {
            args: Prisma.ElementSelectMenuLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          createMany: {
            args: Prisma.ElementSelectMenuLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ElementSelectMenuLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          update: {
            args: Prisma.ElementSelectMenuLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          deleteMany: {
            args: Prisma.ElementSelectMenuLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ElementSelectMenuLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ElementSelectMenuLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ElementSelectMenuLanguagePayload>
          }
          aggregate: {
            args: Prisma.ElementSelectMenuLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateElementSelectMenuLanguage>
          }
          groupBy: {
            args: Prisma.ElementSelectMenuLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ElementSelectMenuLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ElementSelectMenuLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ElementSelectMenuLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ElementSelectMenuLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<ElementSelectMenuLanguageCountAggregateOutputType> | number
          }
        }
      }
      EmbedLanguage: {
        payload: Prisma.$EmbedLanguagePayload<ExtArgs>
        fields: Prisma.EmbedLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmbedLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmbedLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          findFirst: {
            args: Prisma.EmbedLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmbedLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          findMany: {
            args: Prisma.EmbedLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>[]
          }
          create: {
            args: Prisma.EmbedLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          createMany: {
            args: Prisma.EmbedLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.EmbedLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          update: {
            args: Prisma.EmbedLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          deleteMany: {
            args: Prisma.EmbedLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmbedLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmbedLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbedLanguagePayload>
          }
          aggregate: {
            args: Prisma.EmbedLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmbedLanguage>
          }
          groupBy: {
            args: Prisma.EmbedLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmbedLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.EmbedLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.EmbedLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.EmbedLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<EmbedLanguageCountAggregateOutputType> | number
          }
        }
      }
      MarkdownLanguage: {
        payload: Prisma.$MarkdownLanguagePayload<ExtArgs>
        fields: Prisma.MarkdownLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarkdownLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarkdownLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          findFirst: {
            args: Prisma.MarkdownLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarkdownLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          findMany: {
            args: Prisma.MarkdownLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>[]
          }
          create: {
            args: Prisma.MarkdownLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          createMany: {
            args: Prisma.MarkdownLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MarkdownLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          update: {
            args: Prisma.MarkdownLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          deleteMany: {
            args: Prisma.MarkdownLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarkdownLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MarkdownLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarkdownLanguagePayload>
          }
          aggregate: {
            args: Prisma.MarkdownLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarkdownLanguage>
          }
          groupBy: {
            args: Prisma.MarkdownLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarkdownLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.MarkdownLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.MarkdownLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.MarkdownLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<MarkdownLanguageCountAggregateOutputType> | number
          }
        }
      }
      ModalLanguage: {
        payload: Prisma.$ModalLanguagePayload<ExtArgs>
        fields: Prisma.ModalLanguageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModalLanguageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModalLanguageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          findFirst: {
            args: Prisma.ModalLanguageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModalLanguageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          findMany: {
            args: Prisma.ModalLanguageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>[]
          }
          create: {
            args: Prisma.ModalLanguageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          createMany: {
            args: Prisma.ModalLanguageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ModalLanguageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          update: {
            args: Prisma.ModalLanguageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          deleteMany: {
            args: Prisma.ModalLanguageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModalLanguageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ModalLanguageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModalLanguagePayload>
          }
          aggregate: {
            args: Prisma.ModalLanguageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModalLanguage>
          }
          groupBy: {
            args: Prisma.ModalLanguageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModalLanguageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ModalLanguageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ModalLanguageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ModalLanguageCountArgs<ExtArgs>
            result: $Utils.Optional<ModalLanguageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GuildCountOutputType
   */

  export type GuildCountOutputType = {
    data: number
  }

  export type GuildCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | GuildCountOutputTypeCountDataArgs
  }

  // Custom InputTypes
  /**
   * GuildCountOutputType without action
   */
  export type GuildCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildCountOutputType
     */
    select?: GuildCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GuildCountOutputType without action
   */
  export type GuildCountOutputTypeCountDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuildDataWhereInput
  }


  /**
   * Count Type ChannelCountOutputType
   */

  export type ChannelCountOutputType = {
    data: number
  }

  export type ChannelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | ChannelCountOutputTypeCountDataArgs
  }

  // Custom InputTypes
  /**
   * ChannelCountOutputType without action
   */
  export type ChannelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelCountOutputType
     */
    select?: ChannelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChannelCountOutputType without action
   */
  export type ChannelCountOutputTypeCountDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChannelDataWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    data: number
    channelData: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | UserCountOutputTypeCountDataArgs
    channelData?: boolean | UserCountOutputTypeCountChannelDataArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserDataWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountChannelDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserChannelDataWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Language
   */





  export type LanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    name?: boolean
    code?: boolean
  }, ExtArgs["result"]["language"]>


  export type LanguageSelectScalar = {
    name?: boolean
    code?: boolean
  }


  export type $LanguagePayload = {
    name: "Language"
    objects: {}
    scalars: {
      name: string
      code: string
    }
    composites: {}
  }

  type LanguageGetPayload<S extends boolean | null | undefined | LanguageDefaultArgs> = $Result.GetResult<Prisma.$LanguagePayload, S>





  /**
   * Fields of the Language model
   */ 
  interface LanguageFieldRefs {
    readonly name: FieldRef<"Language", 'String'>
    readonly code: FieldRef<"Language", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Language without action
   */
  export type LanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Language
     */
    select?: LanguageSelect<ExtArgs> | null
  }


  /**
   * Model ElementButtonContent
   */





  export type ElementButtonContentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    label?: boolean
    options?: boolean
  }, ExtArgs["result"]["elementButtonContent"]>


  export type ElementButtonContentSelectScalar = {
    label?: boolean
    options?: boolean
  }


  export type $ElementButtonContentPayload = {
    name: "ElementButtonContent"
    objects: {}
    scalars: {
      label: string
      options: Prisma.JsonValue | null
    }
    composites: {}
  }

  type ElementButtonContentGetPayload<S extends boolean | null | undefined | ElementButtonContentDefaultArgs> = $Result.GetResult<Prisma.$ElementButtonContentPayload, S>





  /**
   * Fields of the ElementButtonContent model
   */ 
  interface ElementButtonContentFieldRefs {
    readonly label: FieldRef<"ElementButtonContent", 'String'>
    readonly options: FieldRef<"ElementButtonContent", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * ElementButtonContent without action
   */
  export type ElementButtonContentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonContent
     */
    select?: ElementButtonContentSelect<ExtArgs> | null
  }


  /**
   * Model ElementTextInputContentLanguage
   */





  export type ElementTextInputContentLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    label?: boolean
    placeholder?: boolean
  }, ExtArgs["result"]["elementTextInputContentLanguage"]>


  export type ElementTextInputContentLanguageSelectScalar = {
    label?: boolean
    placeholder?: boolean
  }


  export type $ElementTextInputContentLanguagePayload = {
    name: "ElementTextInputContentLanguage"
    objects: {}
    scalars: {
      label: string
      placeholder: string | null
    }
    composites: {}
  }

  type ElementTextInputContentLanguageGetPayload<S extends boolean | null | undefined | ElementTextInputContentLanguageDefaultArgs> = $Result.GetResult<Prisma.$ElementTextInputContentLanguagePayload, S>





  /**
   * Fields of the ElementTextInputContentLanguage model
   */ 
  interface ElementTextInputContentLanguageFieldRefs {
    readonly label: FieldRef<"ElementTextInputContentLanguage", 'String'>
    readonly placeholder: FieldRef<"ElementTextInputContentLanguage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ElementTextInputContentLanguage without action
   */
  export type ElementTextInputContentLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputContentLanguage
     */
    select?: ElementTextInputContentLanguageSelect<ExtArgs> | null
  }


  /**
   * Model ElementSelectMenuOptionsLanguage
   */





  export type ElementSelectMenuOptionsLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    label?: boolean
  }, ExtArgs["result"]["elementSelectMenuOptionsLanguage"]>


  export type ElementSelectMenuOptionsLanguageSelectScalar = {
    label?: boolean
  }


  export type $ElementSelectMenuOptionsLanguagePayload = {
    name: "ElementSelectMenuOptionsLanguage"
    objects: {}
    scalars: {
      label: string
    }
    composites: {}
  }

  type ElementSelectMenuOptionsLanguageGetPayload<S extends boolean | null | undefined | ElementSelectMenuOptionsLanguageDefaultArgs> = $Result.GetResult<Prisma.$ElementSelectMenuOptionsLanguagePayload, S>





  /**
   * Fields of the ElementSelectMenuOptionsLanguage model
   */ 
  interface ElementSelectMenuOptionsLanguageFieldRefs {
    readonly label: FieldRef<"ElementSelectMenuOptionsLanguage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ElementSelectMenuOptionsLanguage without action
   */
  export type ElementSelectMenuOptionsLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuOptionsLanguage
     */
    select?: ElementSelectMenuOptionsLanguageSelect<ExtArgs> | null
  }


  /**
   * Model ElementSelectMenuLanguageContent
   */





  export type ElementSelectMenuLanguageContentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    placeholder?: boolean
    selectOptions?: boolean | ElementSelectMenuOptionsLanguageDefaultArgs<ExtArgs>
    options?: boolean
  }, ExtArgs["result"]["elementSelectMenuLanguageContent"]>


  export type ElementSelectMenuLanguageContentSelectScalar = {
    placeholder?: boolean
    options?: boolean
  }

  export type ElementSelectMenuLanguageContentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ElementSelectMenuLanguageContentPayload = {
    name: "ElementSelectMenuLanguageContent"
    objects: {}
    scalars: {
      placeholder: string | null
      options: Prisma.JsonValue | null
    }
    composites: {
      selectOptions: Prisma.$ElementSelectMenuOptionsLanguagePayload[]
    }
  }

  type ElementSelectMenuLanguageContentGetPayload<S extends boolean | null | undefined | ElementSelectMenuLanguageContentDefaultArgs> = $Result.GetResult<Prisma.$ElementSelectMenuLanguageContentPayload, S>





  /**
   * Fields of the ElementSelectMenuLanguageContent model
   */ 
  interface ElementSelectMenuLanguageContentFieldRefs {
    readonly placeholder: FieldRef<"ElementSelectMenuLanguageContent", 'String'>
    readonly options: FieldRef<"ElementSelectMenuLanguageContent", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * ElementSelectMenuLanguageContent without action
   */
  export type ElementSelectMenuLanguageContentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguageContent
     */
    select?: ElementSelectMenuLanguageContentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageContentInclude<ExtArgs> | null
  }


  /**
   * Model EmbedContentLanguage
   */





  export type EmbedContentLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    title?: boolean
    description?: boolean
    footer?: boolean
    options?: boolean
    arrayOptions?: boolean
  }, ExtArgs["result"]["embedContentLanguage"]>


  export type EmbedContentLanguageSelectScalar = {
    title?: boolean
    description?: boolean
    footer?: boolean
    options?: boolean
    arrayOptions?: boolean
  }


  export type $EmbedContentLanguagePayload = {
    name: "EmbedContentLanguage"
    objects: {}
    scalars: {
      title: string | null
      description: string | null
      footer: string | null
      options: Prisma.JsonValue | null
      arrayOptions: Prisma.JsonValue | null
    }
    composites: {}
  }

  type EmbedContentLanguageGetPayload<S extends boolean | null | undefined | EmbedContentLanguageDefaultArgs> = $Result.GetResult<Prisma.$EmbedContentLanguagePayload, S>





  /**
   * Fields of the EmbedContentLanguage model
   */ 
  interface EmbedContentLanguageFieldRefs {
    readonly title: FieldRef<"EmbedContentLanguage", 'String'>
    readonly description: FieldRef<"EmbedContentLanguage", 'String'>
    readonly footer: FieldRef<"EmbedContentLanguage", 'String'>
    readonly options: FieldRef<"EmbedContentLanguage", 'Json'>
    readonly arrayOptions: FieldRef<"EmbedContentLanguage", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * EmbedContentLanguage without action
   */
  export type EmbedContentLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedContentLanguage
     */
    select?: EmbedContentLanguageSelect<ExtArgs> | null
  }


  /**
   * Model MarkdownContentLanguage
   */





  export type MarkdownContentLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    content?: boolean
    options?: boolean
  }, ExtArgs["result"]["markdownContentLanguage"]>


  export type MarkdownContentLanguageSelectScalar = {
    content?: boolean
    options?: boolean
  }


  export type $MarkdownContentLanguagePayload = {
    name: "MarkdownContentLanguage"
    objects: {}
    scalars: {
      content: string
      options: Prisma.JsonValue | null
    }
    composites: {}
  }

  type MarkdownContentLanguageGetPayload<S extends boolean | null | undefined | MarkdownContentLanguageDefaultArgs> = $Result.GetResult<Prisma.$MarkdownContentLanguagePayload, S>





  /**
   * Fields of the MarkdownContentLanguage model
   */ 
  interface MarkdownContentLanguageFieldRefs {
    readonly content: FieldRef<"MarkdownContentLanguage", 'String'>
    readonly options: FieldRef<"MarkdownContentLanguage", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * MarkdownContentLanguage without action
   */
  export type MarkdownContentLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownContentLanguage
     */
    select?: MarkdownContentLanguageSelect<ExtArgs> | null
  }


  /**
   * Model ModalContentLanguage
   */





  export type ModalContentLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    title?: boolean
  }, ExtArgs["result"]["modalContentLanguage"]>


  export type ModalContentLanguageSelectScalar = {
    title?: boolean
  }


  export type $ModalContentLanguagePayload = {
    name: "ModalContentLanguage"
    objects: {}
    scalars: {
      title: string
    }
    composites: {}
  }

  type ModalContentLanguageGetPayload<S extends boolean | null | undefined | ModalContentLanguageDefaultArgs> = $Result.GetResult<Prisma.$ModalContentLanguagePayload, S>





  /**
   * Fields of the ModalContentLanguage model
   */ 
  interface ModalContentLanguageFieldRefs {
    readonly title: FieldRef<"ModalContentLanguage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ModalContentLanguage without action
   */
  export type ModalContentLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalContentLanguage
     */
    select?: ModalContentLanguageSelect<ExtArgs> | null
  }


  /**
   * Model Config
   */

  export type AggregateConfig = {
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  export type ConfigMinAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigMaxAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigCountAggregateOutputType = {
    id: number
    key: number
    version: number
    type: number
    object: number
    value: number
    values: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConfigMinAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigMaxAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigCountAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    object?: true
    value?: true
    values?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Config to aggregate.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Configs
    **/
    _count?: true | ConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfigMaxAggregateInputType
  }

  export type GetConfigAggregateType<T extends ConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfig[P]>
      : GetScalarType<T[P], AggregateConfig[P]>
  }




  export type ConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConfigWhereInput
    orderBy?: ConfigOrderByWithAggregationInput | ConfigOrderByWithAggregationInput[]
    by: ConfigScalarFieldEnum[] | ConfigScalarFieldEnum
    having?: ConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfigCountAggregateInputType | true
    _min?: ConfigMinAggregateInputType
    _max?: ConfigMaxAggregateInputType
  }

  export type ConfigGroupByOutputType = {
    id: string
    key: string
    version: string
    type: $Enums.E_DATA_TYPES
    object: JsonValue | null
    value: string | null
    values: string[]
    createdAt: Date
    updatedAt: Date
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  type GetConfigGroupByPayload<T extends ConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ConfigGroupByOutputType[P]>
        }
      >
    >


  export type ConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>


  export type ConfigSelectScalar = {
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $ConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Config"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      version: string
      type: $Enums.E_DATA_TYPES
      object: Prisma.JsonValue | null
      value: string | null
      values: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["config"]>
    composites: {}
  }

  type ConfigGetPayload<S extends boolean | null | undefined | ConfigDefaultArgs> = $Result.GetResult<Prisma.$ConfigPayload, S>

  type ConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConfigCountAggregateInputType | true
    }

  export interface ConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Config'], meta: { name: 'Config' } }
    /**
     * Find zero or one Config that matches the filter.
     * @param {ConfigFindUniqueArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConfigFindUniqueArgs>(args: SelectSubset<T, ConfigFindUniqueArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Config that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConfigFindUniqueOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Config that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConfigFindFirstArgs>(args?: SelectSubset<T, ConfigFindFirstArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Config that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Configs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Configs
     * const configs = await prisma.config.findMany()
     * 
     * // Get first 10 Configs
     * const configs = await prisma.config.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const configWithIdOnly = await prisma.config.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConfigFindManyArgs>(args?: SelectSubset<T, ConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Config.
     * @param {ConfigCreateArgs} args - Arguments to create a Config.
     * @example
     * // Create one Config
     * const Config = await prisma.config.create({
     *   data: {
     *     // ... data to create a Config
     *   }
     * })
     * 
     */
    create<T extends ConfigCreateArgs>(args: SelectSubset<T, ConfigCreateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Configs.
     * @param {ConfigCreateManyArgs} args - Arguments to create many Configs.
     * @example
     * // Create many Configs
     * const config = await prisma.config.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConfigCreateManyArgs>(args?: SelectSubset<T, ConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Config.
     * @param {ConfigDeleteArgs} args - Arguments to delete one Config.
     * @example
     * // Delete one Config
     * const Config = await prisma.config.delete({
     *   where: {
     *     // ... filter to delete one Config
     *   }
     * })
     * 
     */
    delete<T extends ConfigDeleteArgs>(args: SelectSubset<T, ConfigDeleteArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Config.
     * @param {ConfigUpdateArgs} args - Arguments to update one Config.
     * @example
     * // Update one Config
     * const config = await prisma.config.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConfigUpdateArgs>(args: SelectSubset<T, ConfigUpdateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Configs.
     * @param {ConfigDeleteManyArgs} args - Arguments to filter Configs to delete.
     * @example
     * // Delete a few Configs
     * const { count } = await prisma.config.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConfigDeleteManyArgs>(args?: SelectSubset<T, ConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Configs
     * const config = await prisma.config.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConfigUpdateManyArgs>(args: SelectSubset<T, ConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Config.
     * @param {ConfigUpsertArgs} args - Arguments to update or create a Config.
     * @example
     * // Update or create a Config
     * const config = await prisma.config.upsert({
     *   create: {
     *     // ... data to create a Config
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Config we want to update
     *   }
     * })
     */
    upsert<T extends ConfigUpsertArgs>(args: SelectSubset<T, ConfigUpsertArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Configs that matches the filter.
     * @param {ConfigFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const config = await prisma.config.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ConfigFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Config.
     * @param {ConfigAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const config = await prisma.config.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ConfigAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigCountArgs} args - Arguments to filter Configs to count.
     * @example
     * // Count the number of Configs
     * const count = await prisma.config.count({
     *   where: {
     *     // ... the filter for the Configs we want to count
     *   }
     * })
    **/
    count<T extends ConfigCountArgs>(
      args?: Subset<T, ConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfigAggregateArgs>(args: Subset<T, ConfigAggregateArgs>): Prisma.PrismaPromise<GetConfigAggregateType<T>>

    /**
     * Group by Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfigGroupByArgs['orderBy'] }
        : { orderBy?: ConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Config model
   */
  readonly fields: ConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Config.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Config model
   */ 
  interface ConfigFieldRefs {
    readonly id: FieldRef<"Config", 'String'>
    readonly key: FieldRef<"Config", 'String'>
    readonly version: FieldRef<"Config", 'String'>
    readonly type: FieldRef<"Config", 'E_DATA_TYPES'>
    readonly object: FieldRef<"Config", 'Json'>
    readonly value: FieldRef<"Config", 'String'>
    readonly values: FieldRef<"Config", 'String[]'>
    readonly createdAt: FieldRef<"Config", 'DateTime'>
    readonly updatedAt: FieldRef<"Config", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Config findUnique
   */
  export type ConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findUniqueOrThrow
   */
  export type ConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findFirst
   */
  export type ConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findFirstOrThrow
   */
  export type ConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findMany
   */
  export type ConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter, which Configs to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config create
   */
  export type ConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a Config.
     */
    data: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
  }

  /**
   * Config createMany
   */
  export type ConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Configs.
     */
    data: ConfigCreateManyInput | ConfigCreateManyInput[]
  }

  /**
   * Config update
   */
  export type ConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a Config.
     */
    data: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
    /**
     * Choose, which Config to update.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config updateMany
   */
  export type ConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Configs.
     */
    data: XOR<ConfigUpdateManyMutationInput, ConfigUncheckedUpdateManyInput>
    /**
     * Filter which Configs to update
     */
    where?: ConfigWhereInput
  }

  /**
   * Config upsert
   */
  export type ConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the Config to update in case it exists.
     */
    where: ConfigWhereUniqueInput
    /**
     * In case the Config found by the `where` argument doesn't exist, create a new Config with this data.
     */
    create: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
    /**
     * In case the Config was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
  }

  /**
   * Config delete
   */
  export type ConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Filter which Config to delete.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config deleteMany
   */
  export type ConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Configs to delete
     */
    where?: ConfigWhereInput
  }

  /**
   * Config findRaw
   */
  export type ConfigFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Config aggregateRaw
   */
  export type ConfigAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Config without action
   */
  export type ConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
  }


  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    createdAtDiscord: number | null
  }

  export type CategorySumAggregateOutputType = {
    createdAtDiscord: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    categoryId: string | null
    guildId: string | null
    createdAtDiscord: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    categoryId: string | null
    guildId: string | null
    createdAtDiscord: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    categoryId: number
    guildId: number
    createdAtDiscord: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    createdAtDiscord?: true
  }

  export type CategorySumAggregateInputType = {
    createdAtDiscord?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    categoryId?: true
    guildId?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    categoryId?: true
    guildId?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    categoryId?: true
    guildId?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: string
    name: string
    categoryId: string
    guildId: string
    createdAtDiscord: number
    createdAt: Date
    updatedAt: Date
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    categoryId?: boolean
    guildId?: boolean
    createdAtDiscord?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["category"]>


  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    categoryId?: boolean
    guildId?: boolean
    createdAtDiscord?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      categoryId: string
      guildId: string
      createdAtDiscord: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Categories that matches the filter.
     * @param {CategoryFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const category = await prisma.category.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: CategoryFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Category.
     * @param {CategoryAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const category = await prisma.category.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: CategoryAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */ 
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'String'>
    readonly name: FieldRef<"Category", 'String'>
    readonly categoryId: FieldRef<"Category", 'String'>
    readonly guildId: FieldRef<"Category", 'String'>
    readonly createdAtDiscord: FieldRef<"Category", 'Int'>
    readonly createdAt: FieldRef<"Category", 'DateTime'>
    readonly updatedAt: FieldRef<"Category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
  }

  /**
   * Category findRaw
   */
  export type CategoryFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Category aggregateRaw
   */
  export type CategoryAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
  }


  /**
   * Model Guild
   */

  export type AggregateGuild = {
    _count: GuildCountAggregateOutputType | null
    _min: GuildMinAggregateOutputType | null
    _max: GuildMaxAggregateOutputType | null
  }

  export type GuildMinAggregateOutputType = {
    id: string | null
    guildId: string | null
    name: string | null
    isInGuild: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    updatedAtInternal: Date | null
  }

  export type GuildMaxAggregateOutputType = {
    id: string | null
    guildId: string | null
    name: string | null
    isInGuild: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    updatedAtInternal: Date | null
  }

  export type GuildCountAggregateOutputType = {
    id: number
    guildId: number
    name: number
    isInGuild: number
    createdAt: number
    updatedAt: number
    updatedAtInternal: number
    _all: number
  }


  export type GuildMinAggregateInputType = {
    id?: true
    guildId?: true
    name?: true
    isInGuild?: true
    createdAt?: true
    updatedAt?: true
    updatedAtInternal?: true
  }

  export type GuildMaxAggregateInputType = {
    id?: true
    guildId?: true
    name?: true
    isInGuild?: true
    createdAt?: true
    updatedAt?: true
    updatedAtInternal?: true
  }

  export type GuildCountAggregateInputType = {
    id?: true
    guildId?: true
    name?: true
    isInGuild?: true
    createdAt?: true
    updatedAt?: true
    updatedAtInternal?: true
    _all?: true
  }

  export type GuildAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guild to aggregate.
     */
    where?: GuildWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guilds to fetch.
     */
    orderBy?: GuildOrderByWithRelationInput | GuildOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuildWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guilds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Guilds
    **/
    _count?: true | GuildCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuildMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuildMaxAggregateInputType
  }

  export type GetGuildAggregateType<T extends GuildAggregateArgs> = {
        [P in keyof T & keyof AggregateGuild]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuild[P]>
      : GetScalarType<T[P], AggregateGuild[P]>
  }




  export type GuildGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuildWhereInput
    orderBy?: GuildOrderByWithAggregationInput | GuildOrderByWithAggregationInput[]
    by: GuildScalarFieldEnum[] | GuildScalarFieldEnum
    having?: GuildScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuildCountAggregateInputType | true
    _min?: GuildMinAggregateInputType
    _max?: GuildMaxAggregateInputType
  }

  export type GuildGroupByOutputType = {
    id: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt: Date
    updatedAt: Date
    updatedAtInternal: Date | null
    _count: GuildCountAggregateOutputType | null
    _min: GuildMinAggregateOutputType | null
    _max: GuildMaxAggregateOutputType | null
  }

  type GetGuildGroupByPayload<T extends GuildGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuildGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuildGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuildGroupByOutputType[P]>
            : GetScalarType<T[P], GuildGroupByOutputType[P]>
        }
      >
    >


  export type GuildSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    guildId?: boolean
    name?: boolean
    isInGuild?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedAtInternal?: boolean
    data?: boolean | Guild$dataArgs<ExtArgs>
    _count?: boolean | GuildCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guild"]>


  export type GuildSelectScalar = {
    id?: boolean
    guildId?: boolean
    name?: boolean
    isInGuild?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    updatedAtInternal?: boolean
  }

  export type GuildInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | Guild$dataArgs<ExtArgs>
    _count?: boolean | GuildCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GuildPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Guild"
    objects: {
      data: Prisma.$GuildDataPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      guildId: string
      name: string
      isInGuild: boolean
      createdAt: Date
      updatedAt: Date
      updatedAtInternal: Date | null
    }, ExtArgs["result"]["guild"]>
    composites: {}
  }

  type GuildGetPayload<S extends boolean | null | undefined | GuildDefaultArgs> = $Result.GetResult<Prisma.$GuildPayload, S>

  type GuildCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GuildFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GuildCountAggregateInputType | true
    }

  export interface GuildDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Guild'], meta: { name: 'Guild' } }
    /**
     * Find zero or one Guild that matches the filter.
     * @param {GuildFindUniqueArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuildFindUniqueArgs>(args: SelectSubset<T, GuildFindUniqueArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Guild that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GuildFindUniqueOrThrowArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuildFindUniqueOrThrowArgs>(args: SelectSubset<T, GuildFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Guild that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindFirstArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuildFindFirstArgs>(args?: SelectSubset<T, GuildFindFirstArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Guild that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindFirstOrThrowArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuildFindFirstOrThrowArgs>(args?: SelectSubset<T, GuildFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Guilds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guilds
     * const guilds = await prisma.guild.findMany()
     * 
     * // Get first 10 Guilds
     * const guilds = await prisma.guild.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guildWithIdOnly = await prisma.guild.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GuildFindManyArgs>(args?: SelectSubset<T, GuildFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Guild.
     * @param {GuildCreateArgs} args - Arguments to create a Guild.
     * @example
     * // Create one Guild
     * const Guild = await prisma.guild.create({
     *   data: {
     *     // ... data to create a Guild
     *   }
     * })
     * 
     */
    create<T extends GuildCreateArgs>(args: SelectSubset<T, GuildCreateArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Guilds.
     * @param {GuildCreateManyArgs} args - Arguments to create many Guilds.
     * @example
     * // Create many Guilds
     * const guild = await prisma.guild.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuildCreateManyArgs>(args?: SelectSubset<T, GuildCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Guild.
     * @param {GuildDeleteArgs} args - Arguments to delete one Guild.
     * @example
     * // Delete one Guild
     * const Guild = await prisma.guild.delete({
     *   where: {
     *     // ... filter to delete one Guild
     *   }
     * })
     * 
     */
    delete<T extends GuildDeleteArgs>(args: SelectSubset<T, GuildDeleteArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Guild.
     * @param {GuildUpdateArgs} args - Arguments to update one Guild.
     * @example
     * // Update one Guild
     * const guild = await prisma.guild.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuildUpdateArgs>(args: SelectSubset<T, GuildUpdateArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Guilds.
     * @param {GuildDeleteManyArgs} args - Arguments to filter Guilds to delete.
     * @example
     * // Delete a few Guilds
     * const { count } = await prisma.guild.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuildDeleteManyArgs>(args?: SelectSubset<T, GuildDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guilds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guilds
     * const guild = await prisma.guild.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuildUpdateManyArgs>(args: SelectSubset<T, GuildUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Guild.
     * @param {GuildUpsertArgs} args - Arguments to update or create a Guild.
     * @example
     * // Update or create a Guild
     * const guild = await prisma.guild.upsert({
     *   create: {
     *     // ... data to create a Guild
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guild we want to update
     *   }
     * })
     */
    upsert<T extends GuildUpsertArgs>(args: SelectSubset<T, GuildUpsertArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Guilds that matches the filter.
     * @param {GuildFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const guild = await prisma.guild.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: GuildFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Guild.
     * @param {GuildAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const guild = await prisma.guild.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GuildAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Guilds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildCountArgs} args - Arguments to filter Guilds to count.
     * @example
     * // Count the number of Guilds
     * const count = await prisma.guild.count({
     *   where: {
     *     // ... the filter for the Guilds we want to count
     *   }
     * })
    **/
    count<T extends GuildCountArgs>(
      args?: Subset<T, GuildCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuildCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Guild.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuildAggregateArgs>(args: Subset<T, GuildAggregateArgs>): Prisma.PrismaPromise<GetGuildAggregateType<T>>

    /**
     * Group by Guild.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuildGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuildGroupByArgs['orderBy'] }
        : { orderBy?: GuildGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuildGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuildGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Guild model
   */
  readonly fields: GuildFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Guild.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuildClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    data<T extends Guild$dataArgs<ExtArgs> = {}>(args?: Subset<T, Guild$dataArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Guild model
   */ 
  interface GuildFieldRefs {
    readonly id: FieldRef<"Guild", 'String'>
    readonly guildId: FieldRef<"Guild", 'String'>
    readonly name: FieldRef<"Guild", 'String'>
    readonly isInGuild: FieldRef<"Guild", 'Boolean'>
    readonly createdAt: FieldRef<"Guild", 'DateTime'>
    readonly updatedAt: FieldRef<"Guild", 'DateTime'>
    readonly updatedAtInternal: FieldRef<"Guild", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Guild findUnique
   */
  export type GuildFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter, which Guild to fetch.
     */
    where: GuildWhereUniqueInput
  }

  /**
   * Guild findUniqueOrThrow
   */
  export type GuildFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter, which Guild to fetch.
     */
    where: GuildWhereUniqueInput
  }

  /**
   * Guild findFirst
   */
  export type GuildFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter, which Guild to fetch.
     */
    where?: GuildWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guilds to fetch.
     */
    orderBy?: GuildOrderByWithRelationInput | GuildOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guilds.
     */
    cursor?: GuildWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guilds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guilds.
     */
    distinct?: GuildScalarFieldEnum | GuildScalarFieldEnum[]
  }

  /**
   * Guild findFirstOrThrow
   */
  export type GuildFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter, which Guild to fetch.
     */
    where?: GuildWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guilds to fetch.
     */
    orderBy?: GuildOrderByWithRelationInput | GuildOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guilds.
     */
    cursor?: GuildWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guilds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guilds.
     */
    distinct?: GuildScalarFieldEnum | GuildScalarFieldEnum[]
  }

  /**
   * Guild findMany
   */
  export type GuildFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter, which Guilds to fetch.
     */
    where?: GuildWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guilds to fetch.
     */
    orderBy?: GuildOrderByWithRelationInput | GuildOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Guilds.
     */
    cursor?: GuildWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guilds.
     */
    skip?: number
    distinct?: GuildScalarFieldEnum | GuildScalarFieldEnum[]
  }

  /**
   * Guild create
   */
  export type GuildCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * The data needed to create a Guild.
     */
    data: XOR<GuildCreateInput, GuildUncheckedCreateInput>
  }

  /**
   * Guild createMany
   */
  export type GuildCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Guilds.
     */
    data: GuildCreateManyInput | GuildCreateManyInput[]
  }

  /**
   * Guild update
   */
  export type GuildUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * The data needed to update a Guild.
     */
    data: XOR<GuildUpdateInput, GuildUncheckedUpdateInput>
    /**
     * Choose, which Guild to update.
     */
    where: GuildWhereUniqueInput
  }

  /**
   * Guild updateMany
   */
  export type GuildUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Guilds.
     */
    data: XOR<GuildUpdateManyMutationInput, GuildUncheckedUpdateManyInput>
    /**
     * Filter which Guilds to update
     */
    where?: GuildWhereInput
  }

  /**
   * Guild upsert
   */
  export type GuildUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * The filter to search for the Guild to update in case it exists.
     */
    where: GuildWhereUniqueInput
    /**
     * In case the Guild found by the `where` argument doesn't exist, create a new Guild with this data.
     */
    create: XOR<GuildCreateInput, GuildUncheckedCreateInput>
    /**
     * In case the Guild was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuildUpdateInput, GuildUncheckedUpdateInput>
  }

  /**
   * Guild delete
   */
  export type GuildDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
    /**
     * Filter which Guild to delete.
     */
    where: GuildWhereUniqueInput
  }

  /**
   * Guild deleteMany
   */
  export type GuildDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guilds to delete
     */
    where?: GuildWhereInput
  }

  /**
   * Guild findRaw
   */
  export type GuildFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Guild aggregateRaw
   */
  export type GuildAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Guild.data
   */
  export type Guild$dataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    where?: GuildDataWhereInput
    orderBy?: GuildDataOrderByWithRelationInput | GuildDataOrderByWithRelationInput[]
    cursor?: GuildDataWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GuildDataScalarFieldEnum | GuildDataScalarFieldEnum[]
  }

  /**
   * Guild without action
   */
  export type GuildDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: GuildSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildInclude<ExtArgs> | null
  }


  /**
   * Model GuildData
   */

  export type AggregateGuildData = {
    _count: GuildDataCountAggregateOutputType | null
    _min: GuildDataMinAggregateOutputType | null
    _max: GuildDataMaxAggregateOutputType | null
  }

  export type GuildDataMinAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GuildDataMaxAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GuildDataCountAggregateOutputType = {
    id: number
    key: number
    version: number
    type: number
    object: number
    value: number
    values: number
    ownerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GuildDataMinAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GuildDataMaxAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GuildDataCountAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    object?: true
    value?: true
    values?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GuildDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GuildData to aggregate.
     */
    where?: GuildDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuildData to fetch.
     */
    orderBy?: GuildDataOrderByWithRelationInput | GuildDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuildDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuildData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuildData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GuildData
    **/
    _count?: true | GuildDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuildDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuildDataMaxAggregateInputType
  }

  export type GetGuildDataAggregateType<T extends GuildDataAggregateArgs> = {
        [P in keyof T & keyof AggregateGuildData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuildData[P]>
      : GetScalarType<T[P], AggregateGuildData[P]>
  }




  export type GuildDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuildDataWhereInput
    orderBy?: GuildDataOrderByWithAggregationInput | GuildDataOrderByWithAggregationInput[]
    by: GuildDataScalarFieldEnum[] | GuildDataScalarFieldEnum
    having?: GuildDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuildDataCountAggregateInputType | true
    _min?: GuildDataMinAggregateInputType
    _max?: GuildDataMaxAggregateInputType
  }

  export type GuildDataGroupByOutputType = {
    id: string
    key: string
    version: string
    type: $Enums.E_DATA_TYPES
    object: JsonValue | null
    value: string | null
    values: string[]
    ownerId: string
    createdAt: Date
    updatedAt: Date
    _count: GuildDataCountAggregateOutputType | null
    _min: GuildDataMinAggregateOutputType | null
    _max: GuildDataMaxAggregateOutputType | null
  }

  type GetGuildDataGroupByPayload<T extends GuildDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuildDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuildDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuildDataGroupByOutputType[P]>
            : GetScalarType<T[P], GuildDataGroupByOutputType[P]>
        }
      >
    >


  export type GuildDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    guild?: boolean | GuildDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guildData"]>


  export type GuildDataSelectScalar = {
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GuildDataInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guild?: boolean | GuildDefaultArgs<ExtArgs>
  }

  export type $GuildDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GuildData"
    objects: {
      guild: Prisma.$GuildPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      version: string
      type: $Enums.E_DATA_TYPES
      object: Prisma.JsonValue | null
      value: string | null
      values: string[]
      ownerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["guildData"]>
    composites: {}
  }

  type GuildDataGetPayload<S extends boolean | null | undefined | GuildDataDefaultArgs> = $Result.GetResult<Prisma.$GuildDataPayload, S>

  type GuildDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GuildDataFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GuildDataCountAggregateInputType | true
    }

  export interface GuildDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GuildData'], meta: { name: 'GuildData' } }
    /**
     * Find zero or one GuildData that matches the filter.
     * @param {GuildDataFindUniqueArgs} args - Arguments to find a GuildData
     * @example
     * // Get one GuildData
     * const guildData = await prisma.guildData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuildDataFindUniqueArgs>(args: SelectSubset<T, GuildDataFindUniqueArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GuildData that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GuildDataFindUniqueOrThrowArgs} args - Arguments to find a GuildData
     * @example
     * // Get one GuildData
     * const guildData = await prisma.guildData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuildDataFindUniqueOrThrowArgs>(args: SelectSubset<T, GuildDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GuildData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataFindFirstArgs} args - Arguments to find a GuildData
     * @example
     * // Get one GuildData
     * const guildData = await prisma.guildData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuildDataFindFirstArgs>(args?: SelectSubset<T, GuildDataFindFirstArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GuildData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataFindFirstOrThrowArgs} args - Arguments to find a GuildData
     * @example
     * // Get one GuildData
     * const guildData = await prisma.guildData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuildDataFindFirstOrThrowArgs>(args?: SelectSubset<T, GuildDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GuildData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GuildData
     * const guildData = await prisma.guildData.findMany()
     * 
     * // Get first 10 GuildData
     * const guildData = await prisma.guildData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guildDataWithIdOnly = await prisma.guildData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GuildDataFindManyArgs>(args?: SelectSubset<T, GuildDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GuildData.
     * @param {GuildDataCreateArgs} args - Arguments to create a GuildData.
     * @example
     * // Create one GuildData
     * const GuildData = await prisma.guildData.create({
     *   data: {
     *     // ... data to create a GuildData
     *   }
     * })
     * 
     */
    create<T extends GuildDataCreateArgs>(args: SelectSubset<T, GuildDataCreateArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GuildData.
     * @param {GuildDataCreateManyArgs} args - Arguments to create many GuildData.
     * @example
     * // Create many GuildData
     * const guildData = await prisma.guildData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuildDataCreateManyArgs>(args?: SelectSubset<T, GuildDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GuildData.
     * @param {GuildDataDeleteArgs} args - Arguments to delete one GuildData.
     * @example
     * // Delete one GuildData
     * const GuildData = await prisma.guildData.delete({
     *   where: {
     *     // ... filter to delete one GuildData
     *   }
     * })
     * 
     */
    delete<T extends GuildDataDeleteArgs>(args: SelectSubset<T, GuildDataDeleteArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GuildData.
     * @param {GuildDataUpdateArgs} args - Arguments to update one GuildData.
     * @example
     * // Update one GuildData
     * const guildData = await prisma.guildData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuildDataUpdateArgs>(args: SelectSubset<T, GuildDataUpdateArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GuildData.
     * @param {GuildDataDeleteManyArgs} args - Arguments to filter GuildData to delete.
     * @example
     * // Delete a few GuildData
     * const { count } = await prisma.guildData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuildDataDeleteManyArgs>(args?: SelectSubset<T, GuildDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GuildData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GuildData
     * const guildData = await prisma.guildData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuildDataUpdateManyArgs>(args: SelectSubset<T, GuildDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GuildData.
     * @param {GuildDataUpsertArgs} args - Arguments to update or create a GuildData.
     * @example
     * // Update or create a GuildData
     * const guildData = await prisma.guildData.upsert({
     *   create: {
     *     // ... data to create a GuildData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GuildData we want to update
     *   }
     * })
     */
    upsert<T extends GuildDataUpsertArgs>(args: SelectSubset<T, GuildDataUpsertArgs<ExtArgs>>): Prisma__GuildDataClient<$Result.GetResult<Prisma.$GuildDataPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more GuildData that matches the filter.
     * @param {GuildDataFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const guildData = await prisma.guildData.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: GuildDataFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a GuildData.
     * @param {GuildDataAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const guildData = await prisma.guildData.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GuildDataAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of GuildData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataCountArgs} args - Arguments to filter GuildData to count.
     * @example
     * // Count the number of GuildData
     * const count = await prisma.guildData.count({
     *   where: {
     *     // ... the filter for the GuildData we want to count
     *   }
     * })
    **/
    count<T extends GuildDataCountArgs>(
      args?: Subset<T, GuildDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuildDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GuildData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuildDataAggregateArgs>(args: Subset<T, GuildDataAggregateArgs>): Prisma.PrismaPromise<GetGuildDataAggregateType<T>>

    /**
     * Group by GuildData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuildDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuildDataGroupByArgs['orderBy'] }
        : { orderBy?: GuildDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuildDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuildDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GuildData model
   */
  readonly fields: GuildDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GuildData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuildDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    guild<T extends GuildDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GuildDefaultArgs<ExtArgs>>): Prisma__GuildClient<$Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GuildData model
   */ 
  interface GuildDataFieldRefs {
    readonly id: FieldRef<"GuildData", 'String'>
    readonly key: FieldRef<"GuildData", 'String'>
    readonly version: FieldRef<"GuildData", 'String'>
    readonly type: FieldRef<"GuildData", 'E_DATA_TYPES'>
    readonly object: FieldRef<"GuildData", 'Json'>
    readonly value: FieldRef<"GuildData", 'String'>
    readonly values: FieldRef<"GuildData", 'String[]'>
    readonly ownerId: FieldRef<"GuildData", 'String'>
    readonly createdAt: FieldRef<"GuildData", 'DateTime'>
    readonly updatedAt: FieldRef<"GuildData", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GuildData findUnique
   */
  export type GuildDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter, which GuildData to fetch.
     */
    where: GuildDataWhereUniqueInput
  }

  /**
   * GuildData findUniqueOrThrow
   */
  export type GuildDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter, which GuildData to fetch.
     */
    where: GuildDataWhereUniqueInput
  }

  /**
   * GuildData findFirst
   */
  export type GuildDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter, which GuildData to fetch.
     */
    where?: GuildDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuildData to fetch.
     */
    orderBy?: GuildDataOrderByWithRelationInput | GuildDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GuildData.
     */
    cursor?: GuildDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuildData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuildData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GuildData.
     */
    distinct?: GuildDataScalarFieldEnum | GuildDataScalarFieldEnum[]
  }

  /**
   * GuildData findFirstOrThrow
   */
  export type GuildDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter, which GuildData to fetch.
     */
    where?: GuildDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuildData to fetch.
     */
    orderBy?: GuildDataOrderByWithRelationInput | GuildDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GuildData.
     */
    cursor?: GuildDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuildData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuildData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GuildData.
     */
    distinct?: GuildDataScalarFieldEnum | GuildDataScalarFieldEnum[]
  }

  /**
   * GuildData findMany
   */
  export type GuildDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter, which GuildData to fetch.
     */
    where?: GuildDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuildData to fetch.
     */
    orderBy?: GuildDataOrderByWithRelationInput | GuildDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GuildData.
     */
    cursor?: GuildDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuildData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuildData.
     */
    skip?: number
    distinct?: GuildDataScalarFieldEnum | GuildDataScalarFieldEnum[]
  }

  /**
   * GuildData create
   */
  export type GuildDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * The data needed to create a GuildData.
     */
    data: XOR<GuildDataCreateInput, GuildDataUncheckedCreateInput>
  }

  /**
   * GuildData createMany
   */
  export type GuildDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GuildData.
     */
    data: GuildDataCreateManyInput | GuildDataCreateManyInput[]
  }

  /**
   * GuildData update
   */
  export type GuildDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * The data needed to update a GuildData.
     */
    data: XOR<GuildDataUpdateInput, GuildDataUncheckedUpdateInput>
    /**
     * Choose, which GuildData to update.
     */
    where: GuildDataWhereUniqueInput
  }

  /**
   * GuildData updateMany
   */
  export type GuildDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GuildData.
     */
    data: XOR<GuildDataUpdateManyMutationInput, GuildDataUncheckedUpdateManyInput>
    /**
     * Filter which GuildData to update
     */
    where?: GuildDataWhereInput
  }

  /**
   * GuildData upsert
   */
  export type GuildDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * The filter to search for the GuildData to update in case it exists.
     */
    where: GuildDataWhereUniqueInput
    /**
     * In case the GuildData found by the `where` argument doesn't exist, create a new GuildData with this data.
     */
    create: XOR<GuildDataCreateInput, GuildDataUncheckedCreateInput>
    /**
     * In case the GuildData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuildDataUpdateInput, GuildDataUncheckedUpdateInput>
  }

  /**
   * GuildData delete
   */
  export type GuildDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
    /**
     * Filter which GuildData to delete.
     */
    where: GuildDataWhereUniqueInput
  }

  /**
   * GuildData deleteMany
   */
  export type GuildDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GuildData to delete
     */
    where?: GuildDataWhereInput
  }

  /**
   * GuildData findRaw
   */
  export type GuildDataFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GuildData aggregateRaw
   */
  export type GuildDataAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GuildData without action
   */
  export type GuildDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildData
     */
    select?: GuildDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuildDataInclude<ExtArgs> | null
  }


  /**
   * Model Channel
   */

  export type AggregateChannel = {
    _count: ChannelCountAggregateOutputType | null
    _avg: ChannelAvgAggregateOutputType | null
    _sum: ChannelSumAggregateOutputType | null
    _min: ChannelMinAggregateOutputType | null
    _max: ChannelMaxAggregateOutputType | null
  }

  export type ChannelAvgAggregateOutputType = {
    createdAtDiscord: number | null
  }

  export type ChannelSumAggregateOutputType = {
    createdAtDiscord: number | null
  }

  export type ChannelMinAggregateOutputType = {
    id: string | null
    channelId: string | null
    guildId: string | null
    userOwnerId: string | null
    categoryId: string | null
    ownerChannelId: string | null
    version: string | null
    internalType: $Enums.E_INTERNAL_CHANNEL_TYPES | null
    createdAtDiscord: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChannelMaxAggregateOutputType = {
    id: string | null
    channelId: string | null
    guildId: string | null
    userOwnerId: string | null
    categoryId: string | null
    ownerChannelId: string | null
    version: string | null
    internalType: $Enums.E_INTERNAL_CHANNEL_TYPES | null
    createdAtDiscord: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChannelCountAggregateOutputType = {
    id: number
    channelId: number
    guildId: number
    userOwnerId: number
    categoryId: number
    ownerChannelId: number
    version: number
    internalType: number
    createdAtDiscord: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChannelAvgAggregateInputType = {
    createdAtDiscord?: true
  }

  export type ChannelSumAggregateInputType = {
    createdAtDiscord?: true
  }

  export type ChannelMinAggregateInputType = {
    id?: true
    channelId?: true
    guildId?: true
    userOwnerId?: true
    categoryId?: true
    ownerChannelId?: true
    version?: true
    internalType?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChannelMaxAggregateInputType = {
    id?: true
    channelId?: true
    guildId?: true
    userOwnerId?: true
    categoryId?: true
    ownerChannelId?: true
    version?: true
    internalType?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChannelCountAggregateInputType = {
    id?: true
    channelId?: true
    guildId?: true
    userOwnerId?: true
    categoryId?: true
    ownerChannelId?: true
    version?: true
    internalType?: true
    createdAtDiscord?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChannelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Channel to aggregate.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Channels
    **/
    _count?: true | ChannelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChannelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChannelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChannelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChannelMaxAggregateInputType
  }

  export type GetChannelAggregateType<T extends ChannelAggregateArgs> = {
        [P in keyof T & keyof AggregateChannel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChannel[P]>
      : GetScalarType<T[P], AggregateChannel[P]>
  }




  export type ChannelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChannelWhereInput
    orderBy?: ChannelOrderByWithAggregationInput | ChannelOrderByWithAggregationInput[]
    by: ChannelScalarFieldEnum[] | ChannelScalarFieldEnum
    having?: ChannelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChannelCountAggregateInputType | true
    _avg?: ChannelAvgAggregateInputType
    _sum?: ChannelSumAggregateInputType
    _min?: ChannelMinAggregateInputType
    _max?: ChannelMaxAggregateInputType
  }

  export type ChannelGroupByOutputType = {
    id: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId: string | null
    ownerChannelId: string | null
    version: string
    internalType: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt: Date
    updatedAt: Date
    _count: ChannelCountAggregateOutputType | null
    _avg: ChannelAvgAggregateOutputType | null
    _sum: ChannelSumAggregateOutputType | null
    _min: ChannelMinAggregateOutputType | null
    _max: ChannelMaxAggregateOutputType | null
  }

  type GetChannelGroupByPayload<T extends ChannelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChannelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChannelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChannelGroupByOutputType[P]>
            : GetScalarType<T[P], ChannelGroupByOutputType[P]>
        }
      >
    >


  export type ChannelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    guildId?: boolean
    userOwnerId?: boolean
    categoryId?: boolean
    ownerChannelId?: boolean
    version?: boolean
    internalType?: boolean
    createdAtDiscord?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    data?: boolean | Channel$dataArgs<ExtArgs>
    _count?: boolean | ChannelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["channel"]>


  export type ChannelSelectScalar = {
    id?: boolean
    channelId?: boolean
    guildId?: boolean
    userOwnerId?: boolean
    categoryId?: boolean
    ownerChannelId?: boolean
    version?: boolean
    internalType?: boolean
    createdAtDiscord?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChannelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | Channel$dataArgs<ExtArgs>
    _count?: boolean | ChannelCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ChannelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Channel"
    objects: {
      data: Prisma.$ChannelDataPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      channelId: string
      guildId: string
      userOwnerId: string
      categoryId: string | null
      ownerChannelId: string | null
      version: string
      internalType: $Enums.E_INTERNAL_CHANNEL_TYPES
      createdAtDiscord: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["channel"]>
    composites: {}
  }

  type ChannelGetPayload<S extends boolean | null | undefined | ChannelDefaultArgs> = $Result.GetResult<Prisma.$ChannelPayload, S>

  type ChannelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChannelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChannelCountAggregateInputType | true
    }

  export interface ChannelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Channel'], meta: { name: 'Channel' } }
    /**
     * Find zero or one Channel that matches the filter.
     * @param {ChannelFindUniqueArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChannelFindUniqueArgs>(args: SelectSubset<T, ChannelFindUniqueArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Channel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChannelFindUniqueOrThrowArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChannelFindUniqueOrThrowArgs>(args: SelectSubset<T, ChannelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Channel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindFirstArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChannelFindFirstArgs>(args?: SelectSubset<T, ChannelFindFirstArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Channel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindFirstOrThrowArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChannelFindFirstOrThrowArgs>(args?: SelectSubset<T, ChannelFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Channels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Channels
     * const channels = await prisma.channel.findMany()
     * 
     * // Get first 10 Channels
     * const channels = await prisma.channel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const channelWithIdOnly = await prisma.channel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChannelFindManyArgs>(args?: SelectSubset<T, ChannelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Channel.
     * @param {ChannelCreateArgs} args - Arguments to create a Channel.
     * @example
     * // Create one Channel
     * const Channel = await prisma.channel.create({
     *   data: {
     *     // ... data to create a Channel
     *   }
     * })
     * 
     */
    create<T extends ChannelCreateArgs>(args: SelectSubset<T, ChannelCreateArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Channels.
     * @param {ChannelCreateManyArgs} args - Arguments to create many Channels.
     * @example
     * // Create many Channels
     * const channel = await prisma.channel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChannelCreateManyArgs>(args?: SelectSubset<T, ChannelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Channel.
     * @param {ChannelDeleteArgs} args - Arguments to delete one Channel.
     * @example
     * // Delete one Channel
     * const Channel = await prisma.channel.delete({
     *   where: {
     *     // ... filter to delete one Channel
     *   }
     * })
     * 
     */
    delete<T extends ChannelDeleteArgs>(args: SelectSubset<T, ChannelDeleteArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Channel.
     * @param {ChannelUpdateArgs} args - Arguments to update one Channel.
     * @example
     * // Update one Channel
     * const channel = await prisma.channel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChannelUpdateArgs>(args: SelectSubset<T, ChannelUpdateArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Channels.
     * @param {ChannelDeleteManyArgs} args - Arguments to filter Channels to delete.
     * @example
     * // Delete a few Channels
     * const { count } = await prisma.channel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChannelDeleteManyArgs>(args?: SelectSubset<T, ChannelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Channels
     * const channel = await prisma.channel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChannelUpdateManyArgs>(args: SelectSubset<T, ChannelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Channel.
     * @param {ChannelUpsertArgs} args - Arguments to update or create a Channel.
     * @example
     * // Update or create a Channel
     * const channel = await prisma.channel.upsert({
     *   create: {
     *     // ... data to create a Channel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Channel we want to update
     *   }
     * })
     */
    upsert<T extends ChannelUpsertArgs>(args: SelectSubset<T, ChannelUpsertArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Channels that matches the filter.
     * @param {ChannelFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const channel = await prisma.channel.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ChannelFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Channel.
     * @param {ChannelAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const channel = await prisma.channel.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ChannelAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelCountArgs} args - Arguments to filter Channels to count.
     * @example
     * // Count the number of Channels
     * const count = await prisma.channel.count({
     *   where: {
     *     // ... the filter for the Channels we want to count
     *   }
     * })
    **/
    count<T extends ChannelCountArgs>(
      args?: Subset<T, ChannelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChannelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Channel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChannelAggregateArgs>(args: Subset<T, ChannelAggregateArgs>): Prisma.PrismaPromise<GetChannelAggregateType<T>>

    /**
     * Group by Channel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChannelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChannelGroupByArgs['orderBy'] }
        : { orderBy?: ChannelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChannelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChannelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Channel model
   */
  readonly fields: ChannelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Channel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChannelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    data<T extends Channel$dataArgs<ExtArgs> = {}>(args?: Subset<T, Channel$dataArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Channel model
   */ 
  interface ChannelFieldRefs {
    readonly id: FieldRef<"Channel", 'String'>
    readonly channelId: FieldRef<"Channel", 'String'>
    readonly guildId: FieldRef<"Channel", 'String'>
    readonly userOwnerId: FieldRef<"Channel", 'String'>
    readonly categoryId: FieldRef<"Channel", 'String'>
    readonly ownerChannelId: FieldRef<"Channel", 'String'>
    readonly version: FieldRef<"Channel", 'String'>
    readonly internalType: FieldRef<"Channel", 'E_INTERNAL_CHANNEL_TYPES'>
    readonly createdAtDiscord: FieldRef<"Channel", 'Int'>
    readonly createdAt: FieldRef<"Channel", 'DateTime'>
    readonly updatedAt: FieldRef<"Channel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Channel findUnique
   */
  export type ChannelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel findUniqueOrThrow
   */
  export type ChannelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel findFirst
   */
  export type ChannelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Channels.
     */
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel findFirstOrThrow
   */
  export type ChannelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Channels.
     */
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel findMany
   */
  export type ChannelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channels to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel create
   */
  export type ChannelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The data needed to create a Channel.
     */
    data: XOR<ChannelCreateInput, ChannelUncheckedCreateInput>
  }

  /**
   * Channel createMany
   */
  export type ChannelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Channels.
     */
    data: ChannelCreateManyInput | ChannelCreateManyInput[]
  }

  /**
   * Channel update
   */
  export type ChannelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The data needed to update a Channel.
     */
    data: XOR<ChannelUpdateInput, ChannelUncheckedUpdateInput>
    /**
     * Choose, which Channel to update.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel updateMany
   */
  export type ChannelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Channels.
     */
    data: XOR<ChannelUpdateManyMutationInput, ChannelUncheckedUpdateManyInput>
    /**
     * Filter which Channels to update
     */
    where?: ChannelWhereInput
  }

  /**
   * Channel upsert
   */
  export type ChannelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The filter to search for the Channel to update in case it exists.
     */
    where: ChannelWhereUniqueInput
    /**
     * In case the Channel found by the `where` argument doesn't exist, create a new Channel with this data.
     */
    create: XOR<ChannelCreateInput, ChannelUncheckedCreateInput>
    /**
     * In case the Channel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChannelUpdateInput, ChannelUncheckedUpdateInput>
  }

  /**
   * Channel delete
   */
  export type ChannelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter which Channel to delete.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel deleteMany
   */
  export type ChannelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Channels to delete
     */
    where?: ChannelWhereInput
  }

  /**
   * Channel findRaw
   */
  export type ChannelFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Channel aggregateRaw
   */
  export type ChannelAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Channel.data
   */
  export type Channel$dataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    where?: ChannelDataWhereInput
    orderBy?: ChannelDataOrderByWithRelationInput | ChannelDataOrderByWithRelationInput[]
    cursor?: ChannelDataWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChannelDataScalarFieldEnum | ChannelDataScalarFieldEnum[]
  }

  /**
   * Channel without action
   */
  export type ChannelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
  }


  /**
   * Model ChannelData
   */

  export type AggregateChannelData = {
    _count: ChannelDataCountAggregateOutputType | null
    _min: ChannelDataMinAggregateOutputType | null
    _max: ChannelDataMaxAggregateOutputType | null
  }

  export type ChannelDataMinAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChannelDataMaxAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChannelDataCountAggregateOutputType = {
    id: number
    key: number
    version: number
    type: number
    object: number
    value: number
    values: number
    ownerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChannelDataMinAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChannelDataMaxAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChannelDataCountAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    object?: true
    value?: true
    values?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChannelDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChannelData to aggregate.
     */
    where?: ChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChannelData to fetch.
     */
    orderBy?: ChannelDataOrderByWithRelationInput | ChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChannelData
    **/
    _count?: true | ChannelDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChannelDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChannelDataMaxAggregateInputType
  }

  export type GetChannelDataAggregateType<T extends ChannelDataAggregateArgs> = {
        [P in keyof T & keyof AggregateChannelData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChannelData[P]>
      : GetScalarType<T[P], AggregateChannelData[P]>
  }




  export type ChannelDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChannelDataWhereInput
    orderBy?: ChannelDataOrderByWithAggregationInput | ChannelDataOrderByWithAggregationInput[]
    by: ChannelDataScalarFieldEnum[] | ChannelDataScalarFieldEnum
    having?: ChannelDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChannelDataCountAggregateInputType | true
    _min?: ChannelDataMinAggregateInputType
    _max?: ChannelDataMaxAggregateInputType
  }

  export type ChannelDataGroupByOutputType = {
    id: string
    key: string
    version: string
    type: $Enums.E_DATA_TYPES
    object: JsonValue | null
    value: string | null
    values: string[]
    ownerId: string
    createdAt: Date
    updatedAt: Date
    _count: ChannelDataCountAggregateOutputType | null
    _min: ChannelDataMinAggregateOutputType | null
    _max: ChannelDataMaxAggregateOutputType | null
  }

  type GetChannelDataGroupByPayload<T extends ChannelDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChannelDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChannelDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChannelDataGroupByOutputType[P]>
            : GetScalarType<T[P], ChannelDataGroupByOutputType[P]>
        }
      >
    >


  export type ChannelDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["channelData"]>


  export type ChannelDataSelectScalar = {
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChannelDataInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }

  export type $ChannelDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChannelData"
    objects: {
      channel: Prisma.$ChannelPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      version: string
      type: $Enums.E_DATA_TYPES
      object: Prisma.JsonValue | null
      value: string | null
      values: string[]
      ownerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["channelData"]>
    composites: {}
  }

  type ChannelDataGetPayload<S extends boolean | null | undefined | ChannelDataDefaultArgs> = $Result.GetResult<Prisma.$ChannelDataPayload, S>

  type ChannelDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChannelDataFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChannelDataCountAggregateInputType | true
    }

  export interface ChannelDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChannelData'], meta: { name: 'ChannelData' } }
    /**
     * Find zero or one ChannelData that matches the filter.
     * @param {ChannelDataFindUniqueArgs} args - Arguments to find a ChannelData
     * @example
     * // Get one ChannelData
     * const channelData = await prisma.channelData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChannelDataFindUniqueArgs>(args: SelectSubset<T, ChannelDataFindUniqueArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChannelData that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChannelDataFindUniqueOrThrowArgs} args - Arguments to find a ChannelData
     * @example
     * // Get one ChannelData
     * const channelData = await prisma.channelData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChannelDataFindUniqueOrThrowArgs>(args: SelectSubset<T, ChannelDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChannelData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataFindFirstArgs} args - Arguments to find a ChannelData
     * @example
     * // Get one ChannelData
     * const channelData = await prisma.channelData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChannelDataFindFirstArgs>(args?: SelectSubset<T, ChannelDataFindFirstArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChannelData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataFindFirstOrThrowArgs} args - Arguments to find a ChannelData
     * @example
     * // Get one ChannelData
     * const channelData = await prisma.channelData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChannelDataFindFirstOrThrowArgs>(args?: SelectSubset<T, ChannelDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChannelData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChannelData
     * const channelData = await prisma.channelData.findMany()
     * 
     * // Get first 10 ChannelData
     * const channelData = await prisma.channelData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const channelDataWithIdOnly = await prisma.channelData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChannelDataFindManyArgs>(args?: SelectSubset<T, ChannelDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChannelData.
     * @param {ChannelDataCreateArgs} args - Arguments to create a ChannelData.
     * @example
     * // Create one ChannelData
     * const ChannelData = await prisma.channelData.create({
     *   data: {
     *     // ... data to create a ChannelData
     *   }
     * })
     * 
     */
    create<T extends ChannelDataCreateArgs>(args: SelectSubset<T, ChannelDataCreateArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChannelData.
     * @param {ChannelDataCreateManyArgs} args - Arguments to create many ChannelData.
     * @example
     * // Create many ChannelData
     * const channelData = await prisma.channelData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChannelDataCreateManyArgs>(args?: SelectSubset<T, ChannelDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ChannelData.
     * @param {ChannelDataDeleteArgs} args - Arguments to delete one ChannelData.
     * @example
     * // Delete one ChannelData
     * const ChannelData = await prisma.channelData.delete({
     *   where: {
     *     // ... filter to delete one ChannelData
     *   }
     * })
     * 
     */
    delete<T extends ChannelDataDeleteArgs>(args: SelectSubset<T, ChannelDataDeleteArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChannelData.
     * @param {ChannelDataUpdateArgs} args - Arguments to update one ChannelData.
     * @example
     * // Update one ChannelData
     * const channelData = await prisma.channelData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChannelDataUpdateArgs>(args: SelectSubset<T, ChannelDataUpdateArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChannelData.
     * @param {ChannelDataDeleteManyArgs} args - Arguments to filter ChannelData to delete.
     * @example
     * // Delete a few ChannelData
     * const { count } = await prisma.channelData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChannelDataDeleteManyArgs>(args?: SelectSubset<T, ChannelDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChannelData
     * const channelData = await prisma.channelData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChannelDataUpdateManyArgs>(args: SelectSubset<T, ChannelDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChannelData.
     * @param {ChannelDataUpsertArgs} args - Arguments to update or create a ChannelData.
     * @example
     * // Update or create a ChannelData
     * const channelData = await prisma.channelData.upsert({
     *   create: {
     *     // ... data to create a ChannelData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChannelData we want to update
     *   }
     * })
     */
    upsert<T extends ChannelDataUpsertArgs>(args: SelectSubset<T, ChannelDataUpsertArgs<ExtArgs>>): Prisma__ChannelDataClient<$Result.GetResult<Prisma.$ChannelDataPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ChannelData that matches the filter.
     * @param {ChannelDataFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const channelData = await prisma.channelData.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ChannelDataFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ChannelData.
     * @param {ChannelDataAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const channelData = await prisma.channelData.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ChannelDataAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataCountArgs} args - Arguments to filter ChannelData to count.
     * @example
     * // Count the number of ChannelData
     * const count = await prisma.channelData.count({
     *   where: {
     *     // ... the filter for the ChannelData we want to count
     *   }
     * })
    **/
    count<T extends ChannelDataCountArgs>(
      args?: Subset<T, ChannelDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChannelDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChannelDataAggregateArgs>(args: Subset<T, ChannelDataAggregateArgs>): Prisma.PrismaPromise<GetChannelDataAggregateType<T>>

    /**
     * Group by ChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChannelDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChannelDataGroupByArgs['orderBy'] }
        : { orderBy?: ChannelDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChannelDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChannelDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChannelData model
   */
  readonly fields: ChannelDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChannelData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChannelDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    channel<T extends ChannelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChannelDefaultArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChannelData model
   */ 
  interface ChannelDataFieldRefs {
    readonly id: FieldRef<"ChannelData", 'String'>
    readonly key: FieldRef<"ChannelData", 'String'>
    readonly version: FieldRef<"ChannelData", 'String'>
    readonly type: FieldRef<"ChannelData", 'E_DATA_TYPES'>
    readonly object: FieldRef<"ChannelData", 'Json'>
    readonly value: FieldRef<"ChannelData", 'String'>
    readonly values: FieldRef<"ChannelData", 'String[]'>
    readonly ownerId: FieldRef<"ChannelData", 'String'>
    readonly createdAt: FieldRef<"ChannelData", 'DateTime'>
    readonly updatedAt: FieldRef<"ChannelData", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChannelData findUnique
   */
  export type ChannelDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which ChannelData to fetch.
     */
    where: ChannelDataWhereUniqueInput
  }

  /**
   * ChannelData findUniqueOrThrow
   */
  export type ChannelDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which ChannelData to fetch.
     */
    where: ChannelDataWhereUniqueInput
  }

  /**
   * ChannelData findFirst
   */
  export type ChannelDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which ChannelData to fetch.
     */
    where?: ChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChannelData to fetch.
     */
    orderBy?: ChannelDataOrderByWithRelationInput | ChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChannelData.
     */
    cursor?: ChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChannelData.
     */
    distinct?: ChannelDataScalarFieldEnum | ChannelDataScalarFieldEnum[]
  }

  /**
   * ChannelData findFirstOrThrow
   */
  export type ChannelDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which ChannelData to fetch.
     */
    where?: ChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChannelData to fetch.
     */
    orderBy?: ChannelDataOrderByWithRelationInput | ChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChannelData.
     */
    cursor?: ChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChannelData.
     */
    distinct?: ChannelDataScalarFieldEnum | ChannelDataScalarFieldEnum[]
  }

  /**
   * ChannelData findMany
   */
  export type ChannelDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which ChannelData to fetch.
     */
    where?: ChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChannelData to fetch.
     */
    orderBy?: ChannelDataOrderByWithRelationInput | ChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChannelData.
     */
    cursor?: ChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChannelData.
     */
    skip?: number
    distinct?: ChannelDataScalarFieldEnum | ChannelDataScalarFieldEnum[]
  }

  /**
   * ChannelData create
   */
  export type ChannelDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * The data needed to create a ChannelData.
     */
    data: XOR<ChannelDataCreateInput, ChannelDataUncheckedCreateInput>
  }

  /**
   * ChannelData createMany
   */
  export type ChannelDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChannelData.
     */
    data: ChannelDataCreateManyInput | ChannelDataCreateManyInput[]
  }

  /**
   * ChannelData update
   */
  export type ChannelDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * The data needed to update a ChannelData.
     */
    data: XOR<ChannelDataUpdateInput, ChannelDataUncheckedUpdateInput>
    /**
     * Choose, which ChannelData to update.
     */
    where: ChannelDataWhereUniqueInput
  }

  /**
   * ChannelData updateMany
   */
  export type ChannelDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChannelData.
     */
    data: XOR<ChannelDataUpdateManyMutationInput, ChannelDataUncheckedUpdateManyInput>
    /**
     * Filter which ChannelData to update
     */
    where?: ChannelDataWhereInput
  }

  /**
   * ChannelData upsert
   */
  export type ChannelDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * The filter to search for the ChannelData to update in case it exists.
     */
    where: ChannelDataWhereUniqueInput
    /**
     * In case the ChannelData found by the `where` argument doesn't exist, create a new ChannelData with this data.
     */
    create: XOR<ChannelDataCreateInput, ChannelDataUncheckedCreateInput>
    /**
     * In case the ChannelData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChannelDataUpdateInput, ChannelDataUncheckedUpdateInput>
  }

  /**
   * ChannelData delete
   */
  export type ChannelDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
    /**
     * Filter which ChannelData to delete.
     */
    where: ChannelDataWhereUniqueInput
  }

  /**
   * ChannelData deleteMany
   */
  export type ChannelDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChannelData to delete
     */
    where?: ChannelDataWhereInput
  }

  /**
   * ChannelData findRaw
   */
  export type ChannelDataFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ChannelData aggregateRaw
   */
  export type ChannelDataAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ChannelData without action
   */
  export type ChannelDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelData
     */
    select?: ChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelDataInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    userId: string | null
    username: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    username: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    userId: number
    username: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    userId?: true
    username?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    userId?: true
    username?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    userId?: true
    username?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    userId: string
    username: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    username?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    data?: boolean | User$dataArgs<ExtArgs>
    channelData?: boolean | User$channelDataArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>


  export type UserSelectScalar = {
    id?: boolean
    userId?: boolean
    username?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    data?: boolean | User$dataArgs<ExtArgs>
    channelData?: boolean | User$channelDataArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      data: Prisma.$UserDataPayload<ExtArgs>[]
      channelData: Prisma.$UserChannelDataPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      username: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * @param {UserFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const user = await prisma.user.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: UserFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a User.
     * @param {UserAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const user = await prisma.user.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    data<T extends User$dataArgs<ExtArgs> = {}>(args?: Subset<T, User$dataArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findMany"> | Null>
    channelData<T extends User$channelDataArgs<ExtArgs> = {}>(args?: Subset<T, User$channelDataArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly userId: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User findRaw
   */
  export type UserFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User aggregateRaw
   */
  export type UserAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User.data
   */
  export type User$dataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    where?: UserDataWhereInput
    orderBy?: UserDataOrderByWithRelationInput | UserDataOrderByWithRelationInput[]
    cursor?: UserDataWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserDataScalarFieldEnum | UserDataScalarFieldEnum[]
  }

  /**
   * User.channelData
   */
  export type User$channelDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    where?: UserChannelDataWhereInput
    orderBy?: UserChannelDataOrderByWithRelationInput | UserChannelDataOrderByWithRelationInput[]
    cursor?: UserChannelDataWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserChannelDataScalarFieldEnum | UserChannelDataScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserData
   */

  export type AggregateUserData = {
    _count: UserDataCountAggregateOutputType | null
    _min: UserDataMinAggregateOutputType | null
    _max: UserDataMaxAggregateOutputType | null
  }

  export type UserDataMinAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserDataMaxAggregateOutputType = {
    id: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserDataCountAggregateOutputType = {
    id: number
    key: number
    version: number
    type: number
    object: number
    value: number
    values: number
    ownerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserDataMinAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserDataMaxAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserDataCountAggregateInputType = {
    id?: true
    key?: true
    version?: true
    type?: true
    object?: true
    value?: true
    values?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserData to aggregate.
     */
    where?: UserDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserData to fetch.
     */
    orderBy?: UserDataOrderByWithRelationInput | UserDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserData
    **/
    _count?: true | UserDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserDataMaxAggregateInputType
  }

  export type GetUserDataAggregateType<T extends UserDataAggregateArgs> = {
        [P in keyof T & keyof AggregateUserData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserData[P]>
      : GetScalarType<T[P], AggregateUserData[P]>
  }




  export type UserDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserDataWhereInput
    orderBy?: UserDataOrderByWithAggregationInput | UserDataOrderByWithAggregationInput[]
    by: UserDataScalarFieldEnum[] | UserDataScalarFieldEnum
    having?: UserDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserDataCountAggregateInputType | true
    _min?: UserDataMinAggregateInputType
    _max?: UserDataMaxAggregateInputType
  }

  export type UserDataGroupByOutputType = {
    id: string
    key: string
    version: string
    type: $Enums.E_DATA_TYPES
    object: JsonValue | null
    value: string | null
    values: string[]
    ownerId: string
    createdAt: Date
    updatedAt: Date
    _count: UserDataCountAggregateOutputType | null
    _min: UserDataMinAggregateOutputType | null
    _max: UserDataMaxAggregateOutputType | null
  }

  type GetUserDataGroupByPayload<T extends UserDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserDataGroupByOutputType[P]>
            : GetScalarType<T[P], UserDataGroupByOutputType[P]>
        }
      >
    >


  export type UserDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userData"]>


  export type UserDataSelectScalar = {
    id?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserDataInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserData"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      version: string
      type: $Enums.E_DATA_TYPES
      object: Prisma.JsonValue | null
      value: string | null
      values: string[]
      ownerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userData"]>
    composites: {}
  }

  type UserDataGetPayload<S extends boolean | null | undefined | UserDataDefaultArgs> = $Result.GetResult<Prisma.$UserDataPayload, S>

  type UserDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserDataFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserDataCountAggregateInputType | true
    }

  export interface UserDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserData'], meta: { name: 'UserData' } }
    /**
     * Find zero or one UserData that matches the filter.
     * @param {UserDataFindUniqueArgs} args - Arguments to find a UserData
     * @example
     * // Get one UserData
     * const userData = await prisma.userData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserDataFindUniqueArgs>(args: SelectSubset<T, UserDataFindUniqueArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserData that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserDataFindUniqueOrThrowArgs} args - Arguments to find a UserData
     * @example
     * // Get one UserData
     * const userData = await prisma.userData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserDataFindUniqueOrThrowArgs>(args: SelectSubset<T, UserDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataFindFirstArgs} args - Arguments to find a UserData
     * @example
     * // Get one UserData
     * const userData = await prisma.userData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserDataFindFirstArgs>(args?: SelectSubset<T, UserDataFindFirstArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataFindFirstOrThrowArgs} args - Arguments to find a UserData
     * @example
     * // Get one UserData
     * const userData = await prisma.userData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserDataFindFirstOrThrowArgs>(args?: SelectSubset<T, UserDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserData
     * const userData = await prisma.userData.findMany()
     * 
     * // Get first 10 UserData
     * const userData = await prisma.userData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userDataWithIdOnly = await prisma.userData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserDataFindManyArgs>(args?: SelectSubset<T, UserDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserData.
     * @param {UserDataCreateArgs} args - Arguments to create a UserData.
     * @example
     * // Create one UserData
     * const UserData = await prisma.userData.create({
     *   data: {
     *     // ... data to create a UserData
     *   }
     * })
     * 
     */
    create<T extends UserDataCreateArgs>(args: SelectSubset<T, UserDataCreateArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserData.
     * @param {UserDataCreateManyArgs} args - Arguments to create many UserData.
     * @example
     * // Create many UserData
     * const userData = await prisma.userData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserDataCreateManyArgs>(args?: SelectSubset<T, UserDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserData.
     * @param {UserDataDeleteArgs} args - Arguments to delete one UserData.
     * @example
     * // Delete one UserData
     * const UserData = await prisma.userData.delete({
     *   where: {
     *     // ... filter to delete one UserData
     *   }
     * })
     * 
     */
    delete<T extends UserDataDeleteArgs>(args: SelectSubset<T, UserDataDeleteArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserData.
     * @param {UserDataUpdateArgs} args - Arguments to update one UserData.
     * @example
     * // Update one UserData
     * const userData = await prisma.userData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserDataUpdateArgs>(args: SelectSubset<T, UserDataUpdateArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserData.
     * @param {UserDataDeleteManyArgs} args - Arguments to filter UserData to delete.
     * @example
     * // Delete a few UserData
     * const { count } = await prisma.userData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDataDeleteManyArgs>(args?: SelectSubset<T, UserDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserData
     * const userData = await prisma.userData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserDataUpdateManyArgs>(args: SelectSubset<T, UserDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserData.
     * @param {UserDataUpsertArgs} args - Arguments to update or create a UserData.
     * @example
     * // Update or create a UserData
     * const userData = await prisma.userData.upsert({
     *   create: {
     *     // ... data to create a UserData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserData we want to update
     *   }
     * })
     */
    upsert<T extends UserDataUpsertArgs>(args: SelectSubset<T, UserDataUpsertArgs<ExtArgs>>): Prisma__UserDataClient<$Result.GetResult<Prisma.$UserDataPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more UserData that matches the filter.
     * @param {UserDataFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const userData = await prisma.userData.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: UserDataFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a UserData.
     * @param {UserDataAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const userData = await prisma.userData.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserDataAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of UserData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataCountArgs} args - Arguments to filter UserData to count.
     * @example
     * // Count the number of UserData
     * const count = await prisma.userData.count({
     *   where: {
     *     // ... the filter for the UserData we want to count
     *   }
     * })
    **/
    count<T extends UserDataCountArgs>(
      args?: Subset<T, UserDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserDataAggregateArgs>(args: Subset<T, UserDataAggregateArgs>): Prisma.PrismaPromise<GetUserDataAggregateType<T>>

    /**
     * Group by UserData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserDataGroupByArgs['orderBy'] }
        : { orderBy?: UserDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserData model
   */
  readonly fields: UserDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserData model
   */ 
  interface UserDataFieldRefs {
    readonly id: FieldRef<"UserData", 'String'>
    readonly key: FieldRef<"UserData", 'String'>
    readonly version: FieldRef<"UserData", 'String'>
    readonly type: FieldRef<"UserData", 'E_DATA_TYPES'>
    readonly object: FieldRef<"UserData", 'Json'>
    readonly value: FieldRef<"UserData", 'String'>
    readonly values: FieldRef<"UserData", 'String[]'>
    readonly ownerId: FieldRef<"UserData", 'String'>
    readonly createdAt: FieldRef<"UserData", 'DateTime'>
    readonly updatedAt: FieldRef<"UserData", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserData findUnique
   */
  export type UserDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter, which UserData to fetch.
     */
    where: UserDataWhereUniqueInput
  }

  /**
   * UserData findUniqueOrThrow
   */
  export type UserDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter, which UserData to fetch.
     */
    where: UserDataWhereUniqueInput
  }

  /**
   * UserData findFirst
   */
  export type UserDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter, which UserData to fetch.
     */
    where?: UserDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserData to fetch.
     */
    orderBy?: UserDataOrderByWithRelationInput | UserDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserData.
     */
    cursor?: UserDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserData.
     */
    distinct?: UserDataScalarFieldEnum | UserDataScalarFieldEnum[]
  }

  /**
   * UserData findFirstOrThrow
   */
  export type UserDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter, which UserData to fetch.
     */
    where?: UserDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserData to fetch.
     */
    orderBy?: UserDataOrderByWithRelationInput | UserDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserData.
     */
    cursor?: UserDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserData.
     */
    distinct?: UserDataScalarFieldEnum | UserDataScalarFieldEnum[]
  }

  /**
   * UserData findMany
   */
  export type UserDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter, which UserData to fetch.
     */
    where?: UserDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserData to fetch.
     */
    orderBy?: UserDataOrderByWithRelationInput | UserDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserData.
     */
    cursor?: UserDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserData.
     */
    skip?: number
    distinct?: UserDataScalarFieldEnum | UserDataScalarFieldEnum[]
  }

  /**
   * UserData create
   */
  export type UserDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * The data needed to create a UserData.
     */
    data: XOR<UserDataCreateInput, UserDataUncheckedCreateInput>
  }

  /**
   * UserData createMany
   */
  export type UserDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserData.
     */
    data: UserDataCreateManyInput | UserDataCreateManyInput[]
  }

  /**
   * UserData update
   */
  export type UserDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * The data needed to update a UserData.
     */
    data: XOR<UserDataUpdateInput, UserDataUncheckedUpdateInput>
    /**
     * Choose, which UserData to update.
     */
    where: UserDataWhereUniqueInput
  }

  /**
   * UserData updateMany
   */
  export type UserDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserData.
     */
    data: XOR<UserDataUpdateManyMutationInput, UserDataUncheckedUpdateManyInput>
    /**
     * Filter which UserData to update
     */
    where?: UserDataWhereInput
  }

  /**
   * UserData upsert
   */
  export type UserDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * The filter to search for the UserData to update in case it exists.
     */
    where: UserDataWhereUniqueInput
    /**
     * In case the UserData found by the `where` argument doesn't exist, create a new UserData with this data.
     */
    create: XOR<UserDataCreateInput, UserDataUncheckedCreateInput>
    /**
     * In case the UserData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserDataUpdateInput, UserDataUncheckedUpdateInput>
  }

  /**
   * UserData delete
   */
  export type UserDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
    /**
     * Filter which UserData to delete.
     */
    where: UserDataWhereUniqueInput
  }

  /**
   * UserData deleteMany
   */
  export type UserDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserData to delete
     */
    where?: UserDataWhereInput
  }

  /**
   * UserData findRaw
   */
  export type UserDataFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserData aggregateRaw
   */
  export type UserDataAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserData without action
   */
  export type UserDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserData
     */
    select?: UserDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserDataInclude<ExtArgs> | null
  }


  /**
   * Model UserChannelData
   */

  export type AggregateUserChannelData = {
    _count: UserChannelDataCountAggregateOutputType | null
    _min: UserChannelDataMinAggregateOutputType | null
    _max: UserChannelDataMaxAggregateOutputType | null
  }

  export type UserChannelDataMinAggregateOutputType = {
    id: string | null
    channelId: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserChannelDataMaxAggregateOutputType = {
    id: string | null
    channelId: string | null
    key: string | null
    version: string | null
    type: $Enums.E_DATA_TYPES | null
    value: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserChannelDataCountAggregateOutputType = {
    id: number
    channelId: number
    key: number
    version: number
    type: number
    object: number
    value: number
    values: number
    ownerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserChannelDataMinAggregateInputType = {
    id?: true
    channelId?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserChannelDataMaxAggregateInputType = {
    id?: true
    channelId?: true
    key?: true
    version?: true
    type?: true
    value?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserChannelDataCountAggregateInputType = {
    id?: true
    channelId?: true
    key?: true
    version?: true
    type?: true
    object?: true
    value?: true
    values?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserChannelDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserChannelData to aggregate.
     */
    where?: UserChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserChannelData to fetch.
     */
    orderBy?: UserChannelDataOrderByWithRelationInput | UserChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserChannelData
    **/
    _count?: true | UserChannelDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserChannelDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserChannelDataMaxAggregateInputType
  }

  export type GetUserChannelDataAggregateType<T extends UserChannelDataAggregateArgs> = {
        [P in keyof T & keyof AggregateUserChannelData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserChannelData[P]>
      : GetScalarType<T[P], AggregateUserChannelData[P]>
  }




  export type UserChannelDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserChannelDataWhereInput
    orderBy?: UserChannelDataOrderByWithAggregationInput | UserChannelDataOrderByWithAggregationInput[]
    by: UserChannelDataScalarFieldEnum[] | UserChannelDataScalarFieldEnum
    having?: UserChannelDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserChannelDataCountAggregateInputType | true
    _min?: UserChannelDataMinAggregateInputType
    _max?: UserChannelDataMaxAggregateInputType
  }

  export type UserChannelDataGroupByOutputType = {
    id: string
    channelId: string
    key: string
    version: string
    type: $Enums.E_DATA_TYPES
    object: JsonValue | null
    value: string | null
    values: string[]
    ownerId: string
    createdAt: Date
    updatedAt: Date
    _count: UserChannelDataCountAggregateOutputType | null
    _min: UserChannelDataMinAggregateOutputType | null
    _max: UserChannelDataMaxAggregateOutputType | null
  }

  type GetUserChannelDataGroupByPayload<T extends UserChannelDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserChannelDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserChannelDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserChannelDataGroupByOutputType[P]>
            : GetScalarType<T[P], UserChannelDataGroupByOutputType[P]>
        }
      >
    >


  export type UserChannelDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userChannelData"]>


  export type UserChannelDataSelectScalar = {
    id?: boolean
    channelId?: boolean
    key?: boolean
    version?: boolean
    type?: boolean
    object?: boolean
    value?: boolean
    values?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserChannelDataInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserChannelDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserChannelData"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      channelId: string
      key: string
      version: string
      type: $Enums.E_DATA_TYPES
      object: Prisma.JsonValue | null
      value: string | null
      values: string[]
      ownerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userChannelData"]>
    composites: {}
  }

  type UserChannelDataGetPayload<S extends boolean | null | undefined | UserChannelDataDefaultArgs> = $Result.GetResult<Prisma.$UserChannelDataPayload, S>

  type UserChannelDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserChannelDataFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserChannelDataCountAggregateInputType | true
    }

  export interface UserChannelDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserChannelData'], meta: { name: 'UserChannelData' } }
    /**
     * Find zero or one UserChannelData that matches the filter.
     * @param {UserChannelDataFindUniqueArgs} args - Arguments to find a UserChannelData
     * @example
     * // Get one UserChannelData
     * const userChannelData = await prisma.userChannelData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserChannelDataFindUniqueArgs>(args: SelectSubset<T, UserChannelDataFindUniqueArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserChannelData that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserChannelDataFindUniqueOrThrowArgs} args - Arguments to find a UserChannelData
     * @example
     * // Get one UserChannelData
     * const userChannelData = await prisma.userChannelData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserChannelDataFindUniqueOrThrowArgs>(args: SelectSubset<T, UserChannelDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserChannelData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataFindFirstArgs} args - Arguments to find a UserChannelData
     * @example
     * // Get one UserChannelData
     * const userChannelData = await prisma.userChannelData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserChannelDataFindFirstArgs>(args?: SelectSubset<T, UserChannelDataFindFirstArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserChannelData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataFindFirstOrThrowArgs} args - Arguments to find a UserChannelData
     * @example
     * // Get one UserChannelData
     * const userChannelData = await prisma.userChannelData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserChannelDataFindFirstOrThrowArgs>(args?: SelectSubset<T, UserChannelDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserChannelData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserChannelData
     * const userChannelData = await prisma.userChannelData.findMany()
     * 
     * // Get first 10 UserChannelData
     * const userChannelData = await prisma.userChannelData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userChannelDataWithIdOnly = await prisma.userChannelData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserChannelDataFindManyArgs>(args?: SelectSubset<T, UserChannelDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserChannelData.
     * @param {UserChannelDataCreateArgs} args - Arguments to create a UserChannelData.
     * @example
     * // Create one UserChannelData
     * const UserChannelData = await prisma.userChannelData.create({
     *   data: {
     *     // ... data to create a UserChannelData
     *   }
     * })
     * 
     */
    create<T extends UserChannelDataCreateArgs>(args: SelectSubset<T, UserChannelDataCreateArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserChannelData.
     * @param {UserChannelDataCreateManyArgs} args - Arguments to create many UserChannelData.
     * @example
     * // Create many UserChannelData
     * const userChannelData = await prisma.userChannelData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserChannelDataCreateManyArgs>(args?: SelectSubset<T, UserChannelDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserChannelData.
     * @param {UserChannelDataDeleteArgs} args - Arguments to delete one UserChannelData.
     * @example
     * // Delete one UserChannelData
     * const UserChannelData = await prisma.userChannelData.delete({
     *   where: {
     *     // ... filter to delete one UserChannelData
     *   }
     * })
     * 
     */
    delete<T extends UserChannelDataDeleteArgs>(args: SelectSubset<T, UserChannelDataDeleteArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserChannelData.
     * @param {UserChannelDataUpdateArgs} args - Arguments to update one UserChannelData.
     * @example
     * // Update one UserChannelData
     * const userChannelData = await prisma.userChannelData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserChannelDataUpdateArgs>(args: SelectSubset<T, UserChannelDataUpdateArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserChannelData.
     * @param {UserChannelDataDeleteManyArgs} args - Arguments to filter UserChannelData to delete.
     * @example
     * // Delete a few UserChannelData
     * const { count } = await prisma.userChannelData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserChannelDataDeleteManyArgs>(args?: SelectSubset<T, UserChannelDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserChannelData
     * const userChannelData = await prisma.userChannelData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserChannelDataUpdateManyArgs>(args: SelectSubset<T, UserChannelDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserChannelData.
     * @param {UserChannelDataUpsertArgs} args - Arguments to update or create a UserChannelData.
     * @example
     * // Update or create a UserChannelData
     * const userChannelData = await prisma.userChannelData.upsert({
     *   create: {
     *     // ... data to create a UserChannelData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserChannelData we want to update
     *   }
     * })
     */
    upsert<T extends UserChannelDataUpsertArgs>(args: SelectSubset<T, UserChannelDataUpsertArgs<ExtArgs>>): Prisma__UserChannelDataClient<$Result.GetResult<Prisma.$UserChannelDataPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more UserChannelData that matches the filter.
     * @param {UserChannelDataFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const userChannelData = await prisma.userChannelData.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: UserChannelDataFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a UserChannelData.
     * @param {UserChannelDataAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const userChannelData = await prisma.userChannelData.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserChannelDataAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of UserChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataCountArgs} args - Arguments to filter UserChannelData to count.
     * @example
     * // Count the number of UserChannelData
     * const count = await prisma.userChannelData.count({
     *   where: {
     *     // ... the filter for the UserChannelData we want to count
     *   }
     * })
    **/
    count<T extends UserChannelDataCountArgs>(
      args?: Subset<T, UserChannelDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserChannelDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserChannelDataAggregateArgs>(args: Subset<T, UserChannelDataAggregateArgs>): Prisma.PrismaPromise<GetUserChannelDataAggregateType<T>>

    /**
     * Group by UserChannelData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserChannelDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserChannelDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserChannelDataGroupByArgs['orderBy'] }
        : { orderBy?: UserChannelDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserChannelDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserChannelDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserChannelData model
   */
  readonly fields: UserChannelDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserChannelData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserChannelDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserChannelData model
   */ 
  interface UserChannelDataFieldRefs {
    readonly id: FieldRef<"UserChannelData", 'String'>
    readonly channelId: FieldRef<"UserChannelData", 'String'>
    readonly key: FieldRef<"UserChannelData", 'String'>
    readonly version: FieldRef<"UserChannelData", 'String'>
    readonly type: FieldRef<"UserChannelData", 'E_DATA_TYPES'>
    readonly object: FieldRef<"UserChannelData", 'Json'>
    readonly value: FieldRef<"UserChannelData", 'String'>
    readonly values: FieldRef<"UserChannelData", 'String[]'>
    readonly ownerId: FieldRef<"UserChannelData", 'String'>
    readonly createdAt: FieldRef<"UserChannelData", 'DateTime'>
    readonly updatedAt: FieldRef<"UserChannelData", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserChannelData findUnique
   */
  export type UserChannelDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which UserChannelData to fetch.
     */
    where: UserChannelDataWhereUniqueInput
  }

  /**
   * UserChannelData findUniqueOrThrow
   */
  export type UserChannelDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which UserChannelData to fetch.
     */
    where: UserChannelDataWhereUniqueInput
  }

  /**
   * UserChannelData findFirst
   */
  export type UserChannelDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which UserChannelData to fetch.
     */
    where?: UserChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserChannelData to fetch.
     */
    orderBy?: UserChannelDataOrderByWithRelationInput | UserChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserChannelData.
     */
    cursor?: UserChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserChannelData.
     */
    distinct?: UserChannelDataScalarFieldEnum | UserChannelDataScalarFieldEnum[]
  }

  /**
   * UserChannelData findFirstOrThrow
   */
  export type UserChannelDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which UserChannelData to fetch.
     */
    where?: UserChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserChannelData to fetch.
     */
    orderBy?: UserChannelDataOrderByWithRelationInput | UserChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserChannelData.
     */
    cursor?: UserChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserChannelData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserChannelData.
     */
    distinct?: UserChannelDataScalarFieldEnum | UserChannelDataScalarFieldEnum[]
  }

  /**
   * UserChannelData findMany
   */
  export type UserChannelDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter, which UserChannelData to fetch.
     */
    where?: UserChannelDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserChannelData to fetch.
     */
    orderBy?: UserChannelDataOrderByWithRelationInput | UserChannelDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserChannelData.
     */
    cursor?: UserChannelDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserChannelData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserChannelData.
     */
    skip?: number
    distinct?: UserChannelDataScalarFieldEnum | UserChannelDataScalarFieldEnum[]
  }

  /**
   * UserChannelData create
   */
  export type UserChannelDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * The data needed to create a UserChannelData.
     */
    data: XOR<UserChannelDataCreateInput, UserChannelDataUncheckedCreateInput>
  }

  /**
   * UserChannelData createMany
   */
  export type UserChannelDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserChannelData.
     */
    data: UserChannelDataCreateManyInput | UserChannelDataCreateManyInput[]
  }

  /**
   * UserChannelData update
   */
  export type UserChannelDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * The data needed to update a UserChannelData.
     */
    data: XOR<UserChannelDataUpdateInput, UserChannelDataUncheckedUpdateInput>
    /**
     * Choose, which UserChannelData to update.
     */
    where: UserChannelDataWhereUniqueInput
  }

  /**
   * UserChannelData updateMany
   */
  export type UserChannelDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserChannelData.
     */
    data: XOR<UserChannelDataUpdateManyMutationInput, UserChannelDataUncheckedUpdateManyInput>
    /**
     * Filter which UserChannelData to update
     */
    where?: UserChannelDataWhereInput
  }

  /**
   * UserChannelData upsert
   */
  export type UserChannelDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * The filter to search for the UserChannelData to update in case it exists.
     */
    where: UserChannelDataWhereUniqueInput
    /**
     * In case the UserChannelData found by the `where` argument doesn't exist, create a new UserChannelData with this data.
     */
    create: XOR<UserChannelDataCreateInput, UserChannelDataUncheckedCreateInput>
    /**
     * In case the UserChannelData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserChannelDataUpdateInput, UserChannelDataUncheckedUpdateInput>
  }

  /**
   * UserChannelData delete
   */
  export type UserChannelDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
    /**
     * Filter which UserChannelData to delete.
     */
    where: UserChannelDataWhereUniqueInput
  }

  /**
   * UserChannelData deleteMany
   */
  export type UserChannelDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserChannelData to delete
     */
    where?: UserChannelDataWhereInput
  }

  /**
   * UserChannelData findRaw
   */
  export type UserChannelDataFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserChannelData aggregateRaw
   */
  export type UserChannelDataAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserChannelData without action
   */
  export type UserChannelDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserChannelData
     */
    select?: UserChannelDataSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserChannelDataInclude<ExtArgs> | null
  }


  /**
   * Model ElementButtonLanguage
   */

  export type AggregateElementButtonLanguage = {
    _count: ElementButtonLanguageCountAggregateOutputType | null
    _min: ElementButtonLanguageMinAggregateOutputType | null
    _max: ElementButtonLanguageMaxAggregateOutputType | null
  }

  export type ElementButtonLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementButtonLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementButtonLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ElementButtonLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementButtonLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementButtonLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ElementButtonLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementButtonLanguage to aggregate.
     */
    where?: ElementButtonLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementButtonLanguages to fetch.
     */
    orderBy?: ElementButtonLanguageOrderByWithRelationInput | ElementButtonLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ElementButtonLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementButtonLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementButtonLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ElementButtonLanguages
    **/
    _count?: true | ElementButtonLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ElementButtonLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ElementButtonLanguageMaxAggregateInputType
  }

  export type GetElementButtonLanguageAggregateType<T extends ElementButtonLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateElementButtonLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateElementButtonLanguage[P]>
      : GetScalarType<T[P], AggregateElementButtonLanguage[P]>
  }




  export type ElementButtonLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ElementButtonLanguageWhereInput
    orderBy?: ElementButtonLanguageOrderByWithAggregationInput | ElementButtonLanguageOrderByWithAggregationInput[]
    by: ElementButtonLanguageScalarFieldEnum[] | ElementButtonLanguageScalarFieldEnum
    having?: ElementButtonLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ElementButtonLanguageCountAggregateInputType | true
    _min?: ElementButtonLanguageMinAggregateInputType
    _max?: ElementButtonLanguageMaxAggregateInputType
  }

  export type ElementButtonLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: ElementButtonLanguageCountAggregateOutputType | null
    _min: ElementButtonLanguageMinAggregateOutputType | null
    _max: ElementButtonLanguageMaxAggregateOutputType | null
  }

  type GetElementButtonLanguageGroupByPayload<T extends ElementButtonLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ElementButtonLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ElementButtonLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ElementButtonLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], ElementButtonLanguageGroupByOutputType[P]>
        }
      >
    >


  export type ElementButtonLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | ElementButtonContentDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["elementButtonLanguage"]>


  export type ElementButtonLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ElementButtonLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ElementButtonLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ElementButtonLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["elementButtonLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$ElementButtonContentPayload
    }
  }

  type ElementButtonLanguageGetPayload<S extends boolean | null | undefined | ElementButtonLanguageDefaultArgs> = $Result.GetResult<Prisma.$ElementButtonLanguagePayload, S>

  type ElementButtonLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ElementButtonLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ElementButtonLanguageCountAggregateInputType | true
    }

  export interface ElementButtonLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ElementButtonLanguage'], meta: { name: 'ElementButtonLanguage' } }
    /**
     * Find zero or one ElementButtonLanguage that matches the filter.
     * @param {ElementButtonLanguageFindUniqueArgs} args - Arguments to find a ElementButtonLanguage
     * @example
     * // Get one ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ElementButtonLanguageFindUniqueArgs>(args: SelectSubset<T, ElementButtonLanguageFindUniqueArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ElementButtonLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ElementButtonLanguageFindUniqueOrThrowArgs} args - Arguments to find a ElementButtonLanguage
     * @example
     * // Get one ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ElementButtonLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, ElementButtonLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ElementButtonLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageFindFirstArgs} args - Arguments to find a ElementButtonLanguage
     * @example
     * // Get one ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ElementButtonLanguageFindFirstArgs>(args?: SelectSubset<T, ElementButtonLanguageFindFirstArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ElementButtonLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageFindFirstOrThrowArgs} args - Arguments to find a ElementButtonLanguage
     * @example
     * // Get one ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ElementButtonLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, ElementButtonLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ElementButtonLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ElementButtonLanguages
     * const elementButtonLanguages = await prisma.elementButtonLanguage.findMany()
     * 
     * // Get first 10 ElementButtonLanguages
     * const elementButtonLanguages = await prisma.elementButtonLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const elementButtonLanguageWithIdOnly = await prisma.elementButtonLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ElementButtonLanguageFindManyArgs>(args?: SelectSubset<T, ElementButtonLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ElementButtonLanguage.
     * @param {ElementButtonLanguageCreateArgs} args - Arguments to create a ElementButtonLanguage.
     * @example
     * // Create one ElementButtonLanguage
     * const ElementButtonLanguage = await prisma.elementButtonLanguage.create({
     *   data: {
     *     // ... data to create a ElementButtonLanguage
     *   }
     * })
     * 
     */
    create<T extends ElementButtonLanguageCreateArgs>(args: SelectSubset<T, ElementButtonLanguageCreateArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ElementButtonLanguages.
     * @param {ElementButtonLanguageCreateManyArgs} args - Arguments to create many ElementButtonLanguages.
     * @example
     * // Create many ElementButtonLanguages
     * const elementButtonLanguage = await prisma.elementButtonLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ElementButtonLanguageCreateManyArgs>(args?: SelectSubset<T, ElementButtonLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ElementButtonLanguage.
     * @param {ElementButtonLanguageDeleteArgs} args - Arguments to delete one ElementButtonLanguage.
     * @example
     * // Delete one ElementButtonLanguage
     * const ElementButtonLanguage = await prisma.elementButtonLanguage.delete({
     *   where: {
     *     // ... filter to delete one ElementButtonLanguage
     *   }
     * })
     * 
     */
    delete<T extends ElementButtonLanguageDeleteArgs>(args: SelectSubset<T, ElementButtonLanguageDeleteArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ElementButtonLanguage.
     * @param {ElementButtonLanguageUpdateArgs} args - Arguments to update one ElementButtonLanguage.
     * @example
     * // Update one ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ElementButtonLanguageUpdateArgs>(args: SelectSubset<T, ElementButtonLanguageUpdateArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ElementButtonLanguages.
     * @param {ElementButtonLanguageDeleteManyArgs} args - Arguments to filter ElementButtonLanguages to delete.
     * @example
     * // Delete a few ElementButtonLanguages
     * const { count } = await prisma.elementButtonLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ElementButtonLanguageDeleteManyArgs>(args?: SelectSubset<T, ElementButtonLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElementButtonLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ElementButtonLanguages
     * const elementButtonLanguage = await prisma.elementButtonLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ElementButtonLanguageUpdateManyArgs>(args: SelectSubset<T, ElementButtonLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ElementButtonLanguage.
     * @param {ElementButtonLanguageUpsertArgs} args - Arguments to update or create a ElementButtonLanguage.
     * @example
     * // Update or create a ElementButtonLanguage
     * const elementButtonLanguage = await prisma.elementButtonLanguage.upsert({
     *   create: {
     *     // ... data to create a ElementButtonLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ElementButtonLanguage we want to update
     *   }
     * })
     */
    upsert<T extends ElementButtonLanguageUpsertArgs>(args: SelectSubset<T, ElementButtonLanguageUpsertArgs<ExtArgs>>): Prisma__ElementButtonLanguageClient<$Result.GetResult<Prisma.$ElementButtonLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ElementButtonLanguages that matches the filter.
     * @param {ElementButtonLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const elementButtonLanguage = await prisma.elementButtonLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ElementButtonLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ElementButtonLanguage.
     * @param {ElementButtonLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const elementButtonLanguage = await prisma.elementButtonLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ElementButtonLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ElementButtonLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageCountArgs} args - Arguments to filter ElementButtonLanguages to count.
     * @example
     * // Count the number of ElementButtonLanguages
     * const count = await prisma.elementButtonLanguage.count({
     *   where: {
     *     // ... the filter for the ElementButtonLanguages we want to count
     *   }
     * })
    **/
    count<T extends ElementButtonLanguageCountArgs>(
      args?: Subset<T, ElementButtonLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ElementButtonLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ElementButtonLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ElementButtonLanguageAggregateArgs>(args: Subset<T, ElementButtonLanguageAggregateArgs>): Prisma.PrismaPromise<GetElementButtonLanguageAggregateType<T>>

    /**
     * Group by ElementButtonLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementButtonLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ElementButtonLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ElementButtonLanguageGroupByArgs['orderBy'] }
        : { orderBy?: ElementButtonLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ElementButtonLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetElementButtonLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ElementButtonLanguage model
   */
  readonly fields: ElementButtonLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ElementButtonLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ElementButtonLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ElementButtonLanguage model
   */ 
  interface ElementButtonLanguageFieldRefs {
    readonly id: FieldRef<"ElementButtonLanguage", 'String'>
    readonly name: FieldRef<"ElementButtonLanguage", 'String'>
    readonly createdAt: FieldRef<"ElementButtonLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"ElementButtonLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ElementButtonLanguage findUnique
   */
  export type ElementButtonLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementButtonLanguage to fetch.
     */
    where: ElementButtonLanguageWhereUniqueInput
  }

  /**
   * ElementButtonLanguage findUniqueOrThrow
   */
  export type ElementButtonLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementButtonLanguage to fetch.
     */
    where: ElementButtonLanguageWhereUniqueInput
  }

  /**
   * ElementButtonLanguage findFirst
   */
  export type ElementButtonLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementButtonLanguage to fetch.
     */
    where?: ElementButtonLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementButtonLanguages to fetch.
     */
    orderBy?: ElementButtonLanguageOrderByWithRelationInput | ElementButtonLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementButtonLanguages.
     */
    cursor?: ElementButtonLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementButtonLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementButtonLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementButtonLanguages.
     */
    distinct?: ElementButtonLanguageScalarFieldEnum | ElementButtonLanguageScalarFieldEnum[]
  }

  /**
   * ElementButtonLanguage findFirstOrThrow
   */
  export type ElementButtonLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementButtonLanguage to fetch.
     */
    where?: ElementButtonLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementButtonLanguages to fetch.
     */
    orderBy?: ElementButtonLanguageOrderByWithRelationInput | ElementButtonLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementButtonLanguages.
     */
    cursor?: ElementButtonLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementButtonLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementButtonLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementButtonLanguages.
     */
    distinct?: ElementButtonLanguageScalarFieldEnum | ElementButtonLanguageScalarFieldEnum[]
  }

  /**
   * ElementButtonLanguage findMany
   */
  export type ElementButtonLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementButtonLanguages to fetch.
     */
    where?: ElementButtonLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementButtonLanguages to fetch.
     */
    orderBy?: ElementButtonLanguageOrderByWithRelationInput | ElementButtonLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ElementButtonLanguages.
     */
    cursor?: ElementButtonLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementButtonLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementButtonLanguages.
     */
    skip?: number
    distinct?: ElementButtonLanguageScalarFieldEnum | ElementButtonLanguageScalarFieldEnum[]
  }

  /**
   * ElementButtonLanguage create
   */
  export type ElementButtonLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a ElementButtonLanguage.
     */
    data: XOR<ElementButtonLanguageCreateInput, ElementButtonLanguageUncheckedCreateInput>
  }

  /**
   * ElementButtonLanguage createMany
   */
  export type ElementButtonLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ElementButtonLanguages.
     */
    data: ElementButtonLanguageCreateManyInput | ElementButtonLanguageCreateManyInput[]
  }

  /**
   * ElementButtonLanguage update
   */
  export type ElementButtonLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a ElementButtonLanguage.
     */
    data: XOR<ElementButtonLanguageUpdateInput, ElementButtonLanguageUncheckedUpdateInput>
    /**
     * Choose, which ElementButtonLanguage to update.
     */
    where: ElementButtonLanguageWhereUniqueInput
  }

  /**
   * ElementButtonLanguage updateMany
   */
  export type ElementButtonLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ElementButtonLanguages.
     */
    data: XOR<ElementButtonLanguageUpdateManyMutationInput, ElementButtonLanguageUncheckedUpdateManyInput>
    /**
     * Filter which ElementButtonLanguages to update
     */
    where?: ElementButtonLanguageWhereInput
  }

  /**
   * ElementButtonLanguage upsert
   */
  export type ElementButtonLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the ElementButtonLanguage to update in case it exists.
     */
    where: ElementButtonLanguageWhereUniqueInput
    /**
     * In case the ElementButtonLanguage found by the `where` argument doesn't exist, create a new ElementButtonLanguage with this data.
     */
    create: XOR<ElementButtonLanguageCreateInput, ElementButtonLanguageUncheckedCreateInput>
    /**
     * In case the ElementButtonLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ElementButtonLanguageUpdateInput, ElementButtonLanguageUncheckedUpdateInput>
  }

  /**
   * ElementButtonLanguage delete
   */
  export type ElementButtonLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
    /**
     * Filter which ElementButtonLanguage to delete.
     */
    where: ElementButtonLanguageWhereUniqueInput
  }

  /**
   * ElementButtonLanguage deleteMany
   */
  export type ElementButtonLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementButtonLanguages to delete
     */
    where?: ElementButtonLanguageWhereInput
  }

  /**
   * ElementButtonLanguage findRaw
   */
  export type ElementButtonLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementButtonLanguage aggregateRaw
   */
  export type ElementButtonLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementButtonLanguage without action
   */
  export type ElementButtonLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementButtonLanguage
     */
    select?: ElementButtonLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementButtonLanguageInclude<ExtArgs> | null
  }


  /**
   * Model ElementTextInputLanguage
   */

  export type AggregateElementTextInputLanguage = {
    _count: ElementTextInputLanguageCountAggregateOutputType | null
    _min: ElementTextInputLanguageMinAggregateOutputType | null
    _max: ElementTextInputLanguageMaxAggregateOutputType | null
  }

  export type ElementTextInputLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementTextInputLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementTextInputLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ElementTextInputLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementTextInputLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementTextInputLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ElementTextInputLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementTextInputLanguage to aggregate.
     */
    where?: ElementTextInputLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementTextInputLanguages to fetch.
     */
    orderBy?: ElementTextInputLanguageOrderByWithRelationInput | ElementTextInputLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ElementTextInputLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementTextInputLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementTextInputLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ElementTextInputLanguages
    **/
    _count?: true | ElementTextInputLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ElementTextInputLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ElementTextInputLanguageMaxAggregateInputType
  }

  export type GetElementTextInputLanguageAggregateType<T extends ElementTextInputLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateElementTextInputLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateElementTextInputLanguage[P]>
      : GetScalarType<T[P], AggregateElementTextInputLanguage[P]>
  }




  export type ElementTextInputLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ElementTextInputLanguageWhereInput
    orderBy?: ElementTextInputLanguageOrderByWithAggregationInput | ElementTextInputLanguageOrderByWithAggregationInput[]
    by: ElementTextInputLanguageScalarFieldEnum[] | ElementTextInputLanguageScalarFieldEnum
    having?: ElementTextInputLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ElementTextInputLanguageCountAggregateInputType | true
    _min?: ElementTextInputLanguageMinAggregateInputType
    _max?: ElementTextInputLanguageMaxAggregateInputType
  }

  export type ElementTextInputLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: ElementTextInputLanguageCountAggregateOutputType | null
    _min: ElementTextInputLanguageMinAggregateOutputType | null
    _max: ElementTextInputLanguageMaxAggregateOutputType | null
  }

  type GetElementTextInputLanguageGroupByPayload<T extends ElementTextInputLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ElementTextInputLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ElementTextInputLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ElementTextInputLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], ElementTextInputLanguageGroupByOutputType[P]>
        }
      >
    >


  export type ElementTextInputLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | ElementTextInputContentLanguageDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["elementTextInputLanguage"]>


  export type ElementTextInputLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ElementTextInputLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ElementTextInputLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ElementTextInputLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["elementTextInputLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$ElementTextInputContentLanguagePayload
    }
  }

  type ElementTextInputLanguageGetPayload<S extends boolean | null | undefined | ElementTextInputLanguageDefaultArgs> = $Result.GetResult<Prisma.$ElementTextInputLanguagePayload, S>

  type ElementTextInputLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ElementTextInputLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ElementTextInputLanguageCountAggregateInputType | true
    }

  export interface ElementTextInputLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ElementTextInputLanguage'], meta: { name: 'ElementTextInputLanguage' } }
    /**
     * Find zero or one ElementTextInputLanguage that matches the filter.
     * @param {ElementTextInputLanguageFindUniqueArgs} args - Arguments to find a ElementTextInputLanguage
     * @example
     * // Get one ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ElementTextInputLanguageFindUniqueArgs>(args: SelectSubset<T, ElementTextInputLanguageFindUniqueArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ElementTextInputLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ElementTextInputLanguageFindUniqueOrThrowArgs} args - Arguments to find a ElementTextInputLanguage
     * @example
     * // Get one ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ElementTextInputLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, ElementTextInputLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ElementTextInputLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageFindFirstArgs} args - Arguments to find a ElementTextInputLanguage
     * @example
     * // Get one ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ElementTextInputLanguageFindFirstArgs>(args?: SelectSubset<T, ElementTextInputLanguageFindFirstArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ElementTextInputLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageFindFirstOrThrowArgs} args - Arguments to find a ElementTextInputLanguage
     * @example
     * // Get one ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ElementTextInputLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, ElementTextInputLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ElementTextInputLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ElementTextInputLanguages
     * const elementTextInputLanguages = await prisma.elementTextInputLanguage.findMany()
     * 
     * // Get first 10 ElementTextInputLanguages
     * const elementTextInputLanguages = await prisma.elementTextInputLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const elementTextInputLanguageWithIdOnly = await prisma.elementTextInputLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ElementTextInputLanguageFindManyArgs>(args?: SelectSubset<T, ElementTextInputLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ElementTextInputLanguage.
     * @param {ElementTextInputLanguageCreateArgs} args - Arguments to create a ElementTextInputLanguage.
     * @example
     * // Create one ElementTextInputLanguage
     * const ElementTextInputLanguage = await prisma.elementTextInputLanguage.create({
     *   data: {
     *     // ... data to create a ElementTextInputLanguage
     *   }
     * })
     * 
     */
    create<T extends ElementTextInputLanguageCreateArgs>(args: SelectSubset<T, ElementTextInputLanguageCreateArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ElementTextInputLanguages.
     * @param {ElementTextInputLanguageCreateManyArgs} args - Arguments to create many ElementTextInputLanguages.
     * @example
     * // Create many ElementTextInputLanguages
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ElementTextInputLanguageCreateManyArgs>(args?: SelectSubset<T, ElementTextInputLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ElementTextInputLanguage.
     * @param {ElementTextInputLanguageDeleteArgs} args - Arguments to delete one ElementTextInputLanguage.
     * @example
     * // Delete one ElementTextInputLanguage
     * const ElementTextInputLanguage = await prisma.elementTextInputLanguage.delete({
     *   where: {
     *     // ... filter to delete one ElementTextInputLanguage
     *   }
     * })
     * 
     */
    delete<T extends ElementTextInputLanguageDeleteArgs>(args: SelectSubset<T, ElementTextInputLanguageDeleteArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ElementTextInputLanguage.
     * @param {ElementTextInputLanguageUpdateArgs} args - Arguments to update one ElementTextInputLanguage.
     * @example
     * // Update one ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ElementTextInputLanguageUpdateArgs>(args: SelectSubset<T, ElementTextInputLanguageUpdateArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ElementTextInputLanguages.
     * @param {ElementTextInputLanguageDeleteManyArgs} args - Arguments to filter ElementTextInputLanguages to delete.
     * @example
     * // Delete a few ElementTextInputLanguages
     * const { count } = await prisma.elementTextInputLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ElementTextInputLanguageDeleteManyArgs>(args?: SelectSubset<T, ElementTextInputLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElementTextInputLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ElementTextInputLanguages
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ElementTextInputLanguageUpdateManyArgs>(args: SelectSubset<T, ElementTextInputLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ElementTextInputLanguage.
     * @param {ElementTextInputLanguageUpsertArgs} args - Arguments to update or create a ElementTextInputLanguage.
     * @example
     * // Update or create a ElementTextInputLanguage
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.upsert({
     *   create: {
     *     // ... data to create a ElementTextInputLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ElementTextInputLanguage we want to update
     *   }
     * })
     */
    upsert<T extends ElementTextInputLanguageUpsertArgs>(args: SelectSubset<T, ElementTextInputLanguageUpsertArgs<ExtArgs>>): Prisma__ElementTextInputLanguageClient<$Result.GetResult<Prisma.$ElementTextInputLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ElementTextInputLanguages that matches the filter.
     * @param {ElementTextInputLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ElementTextInputLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ElementTextInputLanguage.
     * @param {ElementTextInputLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const elementTextInputLanguage = await prisma.elementTextInputLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ElementTextInputLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ElementTextInputLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageCountArgs} args - Arguments to filter ElementTextInputLanguages to count.
     * @example
     * // Count the number of ElementTextInputLanguages
     * const count = await prisma.elementTextInputLanguage.count({
     *   where: {
     *     // ... the filter for the ElementTextInputLanguages we want to count
     *   }
     * })
    **/
    count<T extends ElementTextInputLanguageCountArgs>(
      args?: Subset<T, ElementTextInputLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ElementTextInputLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ElementTextInputLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ElementTextInputLanguageAggregateArgs>(args: Subset<T, ElementTextInputLanguageAggregateArgs>): Prisma.PrismaPromise<GetElementTextInputLanguageAggregateType<T>>

    /**
     * Group by ElementTextInputLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementTextInputLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ElementTextInputLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ElementTextInputLanguageGroupByArgs['orderBy'] }
        : { orderBy?: ElementTextInputLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ElementTextInputLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetElementTextInputLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ElementTextInputLanguage model
   */
  readonly fields: ElementTextInputLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ElementTextInputLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ElementTextInputLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ElementTextInputLanguage model
   */ 
  interface ElementTextInputLanguageFieldRefs {
    readonly id: FieldRef<"ElementTextInputLanguage", 'String'>
    readonly name: FieldRef<"ElementTextInputLanguage", 'String'>
    readonly createdAt: FieldRef<"ElementTextInputLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"ElementTextInputLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ElementTextInputLanguage findUnique
   */
  export type ElementTextInputLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementTextInputLanguage to fetch.
     */
    where: ElementTextInputLanguageWhereUniqueInput
  }

  /**
   * ElementTextInputLanguage findUniqueOrThrow
   */
  export type ElementTextInputLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementTextInputLanguage to fetch.
     */
    where: ElementTextInputLanguageWhereUniqueInput
  }

  /**
   * ElementTextInputLanguage findFirst
   */
  export type ElementTextInputLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementTextInputLanguage to fetch.
     */
    where?: ElementTextInputLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementTextInputLanguages to fetch.
     */
    orderBy?: ElementTextInputLanguageOrderByWithRelationInput | ElementTextInputLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementTextInputLanguages.
     */
    cursor?: ElementTextInputLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementTextInputLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementTextInputLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementTextInputLanguages.
     */
    distinct?: ElementTextInputLanguageScalarFieldEnum | ElementTextInputLanguageScalarFieldEnum[]
  }

  /**
   * ElementTextInputLanguage findFirstOrThrow
   */
  export type ElementTextInputLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementTextInputLanguage to fetch.
     */
    where?: ElementTextInputLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementTextInputLanguages to fetch.
     */
    orderBy?: ElementTextInputLanguageOrderByWithRelationInput | ElementTextInputLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementTextInputLanguages.
     */
    cursor?: ElementTextInputLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementTextInputLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementTextInputLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementTextInputLanguages.
     */
    distinct?: ElementTextInputLanguageScalarFieldEnum | ElementTextInputLanguageScalarFieldEnum[]
  }

  /**
   * ElementTextInputLanguage findMany
   */
  export type ElementTextInputLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementTextInputLanguages to fetch.
     */
    where?: ElementTextInputLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementTextInputLanguages to fetch.
     */
    orderBy?: ElementTextInputLanguageOrderByWithRelationInput | ElementTextInputLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ElementTextInputLanguages.
     */
    cursor?: ElementTextInputLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementTextInputLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementTextInputLanguages.
     */
    skip?: number
    distinct?: ElementTextInputLanguageScalarFieldEnum | ElementTextInputLanguageScalarFieldEnum[]
  }

  /**
   * ElementTextInputLanguage create
   */
  export type ElementTextInputLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a ElementTextInputLanguage.
     */
    data: XOR<ElementTextInputLanguageCreateInput, ElementTextInputLanguageUncheckedCreateInput>
  }

  /**
   * ElementTextInputLanguage createMany
   */
  export type ElementTextInputLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ElementTextInputLanguages.
     */
    data: ElementTextInputLanguageCreateManyInput | ElementTextInputLanguageCreateManyInput[]
  }

  /**
   * ElementTextInputLanguage update
   */
  export type ElementTextInputLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a ElementTextInputLanguage.
     */
    data: XOR<ElementTextInputLanguageUpdateInput, ElementTextInputLanguageUncheckedUpdateInput>
    /**
     * Choose, which ElementTextInputLanguage to update.
     */
    where: ElementTextInputLanguageWhereUniqueInput
  }

  /**
   * ElementTextInputLanguage updateMany
   */
  export type ElementTextInputLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ElementTextInputLanguages.
     */
    data: XOR<ElementTextInputLanguageUpdateManyMutationInput, ElementTextInputLanguageUncheckedUpdateManyInput>
    /**
     * Filter which ElementTextInputLanguages to update
     */
    where?: ElementTextInputLanguageWhereInput
  }

  /**
   * ElementTextInputLanguage upsert
   */
  export type ElementTextInputLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the ElementTextInputLanguage to update in case it exists.
     */
    where: ElementTextInputLanguageWhereUniqueInput
    /**
     * In case the ElementTextInputLanguage found by the `where` argument doesn't exist, create a new ElementTextInputLanguage with this data.
     */
    create: XOR<ElementTextInputLanguageCreateInput, ElementTextInputLanguageUncheckedCreateInput>
    /**
     * In case the ElementTextInputLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ElementTextInputLanguageUpdateInput, ElementTextInputLanguageUncheckedUpdateInput>
  }

  /**
   * ElementTextInputLanguage delete
   */
  export type ElementTextInputLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
    /**
     * Filter which ElementTextInputLanguage to delete.
     */
    where: ElementTextInputLanguageWhereUniqueInput
  }

  /**
   * ElementTextInputLanguage deleteMany
   */
  export type ElementTextInputLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementTextInputLanguages to delete
     */
    where?: ElementTextInputLanguageWhereInput
  }

  /**
   * ElementTextInputLanguage findRaw
   */
  export type ElementTextInputLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementTextInputLanguage aggregateRaw
   */
  export type ElementTextInputLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementTextInputLanguage without action
   */
  export type ElementTextInputLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementTextInputLanguage
     */
    select?: ElementTextInputLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementTextInputLanguageInclude<ExtArgs> | null
  }


  /**
   * Model ElementSelectMenuLanguage
   */

  export type AggregateElementSelectMenuLanguage = {
    _count: ElementSelectMenuLanguageCountAggregateOutputType | null
    _min: ElementSelectMenuLanguageMinAggregateOutputType | null
    _max: ElementSelectMenuLanguageMaxAggregateOutputType | null
  }

  export type ElementSelectMenuLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementSelectMenuLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ElementSelectMenuLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ElementSelectMenuLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementSelectMenuLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ElementSelectMenuLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ElementSelectMenuLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementSelectMenuLanguage to aggregate.
     */
    where?: ElementSelectMenuLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementSelectMenuLanguages to fetch.
     */
    orderBy?: ElementSelectMenuLanguageOrderByWithRelationInput | ElementSelectMenuLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ElementSelectMenuLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementSelectMenuLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementSelectMenuLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ElementSelectMenuLanguages
    **/
    _count?: true | ElementSelectMenuLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ElementSelectMenuLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ElementSelectMenuLanguageMaxAggregateInputType
  }

  export type GetElementSelectMenuLanguageAggregateType<T extends ElementSelectMenuLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateElementSelectMenuLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateElementSelectMenuLanguage[P]>
      : GetScalarType<T[P], AggregateElementSelectMenuLanguage[P]>
  }




  export type ElementSelectMenuLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ElementSelectMenuLanguageWhereInput
    orderBy?: ElementSelectMenuLanguageOrderByWithAggregationInput | ElementSelectMenuLanguageOrderByWithAggregationInput[]
    by: ElementSelectMenuLanguageScalarFieldEnum[] | ElementSelectMenuLanguageScalarFieldEnum
    having?: ElementSelectMenuLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ElementSelectMenuLanguageCountAggregateInputType | true
    _min?: ElementSelectMenuLanguageMinAggregateInputType
    _max?: ElementSelectMenuLanguageMaxAggregateInputType
  }

  export type ElementSelectMenuLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: ElementSelectMenuLanguageCountAggregateOutputType | null
    _min: ElementSelectMenuLanguageMinAggregateOutputType | null
    _max: ElementSelectMenuLanguageMaxAggregateOutputType | null
  }

  type GetElementSelectMenuLanguageGroupByPayload<T extends ElementSelectMenuLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ElementSelectMenuLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ElementSelectMenuLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ElementSelectMenuLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], ElementSelectMenuLanguageGroupByOutputType[P]>
        }
      >
    >


  export type ElementSelectMenuLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | ElementSelectMenuLanguageContentDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["elementSelectMenuLanguage"]>


  export type ElementSelectMenuLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ElementSelectMenuLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ElementSelectMenuLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ElementSelectMenuLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["elementSelectMenuLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$ElementSelectMenuLanguageContentPayload
    }
  }

  type ElementSelectMenuLanguageGetPayload<S extends boolean | null | undefined | ElementSelectMenuLanguageDefaultArgs> = $Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload, S>

  type ElementSelectMenuLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ElementSelectMenuLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ElementSelectMenuLanguageCountAggregateInputType | true
    }

  export interface ElementSelectMenuLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ElementSelectMenuLanguage'], meta: { name: 'ElementSelectMenuLanguage' } }
    /**
     * Find zero or one ElementSelectMenuLanguage that matches the filter.
     * @param {ElementSelectMenuLanguageFindUniqueArgs} args - Arguments to find a ElementSelectMenuLanguage
     * @example
     * // Get one ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ElementSelectMenuLanguageFindUniqueArgs>(args: SelectSubset<T, ElementSelectMenuLanguageFindUniqueArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ElementSelectMenuLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ElementSelectMenuLanguageFindUniqueOrThrowArgs} args - Arguments to find a ElementSelectMenuLanguage
     * @example
     * // Get one ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ElementSelectMenuLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, ElementSelectMenuLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ElementSelectMenuLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageFindFirstArgs} args - Arguments to find a ElementSelectMenuLanguage
     * @example
     * // Get one ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ElementSelectMenuLanguageFindFirstArgs>(args?: SelectSubset<T, ElementSelectMenuLanguageFindFirstArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ElementSelectMenuLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageFindFirstOrThrowArgs} args - Arguments to find a ElementSelectMenuLanguage
     * @example
     * // Get one ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ElementSelectMenuLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, ElementSelectMenuLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ElementSelectMenuLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ElementSelectMenuLanguages
     * const elementSelectMenuLanguages = await prisma.elementSelectMenuLanguage.findMany()
     * 
     * // Get first 10 ElementSelectMenuLanguages
     * const elementSelectMenuLanguages = await prisma.elementSelectMenuLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const elementSelectMenuLanguageWithIdOnly = await prisma.elementSelectMenuLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ElementSelectMenuLanguageFindManyArgs>(args?: SelectSubset<T, ElementSelectMenuLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ElementSelectMenuLanguage.
     * @param {ElementSelectMenuLanguageCreateArgs} args - Arguments to create a ElementSelectMenuLanguage.
     * @example
     * // Create one ElementSelectMenuLanguage
     * const ElementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.create({
     *   data: {
     *     // ... data to create a ElementSelectMenuLanguage
     *   }
     * })
     * 
     */
    create<T extends ElementSelectMenuLanguageCreateArgs>(args: SelectSubset<T, ElementSelectMenuLanguageCreateArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ElementSelectMenuLanguages.
     * @param {ElementSelectMenuLanguageCreateManyArgs} args - Arguments to create many ElementSelectMenuLanguages.
     * @example
     * // Create many ElementSelectMenuLanguages
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ElementSelectMenuLanguageCreateManyArgs>(args?: SelectSubset<T, ElementSelectMenuLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ElementSelectMenuLanguage.
     * @param {ElementSelectMenuLanguageDeleteArgs} args - Arguments to delete one ElementSelectMenuLanguage.
     * @example
     * // Delete one ElementSelectMenuLanguage
     * const ElementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.delete({
     *   where: {
     *     // ... filter to delete one ElementSelectMenuLanguage
     *   }
     * })
     * 
     */
    delete<T extends ElementSelectMenuLanguageDeleteArgs>(args: SelectSubset<T, ElementSelectMenuLanguageDeleteArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ElementSelectMenuLanguage.
     * @param {ElementSelectMenuLanguageUpdateArgs} args - Arguments to update one ElementSelectMenuLanguage.
     * @example
     * // Update one ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ElementSelectMenuLanguageUpdateArgs>(args: SelectSubset<T, ElementSelectMenuLanguageUpdateArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ElementSelectMenuLanguages.
     * @param {ElementSelectMenuLanguageDeleteManyArgs} args - Arguments to filter ElementSelectMenuLanguages to delete.
     * @example
     * // Delete a few ElementSelectMenuLanguages
     * const { count } = await prisma.elementSelectMenuLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ElementSelectMenuLanguageDeleteManyArgs>(args?: SelectSubset<T, ElementSelectMenuLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElementSelectMenuLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ElementSelectMenuLanguages
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ElementSelectMenuLanguageUpdateManyArgs>(args: SelectSubset<T, ElementSelectMenuLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ElementSelectMenuLanguage.
     * @param {ElementSelectMenuLanguageUpsertArgs} args - Arguments to update or create a ElementSelectMenuLanguage.
     * @example
     * // Update or create a ElementSelectMenuLanguage
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.upsert({
     *   create: {
     *     // ... data to create a ElementSelectMenuLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ElementSelectMenuLanguage we want to update
     *   }
     * })
     */
    upsert<T extends ElementSelectMenuLanguageUpsertArgs>(args: SelectSubset<T, ElementSelectMenuLanguageUpsertArgs<ExtArgs>>): Prisma__ElementSelectMenuLanguageClient<$Result.GetResult<Prisma.$ElementSelectMenuLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ElementSelectMenuLanguages that matches the filter.
     * @param {ElementSelectMenuLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ElementSelectMenuLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ElementSelectMenuLanguage.
     * @param {ElementSelectMenuLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const elementSelectMenuLanguage = await prisma.elementSelectMenuLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ElementSelectMenuLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ElementSelectMenuLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageCountArgs} args - Arguments to filter ElementSelectMenuLanguages to count.
     * @example
     * // Count the number of ElementSelectMenuLanguages
     * const count = await prisma.elementSelectMenuLanguage.count({
     *   where: {
     *     // ... the filter for the ElementSelectMenuLanguages we want to count
     *   }
     * })
    **/
    count<T extends ElementSelectMenuLanguageCountArgs>(
      args?: Subset<T, ElementSelectMenuLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ElementSelectMenuLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ElementSelectMenuLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ElementSelectMenuLanguageAggregateArgs>(args: Subset<T, ElementSelectMenuLanguageAggregateArgs>): Prisma.PrismaPromise<GetElementSelectMenuLanguageAggregateType<T>>

    /**
     * Group by ElementSelectMenuLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementSelectMenuLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ElementSelectMenuLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ElementSelectMenuLanguageGroupByArgs['orderBy'] }
        : { orderBy?: ElementSelectMenuLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ElementSelectMenuLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetElementSelectMenuLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ElementSelectMenuLanguage model
   */
  readonly fields: ElementSelectMenuLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ElementSelectMenuLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ElementSelectMenuLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ElementSelectMenuLanguage model
   */ 
  interface ElementSelectMenuLanguageFieldRefs {
    readonly id: FieldRef<"ElementSelectMenuLanguage", 'String'>
    readonly name: FieldRef<"ElementSelectMenuLanguage", 'String'>
    readonly createdAt: FieldRef<"ElementSelectMenuLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"ElementSelectMenuLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ElementSelectMenuLanguage findUnique
   */
  export type ElementSelectMenuLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementSelectMenuLanguage to fetch.
     */
    where: ElementSelectMenuLanguageWhereUniqueInput
  }

  /**
   * ElementSelectMenuLanguage findUniqueOrThrow
   */
  export type ElementSelectMenuLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementSelectMenuLanguage to fetch.
     */
    where: ElementSelectMenuLanguageWhereUniqueInput
  }

  /**
   * ElementSelectMenuLanguage findFirst
   */
  export type ElementSelectMenuLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementSelectMenuLanguage to fetch.
     */
    where?: ElementSelectMenuLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementSelectMenuLanguages to fetch.
     */
    orderBy?: ElementSelectMenuLanguageOrderByWithRelationInput | ElementSelectMenuLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementSelectMenuLanguages.
     */
    cursor?: ElementSelectMenuLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementSelectMenuLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementSelectMenuLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementSelectMenuLanguages.
     */
    distinct?: ElementSelectMenuLanguageScalarFieldEnum | ElementSelectMenuLanguageScalarFieldEnum[]
  }

  /**
   * ElementSelectMenuLanguage findFirstOrThrow
   */
  export type ElementSelectMenuLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementSelectMenuLanguage to fetch.
     */
    where?: ElementSelectMenuLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementSelectMenuLanguages to fetch.
     */
    orderBy?: ElementSelectMenuLanguageOrderByWithRelationInput | ElementSelectMenuLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ElementSelectMenuLanguages.
     */
    cursor?: ElementSelectMenuLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementSelectMenuLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementSelectMenuLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ElementSelectMenuLanguages.
     */
    distinct?: ElementSelectMenuLanguageScalarFieldEnum | ElementSelectMenuLanguageScalarFieldEnum[]
  }

  /**
   * ElementSelectMenuLanguage findMany
   */
  export type ElementSelectMenuLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ElementSelectMenuLanguages to fetch.
     */
    where?: ElementSelectMenuLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ElementSelectMenuLanguages to fetch.
     */
    orderBy?: ElementSelectMenuLanguageOrderByWithRelationInput | ElementSelectMenuLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ElementSelectMenuLanguages.
     */
    cursor?: ElementSelectMenuLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ElementSelectMenuLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ElementSelectMenuLanguages.
     */
    skip?: number
    distinct?: ElementSelectMenuLanguageScalarFieldEnum | ElementSelectMenuLanguageScalarFieldEnum[]
  }

  /**
   * ElementSelectMenuLanguage create
   */
  export type ElementSelectMenuLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a ElementSelectMenuLanguage.
     */
    data: XOR<ElementSelectMenuLanguageCreateInput, ElementSelectMenuLanguageUncheckedCreateInput>
  }

  /**
   * ElementSelectMenuLanguage createMany
   */
  export type ElementSelectMenuLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ElementSelectMenuLanguages.
     */
    data: ElementSelectMenuLanguageCreateManyInput | ElementSelectMenuLanguageCreateManyInput[]
  }

  /**
   * ElementSelectMenuLanguage update
   */
  export type ElementSelectMenuLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a ElementSelectMenuLanguage.
     */
    data: XOR<ElementSelectMenuLanguageUpdateInput, ElementSelectMenuLanguageUncheckedUpdateInput>
    /**
     * Choose, which ElementSelectMenuLanguage to update.
     */
    where: ElementSelectMenuLanguageWhereUniqueInput
  }

  /**
   * ElementSelectMenuLanguage updateMany
   */
  export type ElementSelectMenuLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ElementSelectMenuLanguages.
     */
    data: XOR<ElementSelectMenuLanguageUpdateManyMutationInput, ElementSelectMenuLanguageUncheckedUpdateManyInput>
    /**
     * Filter which ElementSelectMenuLanguages to update
     */
    where?: ElementSelectMenuLanguageWhereInput
  }

  /**
   * ElementSelectMenuLanguage upsert
   */
  export type ElementSelectMenuLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the ElementSelectMenuLanguage to update in case it exists.
     */
    where: ElementSelectMenuLanguageWhereUniqueInput
    /**
     * In case the ElementSelectMenuLanguage found by the `where` argument doesn't exist, create a new ElementSelectMenuLanguage with this data.
     */
    create: XOR<ElementSelectMenuLanguageCreateInput, ElementSelectMenuLanguageUncheckedCreateInput>
    /**
     * In case the ElementSelectMenuLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ElementSelectMenuLanguageUpdateInput, ElementSelectMenuLanguageUncheckedUpdateInput>
  }

  /**
   * ElementSelectMenuLanguage delete
   */
  export type ElementSelectMenuLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
    /**
     * Filter which ElementSelectMenuLanguage to delete.
     */
    where: ElementSelectMenuLanguageWhereUniqueInput
  }

  /**
   * ElementSelectMenuLanguage deleteMany
   */
  export type ElementSelectMenuLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ElementSelectMenuLanguages to delete
     */
    where?: ElementSelectMenuLanguageWhereInput
  }

  /**
   * ElementSelectMenuLanguage findRaw
   */
  export type ElementSelectMenuLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementSelectMenuLanguage aggregateRaw
   */
  export type ElementSelectMenuLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ElementSelectMenuLanguage without action
   */
  export type ElementSelectMenuLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementSelectMenuLanguage
     */
    select?: ElementSelectMenuLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ElementSelectMenuLanguageInclude<ExtArgs> | null
  }


  /**
   * Model EmbedLanguage
   */

  export type AggregateEmbedLanguage = {
    _count: EmbedLanguageCountAggregateOutputType | null
    _min: EmbedLanguageMinAggregateOutputType | null
    _max: EmbedLanguageMaxAggregateOutputType | null
  }

  export type EmbedLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmbedLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmbedLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EmbedLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmbedLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmbedLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EmbedLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmbedLanguage to aggregate.
     */
    where?: EmbedLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbedLanguages to fetch.
     */
    orderBy?: EmbedLanguageOrderByWithRelationInput | EmbedLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmbedLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbedLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbedLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmbedLanguages
    **/
    _count?: true | EmbedLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmbedLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmbedLanguageMaxAggregateInputType
  }

  export type GetEmbedLanguageAggregateType<T extends EmbedLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateEmbedLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmbedLanguage[P]>
      : GetScalarType<T[P], AggregateEmbedLanguage[P]>
  }




  export type EmbedLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbedLanguageWhereInput
    orderBy?: EmbedLanguageOrderByWithAggregationInput | EmbedLanguageOrderByWithAggregationInput[]
    by: EmbedLanguageScalarFieldEnum[] | EmbedLanguageScalarFieldEnum
    having?: EmbedLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmbedLanguageCountAggregateInputType | true
    _min?: EmbedLanguageMinAggregateInputType
    _max?: EmbedLanguageMaxAggregateInputType
  }

  export type EmbedLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: EmbedLanguageCountAggregateOutputType | null
    _min: EmbedLanguageMinAggregateOutputType | null
    _max: EmbedLanguageMaxAggregateOutputType | null
  }

  type GetEmbedLanguageGroupByPayload<T extends EmbedLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmbedLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmbedLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmbedLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], EmbedLanguageGroupByOutputType[P]>
        }
      >
    >


  export type EmbedLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | EmbedContentLanguageDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["embedLanguage"]>


  export type EmbedLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EmbedLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EmbedLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmbedLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["embedLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$EmbedContentLanguagePayload
    }
  }

  type EmbedLanguageGetPayload<S extends boolean | null | undefined | EmbedLanguageDefaultArgs> = $Result.GetResult<Prisma.$EmbedLanguagePayload, S>

  type EmbedLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmbedLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmbedLanguageCountAggregateInputType | true
    }

  export interface EmbedLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmbedLanguage'], meta: { name: 'EmbedLanguage' } }
    /**
     * Find zero or one EmbedLanguage that matches the filter.
     * @param {EmbedLanguageFindUniqueArgs} args - Arguments to find a EmbedLanguage
     * @example
     * // Get one EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmbedLanguageFindUniqueArgs>(args: SelectSubset<T, EmbedLanguageFindUniqueArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EmbedLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmbedLanguageFindUniqueOrThrowArgs} args - Arguments to find a EmbedLanguage
     * @example
     * // Get one EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmbedLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, EmbedLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EmbedLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageFindFirstArgs} args - Arguments to find a EmbedLanguage
     * @example
     * // Get one EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmbedLanguageFindFirstArgs>(args?: SelectSubset<T, EmbedLanguageFindFirstArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EmbedLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageFindFirstOrThrowArgs} args - Arguments to find a EmbedLanguage
     * @example
     * // Get one EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmbedLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, EmbedLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EmbedLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmbedLanguages
     * const embedLanguages = await prisma.embedLanguage.findMany()
     * 
     * // Get first 10 EmbedLanguages
     * const embedLanguages = await prisma.embedLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const embedLanguageWithIdOnly = await prisma.embedLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmbedLanguageFindManyArgs>(args?: SelectSubset<T, EmbedLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EmbedLanguage.
     * @param {EmbedLanguageCreateArgs} args - Arguments to create a EmbedLanguage.
     * @example
     * // Create one EmbedLanguage
     * const EmbedLanguage = await prisma.embedLanguage.create({
     *   data: {
     *     // ... data to create a EmbedLanguage
     *   }
     * })
     * 
     */
    create<T extends EmbedLanguageCreateArgs>(args: SelectSubset<T, EmbedLanguageCreateArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EmbedLanguages.
     * @param {EmbedLanguageCreateManyArgs} args - Arguments to create many EmbedLanguages.
     * @example
     * // Create many EmbedLanguages
     * const embedLanguage = await prisma.embedLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmbedLanguageCreateManyArgs>(args?: SelectSubset<T, EmbedLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EmbedLanguage.
     * @param {EmbedLanguageDeleteArgs} args - Arguments to delete one EmbedLanguage.
     * @example
     * // Delete one EmbedLanguage
     * const EmbedLanguage = await prisma.embedLanguage.delete({
     *   where: {
     *     // ... filter to delete one EmbedLanguage
     *   }
     * })
     * 
     */
    delete<T extends EmbedLanguageDeleteArgs>(args: SelectSubset<T, EmbedLanguageDeleteArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EmbedLanguage.
     * @param {EmbedLanguageUpdateArgs} args - Arguments to update one EmbedLanguage.
     * @example
     * // Update one EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmbedLanguageUpdateArgs>(args: SelectSubset<T, EmbedLanguageUpdateArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EmbedLanguages.
     * @param {EmbedLanguageDeleteManyArgs} args - Arguments to filter EmbedLanguages to delete.
     * @example
     * // Delete a few EmbedLanguages
     * const { count } = await prisma.embedLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmbedLanguageDeleteManyArgs>(args?: SelectSubset<T, EmbedLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmbedLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmbedLanguages
     * const embedLanguage = await prisma.embedLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmbedLanguageUpdateManyArgs>(args: SelectSubset<T, EmbedLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EmbedLanguage.
     * @param {EmbedLanguageUpsertArgs} args - Arguments to update or create a EmbedLanguage.
     * @example
     * // Update or create a EmbedLanguage
     * const embedLanguage = await prisma.embedLanguage.upsert({
     *   create: {
     *     // ... data to create a EmbedLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmbedLanguage we want to update
     *   }
     * })
     */
    upsert<T extends EmbedLanguageUpsertArgs>(args: SelectSubset<T, EmbedLanguageUpsertArgs<ExtArgs>>): Prisma__EmbedLanguageClient<$Result.GetResult<Prisma.$EmbedLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more EmbedLanguages that matches the filter.
     * @param {EmbedLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const embedLanguage = await prisma.embedLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: EmbedLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a EmbedLanguage.
     * @param {EmbedLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const embedLanguage = await prisma.embedLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: EmbedLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of EmbedLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageCountArgs} args - Arguments to filter EmbedLanguages to count.
     * @example
     * // Count the number of EmbedLanguages
     * const count = await prisma.embedLanguage.count({
     *   where: {
     *     // ... the filter for the EmbedLanguages we want to count
     *   }
     * })
    **/
    count<T extends EmbedLanguageCountArgs>(
      args?: Subset<T, EmbedLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmbedLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmbedLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmbedLanguageAggregateArgs>(args: Subset<T, EmbedLanguageAggregateArgs>): Prisma.PrismaPromise<GetEmbedLanguageAggregateType<T>>

    /**
     * Group by EmbedLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbedLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmbedLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmbedLanguageGroupByArgs['orderBy'] }
        : { orderBy?: EmbedLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmbedLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmbedLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmbedLanguage model
   */
  readonly fields: EmbedLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmbedLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmbedLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmbedLanguage model
   */ 
  interface EmbedLanguageFieldRefs {
    readonly id: FieldRef<"EmbedLanguage", 'String'>
    readonly name: FieldRef<"EmbedLanguage", 'String'>
    readonly createdAt: FieldRef<"EmbedLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"EmbedLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmbedLanguage findUnique
   */
  export type EmbedLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter, which EmbedLanguage to fetch.
     */
    where: EmbedLanguageWhereUniqueInput
  }

  /**
   * EmbedLanguage findUniqueOrThrow
   */
  export type EmbedLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter, which EmbedLanguage to fetch.
     */
    where: EmbedLanguageWhereUniqueInput
  }

  /**
   * EmbedLanguage findFirst
   */
  export type EmbedLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter, which EmbedLanguage to fetch.
     */
    where?: EmbedLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbedLanguages to fetch.
     */
    orderBy?: EmbedLanguageOrderByWithRelationInput | EmbedLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmbedLanguages.
     */
    cursor?: EmbedLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbedLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbedLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmbedLanguages.
     */
    distinct?: EmbedLanguageScalarFieldEnum | EmbedLanguageScalarFieldEnum[]
  }

  /**
   * EmbedLanguage findFirstOrThrow
   */
  export type EmbedLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter, which EmbedLanguage to fetch.
     */
    where?: EmbedLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbedLanguages to fetch.
     */
    orderBy?: EmbedLanguageOrderByWithRelationInput | EmbedLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmbedLanguages.
     */
    cursor?: EmbedLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbedLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbedLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmbedLanguages.
     */
    distinct?: EmbedLanguageScalarFieldEnum | EmbedLanguageScalarFieldEnum[]
  }

  /**
   * EmbedLanguage findMany
   */
  export type EmbedLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter, which EmbedLanguages to fetch.
     */
    where?: EmbedLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbedLanguages to fetch.
     */
    orderBy?: EmbedLanguageOrderByWithRelationInput | EmbedLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmbedLanguages.
     */
    cursor?: EmbedLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbedLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbedLanguages.
     */
    skip?: number
    distinct?: EmbedLanguageScalarFieldEnum | EmbedLanguageScalarFieldEnum[]
  }

  /**
   * EmbedLanguage create
   */
  export type EmbedLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a EmbedLanguage.
     */
    data: XOR<EmbedLanguageCreateInput, EmbedLanguageUncheckedCreateInput>
  }

  /**
   * EmbedLanguage createMany
   */
  export type EmbedLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmbedLanguages.
     */
    data: EmbedLanguageCreateManyInput | EmbedLanguageCreateManyInput[]
  }

  /**
   * EmbedLanguage update
   */
  export type EmbedLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a EmbedLanguage.
     */
    data: XOR<EmbedLanguageUpdateInput, EmbedLanguageUncheckedUpdateInput>
    /**
     * Choose, which EmbedLanguage to update.
     */
    where: EmbedLanguageWhereUniqueInput
  }

  /**
   * EmbedLanguage updateMany
   */
  export type EmbedLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmbedLanguages.
     */
    data: XOR<EmbedLanguageUpdateManyMutationInput, EmbedLanguageUncheckedUpdateManyInput>
    /**
     * Filter which EmbedLanguages to update
     */
    where?: EmbedLanguageWhereInput
  }

  /**
   * EmbedLanguage upsert
   */
  export type EmbedLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the EmbedLanguage to update in case it exists.
     */
    where: EmbedLanguageWhereUniqueInput
    /**
     * In case the EmbedLanguage found by the `where` argument doesn't exist, create a new EmbedLanguage with this data.
     */
    create: XOR<EmbedLanguageCreateInput, EmbedLanguageUncheckedCreateInput>
    /**
     * In case the EmbedLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmbedLanguageUpdateInput, EmbedLanguageUncheckedUpdateInput>
  }

  /**
   * EmbedLanguage delete
   */
  export type EmbedLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
    /**
     * Filter which EmbedLanguage to delete.
     */
    where: EmbedLanguageWhereUniqueInput
  }

  /**
   * EmbedLanguage deleteMany
   */
  export type EmbedLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmbedLanguages to delete
     */
    where?: EmbedLanguageWhereInput
  }

  /**
   * EmbedLanguage findRaw
   */
  export type EmbedLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * EmbedLanguage aggregateRaw
   */
  export type EmbedLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * EmbedLanguage without action
   */
  export type EmbedLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedLanguage
     */
    select?: EmbedLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbedLanguageInclude<ExtArgs> | null
  }


  /**
   * Model MarkdownLanguage
   */

  export type AggregateMarkdownLanguage = {
    _count: MarkdownLanguageCountAggregateOutputType | null
    _min: MarkdownLanguageMinAggregateOutputType | null
    _max: MarkdownLanguageMaxAggregateOutputType | null
  }

  export type MarkdownLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MarkdownLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MarkdownLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MarkdownLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MarkdownLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MarkdownLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MarkdownLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarkdownLanguage to aggregate.
     */
    where?: MarkdownLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarkdownLanguages to fetch.
     */
    orderBy?: MarkdownLanguageOrderByWithRelationInput | MarkdownLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarkdownLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarkdownLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarkdownLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarkdownLanguages
    **/
    _count?: true | MarkdownLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarkdownLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarkdownLanguageMaxAggregateInputType
  }

  export type GetMarkdownLanguageAggregateType<T extends MarkdownLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateMarkdownLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarkdownLanguage[P]>
      : GetScalarType<T[P], AggregateMarkdownLanguage[P]>
  }




  export type MarkdownLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarkdownLanguageWhereInput
    orderBy?: MarkdownLanguageOrderByWithAggregationInput | MarkdownLanguageOrderByWithAggregationInput[]
    by: MarkdownLanguageScalarFieldEnum[] | MarkdownLanguageScalarFieldEnum
    having?: MarkdownLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarkdownLanguageCountAggregateInputType | true
    _min?: MarkdownLanguageMinAggregateInputType
    _max?: MarkdownLanguageMaxAggregateInputType
  }

  export type MarkdownLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: MarkdownLanguageCountAggregateOutputType | null
    _min: MarkdownLanguageMinAggregateOutputType | null
    _max: MarkdownLanguageMaxAggregateOutputType | null
  }

  type GetMarkdownLanguageGroupByPayload<T extends MarkdownLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarkdownLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarkdownLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarkdownLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], MarkdownLanguageGroupByOutputType[P]>
        }
      >
    >


  export type MarkdownLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | MarkdownContentLanguageDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["markdownLanguage"]>


  export type MarkdownLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MarkdownLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MarkdownLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarkdownLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["markdownLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$MarkdownContentLanguagePayload
    }
  }

  type MarkdownLanguageGetPayload<S extends boolean | null | undefined | MarkdownLanguageDefaultArgs> = $Result.GetResult<Prisma.$MarkdownLanguagePayload, S>

  type MarkdownLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MarkdownLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MarkdownLanguageCountAggregateInputType | true
    }

  export interface MarkdownLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarkdownLanguage'], meta: { name: 'MarkdownLanguage' } }
    /**
     * Find zero or one MarkdownLanguage that matches the filter.
     * @param {MarkdownLanguageFindUniqueArgs} args - Arguments to find a MarkdownLanguage
     * @example
     * // Get one MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarkdownLanguageFindUniqueArgs>(args: SelectSubset<T, MarkdownLanguageFindUniqueArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MarkdownLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MarkdownLanguageFindUniqueOrThrowArgs} args - Arguments to find a MarkdownLanguage
     * @example
     * // Get one MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarkdownLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, MarkdownLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MarkdownLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageFindFirstArgs} args - Arguments to find a MarkdownLanguage
     * @example
     * // Get one MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarkdownLanguageFindFirstArgs>(args?: SelectSubset<T, MarkdownLanguageFindFirstArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MarkdownLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageFindFirstOrThrowArgs} args - Arguments to find a MarkdownLanguage
     * @example
     * // Get one MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarkdownLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, MarkdownLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MarkdownLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarkdownLanguages
     * const markdownLanguages = await prisma.markdownLanguage.findMany()
     * 
     * // Get first 10 MarkdownLanguages
     * const markdownLanguages = await prisma.markdownLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const markdownLanguageWithIdOnly = await prisma.markdownLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarkdownLanguageFindManyArgs>(args?: SelectSubset<T, MarkdownLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MarkdownLanguage.
     * @param {MarkdownLanguageCreateArgs} args - Arguments to create a MarkdownLanguage.
     * @example
     * // Create one MarkdownLanguage
     * const MarkdownLanguage = await prisma.markdownLanguage.create({
     *   data: {
     *     // ... data to create a MarkdownLanguage
     *   }
     * })
     * 
     */
    create<T extends MarkdownLanguageCreateArgs>(args: SelectSubset<T, MarkdownLanguageCreateArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MarkdownLanguages.
     * @param {MarkdownLanguageCreateManyArgs} args - Arguments to create many MarkdownLanguages.
     * @example
     * // Create many MarkdownLanguages
     * const markdownLanguage = await prisma.markdownLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarkdownLanguageCreateManyArgs>(args?: SelectSubset<T, MarkdownLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MarkdownLanguage.
     * @param {MarkdownLanguageDeleteArgs} args - Arguments to delete one MarkdownLanguage.
     * @example
     * // Delete one MarkdownLanguage
     * const MarkdownLanguage = await prisma.markdownLanguage.delete({
     *   where: {
     *     // ... filter to delete one MarkdownLanguage
     *   }
     * })
     * 
     */
    delete<T extends MarkdownLanguageDeleteArgs>(args: SelectSubset<T, MarkdownLanguageDeleteArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MarkdownLanguage.
     * @param {MarkdownLanguageUpdateArgs} args - Arguments to update one MarkdownLanguage.
     * @example
     * // Update one MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarkdownLanguageUpdateArgs>(args: SelectSubset<T, MarkdownLanguageUpdateArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MarkdownLanguages.
     * @param {MarkdownLanguageDeleteManyArgs} args - Arguments to filter MarkdownLanguages to delete.
     * @example
     * // Delete a few MarkdownLanguages
     * const { count } = await prisma.markdownLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarkdownLanguageDeleteManyArgs>(args?: SelectSubset<T, MarkdownLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarkdownLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarkdownLanguages
     * const markdownLanguage = await prisma.markdownLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarkdownLanguageUpdateManyArgs>(args: SelectSubset<T, MarkdownLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MarkdownLanguage.
     * @param {MarkdownLanguageUpsertArgs} args - Arguments to update or create a MarkdownLanguage.
     * @example
     * // Update or create a MarkdownLanguage
     * const markdownLanguage = await prisma.markdownLanguage.upsert({
     *   create: {
     *     // ... data to create a MarkdownLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarkdownLanguage we want to update
     *   }
     * })
     */
    upsert<T extends MarkdownLanguageUpsertArgs>(args: SelectSubset<T, MarkdownLanguageUpsertArgs<ExtArgs>>): Prisma__MarkdownLanguageClient<$Result.GetResult<Prisma.$MarkdownLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more MarkdownLanguages that matches the filter.
     * @param {MarkdownLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const markdownLanguage = await prisma.markdownLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: MarkdownLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a MarkdownLanguage.
     * @param {MarkdownLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const markdownLanguage = await prisma.markdownLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: MarkdownLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of MarkdownLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageCountArgs} args - Arguments to filter MarkdownLanguages to count.
     * @example
     * // Count the number of MarkdownLanguages
     * const count = await prisma.markdownLanguage.count({
     *   where: {
     *     // ... the filter for the MarkdownLanguages we want to count
     *   }
     * })
    **/
    count<T extends MarkdownLanguageCountArgs>(
      args?: Subset<T, MarkdownLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarkdownLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarkdownLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarkdownLanguageAggregateArgs>(args: Subset<T, MarkdownLanguageAggregateArgs>): Prisma.PrismaPromise<GetMarkdownLanguageAggregateType<T>>

    /**
     * Group by MarkdownLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarkdownLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarkdownLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarkdownLanguageGroupByArgs['orderBy'] }
        : { orderBy?: MarkdownLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarkdownLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarkdownLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarkdownLanguage model
   */
  readonly fields: MarkdownLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarkdownLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarkdownLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarkdownLanguage model
   */ 
  interface MarkdownLanguageFieldRefs {
    readonly id: FieldRef<"MarkdownLanguage", 'String'>
    readonly name: FieldRef<"MarkdownLanguage", 'String'>
    readonly createdAt: FieldRef<"MarkdownLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"MarkdownLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MarkdownLanguage findUnique
   */
  export type MarkdownLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter, which MarkdownLanguage to fetch.
     */
    where: MarkdownLanguageWhereUniqueInput
  }

  /**
   * MarkdownLanguage findUniqueOrThrow
   */
  export type MarkdownLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter, which MarkdownLanguage to fetch.
     */
    where: MarkdownLanguageWhereUniqueInput
  }

  /**
   * MarkdownLanguage findFirst
   */
  export type MarkdownLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter, which MarkdownLanguage to fetch.
     */
    where?: MarkdownLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarkdownLanguages to fetch.
     */
    orderBy?: MarkdownLanguageOrderByWithRelationInput | MarkdownLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarkdownLanguages.
     */
    cursor?: MarkdownLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarkdownLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarkdownLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarkdownLanguages.
     */
    distinct?: MarkdownLanguageScalarFieldEnum | MarkdownLanguageScalarFieldEnum[]
  }

  /**
   * MarkdownLanguage findFirstOrThrow
   */
  export type MarkdownLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter, which MarkdownLanguage to fetch.
     */
    where?: MarkdownLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarkdownLanguages to fetch.
     */
    orderBy?: MarkdownLanguageOrderByWithRelationInput | MarkdownLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarkdownLanguages.
     */
    cursor?: MarkdownLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarkdownLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarkdownLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarkdownLanguages.
     */
    distinct?: MarkdownLanguageScalarFieldEnum | MarkdownLanguageScalarFieldEnum[]
  }

  /**
   * MarkdownLanguage findMany
   */
  export type MarkdownLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter, which MarkdownLanguages to fetch.
     */
    where?: MarkdownLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarkdownLanguages to fetch.
     */
    orderBy?: MarkdownLanguageOrderByWithRelationInput | MarkdownLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarkdownLanguages.
     */
    cursor?: MarkdownLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarkdownLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarkdownLanguages.
     */
    skip?: number
    distinct?: MarkdownLanguageScalarFieldEnum | MarkdownLanguageScalarFieldEnum[]
  }

  /**
   * MarkdownLanguage create
   */
  export type MarkdownLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a MarkdownLanguage.
     */
    data: XOR<MarkdownLanguageCreateInput, MarkdownLanguageUncheckedCreateInput>
  }

  /**
   * MarkdownLanguage createMany
   */
  export type MarkdownLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarkdownLanguages.
     */
    data: MarkdownLanguageCreateManyInput | MarkdownLanguageCreateManyInput[]
  }

  /**
   * MarkdownLanguage update
   */
  export type MarkdownLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a MarkdownLanguage.
     */
    data: XOR<MarkdownLanguageUpdateInput, MarkdownLanguageUncheckedUpdateInput>
    /**
     * Choose, which MarkdownLanguage to update.
     */
    where: MarkdownLanguageWhereUniqueInput
  }

  /**
   * MarkdownLanguage updateMany
   */
  export type MarkdownLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarkdownLanguages.
     */
    data: XOR<MarkdownLanguageUpdateManyMutationInput, MarkdownLanguageUncheckedUpdateManyInput>
    /**
     * Filter which MarkdownLanguages to update
     */
    where?: MarkdownLanguageWhereInput
  }

  /**
   * MarkdownLanguage upsert
   */
  export type MarkdownLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the MarkdownLanguage to update in case it exists.
     */
    where: MarkdownLanguageWhereUniqueInput
    /**
     * In case the MarkdownLanguage found by the `where` argument doesn't exist, create a new MarkdownLanguage with this data.
     */
    create: XOR<MarkdownLanguageCreateInput, MarkdownLanguageUncheckedCreateInput>
    /**
     * In case the MarkdownLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarkdownLanguageUpdateInput, MarkdownLanguageUncheckedUpdateInput>
  }

  /**
   * MarkdownLanguage delete
   */
  export type MarkdownLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
    /**
     * Filter which MarkdownLanguage to delete.
     */
    where: MarkdownLanguageWhereUniqueInput
  }

  /**
   * MarkdownLanguage deleteMany
   */
  export type MarkdownLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarkdownLanguages to delete
     */
    where?: MarkdownLanguageWhereInput
  }

  /**
   * MarkdownLanguage findRaw
   */
  export type MarkdownLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * MarkdownLanguage aggregateRaw
   */
  export type MarkdownLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * MarkdownLanguage without action
   */
  export type MarkdownLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarkdownLanguage
     */
    select?: MarkdownLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarkdownLanguageInclude<ExtArgs> | null
  }


  /**
   * Model ModalLanguage
   */

  export type AggregateModalLanguage = {
    _count: ModalLanguageCountAggregateOutputType | null
    _min: ModalLanguageMinAggregateOutputType | null
    _max: ModalLanguageMaxAggregateOutputType | null
  }

  export type ModalLanguageMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModalLanguageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModalLanguageCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ModalLanguageMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModalLanguageMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModalLanguageCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ModalLanguageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModalLanguage to aggregate.
     */
    where?: ModalLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModalLanguages to fetch.
     */
    orderBy?: ModalLanguageOrderByWithRelationInput | ModalLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModalLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModalLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModalLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ModalLanguages
    **/
    _count?: true | ModalLanguageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModalLanguageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModalLanguageMaxAggregateInputType
  }

  export type GetModalLanguageAggregateType<T extends ModalLanguageAggregateArgs> = {
        [P in keyof T & keyof AggregateModalLanguage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModalLanguage[P]>
      : GetScalarType<T[P], AggregateModalLanguage[P]>
  }




  export type ModalLanguageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModalLanguageWhereInput
    orderBy?: ModalLanguageOrderByWithAggregationInput | ModalLanguageOrderByWithAggregationInput[]
    by: ModalLanguageScalarFieldEnum[] | ModalLanguageScalarFieldEnum
    having?: ModalLanguageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModalLanguageCountAggregateInputType | true
    _min?: ModalLanguageMinAggregateInputType
    _max?: ModalLanguageMaxAggregateInputType
  }

  export type ModalLanguageGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: ModalLanguageCountAggregateOutputType | null
    _min: ModalLanguageMinAggregateOutputType | null
    _max: ModalLanguageMaxAggregateOutputType | null
  }

  type GetModalLanguageGroupByPayload<T extends ModalLanguageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModalLanguageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModalLanguageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModalLanguageGroupByOutputType[P]>
            : GetScalarType<T[P], ModalLanguageGroupByOutputType[P]>
        }
      >
    >


  export type ModalLanguageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    language?: boolean | LanguageDefaultArgs<ExtArgs>
    content?: boolean | ModalContentLanguageDefaultArgs<ExtArgs>
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modalLanguage"]>


  export type ModalLanguageSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ModalLanguageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ModalLanguagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ModalLanguage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["modalLanguage"]>
    composites: {
      language: Prisma.$LanguagePayload
      content: Prisma.$ModalContentLanguagePayload
    }
  }

  type ModalLanguageGetPayload<S extends boolean | null | undefined | ModalLanguageDefaultArgs> = $Result.GetResult<Prisma.$ModalLanguagePayload, S>

  type ModalLanguageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ModalLanguageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ModalLanguageCountAggregateInputType | true
    }

  export interface ModalLanguageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ModalLanguage'], meta: { name: 'ModalLanguage' } }
    /**
     * Find zero or one ModalLanguage that matches the filter.
     * @param {ModalLanguageFindUniqueArgs} args - Arguments to find a ModalLanguage
     * @example
     * // Get one ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModalLanguageFindUniqueArgs>(args: SelectSubset<T, ModalLanguageFindUniqueArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ModalLanguage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ModalLanguageFindUniqueOrThrowArgs} args - Arguments to find a ModalLanguage
     * @example
     * // Get one ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModalLanguageFindUniqueOrThrowArgs>(args: SelectSubset<T, ModalLanguageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ModalLanguage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageFindFirstArgs} args - Arguments to find a ModalLanguage
     * @example
     * // Get one ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModalLanguageFindFirstArgs>(args?: SelectSubset<T, ModalLanguageFindFirstArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ModalLanguage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageFindFirstOrThrowArgs} args - Arguments to find a ModalLanguage
     * @example
     * // Get one ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModalLanguageFindFirstOrThrowArgs>(args?: SelectSubset<T, ModalLanguageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ModalLanguages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModalLanguages
     * const modalLanguages = await prisma.modalLanguage.findMany()
     * 
     * // Get first 10 ModalLanguages
     * const modalLanguages = await prisma.modalLanguage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const modalLanguageWithIdOnly = await prisma.modalLanguage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModalLanguageFindManyArgs>(args?: SelectSubset<T, ModalLanguageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ModalLanguage.
     * @param {ModalLanguageCreateArgs} args - Arguments to create a ModalLanguage.
     * @example
     * // Create one ModalLanguage
     * const ModalLanguage = await prisma.modalLanguage.create({
     *   data: {
     *     // ... data to create a ModalLanguage
     *   }
     * })
     * 
     */
    create<T extends ModalLanguageCreateArgs>(args: SelectSubset<T, ModalLanguageCreateArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ModalLanguages.
     * @param {ModalLanguageCreateManyArgs} args - Arguments to create many ModalLanguages.
     * @example
     * // Create many ModalLanguages
     * const modalLanguage = await prisma.modalLanguage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModalLanguageCreateManyArgs>(args?: SelectSubset<T, ModalLanguageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ModalLanguage.
     * @param {ModalLanguageDeleteArgs} args - Arguments to delete one ModalLanguage.
     * @example
     * // Delete one ModalLanguage
     * const ModalLanguage = await prisma.modalLanguage.delete({
     *   where: {
     *     // ... filter to delete one ModalLanguage
     *   }
     * })
     * 
     */
    delete<T extends ModalLanguageDeleteArgs>(args: SelectSubset<T, ModalLanguageDeleteArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ModalLanguage.
     * @param {ModalLanguageUpdateArgs} args - Arguments to update one ModalLanguage.
     * @example
     * // Update one ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModalLanguageUpdateArgs>(args: SelectSubset<T, ModalLanguageUpdateArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ModalLanguages.
     * @param {ModalLanguageDeleteManyArgs} args - Arguments to filter ModalLanguages to delete.
     * @example
     * // Delete a few ModalLanguages
     * const { count } = await prisma.modalLanguage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModalLanguageDeleteManyArgs>(args?: SelectSubset<T, ModalLanguageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModalLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModalLanguages
     * const modalLanguage = await prisma.modalLanguage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModalLanguageUpdateManyArgs>(args: SelectSubset<T, ModalLanguageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ModalLanguage.
     * @param {ModalLanguageUpsertArgs} args - Arguments to update or create a ModalLanguage.
     * @example
     * // Update or create a ModalLanguage
     * const modalLanguage = await prisma.modalLanguage.upsert({
     *   create: {
     *     // ... data to create a ModalLanguage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModalLanguage we want to update
     *   }
     * })
     */
    upsert<T extends ModalLanguageUpsertArgs>(args: SelectSubset<T, ModalLanguageUpsertArgs<ExtArgs>>): Prisma__ModalLanguageClient<$Result.GetResult<Prisma.$ModalLanguagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ModalLanguages that matches the filter.
     * @param {ModalLanguageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const modalLanguage = await prisma.modalLanguage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ModalLanguageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ModalLanguage.
     * @param {ModalLanguageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const modalLanguage = await prisma.modalLanguage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ModalLanguageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ModalLanguages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageCountArgs} args - Arguments to filter ModalLanguages to count.
     * @example
     * // Count the number of ModalLanguages
     * const count = await prisma.modalLanguage.count({
     *   where: {
     *     // ... the filter for the ModalLanguages we want to count
     *   }
     * })
    **/
    count<T extends ModalLanguageCountArgs>(
      args?: Subset<T, ModalLanguageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModalLanguageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ModalLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ModalLanguageAggregateArgs>(args: Subset<T, ModalLanguageAggregateArgs>): Prisma.PrismaPromise<GetModalLanguageAggregateType<T>>

    /**
     * Group by ModalLanguage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModalLanguageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ModalLanguageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModalLanguageGroupByArgs['orderBy'] }
        : { orderBy?: ModalLanguageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ModalLanguageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModalLanguageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ModalLanguage model
   */
  readonly fields: ModalLanguageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ModalLanguage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModalLanguageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ModalLanguage model
   */ 
  interface ModalLanguageFieldRefs {
    readonly id: FieldRef<"ModalLanguage", 'String'>
    readonly name: FieldRef<"ModalLanguage", 'String'>
    readonly createdAt: FieldRef<"ModalLanguage", 'DateTime'>
    readonly updatedAt: FieldRef<"ModalLanguage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ModalLanguage findUnique
   */
  export type ModalLanguageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ModalLanguage to fetch.
     */
    where: ModalLanguageWhereUniqueInput
  }

  /**
   * ModalLanguage findUniqueOrThrow
   */
  export type ModalLanguageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ModalLanguage to fetch.
     */
    where: ModalLanguageWhereUniqueInput
  }

  /**
   * ModalLanguage findFirst
   */
  export type ModalLanguageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ModalLanguage to fetch.
     */
    where?: ModalLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModalLanguages to fetch.
     */
    orderBy?: ModalLanguageOrderByWithRelationInput | ModalLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModalLanguages.
     */
    cursor?: ModalLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModalLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModalLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModalLanguages.
     */
    distinct?: ModalLanguageScalarFieldEnum | ModalLanguageScalarFieldEnum[]
  }

  /**
   * ModalLanguage findFirstOrThrow
   */
  export type ModalLanguageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ModalLanguage to fetch.
     */
    where?: ModalLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModalLanguages to fetch.
     */
    orderBy?: ModalLanguageOrderByWithRelationInput | ModalLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModalLanguages.
     */
    cursor?: ModalLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModalLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModalLanguages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModalLanguages.
     */
    distinct?: ModalLanguageScalarFieldEnum | ModalLanguageScalarFieldEnum[]
  }

  /**
   * ModalLanguage findMany
   */
  export type ModalLanguageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter, which ModalLanguages to fetch.
     */
    where?: ModalLanguageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModalLanguages to fetch.
     */
    orderBy?: ModalLanguageOrderByWithRelationInput | ModalLanguageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ModalLanguages.
     */
    cursor?: ModalLanguageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModalLanguages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModalLanguages.
     */
    skip?: number
    distinct?: ModalLanguageScalarFieldEnum | ModalLanguageScalarFieldEnum[]
  }

  /**
   * ModalLanguage create
   */
  export type ModalLanguageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * The data needed to create a ModalLanguage.
     */
    data: XOR<ModalLanguageCreateInput, ModalLanguageUncheckedCreateInput>
  }

  /**
   * ModalLanguage createMany
   */
  export type ModalLanguageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModalLanguages.
     */
    data: ModalLanguageCreateManyInput | ModalLanguageCreateManyInput[]
  }

  /**
   * ModalLanguage update
   */
  export type ModalLanguageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * The data needed to update a ModalLanguage.
     */
    data: XOR<ModalLanguageUpdateInput, ModalLanguageUncheckedUpdateInput>
    /**
     * Choose, which ModalLanguage to update.
     */
    where: ModalLanguageWhereUniqueInput
  }

  /**
   * ModalLanguage updateMany
   */
  export type ModalLanguageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ModalLanguages.
     */
    data: XOR<ModalLanguageUpdateManyMutationInput, ModalLanguageUncheckedUpdateManyInput>
    /**
     * Filter which ModalLanguages to update
     */
    where?: ModalLanguageWhereInput
  }

  /**
   * ModalLanguage upsert
   */
  export type ModalLanguageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * The filter to search for the ModalLanguage to update in case it exists.
     */
    where: ModalLanguageWhereUniqueInput
    /**
     * In case the ModalLanguage found by the `where` argument doesn't exist, create a new ModalLanguage with this data.
     */
    create: XOR<ModalLanguageCreateInput, ModalLanguageUncheckedCreateInput>
    /**
     * In case the ModalLanguage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModalLanguageUpdateInput, ModalLanguageUncheckedUpdateInput>
  }

  /**
   * ModalLanguage delete
   */
  export type ModalLanguageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
    /**
     * Filter which ModalLanguage to delete.
     */
    where: ModalLanguageWhereUniqueInput
  }

  /**
   * ModalLanguage deleteMany
   */
  export type ModalLanguageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModalLanguages to delete
     */
    where?: ModalLanguageWhereInput
  }

  /**
   * ModalLanguage findRaw
   */
  export type ModalLanguageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ModalLanguage aggregateRaw
   */
  export type ModalLanguageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ModalLanguage without action
   */
  export type ModalLanguageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModalLanguage
     */
    select?: ModalLanguageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModalLanguageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const ConfigScalarFieldEnum: {
    id: 'id',
    key: 'key',
    version: 'version',
    type: 'type',
    object: 'object',
    value: 'value',
    values: 'values',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConfigScalarFieldEnum = (typeof ConfigScalarFieldEnum)[keyof typeof ConfigScalarFieldEnum]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    categoryId: 'categoryId',
    guildId: 'guildId',
    createdAtDiscord: 'createdAtDiscord',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const GuildScalarFieldEnum: {
    id: 'id',
    guildId: 'guildId',
    name: 'name',
    isInGuild: 'isInGuild',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    updatedAtInternal: 'updatedAtInternal'
  };

  export type GuildScalarFieldEnum = (typeof GuildScalarFieldEnum)[keyof typeof GuildScalarFieldEnum]


  export const GuildDataScalarFieldEnum: {
    id: 'id',
    key: 'key',
    version: 'version',
    type: 'type',
    object: 'object',
    value: 'value',
    values: 'values',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GuildDataScalarFieldEnum = (typeof GuildDataScalarFieldEnum)[keyof typeof GuildDataScalarFieldEnum]


  export const ChannelScalarFieldEnum: {
    id: 'id',
    channelId: 'channelId',
    guildId: 'guildId',
    userOwnerId: 'userOwnerId',
    categoryId: 'categoryId',
    ownerChannelId: 'ownerChannelId',
    version: 'version',
    internalType: 'internalType',
    createdAtDiscord: 'createdAtDiscord',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChannelScalarFieldEnum = (typeof ChannelScalarFieldEnum)[keyof typeof ChannelScalarFieldEnum]


  export const ChannelDataScalarFieldEnum: {
    id: 'id',
    key: 'key',
    version: 'version',
    type: 'type',
    object: 'object',
    value: 'value',
    values: 'values',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChannelDataScalarFieldEnum = (typeof ChannelDataScalarFieldEnum)[keyof typeof ChannelDataScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    username: 'username',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserDataScalarFieldEnum: {
    id: 'id',
    key: 'key',
    version: 'version',
    type: 'type',
    object: 'object',
    value: 'value',
    values: 'values',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserDataScalarFieldEnum = (typeof UserDataScalarFieldEnum)[keyof typeof UserDataScalarFieldEnum]


  export const UserChannelDataScalarFieldEnum: {
    id: 'id',
    channelId: 'channelId',
    key: 'key',
    version: 'version',
    type: 'type',
    object: 'object',
    value: 'value',
    values: 'values',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserChannelDataScalarFieldEnum = (typeof UserChannelDataScalarFieldEnum)[keyof typeof UserChannelDataScalarFieldEnum]


  export const ElementButtonLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ElementButtonLanguageScalarFieldEnum = (typeof ElementButtonLanguageScalarFieldEnum)[keyof typeof ElementButtonLanguageScalarFieldEnum]


  export const ElementTextInputLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ElementTextInputLanguageScalarFieldEnum = (typeof ElementTextInputLanguageScalarFieldEnum)[keyof typeof ElementTextInputLanguageScalarFieldEnum]


  export const ElementSelectMenuLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ElementSelectMenuLanguageScalarFieldEnum = (typeof ElementSelectMenuLanguageScalarFieldEnum)[keyof typeof ElementSelectMenuLanguageScalarFieldEnum]


  export const EmbedLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EmbedLanguageScalarFieldEnum = (typeof EmbedLanguageScalarFieldEnum)[keyof typeof EmbedLanguageScalarFieldEnum]


  export const MarkdownLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MarkdownLanguageScalarFieldEnum = (typeof MarkdownLanguageScalarFieldEnum)[keyof typeof MarkdownLanguageScalarFieldEnum]


  export const ModalLanguageScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ModalLanguageScalarFieldEnum = (typeof ModalLanguageScalarFieldEnum)[keyof typeof ModalLanguageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'E_DATA_TYPES'
   */
  export type EnumE_DATA_TYPESFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_DATA_TYPES'>
    


  /**
   * Reference to a field of type 'E_DATA_TYPES[]'
   */
  export type ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_DATA_TYPES[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'E_INTERNAL_CHANNEL_TYPES'
   */
  export type EnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_INTERNAL_CHANNEL_TYPES'>
    


  /**
   * Reference to a field of type 'E_INTERNAL_CHANNEL_TYPES[]'
   */
  export type ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_INTERNAL_CHANNEL_TYPES[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ConfigWhereInput = {
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    id?: StringFilter<"Config"> | string
    key?: StringFilter<"Config"> | string
    version?: StringFilter<"Config"> | string
    type?: EnumE_DATA_TYPESFilter<"Config"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"Config">
    value?: StringNullableFilter<"Config"> | string | null
    values?: StringNullableListFilter<"Config">
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }

  export type ConfigOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key_version?: ConfigKeyVersionCompoundUniqueInput
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    key?: StringFilter<"Config"> | string
    version?: StringFilter<"Config"> | string
    type?: EnumE_DATA_TYPESFilter<"Config"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"Config">
    value?: StringNullableFilter<"Config"> | string | null
    values?: StringNullableListFilter<"Config">
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }, "id" | "key_version">

  export type ConfigOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConfigCountOrderByAggregateInput
    _max?: ConfigMaxOrderByAggregateInput
    _min?: ConfigMinOrderByAggregateInput
  }

  export type ConfigScalarWhereWithAggregatesInput = {
    AND?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    OR?: ConfigScalarWhereWithAggregatesInput[]
    NOT?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Config"> | string
    key?: StringWithAggregatesFilter<"Config"> | string
    version?: StringWithAggregatesFilter<"Config"> | string
    type?: EnumE_DATA_TYPESWithAggregatesFilter<"Config"> | $Enums.E_DATA_TYPES
    object?: JsonNullableWithAggregatesFilter<"Config">
    value?: StringNullableWithAggregatesFilter<"Config"> | string | null
    values?: StringNullableListFilter<"Config">
    createdAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
  }

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    categoryId?: StringFilter<"Category"> | string
    guildId?: StringFilter<"Category"> | string
    createdAtDiscord?: IntFilter<"Category"> | number
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    categoryId?: SortOrder
    guildId?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    name?: StringFilter<"Category"> | string
    categoryId?: StringFilter<"Category"> | string
    guildId?: StringFilter<"Category"> | string
    createdAtDiscord?: IntFilter<"Category"> | number
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
  }, "id">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    categoryId?: SortOrder
    guildId?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Category"> | string
    name?: StringWithAggregatesFilter<"Category"> | string
    categoryId?: StringWithAggregatesFilter<"Category"> | string
    guildId?: StringWithAggregatesFilter<"Category"> | string
    createdAtDiscord?: IntWithAggregatesFilter<"Category"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
  }

  export type GuildWhereInput = {
    AND?: GuildWhereInput | GuildWhereInput[]
    OR?: GuildWhereInput[]
    NOT?: GuildWhereInput | GuildWhereInput[]
    id?: StringFilter<"Guild"> | string
    guildId?: StringFilter<"Guild"> | string
    name?: StringFilter<"Guild"> | string
    isInGuild?: BoolFilter<"Guild"> | boolean
    createdAt?: DateTimeFilter<"Guild"> | Date | string
    updatedAt?: DateTimeFilter<"Guild"> | Date | string
    updatedAtInternal?: DateTimeNullableFilter<"Guild"> | Date | string | null
    data?: GuildDataListRelationFilter
  }

  export type GuildOrderByWithRelationInput = {
    id?: SortOrder
    guildId?: SortOrder
    name?: SortOrder
    isInGuild?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedAtInternal?: SortOrder
    data?: GuildDataOrderByRelationAggregateInput
  }

  export type GuildWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    guildId?: string
    AND?: GuildWhereInput | GuildWhereInput[]
    OR?: GuildWhereInput[]
    NOT?: GuildWhereInput | GuildWhereInput[]
    name?: StringFilter<"Guild"> | string
    isInGuild?: BoolFilter<"Guild"> | boolean
    createdAt?: DateTimeFilter<"Guild"> | Date | string
    updatedAt?: DateTimeFilter<"Guild"> | Date | string
    updatedAtInternal?: DateTimeNullableFilter<"Guild"> | Date | string | null
    data?: GuildDataListRelationFilter
  }, "id" | "guildId">

  export type GuildOrderByWithAggregationInput = {
    id?: SortOrder
    guildId?: SortOrder
    name?: SortOrder
    isInGuild?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedAtInternal?: SortOrder
    _count?: GuildCountOrderByAggregateInput
    _max?: GuildMaxOrderByAggregateInput
    _min?: GuildMinOrderByAggregateInput
  }

  export type GuildScalarWhereWithAggregatesInput = {
    AND?: GuildScalarWhereWithAggregatesInput | GuildScalarWhereWithAggregatesInput[]
    OR?: GuildScalarWhereWithAggregatesInput[]
    NOT?: GuildScalarWhereWithAggregatesInput | GuildScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Guild"> | string
    guildId?: StringWithAggregatesFilter<"Guild"> | string
    name?: StringWithAggregatesFilter<"Guild"> | string
    isInGuild?: BoolWithAggregatesFilter<"Guild"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Guild"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Guild"> | Date | string
    updatedAtInternal?: DateTimeNullableWithAggregatesFilter<"Guild"> | Date | string | null
  }

  export type GuildDataWhereInput = {
    AND?: GuildDataWhereInput | GuildDataWhereInput[]
    OR?: GuildDataWhereInput[]
    NOT?: GuildDataWhereInput | GuildDataWhereInput[]
    id?: StringFilter<"GuildData"> | string
    key?: StringFilter<"GuildData"> | string
    version?: StringFilter<"GuildData"> | string
    type?: EnumE_DATA_TYPESFilter<"GuildData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"GuildData">
    value?: StringNullableFilter<"GuildData"> | string | null
    values?: StringNullableListFilter<"GuildData">
    ownerId?: StringFilter<"GuildData"> | string
    createdAt?: DateTimeFilter<"GuildData"> | Date | string
    updatedAt?: DateTimeFilter<"GuildData"> | Date | string
    guild?: XOR<GuildRelationFilter, GuildWhereInput>
  }

  export type GuildDataOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    guild?: GuildOrderByWithRelationInput
  }

  export type GuildDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ownerId_key_version?: GuildDataOwnerIdKeyVersionCompoundUniqueInput
    AND?: GuildDataWhereInput | GuildDataWhereInput[]
    OR?: GuildDataWhereInput[]
    NOT?: GuildDataWhereInput | GuildDataWhereInput[]
    key?: StringFilter<"GuildData"> | string
    version?: StringFilter<"GuildData"> | string
    type?: EnumE_DATA_TYPESFilter<"GuildData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"GuildData">
    value?: StringNullableFilter<"GuildData"> | string | null
    values?: StringNullableListFilter<"GuildData">
    ownerId?: StringFilter<"GuildData"> | string
    createdAt?: DateTimeFilter<"GuildData"> | Date | string
    updatedAt?: DateTimeFilter<"GuildData"> | Date | string
    guild?: XOR<GuildRelationFilter, GuildWhereInput>
  }, "id" | "ownerId_key_version">

  export type GuildDataOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GuildDataCountOrderByAggregateInput
    _max?: GuildDataMaxOrderByAggregateInput
    _min?: GuildDataMinOrderByAggregateInput
  }

  export type GuildDataScalarWhereWithAggregatesInput = {
    AND?: GuildDataScalarWhereWithAggregatesInput | GuildDataScalarWhereWithAggregatesInput[]
    OR?: GuildDataScalarWhereWithAggregatesInput[]
    NOT?: GuildDataScalarWhereWithAggregatesInput | GuildDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GuildData"> | string
    key?: StringWithAggregatesFilter<"GuildData"> | string
    version?: StringWithAggregatesFilter<"GuildData"> | string
    type?: EnumE_DATA_TYPESWithAggregatesFilter<"GuildData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableWithAggregatesFilter<"GuildData">
    value?: StringNullableWithAggregatesFilter<"GuildData"> | string | null
    values?: StringNullableListFilter<"GuildData">
    ownerId?: StringWithAggregatesFilter<"GuildData"> | string
    createdAt?: DateTimeWithAggregatesFilter<"GuildData"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GuildData"> | Date | string
  }

  export type ChannelWhereInput = {
    AND?: ChannelWhereInput | ChannelWhereInput[]
    OR?: ChannelWhereInput[]
    NOT?: ChannelWhereInput | ChannelWhereInput[]
    id?: StringFilter<"Channel"> | string
    channelId?: StringFilter<"Channel"> | string
    guildId?: StringFilter<"Channel"> | string
    userOwnerId?: StringFilter<"Channel"> | string
    categoryId?: StringNullableFilter<"Channel"> | string | null
    ownerChannelId?: StringNullableFilter<"Channel"> | string | null
    version?: StringFilter<"Channel"> | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFilter<"Channel"> | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFilter<"Channel"> | number
    createdAt?: DateTimeFilter<"Channel"> | Date | string
    updatedAt?: DateTimeFilter<"Channel"> | Date | string
    data?: ChannelDataListRelationFilter
  }

  export type ChannelOrderByWithRelationInput = {
    id?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    userOwnerId?: SortOrder
    categoryId?: SortOrder
    ownerChannelId?: SortOrder
    version?: SortOrder
    internalType?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    data?: ChannelDataOrderByRelationAggregateInput
  }

  export type ChannelWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    channelId?: string
    AND?: ChannelWhereInput | ChannelWhereInput[]
    OR?: ChannelWhereInput[]
    NOT?: ChannelWhereInput | ChannelWhereInput[]
    guildId?: StringFilter<"Channel"> | string
    userOwnerId?: StringFilter<"Channel"> | string
    categoryId?: StringNullableFilter<"Channel"> | string | null
    ownerChannelId?: StringNullableFilter<"Channel"> | string | null
    version?: StringFilter<"Channel"> | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFilter<"Channel"> | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFilter<"Channel"> | number
    createdAt?: DateTimeFilter<"Channel"> | Date | string
    updatedAt?: DateTimeFilter<"Channel"> | Date | string
    data?: ChannelDataListRelationFilter
  }, "id" | "channelId">

  export type ChannelOrderByWithAggregationInput = {
    id?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    userOwnerId?: SortOrder
    categoryId?: SortOrder
    ownerChannelId?: SortOrder
    version?: SortOrder
    internalType?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChannelCountOrderByAggregateInput
    _avg?: ChannelAvgOrderByAggregateInput
    _max?: ChannelMaxOrderByAggregateInput
    _min?: ChannelMinOrderByAggregateInput
    _sum?: ChannelSumOrderByAggregateInput
  }

  export type ChannelScalarWhereWithAggregatesInput = {
    AND?: ChannelScalarWhereWithAggregatesInput | ChannelScalarWhereWithAggregatesInput[]
    OR?: ChannelScalarWhereWithAggregatesInput[]
    NOT?: ChannelScalarWhereWithAggregatesInput | ChannelScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Channel"> | string
    channelId?: StringWithAggregatesFilter<"Channel"> | string
    guildId?: StringWithAggregatesFilter<"Channel"> | string
    userOwnerId?: StringWithAggregatesFilter<"Channel"> | string
    categoryId?: StringNullableWithAggregatesFilter<"Channel"> | string | null
    ownerChannelId?: StringNullableWithAggregatesFilter<"Channel"> | string | null
    version?: StringWithAggregatesFilter<"Channel"> | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESWithAggregatesFilter<"Channel"> | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntWithAggregatesFilter<"Channel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Channel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Channel"> | Date | string
  }

  export type ChannelDataWhereInput = {
    AND?: ChannelDataWhereInput | ChannelDataWhereInput[]
    OR?: ChannelDataWhereInput[]
    NOT?: ChannelDataWhereInput | ChannelDataWhereInput[]
    id?: StringFilter<"ChannelData"> | string
    key?: StringFilter<"ChannelData"> | string
    version?: StringFilter<"ChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"ChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"ChannelData">
    value?: StringNullableFilter<"ChannelData"> | string | null
    values?: StringNullableListFilter<"ChannelData">
    ownerId?: StringFilter<"ChannelData"> | string
    createdAt?: DateTimeFilter<"ChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"ChannelData"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
  }

  export type ChannelDataOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    channel?: ChannelOrderByWithRelationInput
  }

  export type ChannelDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ownerId_key_version?: ChannelDataOwnerIdKeyVersionCompoundUniqueInput
    AND?: ChannelDataWhereInput | ChannelDataWhereInput[]
    OR?: ChannelDataWhereInput[]
    NOT?: ChannelDataWhereInput | ChannelDataWhereInput[]
    key?: StringFilter<"ChannelData"> | string
    version?: StringFilter<"ChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"ChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"ChannelData">
    value?: StringNullableFilter<"ChannelData"> | string | null
    values?: StringNullableListFilter<"ChannelData">
    ownerId?: StringFilter<"ChannelData"> | string
    createdAt?: DateTimeFilter<"ChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"ChannelData"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
  }, "id" | "ownerId_key_version">

  export type ChannelDataOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChannelDataCountOrderByAggregateInput
    _max?: ChannelDataMaxOrderByAggregateInput
    _min?: ChannelDataMinOrderByAggregateInput
  }

  export type ChannelDataScalarWhereWithAggregatesInput = {
    AND?: ChannelDataScalarWhereWithAggregatesInput | ChannelDataScalarWhereWithAggregatesInput[]
    OR?: ChannelDataScalarWhereWithAggregatesInput[]
    NOT?: ChannelDataScalarWhereWithAggregatesInput | ChannelDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChannelData"> | string
    key?: StringWithAggregatesFilter<"ChannelData"> | string
    version?: StringWithAggregatesFilter<"ChannelData"> | string
    type?: EnumE_DATA_TYPESWithAggregatesFilter<"ChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableWithAggregatesFilter<"ChannelData">
    value?: StringNullableWithAggregatesFilter<"ChannelData"> | string | null
    values?: StringNullableListFilter<"ChannelData">
    ownerId?: StringWithAggregatesFilter<"ChannelData"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ChannelData"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChannelData"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    userId?: StringFilter<"User"> | string
    username?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    data?: UserDataListRelationFilter
    channelData?: UserChannelDataListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    data?: UserDataOrderByRelationAggregateInput
    channelData?: UserChannelDataOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    username?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    data?: UserDataListRelationFilter
    channelData?: UserChannelDataListRelationFilter
  }, "id" | "userId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    userId?: StringWithAggregatesFilter<"User"> | string
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserDataWhereInput = {
    AND?: UserDataWhereInput | UserDataWhereInput[]
    OR?: UserDataWhereInput[]
    NOT?: UserDataWhereInput | UserDataWhereInput[]
    id?: StringFilter<"UserData"> | string
    key?: StringFilter<"UserData"> | string
    version?: StringFilter<"UserData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserData">
    value?: StringNullableFilter<"UserData"> | string | null
    values?: StringNullableListFilter<"UserData">
    ownerId?: StringFilter<"UserData"> | string
    createdAt?: DateTimeFilter<"UserData"> | Date | string
    updatedAt?: DateTimeFilter<"UserData"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type UserDataOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ownerId_key_version?: UserDataOwnerIdKeyVersionCompoundUniqueInput
    AND?: UserDataWhereInput | UserDataWhereInput[]
    OR?: UserDataWhereInput[]
    NOT?: UserDataWhereInput | UserDataWhereInput[]
    key?: StringFilter<"UserData"> | string
    version?: StringFilter<"UserData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserData">
    value?: StringNullableFilter<"UserData"> | string | null
    values?: StringNullableListFilter<"UserData">
    ownerId?: StringFilter<"UserData"> | string
    createdAt?: DateTimeFilter<"UserData"> | Date | string
    updatedAt?: DateTimeFilter<"UserData"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "ownerId_key_version">

  export type UserDataOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserDataCountOrderByAggregateInput
    _max?: UserDataMaxOrderByAggregateInput
    _min?: UserDataMinOrderByAggregateInput
  }

  export type UserDataScalarWhereWithAggregatesInput = {
    AND?: UserDataScalarWhereWithAggregatesInput | UserDataScalarWhereWithAggregatesInput[]
    OR?: UserDataScalarWhereWithAggregatesInput[]
    NOT?: UserDataScalarWhereWithAggregatesInput | UserDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserData"> | string
    key?: StringWithAggregatesFilter<"UserData"> | string
    version?: StringWithAggregatesFilter<"UserData"> | string
    type?: EnumE_DATA_TYPESWithAggregatesFilter<"UserData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableWithAggregatesFilter<"UserData">
    value?: StringNullableWithAggregatesFilter<"UserData"> | string | null
    values?: StringNullableListFilter<"UserData">
    ownerId?: StringWithAggregatesFilter<"UserData"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserData"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserData"> | Date | string
  }

  export type UserChannelDataWhereInput = {
    AND?: UserChannelDataWhereInput | UserChannelDataWhereInput[]
    OR?: UserChannelDataWhereInput[]
    NOT?: UserChannelDataWhereInput | UserChannelDataWhereInput[]
    id?: StringFilter<"UserChannelData"> | string
    channelId?: StringFilter<"UserChannelData"> | string
    key?: StringFilter<"UserChannelData"> | string
    version?: StringFilter<"UserChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserChannelData">
    value?: StringNullableFilter<"UserChannelData"> | string | null
    values?: StringNullableListFilter<"UserChannelData">
    ownerId?: StringFilter<"UserChannelData"> | string
    createdAt?: DateTimeFilter<"UserChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"UserChannelData"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type UserChannelDataOrderByWithRelationInput = {
    id?: SortOrder
    channelId?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserChannelDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ownerId_channelId_key_version?: UserChannelDataOwnerIdChannelIdKeyVersionCompoundUniqueInput
    AND?: UserChannelDataWhereInput | UserChannelDataWhereInput[]
    OR?: UserChannelDataWhereInput[]
    NOT?: UserChannelDataWhereInput | UserChannelDataWhereInput[]
    channelId?: StringFilter<"UserChannelData"> | string
    key?: StringFilter<"UserChannelData"> | string
    version?: StringFilter<"UserChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserChannelData">
    value?: StringNullableFilter<"UserChannelData"> | string | null
    values?: StringNullableListFilter<"UserChannelData">
    ownerId?: StringFilter<"UserChannelData"> | string
    createdAt?: DateTimeFilter<"UserChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"UserChannelData"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "ownerId_channelId_key_version">

  export type UserChannelDataOrderByWithAggregationInput = {
    id?: SortOrder
    channelId?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserChannelDataCountOrderByAggregateInput
    _max?: UserChannelDataMaxOrderByAggregateInput
    _min?: UserChannelDataMinOrderByAggregateInput
  }

  export type UserChannelDataScalarWhereWithAggregatesInput = {
    AND?: UserChannelDataScalarWhereWithAggregatesInput | UserChannelDataScalarWhereWithAggregatesInput[]
    OR?: UserChannelDataScalarWhereWithAggregatesInput[]
    NOT?: UserChannelDataScalarWhereWithAggregatesInput | UserChannelDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserChannelData"> | string
    channelId?: StringWithAggregatesFilter<"UserChannelData"> | string
    key?: StringWithAggregatesFilter<"UserChannelData"> | string
    version?: StringWithAggregatesFilter<"UserChannelData"> | string
    type?: EnumE_DATA_TYPESWithAggregatesFilter<"UserChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableWithAggregatesFilter<"UserChannelData">
    value?: StringNullableWithAggregatesFilter<"UserChannelData"> | string | null
    values?: StringNullableListFilter<"UserChannelData">
    ownerId?: StringWithAggregatesFilter<"UserChannelData"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserChannelData"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserChannelData"> | Date | string
  }

  export type ElementButtonLanguageWhereInput = {
    AND?: ElementButtonLanguageWhereInput | ElementButtonLanguageWhereInput[]
    OR?: ElementButtonLanguageWhereInput[]
    NOT?: ElementButtonLanguageWhereInput | ElementButtonLanguageWhereInput[]
    id?: StringFilter<"ElementButtonLanguage"> | string
    name?: StringFilter<"ElementButtonLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementButtonContentCompositeFilter, ElementButtonContentObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementButtonLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementButtonLanguage"> | Date | string
  }

  export type ElementButtonLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: ElementButtonContentOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementButtonLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ElementButtonLanguageWhereInput | ElementButtonLanguageWhereInput[]
    OR?: ElementButtonLanguageWhereInput[]
    NOT?: ElementButtonLanguageWhereInput | ElementButtonLanguageWhereInput[]
    name?: StringFilter<"ElementButtonLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementButtonContentCompositeFilter, ElementButtonContentObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementButtonLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementButtonLanguage"> | Date | string
  }, "id">

  export type ElementButtonLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ElementButtonLanguageCountOrderByAggregateInput
    _max?: ElementButtonLanguageMaxOrderByAggregateInput
    _min?: ElementButtonLanguageMinOrderByAggregateInput
  }

  export type ElementButtonLanguageScalarWhereWithAggregatesInput = {
    AND?: ElementButtonLanguageScalarWhereWithAggregatesInput | ElementButtonLanguageScalarWhereWithAggregatesInput[]
    OR?: ElementButtonLanguageScalarWhereWithAggregatesInput[]
    NOT?: ElementButtonLanguageScalarWhereWithAggregatesInput | ElementButtonLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ElementButtonLanguage"> | string
    name?: StringWithAggregatesFilter<"ElementButtonLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ElementButtonLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ElementButtonLanguage"> | Date | string
  }

  export type ElementTextInputLanguageWhereInput = {
    AND?: ElementTextInputLanguageWhereInput | ElementTextInputLanguageWhereInput[]
    OR?: ElementTextInputLanguageWhereInput[]
    NOT?: ElementTextInputLanguageWhereInput | ElementTextInputLanguageWhereInput[]
    id?: StringFilter<"ElementTextInputLanguage"> | string
    name?: StringFilter<"ElementTextInputLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementTextInputContentLanguageCompositeFilter, ElementTextInputContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementTextInputLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementTextInputLanguage"> | Date | string
  }

  export type ElementTextInputLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: ElementTextInputContentLanguageOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementTextInputLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ElementTextInputLanguageWhereInput | ElementTextInputLanguageWhereInput[]
    OR?: ElementTextInputLanguageWhereInput[]
    NOT?: ElementTextInputLanguageWhereInput | ElementTextInputLanguageWhereInput[]
    name?: StringFilter<"ElementTextInputLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementTextInputContentLanguageCompositeFilter, ElementTextInputContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementTextInputLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementTextInputLanguage"> | Date | string
  }, "id">

  export type ElementTextInputLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ElementTextInputLanguageCountOrderByAggregateInput
    _max?: ElementTextInputLanguageMaxOrderByAggregateInput
    _min?: ElementTextInputLanguageMinOrderByAggregateInput
  }

  export type ElementTextInputLanguageScalarWhereWithAggregatesInput = {
    AND?: ElementTextInputLanguageScalarWhereWithAggregatesInput | ElementTextInputLanguageScalarWhereWithAggregatesInput[]
    OR?: ElementTextInputLanguageScalarWhereWithAggregatesInput[]
    NOT?: ElementTextInputLanguageScalarWhereWithAggregatesInput | ElementTextInputLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ElementTextInputLanguage"> | string
    name?: StringWithAggregatesFilter<"ElementTextInputLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ElementTextInputLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ElementTextInputLanguage"> | Date | string
  }

  export type ElementSelectMenuLanguageWhereInput = {
    AND?: ElementSelectMenuLanguageWhereInput | ElementSelectMenuLanguageWhereInput[]
    OR?: ElementSelectMenuLanguageWhereInput[]
    NOT?: ElementSelectMenuLanguageWhereInput | ElementSelectMenuLanguageWhereInput[]
    id?: StringFilter<"ElementSelectMenuLanguage"> | string
    name?: StringFilter<"ElementSelectMenuLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementSelectMenuLanguageContentCompositeFilter, ElementSelectMenuLanguageContentObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementSelectMenuLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementSelectMenuLanguage"> | Date | string
  }

  export type ElementSelectMenuLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: ElementSelectMenuLanguageContentOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementSelectMenuLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ElementSelectMenuLanguageWhereInput | ElementSelectMenuLanguageWhereInput[]
    OR?: ElementSelectMenuLanguageWhereInput[]
    NOT?: ElementSelectMenuLanguageWhereInput | ElementSelectMenuLanguageWhereInput[]
    name?: StringFilter<"ElementSelectMenuLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ElementSelectMenuLanguageContentCompositeFilter, ElementSelectMenuLanguageContentObjectEqualityInput>
    createdAt?: DateTimeFilter<"ElementSelectMenuLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ElementSelectMenuLanguage"> | Date | string
  }, "id">

  export type ElementSelectMenuLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ElementSelectMenuLanguageCountOrderByAggregateInput
    _max?: ElementSelectMenuLanguageMaxOrderByAggregateInput
    _min?: ElementSelectMenuLanguageMinOrderByAggregateInput
  }

  export type ElementSelectMenuLanguageScalarWhereWithAggregatesInput = {
    AND?: ElementSelectMenuLanguageScalarWhereWithAggregatesInput | ElementSelectMenuLanguageScalarWhereWithAggregatesInput[]
    OR?: ElementSelectMenuLanguageScalarWhereWithAggregatesInput[]
    NOT?: ElementSelectMenuLanguageScalarWhereWithAggregatesInput | ElementSelectMenuLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ElementSelectMenuLanguage"> | string
    name?: StringWithAggregatesFilter<"ElementSelectMenuLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ElementSelectMenuLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ElementSelectMenuLanguage"> | Date | string
  }

  export type EmbedLanguageWhereInput = {
    AND?: EmbedLanguageWhereInput | EmbedLanguageWhereInput[]
    OR?: EmbedLanguageWhereInput[]
    NOT?: EmbedLanguageWhereInput | EmbedLanguageWhereInput[]
    id?: StringFilter<"EmbedLanguage"> | string
    name?: StringFilter<"EmbedLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<EmbedContentLanguageCompositeFilter, EmbedContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"EmbedLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"EmbedLanguage"> | Date | string
  }

  export type EmbedLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: EmbedContentLanguageOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmbedLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmbedLanguageWhereInput | EmbedLanguageWhereInput[]
    OR?: EmbedLanguageWhereInput[]
    NOT?: EmbedLanguageWhereInput | EmbedLanguageWhereInput[]
    name?: StringFilter<"EmbedLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<EmbedContentLanguageCompositeFilter, EmbedContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"EmbedLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"EmbedLanguage"> | Date | string
  }, "id">

  export type EmbedLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EmbedLanguageCountOrderByAggregateInput
    _max?: EmbedLanguageMaxOrderByAggregateInput
    _min?: EmbedLanguageMinOrderByAggregateInput
  }

  export type EmbedLanguageScalarWhereWithAggregatesInput = {
    AND?: EmbedLanguageScalarWhereWithAggregatesInput | EmbedLanguageScalarWhereWithAggregatesInput[]
    OR?: EmbedLanguageScalarWhereWithAggregatesInput[]
    NOT?: EmbedLanguageScalarWhereWithAggregatesInput | EmbedLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmbedLanguage"> | string
    name?: StringWithAggregatesFilter<"EmbedLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"EmbedLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"EmbedLanguage"> | Date | string
  }

  export type MarkdownLanguageWhereInput = {
    AND?: MarkdownLanguageWhereInput | MarkdownLanguageWhereInput[]
    OR?: MarkdownLanguageWhereInput[]
    NOT?: MarkdownLanguageWhereInput | MarkdownLanguageWhereInput[]
    id?: StringFilter<"MarkdownLanguage"> | string
    name?: StringFilter<"MarkdownLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<MarkdownContentLanguageCompositeFilter, MarkdownContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"MarkdownLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"MarkdownLanguage"> | Date | string
  }

  export type MarkdownLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: MarkdownContentLanguageOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MarkdownLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MarkdownLanguageWhereInput | MarkdownLanguageWhereInput[]
    OR?: MarkdownLanguageWhereInput[]
    NOT?: MarkdownLanguageWhereInput | MarkdownLanguageWhereInput[]
    name?: StringFilter<"MarkdownLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<MarkdownContentLanguageCompositeFilter, MarkdownContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"MarkdownLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"MarkdownLanguage"> | Date | string
  }, "id">

  export type MarkdownLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MarkdownLanguageCountOrderByAggregateInput
    _max?: MarkdownLanguageMaxOrderByAggregateInput
    _min?: MarkdownLanguageMinOrderByAggregateInput
  }

  export type MarkdownLanguageScalarWhereWithAggregatesInput = {
    AND?: MarkdownLanguageScalarWhereWithAggregatesInput | MarkdownLanguageScalarWhereWithAggregatesInput[]
    OR?: MarkdownLanguageScalarWhereWithAggregatesInput[]
    NOT?: MarkdownLanguageScalarWhereWithAggregatesInput | MarkdownLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarkdownLanguage"> | string
    name?: StringWithAggregatesFilter<"MarkdownLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MarkdownLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MarkdownLanguage"> | Date | string
  }

  export type ModalLanguageWhereInput = {
    AND?: ModalLanguageWhereInput | ModalLanguageWhereInput[]
    OR?: ModalLanguageWhereInput[]
    NOT?: ModalLanguageWhereInput | ModalLanguageWhereInput[]
    id?: StringFilter<"ModalLanguage"> | string
    name?: StringFilter<"ModalLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ModalContentLanguageCompositeFilter, ModalContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"ModalLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ModalLanguage"> | Date | string
  }

  export type ModalLanguageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    language?: LanguageOrderByInput
    content?: ModalContentLanguageOrderByInput
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModalLanguageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ModalLanguageWhereInput | ModalLanguageWhereInput[]
    OR?: ModalLanguageWhereInput[]
    NOT?: ModalLanguageWhereInput | ModalLanguageWhereInput[]
    name?: StringFilter<"ModalLanguage"> | string
    language?: XOR<LanguageCompositeFilter, LanguageObjectEqualityInput>
    content?: XOR<ModalContentLanguageCompositeFilter, ModalContentLanguageObjectEqualityInput>
    createdAt?: DateTimeFilter<"ModalLanguage"> | Date | string
    updatedAt?: DateTimeFilter<"ModalLanguage"> | Date | string
  }, "id">

  export type ModalLanguageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ModalLanguageCountOrderByAggregateInput
    _max?: ModalLanguageMaxOrderByAggregateInput
    _min?: ModalLanguageMinOrderByAggregateInput
  }

  export type ModalLanguageScalarWhereWithAggregatesInput = {
    AND?: ModalLanguageScalarWhereWithAggregatesInput | ModalLanguageScalarWhereWithAggregatesInput[]
    OR?: ModalLanguageScalarWhereWithAggregatesInput[]
    NOT?: ModalLanguageScalarWhereWithAggregatesInput | ModalLanguageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ModalLanguage"> | string
    name?: StringWithAggregatesFilter<"ModalLanguage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ModalLanguage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ModalLanguage"> | Date | string
  }

  export type ConfigCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ConfigCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUncheckedCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ConfigCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ConfigUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ConfigUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigCreateManyInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ConfigCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ConfigUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ConfigUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryCreateInput = {
    id?: string
    name: string
    categoryId: string
    guildId: string
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUncheckedCreateInput = {
    id?: string
    name: string
    categoryId: string
    guildId: string
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryCreateManyInput = {
    id?: string
    name: string
    categoryId: string
    guildId: string
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuildCreateInput = {
    id?: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedAtInternal?: Date | string | null
    data?: GuildDataCreateNestedManyWithoutGuildInput
  }

  export type GuildUncheckedCreateInput = {
    id?: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedAtInternal?: Date | string | null
    data?: GuildDataUncheckedCreateNestedManyWithoutGuildInput
  }

  export type GuildUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data?: GuildDataUpdateManyWithoutGuildNestedInput
  }

  export type GuildUncheckedUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data?: GuildDataUncheckedUpdateManyWithoutGuildNestedInput
  }

  export type GuildCreateManyInput = {
    id?: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedAtInternal?: Date | string | null
  }

  export type GuildUpdateManyMutationInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuildUncheckedUpdateManyInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuildDataCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    guild: GuildCreateNestedOneWithoutDataInput
  }

  export type GuildDataUncheckedCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuildDataUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    guild?: GuildUpdateOneRequiredWithoutDataNestedInput
  }

  export type GuildDataUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuildDataCreateManyInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuildDataUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuildDataUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelCreateInput = {
    id?: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId?: string | null
    ownerChannelId?: string | null
    version?: string
    internalType?: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: ChannelDataCreateNestedManyWithoutChannelInput
  }

  export type ChannelUncheckedCreateInput = {
    id?: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId?: string | null
    ownerChannelId?: string | null
    version?: string
    internalType?: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: ChannelDataUncheckedCreateNestedManyWithoutChannelInput
  }

  export type ChannelUpdateInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: ChannelDataUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: ChannelDataUncheckedUpdateManyWithoutChannelNestedInput
  }

  export type ChannelCreateManyInput = {
    id?: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId?: string | null
    ownerChannelId?: string | null
    version?: string
    internalType?: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelUpdateManyMutationInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelUncheckedUpdateManyInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    channel: ChannelCreateNestedOneWithoutDataInput
  }

  export type ChannelDataUncheckedCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelDataUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channel?: ChannelUpdateOneRequiredWithoutDataNestedInput
  }

  export type ChannelDataUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataCreateManyInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelDataUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: UserDataCreateNestedManyWithoutUserInput
    channelData?: UserChannelDataCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: UserDataUncheckedCreateNestedManyWithoutUserInput
    channelData?: UserChannelDataUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: UserDataUpdateManyWithoutUserNestedInput
    channelData?: UserChannelDataUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: UserDataUncheckedUpdateManyWithoutUserNestedInput
    channelData?: UserChannelDataUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDataInput
  }

  export type UserDataUncheckedCreateInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserDataUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDataNestedInput
  }

  export type UserDataUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataCreateManyInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserDataUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataCreateInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutChannelDataInput
  }

  export type UserChannelDataUncheckedCreateInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserChannelDataUpdateInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutChannelDataNestedInput
  }

  export type UserChannelDataUncheckedUpdateInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataCreateManyInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserChannelDataUpdateManyMutationInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataUncheckedUpdateManyInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementButtonLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementButtonContentCreateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementButtonLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementButtonContentCreateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementButtonLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementButtonContentUpdateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementButtonLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementButtonContentUpdateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementButtonLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementButtonContentCreateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementButtonLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementButtonContentUpdateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementButtonLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementButtonContentUpdateEnvelopeInput, ElementButtonContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementTextInputLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementTextInputContentLanguageCreateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementTextInputLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementTextInputContentLanguageCreateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementTextInputLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementTextInputContentLanguageUpdateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementTextInputLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementTextInputContentLanguageUpdateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementTextInputLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementTextInputContentLanguageCreateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementTextInputLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementTextInputContentLanguageUpdateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementTextInputLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementTextInputContentLanguageUpdateEnvelopeInput, ElementTextInputContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementSelectMenuLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementSelectMenuLanguageContentCreateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementSelectMenuLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementSelectMenuLanguageContentCreateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementSelectMenuLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementSelectMenuLanguageContentUpdateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementSelectMenuLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementSelectMenuLanguageContentUpdateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementSelectMenuLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ElementSelectMenuLanguageContentCreateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ElementSelectMenuLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementSelectMenuLanguageContentUpdateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementSelectMenuLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ElementSelectMenuLanguageContentUpdateEnvelopeInput, ElementSelectMenuLanguageContentCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbedLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<EmbedContentLanguageCreateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmbedLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<EmbedContentLanguageCreateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmbedLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<EmbedContentLanguageUpdateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbedLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<EmbedContentLanguageUpdateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbedLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<EmbedContentLanguageCreateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmbedLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<EmbedContentLanguageUpdateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbedLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<EmbedContentLanguageUpdateEnvelopeInput, EmbedContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarkdownLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<MarkdownContentLanguageCreateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MarkdownLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<MarkdownContentLanguageCreateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MarkdownLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<MarkdownContentLanguageUpdateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarkdownLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<MarkdownContentLanguageUpdateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarkdownLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<MarkdownContentLanguageCreateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MarkdownLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<MarkdownContentLanguageUpdateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarkdownLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<MarkdownContentLanguageUpdateEnvelopeInput, MarkdownContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModalLanguageCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ModalContentLanguageCreateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModalLanguageUncheckedCreateInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ModalContentLanguageCreateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModalLanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ModalContentLanguageUpdateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModalLanguageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ModalContentLanguageUpdateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModalLanguageCreateManyInput = {
    id?: string
    name: string
    language: XOR<LanguageCreateEnvelopeInput, LanguageCreateInput>
    content: XOR<ModalContentLanguageCreateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModalLanguageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ModalContentLanguageUpdateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModalLanguageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    language?: XOR<LanguageUpdateEnvelopeInput, LanguageCreateInput>
    content?: XOR<ModalContentLanguageUpdateEnvelopeInput, ModalContentLanguageCreateInput>
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumE_DATA_TYPESFilter<$PrismaModel = never> = {
    equals?: $Enums.E_DATA_TYPES | EnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_DATA_TYPESFilter<$PrismaModel> | $Enums.E_DATA_TYPES
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ConfigKeyVersionCompoundUniqueInput = {
    key: string
    version: string
  }

  export type ConfigCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumE_DATA_TYPESWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.E_DATA_TYPES | EnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_DATA_TYPESWithAggregatesFilter<$PrismaModel> | $Enums.E_DATA_TYPES
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumE_DATA_TYPESFilter<$PrismaModel>
    _max?: NestedEnumE_DATA_TYPESFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    categoryId?: SortOrder
    guildId?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    createdAtDiscord?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    categoryId?: SortOrder
    guildId?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    categoryId?: SortOrder
    guildId?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    createdAtDiscord?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type GuildDataListRelationFilter = {
    every?: GuildDataWhereInput
    some?: GuildDataWhereInput
    none?: GuildDataWhereInput
  }

  export type GuildDataOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GuildCountOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    name?: SortOrder
    isInGuild?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedAtInternal?: SortOrder
  }

  export type GuildMaxOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    name?: SortOrder
    isInGuild?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedAtInternal?: SortOrder
  }

  export type GuildMinOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    name?: SortOrder
    isInGuild?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    updatedAtInternal?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type GuildRelationFilter = {
    is?: GuildWhereInput
    isNot?: GuildWhereInput
  }

  export type GuildDataOwnerIdKeyVersionCompoundUniqueInput = {
    ownerId: string
    key: string
    version: string
  }

  export type GuildDataCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GuildDataMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GuildDataMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel = never> = {
    equals?: $Enums.E_INTERNAL_CHANNEL_TYPES | EnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel> | $Enums.E_INTERNAL_CHANNEL_TYPES
  }

  export type ChannelDataListRelationFilter = {
    every?: ChannelDataWhereInput
    some?: ChannelDataWhereInput
    none?: ChannelDataWhereInput
  }

  export type ChannelDataOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChannelCountOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    userOwnerId?: SortOrder
    categoryId?: SortOrder
    ownerChannelId?: SortOrder
    version?: SortOrder
    internalType?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChannelAvgOrderByAggregateInput = {
    createdAtDiscord?: SortOrder
  }

  export type ChannelMaxOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    userOwnerId?: SortOrder
    categoryId?: SortOrder
    ownerChannelId?: SortOrder
    version?: SortOrder
    internalType?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChannelMinOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    userOwnerId?: SortOrder
    categoryId?: SortOrder
    ownerChannelId?: SortOrder
    version?: SortOrder
    internalType?: SortOrder
    createdAtDiscord?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChannelSumOrderByAggregateInput = {
    createdAtDiscord?: SortOrder
  }

  export type EnumE_INTERNAL_CHANNEL_TYPESWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.E_INTERNAL_CHANNEL_TYPES | EnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_INTERNAL_CHANNEL_TYPESWithAggregatesFilter<$PrismaModel> | $Enums.E_INTERNAL_CHANNEL_TYPES
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel>
    _max?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel>
  }

  export type ChannelRelationFilter = {
    is?: ChannelWhereInput
    isNot?: ChannelWhereInput
  }

  export type ChannelDataOwnerIdKeyVersionCompoundUniqueInput = {
    ownerId: string
    key: string
    version: string
  }

  export type ChannelDataCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChannelDataMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChannelDataMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserDataListRelationFilter = {
    every?: UserDataWhereInput
    some?: UserDataWhereInput
    none?: UserDataWhereInput
  }

  export type UserChannelDataListRelationFilter = {
    every?: UserChannelDataWhereInput
    some?: UserChannelDataWhereInput
    none?: UserChannelDataWhereInput
  }

  export type UserDataOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserChannelDataOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserDataOwnerIdKeyVersionCompoundUniqueInput = {
    ownerId: string
    key: string
    version: string
  }

  export type UserDataCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserDataMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserDataMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserChannelDataOwnerIdChannelIdKeyVersionCompoundUniqueInput = {
    ownerId: string
    channelId: string
    key: string
    version: string
  }

  export type UserChannelDataCountOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    object?: SortOrder
    value?: SortOrder
    values?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserChannelDataMaxOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserChannelDataMinOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    key?: SortOrder
    version?: SortOrder
    type?: SortOrder
    value?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LanguageCompositeFilter = {
    equals?: LanguageObjectEqualityInput
    is?: LanguageWhereInput
    isNot?: LanguageWhereInput
  }

  export type LanguageObjectEqualityInput = {
    name: string
    code: string
  }

  export type ElementButtonContentCompositeFilter = {
    equals?: ElementButtonContentObjectEqualityInput
    is?: ElementButtonContentWhereInput
    isNot?: ElementButtonContentWhereInput
  }

  export type ElementButtonContentObjectEqualityInput = {
    label: string
    options?: InputJsonValue | null
  }

  export type LanguageOrderByInput = {
    name?: SortOrder
    code?: SortOrder
  }

  export type ElementButtonContentOrderByInput = {
    label?: SortOrder
    options?: SortOrder
  }

  export type ElementButtonLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementButtonLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementButtonLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementTextInputContentLanguageCompositeFilter = {
    equals?: ElementTextInputContentLanguageObjectEqualityInput
    is?: ElementTextInputContentLanguageWhereInput
    isNot?: ElementTextInputContentLanguageWhereInput
  }

  export type ElementTextInputContentLanguageObjectEqualityInput = {
    label: string
    placeholder?: string | null
  }

  export type ElementTextInputContentLanguageOrderByInput = {
    label?: SortOrder
    placeholder?: SortOrder
  }

  export type ElementTextInputLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementTextInputLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementTextInputLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementSelectMenuLanguageContentCompositeFilter = {
    equals?: ElementSelectMenuLanguageContentObjectEqualityInput
    is?: ElementSelectMenuLanguageContentWhereInput
    isNot?: ElementSelectMenuLanguageContentWhereInput
  }

  export type ElementSelectMenuLanguageContentObjectEqualityInput = {
    placeholder?: string | null
    selectOptions?: ElementSelectMenuOptionsLanguageObjectEqualityInput[]
    options?: InputJsonValue | null
  }

  export type ElementSelectMenuLanguageContentOrderByInput = {
    placeholder?: SortOrder
    selectOptions?: ElementSelectMenuOptionsLanguageOrderByCompositeAggregateInput
    options?: SortOrder
  }

  export type ElementSelectMenuLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementSelectMenuLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ElementSelectMenuLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmbedContentLanguageCompositeFilter = {
    equals?: EmbedContentLanguageObjectEqualityInput
    is?: EmbedContentLanguageWhereInput
    isNot?: EmbedContentLanguageWhereInput
  }

  export type EmbedContentLanguageObjectEqualityInput = {
    title?: string | null
    description?: string | null
    footer?: string | null
    options?: InputJsonValue | null
    arrayOptions?: InputJsonValue | null
  }

  export type EmbedContentLanguageOrderByInput = {
    title?: SortOrder
    description?: SortOrder
    footer?: SortOrder
    options?: SortOrder
    arrayOptions?: SortOrder
  }

  export type EmbedLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmbedLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmbedLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MarkdownContentLanguageCompositeFilter = {
    equals?: MarkdownContentLanguageObjectEqualityInput
    is?: MarkdownContentLanguageWhereInput
    isNot?: MarkdownContentLanguageWhereInput
  }

  export type MarkdownContentLanguageObjectEqualityInput = {
    content: string
    options?: InputJsonValue | null
  }

  export type MarkdownContentLanguageOrderByInput = {
    content?: SortOrder
    options?: SortOrder
  }

  export type MarkdownLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MarkdownLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MarkdownLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModalContentLanguageCompositeFilter = {
    equals?: ModalContentLanguageObjectEqualityInput
    is?: ModalContentLanguageWhereInput
    isNot?: ModalContentLanguageWhereInput
  }

  export type ModalContentLanguageObjectEqualityInput = {
    title: string
  }

  export type ModalContentLanguageOrderByInput = {
    title?: SortOrder
  }

  export type ModalLanguageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModalLanguageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModalLanguageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigCreatevaluesInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumE_DATA_TYPESFieldUpdateOperationsInput = {
    set?: $Enums.E_DATA_TYPES
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type ConfigUpdatevaluesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GuildDataCreateNestedManyWithoutGuildInput = {
    create?: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput> | GuildDataCreateWithoutGuildInput[] | GuildDataUncheckedCreateWithoutGuildInput[]
    connectOrCreate?: GuildDataCreateOrConnectWithoutGuildInput | GuildDataCreateOrConnectWithoutGuildInput[]
    createMany?: GuildDataCreateManyGuildInputEnvelope
    connect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
  }

  export type GuildDataUncheckedCreateNestedManyWithoutGuildInput = {
    create?: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput> | GuildDataCreateWithoutGuildInput[] | GuildDataUncheckedCreateWithoutGuildInput[]
    connectOrCreate?: GuildDataCreateOrConnectWithoutGuildInput | GuildDataCreateOrConnectWithoutGuildInput[]
    createMany?: GuildDataCreateManyGuildInputEnvelope
    connect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type GuildDataUpdateManyWithoutGuildNestedInput = {
    create?: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput> | GuildDataCreateWithoutGuildInput[] | GuildDataUncheckedCreateWithoutGuildInput[]
    connectOrCreate?: GuildDataCreateOrConnectWithoutGuildInput | GuildDataCreateOrConnectWithoutGuildInput[]
    upsert?: GuildDataUpsertWithWhereUniqueWithoutGuildInput | GuildDataUpsertWithWhereUniqueWithoutGuildInput[]
    createMany?: GuildDataCreateManyGuildInputEnvelope
    set?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    disconnect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    delete?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    connect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    update?: GuildDataUpdateWithWhereUniqueWithoutGuildInput | GuildDataUpdateWithWhereUniqueWithoutGuildInput[]
    updateMany?: GuildDataUpdateManyWithWhereWithoutGuildInput | GuildDataUpdateManyWithWhereWithoutGuildInput[]
    deleteMany?: GuildDataScalarWhereInput | GuildDataScalarWhereInput[]
  }

  export type GuildDataUncheckedUpdateManyWithoutGuildNestedInput = {
    create?: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput> | GuildDataCreateWithoutGuildInput[] | GuildDataUncheckedCreateWithoutGuildInput[]
    connectOrCreate?: GuildDataCreateOrConnectWithoutGuildInput | GuildDataCreateOrConnectWithoutGuildInput[]
    upsert?: GuildDataUpsertWithWhereUniqueWithoutGuildInput | GuildDataUpsertWithWhereUniqueWithoutGuildInput[]
    createMany?: GuildDataCreateManyGuildInputEnvelope
    set?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    disconnect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    delete?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    connect?: GuildDataWhereUniqueInput | GuildDataWhereUniqueInput[]
    update?: GuildDataUpdateWithWhereUniqueWithoutGuildInput | GuildDataUpdateWithWhereUniqueWithoutGuildInput[]
    updateMany?: GuildDataUpdateManyWithWhereWithoutGuildInput | GuildDataUpdateManyWithWhereWithoutGuildInput[]
    deleteMany?: GuildDataScalarWhereInput | GuildDataScalarWhereInput[]
  }

  export type GuildDataCreatevaluesInput = {
    set: string[]
  }

  export type GuildCreateNestedOneWithoutDataInput = {
    create?: XOR<GuildCreateWithoutDataInput, GuildUncheckedCreateWithoutDataInput>
    connectOrCreate?: GuildCreateOrConnectWithoutDataInput
    connect?: GuildWhereUniqueInput
  }

  export type GuildDataUpdatevaluesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type GuildUpdateOneRequiredWithoutDataNestedInput = {
    create?: XOR<GuildCreateWithoutDataInput, GuildUncheckedCreateWithoutDataInput>
    connectOrCreate?: GuildCreateOrConnectWithoutDataInput
    upsert?: GuildUpsertWithoutDataInput
    connect?: GuildWhereUniqueInput
    update?: XOR<XOR<GuildUpdateToOneWithWhereWithoutDataInput, GuildUpdateWithoutDataInput>, GuildUncheckedUpdateWithoutDataInput>
  }

  export type ChannelDataCreateNestedManyWithoutChannelInput = {
    create?: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput> | ChannelDataCreateWithoutChannelInput[] | ChannelDataUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: ChannelDataCreateOrConnectWithoutChannelInput | ChannelDataCreateOrConnectWithoutChannelInput[]
    createMany?: ChannelDataCreateManyChannelInputEnvelope
    connect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
  }

  export type ChannelDataUncheckedCreateNestedManyWithoutChannelInput = {
    create?: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput> | ChannelDataCreateWithoutChannelInput[] | ChannelDataUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: ChannelDataCreateOrConnectWithoutChannelInput | ChannelDataCreateOrConnectWithoutChannelInput[]
    createMany?: ChannelDataCreateManyChannelInputEnvelope
    connect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
  }

  export type EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput = {
    set?: $Enums.E_INTERNAL_CHANNEL_TYPES
  }

  export type ChannelDataUpdateManyWithoutChannelNestedInput = {
    create?: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput> | ChannelDataCreateWithoutChannelInput[] | ChannelDataUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: ChannelDataCreateOrConnectWithoutChannelInput | ChannelDataCreateOrConnectWithoutChannelInput[]
    upsert?: ChannelDataUpsertWithWhereUniqueWithoutChannelInput | ChannelDataUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: ChannelDataCreateManyChannelInputEnvelope
    set?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    disconnect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    delete?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    connect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    update?: ChannelDataUpdateWithWhereUniqueWithoutChannelInput | ChannelDataUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: ChannelDataUpdateManyWithWhereWithoutChannelInput | ChannelDataUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: ChannelDataScalarWhereInput | ChannelDataScalarWhereInput[]
  }

  export type ChannelDataUncheckedUpdateManyWithoutChannelNestedInput = {
    create?: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput> | ChannelDataCreateWithoutChannelInput[] | ChannelDataUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: ChannelDataCreateOrConnectWithoutChannelInput | ChannelDataCreateOrConnectWithoutChannelInput[]
    upsert?: ChannelDataUpsertWithWhereUniqueWithoutChannelInput | ChannelDataUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: ChannelDataCreateManyChannelInputEnvelope
    set?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    disconnect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    delete?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    connect?: ChannelDataWhereUniqueInput | ChannelDataWhereUniqueInput[]
    update?: ChannelDataUpdateWithWhereUniqueWithoutChannelInput | ChannelDataUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: ChannelDataUpdateManyWithWhereWithoutChannelInput | ChannelDataUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: ChannelDataScalarWhereInput | ChannelDataScalarWhereInput[]
  }

  export type ChannelDataCreatevaluesInput = {
    set: string[]
  }

  export type ChannelCreateNestedOneWithoutDataInput = {
    create?: XOR<ChannelCreateWithoutDataInput, ChannelUncheckedCreateWithoutDataInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutDataInput
    connect?: ChannelWhereUniqueInput
  }

  export type ChannelDataUpdatevaluesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ChannelUpdateOneRequiredWithoutDataNestedInput = {
    create?: XOR<ChannelCreateWithoutDataInput, ChannelUncheckedCreateWithoutDataInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutDataInput
    upsert?: ChannelUpsertWithoutDataInput
    connect?: ChannelWhereUniqueInput
    update?: XOR<XOR<ChannelUpdateToOneWithWhereWithoutDataInput, ChannelUpdateWithoutDataInput>, ChannelUncheckedUpdateWithoutDataInput>
  }

  export type UserDataCreateNestedManyWithoutUserInput = {
    create?: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput> | UserDataCreateWithoutUserInput[] | UserDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserDataCreateOrConnectWithoutUserInput | UserDataCreateOrConnectWithoutUserInput[]
    createMany?: UserDataCreateManyUserInputEnvelope
    connect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
  }

  export type UserChannelDataCreateNestedManyWithoutUserInput = {
    create?: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput> | UserChannelDataCreateWithoutUserInput[] | UserChannelDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserChannelDataCreateOrConnectWithoutUserInput | UserChannelDataCreateOrConnectWithoutUserInput[]
    createMany?: UserChannelDataCreateManyUserInputEnvelope
    connect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
  }

  export type UserDataUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput> | UserDataCreateWithoutUserInput[] | UserDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserDataCreateOrConnectWithoutUserInput | UserDataCreateOrConnectWithoutUserInput[]
    createMany?: UserDataCreateManyUserInputEnvelope
    connect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
  }

  export type UserChannelDataUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput> | UserChannelDataCreateWithoutUserInput[] | UserChannelDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserChannelDataCreateOrConnectWithoutUserInput | UserChannelDataCreateOrConnectWithoutUserInput[]
    createMany?: UserChannelDataCreateManyUserInputEnvelope
    connect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
  }

  export type UserDataUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput> | UserDataCreateWithoutUserInput[] | UserDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserDataCreateOrConnectWithoutUserInput | UserDataCreateOrConnectWithoutUserInput[]
    upsert?: UserDataUpsertWithWhereUniqueWithoutUserInput | UserDataUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserDataCreateManyUserInputEnvelope
    set?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    disconnect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    delete?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    connect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    update?: UserDataUpdateWithWhereUniqueWithoutUserInput | UserDataUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserDataUpdateManyWithWhereWithoutUserInput | UserDataUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserDataScalarWhereInput | UserDataScalarWhereInput[]
  }

  export type UserChannelDataUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput> | UserChannelDataCreateWithoutUserInput[] | UserChannelDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserChannelDataCreateOrConnectWithoutUserInput | UserChannelDataCreateOrConnectWithoutUserInput[]
    upsert?: UserChannelDataUpsertWithWhereUniqueWithoutUserInput | UserChannelDataUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserChannelDataCreateManyUserInputEnvelope
    set?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    disconnect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    delete?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    connect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    update?: UserChannelDataUpdateWithWhereUniqueWithoutUserInput | UserChannelDataUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserChannelDataUpdateManyWithWhereWithoutUserInput | UserChannelDataUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserChannelDataScalarWhereInput | UserChannelDataScalarWhereInput[]
  }

  export type UserDataUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput> | UserDataCreateWithoutUserInput[] | UserDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserDataCreateOrConnectWithoutUserInput | UserDataCreateOrConnectWithoutUserInput[]
    upsert?: UserDataUpsertWithWhereUniqueWithoutUserInput | UserDataUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserDataCreateManyUserInputEnvelope
    set?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    disconnect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    delete?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    connect?: UserDataWhereUniqueInput | UserDataWhereUniqueInput[]
    update?: UserDataUpdateWithWhereUniqueWithoutUserInput | UserDataUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserDataUpdateManyWithWhereWithoutUserInput | UserDataUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserDataScalarWhereInput | UserDataScalarWhereInput[]
  }

  export type UserChannelDataUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput> | UserChannelDataCreateWithoutUserInput[] | UserChannelDataUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserChannelDataCreateOrConnectWithoutUserInput | UserChannelDataCreateOrConnectWithoutUserInput[]
    upsert?: UserChannelDataUpsertWithWhereUniqueWithoutUserInput | UserChannelDataUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserChannelDataCreateManyUserInputEnvelope
    set?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    disconnect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    delete?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    connect?: UserChannelDataWhereUniqueInput | UserChannelDataWhereUniqueInput[]
    update?: UserChannelDataUpdateWithWhereUniqueWithoutUserInput | UserChannelDataUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserChannelDataUpdateManyWithWhereWithoutUserInput | UserChannelDataUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserChannelDataScalarWhereInput | UserChannelDataScalarWhereInput[]
  }

  export type UserDataCreatevaluesInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutDataInput = {
    create?: XOR<UserCreateWithoutDataInput, UserUncheckedCreateWithoutDataInput>
    connectOrCreate?: UserCreateOrConnectWithoutDataInput
    connect?: UserWhereUniqueInput
  }

  export type UserDataUpdatevaluesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutDataNestedInput = {
    create?: XOR<UserCreateWithoutDataInput, UserUncheckedCreateWithoutDataInput>
    connectOrCreate?: UserCreateOrConnectWithoutDataInput
    upsert?: UserUpsertWithoutDataInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDataInput, UserUpdateWithoutDataInput>, UserUncheckedUpdateWithoutDataInput>
  }

  export type UserChannelDataCreatevaluesInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutChannelDataInput = {
    create?: XOR<UserCreateWithoutChannelDataInput, UserUncheckedCreateWithoutChannelDataInput>
    connectOrCreate?: UserCreateOrConnectWithoutChannelDataInput
    connect?: UserWhereUniqueInput
  }

  export type UserChannelDataUpdatevaluesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutChannelDataNestedInput = {
    create?: XOR<UserCreateWithoutChannelDataInput, UserUncheckedCreateWithoutChannelDataInput>
    connectOrCreate?: UserCreateOrConnectWithoutChannelDataInput
    upsert?: UserUpsertWithoutChannelDataInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutChannelDataInput, UserUpdateWithoutChannelDataInput>, UserUncheckedUpdateWithoutChannelDataInput>
  }

  export type LanguageCreateEnvelopeInput = {
    set?: LanguageCreateInput
  }

  export type LanguageCreateInput = {
    name: string
    code: string
  }

  export type ElementButtonContentCreateEnvelopeInput = {
    set?: ElementButtonContentCreateInput
  }

  export type ElementButtonContentCreateInput = {
    label: string
    options?: InputJsonValue | null
  }

  export type LanguageUpdateEnvelopeInput = {
    set?: LanguageCreateInput
    update?: LanguageUpdateInput
  }

  export type ElementButtonContentUpdateEnvelopeInput = {
    set?: ElementButtonContentCreateInput
    update?: ElementButtonContentUpdateInput
  }

  export type ElementTextInputContentLanguageCreateEnvelopeInput = {
    set?: ElementTextInputContentLanguageCreateInput
  }

  export type ElementTextInputContentLanguageCreateInput = {
    label: string
    placeholder?: string | null
  }

  export type ElementTextInputContentLanguageUpdateEnvelopeInput = {
    set?: ElementTextInputContentLanguageCreateInput
    update?: ElementTextInputContentLanguageUpdateInput
  }

  export type ElementSelectMenuLanguageContentCreateEnvelopeInput = {
    set?: ElementSelectMenuLanguageContentCreateInput
  }

  export type ElementSelectMenuLanguageContentCreateInput = {
    placeholder?: string | null
    selectOptions?: ElementSelectMenuOptionsLanguageCreateInput | ElementSelectMenuOptionsLanguageCreateInput[]
    options?: InputJsonValue | null
  }

  export type ElementSelectMenuLanguageContentUpdateEnvelopeInput = {
    set?: ElementSelectMenuLanguageContentCreateInput
    update?: ElementSelectMenuLanguageContentUpdateInput
  }

  export type EmbedContentLanguageCreateEnvelopeInput = {
    set?: EmbedContentLanguageCreateInput
  }

  export type EmbedContentLanguageCreateInput = {
    title?: string | null
    description?: string | null
    footer?: string | null
    options?: InputJsonValue | null
    arrayOptions?: InputJsonValue | null
  }

  export type EmbedContentLanguageUpdateEnvelopeInput = {
    set?: EmbedContentLanguageCreateInput
    update?: EmbedContentLanguageUpdateInput
  }

  export type MarkdownContentLanguageCreateEnvelopeInput = {
    set?: MarkdownContentLanguageCreateInput
  }

  export type MarkdownContentLanguageCreateInput = {
    content: string
    options?: InputJsonValue | null
  }

  export type MarkdownContentLanguageUpdateEnvelopeInput = {
    set?: MarkdownContentLanguageCreateInput
    update?: MarkdownContentLanguageUpdateInput
  }

  export type ModalContentLanguageCreateEnvelopeInput = {
    set?: ModalContentLanguageCreateInput
  }

  export type ModalContentLanguageCreateInput = {
    title: string
  }

  export type ModalContentLanguageUpdateEnvelopeInput = {
    set?: ModalContentLanguageCreateInput
    update?: ModalContentLanguageUpdateInput
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumE_DATA_TYPESFilter<$PrismaModel = never> = {
    equals?: $Enums.E_DATA_TYPES | EnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_DATA_TYPESFilter<$PrismaModel> | $Enums.E_DATA_TYPES
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumE_DATA_TYPESWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.E_DATA_TYPES | EnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_DATA_TYPES[] | ListEnumE_DATA_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_DATA_TYPESWithAggregatesFilter<$PrismaModel> | $Enums.E_DATA_TYPES
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumE_DATA_TYPESFilter<$PrismaModel>
    _max?: NestedEnumE_DATA_TYPESFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel = never> = {
    equals?: $Enums.E_INTERNAL_CHANNEL_TYPES | EnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel> | $Enums.E_INTERNAL_CHANNEL_TYPES
  }

  export type NestedEnumE_INTERNAL_CHANNEL_TYPESWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.E_INTERNAL_CHANNEL_TYPES | EnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    in?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    notIn?: $Enums.E_INTERNAL_CHANNEL_TYPES[] | ListEnumE_INTERNAL_CHANNEL_TYPESFieldRefInput<$PrismaModel>
    not?: NestedEnumE_INTERNAL_CHANNEL_TYPESWithAggregatesFilter<$PrismaModel> | $Enums.E_INTERNAL_CHANNEL_TYPES
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel>
    _max?: NestedEnumE_INTERNAL_CHANNEL_TYPESFilter<$PrismaModel>
  }

  export type LanguageWhereInput = {
    AND?: LanguageWhereInput | LanguageWhereInput[]
    OR?: LanguageWhereInput[]
    NOT?: LanguageWhereInput | LanguageWhereInput[]
    name?: StringFilter<"Language"> | string
    code?: StringFilter<"Language"> | string
  }

  export type ElementButtonContentWhereInput = {
    AND?: ElementButtonContentWhereInput | ElementButtonContentWhereInput[]
    OR?: ElementButtonContentWhereInput[]
    NOT?: ElementButtonContentWhereInput | ElementButtonContentWhereInput[]
    label?: StringFilter<"ElementButtonContent"> | string
    options?: JsonNullableFilter<"ElementButtonContent">
  }

  export type ElementTextInputContentLanguageWhereInput = {
    AND?: ElementTextInputContentLanguageWhereInput | ElementTextInputContentLanguageWhereInput[]
    OR?: ElementTextInputContentLanguageWhereInput[]
    NOT?: ElementTextInputContentLanguageWhereInput | ElementTextInputContentLanguageWhereInput[]
    label?: StringFilter<"ElementTextInputContentLanguage"> | string
    placeholder?: StringNullableFilter<"ElementTextInputContentLanguage"> | string | null
  }

  export type ElementSelectMenuLanguageContentWhereInput = {
    AND?: ElementSelectMenuLanguageContentWhereInput | ElementSelectMenuLanguageContentWhereInput[]
    OR?: ElementSelectMenuLanguageContentWhereInput[]
    NOT?: ElementSelectMenuLanguageContentWhereInput | ElementSelectMenuLanguageContentWhereInput[]
    placeholder?: StringNullableFilter<"ElementSelectMenuLanguageContent"> | string | null
    selectOptions?: ElementSelectMenuOptionsLanguageCompositeListFilter | ElementSelectMenuOptionsLanguageObjectEqualityInput[]
    options?: JsonNullableFilter<"ElementSelectMenuLanguageContent">
  }

  export type ElementSelectMenuOptionsLanguageObjectEqualityInput = {
    label: string
  }

  export type ElementSelectMenuOptionsLanguageOrderByCompositeAggregateInput = {
    _count?: SortOrder
  }

  export type EmbedContentLanguageWhereInput = {
    AND?: EmbedContentLanguageWhereInput | EmbedContentLanguageWhereInput[]
    OR?: EmbedContentLanguageWhereInput[]
    NOT?: EmbedContentLanguageWhereInput | EmbedContentLanguageWhereInput[]
    title?: StringNullableFilter<"EmbedContentLanguage"> | string | null
    description?: StringNullableFilter<"EmbedContentLanguage"> | string | null
    footer?: StringNullableFilter<"EmbedContentLanguage"> | string | null
    options?: JsonNullableFilter<"EmbedContentLanguage">
    arrayOptions?: JsonNullableFilter<"EmbedContentLanguage">
  }

  export type MarkdownContentLanguageWhereInput = {
    AND?: MarkdownContentLanguageWhereInput | MarkdownContentLanguageWhereInput[]
    OR?: MarkdownContentLanguageWhereInput[]
    NOT?: MarkdownContentLanguageWhereInput | MarkdownContentLanguageWhereInput[]
    content?: StringFilter<"MarkdownContentLanguage"> | string
    options?: JsonNullableFilter<"MarkdownContentLanguage">
  }

  export type ModalContentLanguageWhereInput = {
    AND?: ModalContentLanguageWhereInput | ModalContentLanguageWhereInput[]
    OR?: ModalContentLanguageWhereInput[]
    NOT?: ModalContentLanguageWhereInput | ModalContentLanguageWhereInput[]
    title?: StringFilter<"ModalContentLanguage"> | string
  }

  export type GuildDataCreateWithoutGuildInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuildDataUncheckedCreateWithoutGuildInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuildDataCreateOrConnectWithoutGuildInput = {
    where: GuildDataWhereUniqueInput
    create: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput>
  }

  export type GuildDataCreateManyGuildInputEnvelope = {
    data: GuildDataCreateManyGuildInput | GuildDataCreateManyGuildInput[]
  }

  export type GuildDataUpsertWithWhereUniqueWithoutGuildInput = {
    where: GuildDataWhereUniqueInput
    update: XOR<GuildDataUpdateWithoutGuildInput, GuildDataUncheckedUpdateWithoutGuildInput>
    create: XOR<GuildDataCreateWithoutGuildInput, GuildDataUncheckedCreateWithoutGuildInput>
  }

  export type GuildDataUpdateWithWhereUniqueWithoutGuildInput = {
    where: GuildDataWhereUniqueInput
    data: XOR<GuildDataUpdateWithoutGuildInput, GuildDataUncheckedUpdateWithoutGuildInput>
  }

  export type GuildDataUpdateManyWithWhereWithoutGuildInput = {
    where: GuildDataScalarWhereInput
    data: XOR<GuildDataUpdateManyMutationInput, GuildDataUncheckedUpdateManyWithoutGuildInput>
  }

  export type GuildDataScalarWhereInput = {
    AND?: GuildDataScalarWhereInput | GuildDataScalarWhereInput[]
    OR?: GuildDataScalarWhereInput[]
    NOT?: GuildDataScalarWhereInput | GuildDataScalarWhereInput[]
    id?: StringFilter<"GuildData"> | string
    key?: StringFilter<"GuildData"> | string
    version?: StringFilter<"GuildData"> | string
    type?: EnumE_DATA_TYPESFilter<"GuildData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"GuildData">
    value?: StringNullableFilter<"GuildData"> | string | null
    values?: StringNullableListFilter<"GuildData">
    ownerId?: StringFilter<"GuildData"> | string
    createdAt?: DateTimeFilter<"GuildData"> | Date | string
    updatedAt?: DateTimeFilter<"GuildData"> | Date | string
  }

  export type GuildCreateWithoutDataInput = {
    id?: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedAtInternal?: Date | string | null
  }

  export type GuildUncheckedCreateWithoutDataInput = {
    id?: string
    guildId: string
    name: string
    isInGuild: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedAtInternal?: Date | string | null
  }

  export type GuildCreateOrConnectWithoutDataInput = {
    where: GuildWhereUniqueInput
    create: XOR<GuildCreateWithoutDataInput, GuildUncheckedCreateWithoutDataInput>
  }

  export type GuildUpsertWithoutDataInput = {
    update: XOR<GuildUpdateWithoutDataInput, GuildUncheckedUpdateWithoutDataInput>
    create: XOR<GuildCreateWithoutDataInput, GuildUncheckedCreateWithoutDataInput>
    where?: GuildWhereInput
  }

  export type GuildUpdateToOneWithWhereWithoutDataInput = {
    where?: GuildWhereInput
    data: XOR<GuildUpdateWithoutDataInput, GuildUncheckedUpdateWithoutDataInput>
  }

  export type GuildUpdateWithoutDataInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuildUncheckedUpdateWithoutDataInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isInGuild?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAtInternal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ChannelDataCreateWithoutChannelInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelDataUncheckedCreateWithoutChannelInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelDataCreateOrConnectWithoutChannelInput = {
    where: ChannelDataWhereUniqueInput
    create: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput>
  }

  export type ChannelDataCreateManyChannelInputEnvelope = {
    data: ChannelDataCreateManyChannelInput | ChannelDataCreateManyChannelInput[]
  }

  export type ChannelDataUpsertWithWhereUniqueWithoutChannelInput = {
    where: ChannelDataWhereUniqueInput
    update: XOR<ChannelDataUpdateWithoutChannelInput, ChannelDataUncheckedUpdateWithoutChannelInput>
    create: XOR<ChannelDataCreateWithoutChannelInput, ChannelDataUncheckedCreateWithoutChannelInput>
  }

  export type ChannelDataUpdateWithWhereUniqueWithoutChannelInput = {
    where: ChannelDataWhereUniqueInput
    data: XOR<ChannelDataUpdateWithoutChannelInput, ChannelDataUncheckedUpdateWithoutChannelInput>
  }

  export type ChannelDataUpdateManyWithWhereWithoutChannelInput = {
    where: ChannelDataScalarWhereInput
    data: XOR<ChannelDataUpdateManyMutationInput, ChannelDataUncheckedUpdateManyWithoutChannelInput>
  }

  export type ChannelDataScalarWhereInput = {
    AND?: ChannelDataScalarWhereInput | ChannelDataScalarWhereInput[]
    OR?: ChannelDataScalarWhereInput[]
    NOT?: ChannelDataScalarWhereInput | ChannelDataScalarWhereInput[]
    id?: StringFilter<"ChannelData"> | string
    key?: StringFilter<"ChannelData"> | string
    version?: StringFilter<"ChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"ChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"ChannelData">
    value?: StringNullableFilter<"ChannelData"> | string | null
    values?: StringNullableListFilter<"ChannelData">
    ownerId?: StringFilter<"ChannelData"> | string
    createdAt?: DateTimeFilter<"ChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"ChannelData"> | Date | string
  }

  export type ChannelCreateWithoutDataInput = {
    id?: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId?: string | null
    ownerChannelId?: string | null
    version?: string
    internalType?: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelUncheckedCreateWithoutDataInput = {
    id?: string
    channelId: string
    guildId: string
    userOwnerId: string
    categoryId?: string | null
    ownerChannelId?: string | null
    version?: string
    internalType?: $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelCreateOrConnectWithoutDataInput = {
    where: ChannelWhereUniqueInput
    create: XOR<ChannelCreateWithoutDataInput, ChannelUncheckedCreateWithoutDataInput>
  }

  export type ChannelUpsertWithoutDataInput = {
    update: XOR<ChannelUpdateWithoutDataInput, ChannelUncheckedUpdateWithoutDataInput>
    create: XOR<ChannelCreateWithoutDataInput, ChannelUncheckedCreateWithoutDataInput>
    where?: ChannelWhereInput
  }

  export type ChannelUpdateToOneWithWhereWithoutDataInput = {
    where?: ChannelWhereInput
    data: XOR<ChannelUpdateWithoutDataInput, ChannelUncheckedUpdateWithoutDataInput>
  }

  export type ChannelUpdateWithoutDataInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelUncheckedUpdateWithoutDataInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    userOwnerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    ownerChannelId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    internalType?: EnumE_INTERNAL_CHANNEL_TYPESFieldUpdateOperationsInput | $Enums.E_INTERNAL_CHANNEL_TYPES
    createdAtDiscord?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataCreateWithoutUserInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserDataUncheckedCreateWithoutUserInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserDataCreateOrConnectWithoutUserInput = {
    where: UserDataWhereUniqueInput
    create: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput>
  }

  export type UserDataCreateManyUserInputEnvelope = {
    data: UserDataCreateManyUserInput | UserDataCreateManyUserInput[]
  }

  export type UserChannelDataCreateWithoutUserInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserChannelDataUncheckedCreateWithoutUserInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserChannelDataCreateOrConnectWithoutUserInput = {
    where: UserChannelDataWhereUniqueInput
    create: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput>
  }

  export type UserChannelDataCreateManyUserInputEnvelope = {
    data: UserChannelDataCreateManyUserInput | UserChannelDataCreateManyUserInput[]
  }

  export type UserDataUpsertWithWhereUniqueWithoutUserInput = {
    where: UserDataWhereUniqueInput
    update: XOR<UserDataUpdateWithoutUserInput, UserDataUncheckedUpdateWithoutUserInput>
    create: XOR<UserDataCreateWithoutUserInput, UserDataUncheckedCreateWithoutUserInput>
  }

  export type UserDataUpdateWithWhereUniqueWithoutUserInput = {
    where: UserDataWhereUniqueInput
    data: XOR<UserDataUpdateWithoutUserInput, UserDataUncheckedUpdateWithoutUserInput>
  }

  export type UserDataUpdateManyWithWhereWithoutUserInput = {
    where: UserDataScalarWhereInput
    data: XOR<UserDataUpdateManyMutationInput, UserDataUncheckedUpdateManyWithoutUserInput>
  }

  export type UserDataScalarWhereInput = {
    AND?: UserDataScalarWhereInput | UserDataScalarWhereInput[]
    OR?: UserDataScalarWhereInput[]
    NOT?: UserDataScalarWhereInput | UserDataScalarWhereInput[]
    id?: StringFilter<"UserData"> | string
    key?: StringFilter<"UserData"> | string
    version?: StringFilter<"UserData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserData">
    value?: StringNullableFilter<"UserData"> | string | null
    values?: StringNullableListFilter<"UserData">
    ownerId?: StringFilter<"UserData"> | string
    createdAt?: DateTimeFilter<"UserData"> | Date | string
    updatedAt?: DateTimeFilter<"UserData"> | Date | string
  }

  export type UserChannelDataUpsertWithWhereUniqueWithoutUserInput = {
    where: UserChannelDataWhereUniqueInput
    update: XOR<UserChannelDataUpdateWithoutUserInput, UserChannelDataUncheckedUpdateWithoutUserInput>
    create: XOR<UserChannelDataCreateWithoutUserInput, UserChannelDataUncheckedCreateWithoutUserInput>
  }

  export type UserChannelDataUpdateWithWhereUniqueWithoutUserInput = {
    where: UserChannelDataWhereUniqueInput
    data: XOR<UserChannelDataUpdateWithoutUserInput, UserChannelDataUncheckedUpdateWithoutUserInput>
  }

  export type UserChannelDataUpdateManyWithWhereWithoutUserInput = {
    where: UserChannelDataScalarWhereInput
    data: XOR<UserChannelDataUpdateManyMutationInput, UserChannelDataUncheckedUpdateManyWithoutUserInput>
  }

  export type UserChannelDataScalarWhereInput = {
    AND?: UserChannelDataScalarWhereInput | UserChannelDataScalarWhereInput[]
    OR?: UserChannelDataScalarWhereInput[]
    NOT?: UserChannelDataScalarWhereInput | UserChannelDataScalarWhereInput[]
    id?: StringFilter<"UserChannelData"> | string
    channelId?: StringFilter<"UserChannelData"> | string
    key?: StringFilter<"UserChannelData"> | string
    version?: StringFilter<"UserChannelData"> | string
    type?: EnumE_DATA_TYPESFilter<"UserChannelData"> | $Enums.E_DATA_TYPES
    object?: JsonNullableFilter<"UserChannelData">
    value?: StringNullableFilter<"UserChannelData"> | string | null
    values?: StringNullableListFilter<"UserChannelData">
    ownerId?: StringFilter<"UserChannelData"> | string
    createdAt?: DateTimeFilter<"UserChannelData"> | Date | string
    updatedAt?: DateTimeFilter<"UserChannelData"> | Date | string
  }

  export type UserCreateWithoutDataInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    channelData?: UserChannelDataCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDataInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    channelData?: UserChannelDataUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDataInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDataInput, UserUncheckedCreateWithoutDataInput>
  }

  export type UserUpsertWithoutDataInput = {
    update: XOR<UserUpdateWithoutDataInput, UserUncheckedUpdateWithoutDataInput>
    create: XOR<UserCreateWithoutDataInput, UserUncheckedCreateWithoutDataInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDataInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDataInput, UserUncheckedUpdateWithoutDataInput>
  }

  export type UserUpdateWithoutDataInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channelData?: UserChannelDataUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDataInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channelData?: UserChannelDataUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutChannelDataInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: UserDataCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutChannelDataInput = {
    id?: string
    userId: string
    username?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    data?: UserDataUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutChannelDataInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutChannelDataInput, UserUncheckedCreateWithoutChannelDataInput>
  }

  export type UserUpsertWithoutChannelDataInput = {
    update: XOR<UserUpdateWithoutChannelDataInput, UserUncheckedUpdateWithoutChannelDataInput>
    create: XOR<UserCreateWithoutChannelDataInput, UserUncheckedCreateWithoutChannelDataInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutChannelDataInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutChannelDataInput, UserUncheckedUpdateWithoutChannelDataInput>
  }

  export type UserUpdateWithoutChannelDataInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: UserDataUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutChannelDataInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    data?: UserDataUncheckedUpdateManyWithoutUserNestedInput
  }

  export type LanguageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
  }

  export type ElementButtonContentUpdateInput = {
    label?: StringFieldUpdateOperationsInput | string
    options?: InputJsonValue | InputJsonValue | null
  }

  export type ElementTextInputContentLanguageUpdateInput = {
    label?: StringFieldUpdateOperationsInput | string
    placeholder?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ElementSelectMenuOptionsLanguageCreateInput = {
    label: string
  }

  export type ElementSelectMenuLanguageContentUpdateInput = {
    placeholder?: NullableStringFieldUpdateOperationsInput | string | null
    selectOptions?: XOR<ElementSelectMenuOptionsLanguageListUpdateEnvelopeInput, ElementSelectMenuOptionsLanguageCreateInput> | ElementSelectMenuOptionsLanguageCreateInput[]
    options?: InputJsonValue | InputJsonValue | null
  }

  export type EmbedContentLanguageUpdateInput = {
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    footer?: NullableStringFieldUpdateOperationsInput | string | null
    options?: InputJsonValue | InputJsonValue | null
    arrayOptions?: InputJsonValue | InputJsonValue | null
  }

  export type MarkdownContentLanguageUpdateInput = {
    content?: StringFieldUpdateOperationsInput | string
    options?: InputJsonValue | InputJsonValue | null
  }

  export type ModalContentLanguageUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
  }

  export type ElementSelectMenuOptionsLanguageCompositeListFilter = {
    equals?: ElementSelectMenuOptionsLanguageObjectEqualityInput[]
    every?: ElementSelectMenuOptionsLanguageWhereInput
    some?: ElementSelectMenuOptionsLanguageWhereInput
    none?: ElementSelectMenuOptionsLanguageWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type GuildDataCreateManyGuildInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: GuildDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuildDataUpdateWithoutGuildInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuildDataUncheckedUpdateWithoutGuildInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuildDataUncheckedUpdateManyWithoutGuildInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: GuildDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataCreateManyChannelInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: ChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChannelDataUpdateWithoutChannelInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataUncheckedUpdateWithoutChannelInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelDataUncheckedUpdateManyWithoutChannelInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: ChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataCreateManyUserInput = {
    id?: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserChannelDataCreateManyUserInput = {
    id?: string
    channelId: string
    key: string
    version: string
    type?: $Enums.E_DATA_TYPES
    object?: InputJsonValue | null
    value?: string | null
    values?: UserChannelDataCreatevaluesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserDataUpdateWithoutUserInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataUncheckedUpdateWithoutUserInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserDataUncheckedUpdateManyWithoutUserInput = {
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataUpdateWithoutUserInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataUncheckedUpdateWithoutUserInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserChannelDataUncheckedUpdateManyWithoutUserInput = {
    channelId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    type?: EnumE_DATA_TYPESFieldUpdateOperationsInput | $Enums.E_DATA_TYPES
    object?: InputJsonValue | InputJsonValue | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
    values?: UserChannelDataUpdatevaluesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ElementSelectMenuOptionsLanguageListUpdateEnvelopeInput = {
    set?: ElementSelectMenuOptionsLanguageCreateInput | ElementSelectMenuOptionsLanguageCreateInput[]
    push?: ElementSelectMenuOptionsLanguageCreateInput | ElementSelectMenuOptionsLanguageCreateInput[]
    updateMany?: ElementSelectMenuOptionsLanguageUpdateManyInput
    deleteMany?: ElementSelectMenuOptionsLanguageDeleteManyInput
  }

  export type ElementSelectMenuOptionsLanguageWhereInput = {
    AND?: ElementSelectMenuOptionsLanguageWhereInput | ElementSelectMenuOptionsLanguageWhereInput[]
    OR?: ElementSelectMenuOptionsLanguageWhereInput[]
    NOT?: ElementSelectMenuOptionsLanguageWhereInput | ElementSelectMenuOptionsLanguageWhereInput[]
    label?: StringFilter<"ElementSelectMenuOptionsLanguage"> | string
  }

  export type ElementSelectMenuOptionsLanguageUpdateManyInput = {
    where: ElementSelectMenuOptionsLanguageWhereInput
    data: ElementSelectMenuOptionsLanguageUpdateInput
  }

  export type ElementSelectMenuOptionsLanguageDeleteManyInput = {
    where: ElementSelectMenuOptionsLanguageWhereInput
  }

  export type ElementSelectMenuOptionsLanguageUpdateInput = {
    label?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use GuildCountOutputTypeDefaultArgs instead
     */
    export type GuildCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GuildCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChannelCountOutputTypeDefaultArgs instead
     */
    export type ChannelCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChannelCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LanguageDefaultArgs instead
     */
    export type LanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementButtonContentDefaultArgs instead
     */
    export type ElementButtonContentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementButtonContentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementTextInputContentLanguageDefaultArgs instead
     */
    export type ElementTextInputContentLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementTextInputContentLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementSelectMenuOptionsLanguageDefaultArgs instead
     */
    export type ElementSelectMenuOptionsLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementSelectMenuOptionsLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementSelectMenuLanguageContentDefaultArgs instead
     */
    export type ElementSelectMenuLanguageContentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementSelectMenuLanguageContentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmbedContentLanguageDefaultArgs instead
     */
    export type EmbedContentLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmbedContentLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MarkdownContentLanguageDefaultArgs instead
     */
    export type MarkdownContentLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MarkdownContentLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ModalContentLanguageDefaultArgs instead
     */
    export type ModalContentLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ModalContentLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConfigDefaultArgs instead
     */
    export type ConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConfigDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CategoryDefaultArgs instead
     */
    export type CategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GuildDefaultArgs instead
     */
    export type GuildArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GuildDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GuildDataDefaultArgs instead
     */
    export type GuildDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GuildDataDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChannelDefaultArgs instead
     */
    export type ChannelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChannelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChannelDataDefaultArgs instead
     */
    export type ChannelDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChannelDataDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDataDefaultArgs instead
     */
    export type UserDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDataDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserChannelDataDefaultArgs instead
     */
    export type UserChannelDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserChannelDataDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementButtonLanguageDefaultArgs instead
     */
    export type ElementButtonLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementButtonLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementTextInputLanguageDefaultArgs instead
     */
    export type ElementTextInputLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementTextInputLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ElementSelectMenuLanguageDefaultArgs instead
     */
    export type ElementSelectMenuLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ElementSelectMenuLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmbedLanguageDefaultArgs instead
     */
    export type EmbedLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmbedLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MarkdownLanguageDefaultArgs instead
     */
    export type MarkdownLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MarkdownLanguageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ModalLanguageDefaultArgs instead
     */
    export type ModalLanguageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ModalLanguageDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}