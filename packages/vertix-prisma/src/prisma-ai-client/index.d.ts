
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
 * Model AIGuildSettings
 * Per-guild configuration for Vertix AI.
 * 
 * Keyed by the raw Discord guild id on purpose: this app is its own Discord
 * application and can be invited to servers Vertix itself is not in, so it
 * must not depend on a row existing in the bot's `Guild` collection.
 */
export type AIGuildSettings = $Result.DefaultSelection<Prisma.$AIGuildSettingsPayload>
/**
 * Model AIPendingAction
 * The destructive actions the model proposed in one turn, awaiting agreement.
 * 
 * A batch, not a single action: asking to delete ten channels produces ten
 * tool calls in one turn, and confirming them one at a time is unusable.
 * Persisted so a restart between "shall I?" and "yes" cannot drop it.
 */
export type AIPendingAction = $Result.DefaultSelection<Prisma.$AIPendingActionPayload>
/**
 * Model AIInteractiveButton
 * A button this bot posted, and what it replies when clicked.
 * 
 * Buttons created at runtime have no compiled adapter behind them, so the
 * response has to be stored. Persisted rather than held in memory because a
 * button lives in the channel long after the process that sent it.
 */
export type AIInteractiveButton = $Result.DefaultSelection<Prisma.$AIInteractiveButtonPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const E_AI_TRIGGER_EVENT: {
  MESSAGE_MENTION: 'MESSAGE_MENTION',
  MESSAGE_IN_CHANNEL: 'MESSAGE_IN_CHANNEL',
  MESSAGE_EDIT: 'MESSAGE_EDIT',
  MESSAGE_DELETE: 'MESSAGE_DELETE',
  MEMBER_JOIN: 'MEMBER_JOIN',
  MEMBER_LEAVE: 'MEMBER_LEAVE',
  MEMBER_BAN: 'MEMBER_BAN',
  CHANNEL_CREATE: 'CHANNEL_CREATE',
  CHANNEL_DELETE: 'CHANNEL_DELETE',
  VOICE_JOIN: 'VOICE_JOIN',
  VOICE_LEAVE: 'VOICE_LEAVE'
};

export type E_AI_TRIGGER_EVENT = (typeof E_AI_TRIGGER_EVENT)[keyof typeof E_AI_TRIGGER_EVENT]

}

export type E_AI_TRIGGER_EVENT = $Enums.E_AI_TRIGGER_EVENT

export const E_AI_TRIGGER_EVENT: typeof $Enums.E_AI_TRIGGER_EVENT

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AIGuildSettings
 * const aIGuildSettings = await prisma.aIGuildSettings.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more AIGuildSettings
   * const aIGuildSettings = await prisma.aIGuildSettings.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

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

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.aIGuildSettings`: Exposes CRUD operations for the **AIGuildSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AIGuildSettings
    * const aIGuildSettings = await prisma.aIGuildSettings.findMany()
    * ```
    */
  get aIGuildSettings(): Prisma.AIGuildSettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aIPendingAction`: Exposes CRUD operations for the **AIPendingAction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AIPendingActions
    * const aIPendingActions = await prisma.aIPendingAction.findMany()
    * ```
    */
  get aIPendingAction(): Prisma.AIPendingActionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aIInteractiveButton`: Exposes CRUD operations for the **AIInteractiveButton** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AIInteractiveButtons
    * const aIInteractiveButtons = await prisma.aIInteractiveButton.findMany()
    * ```
    */
  get aIInteractiveButton(): Prisma.AIInteractiveButtonDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.19.1
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
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
    AIGuildSettings: 'AIGuildSettings',
    AIPendingAction: 'AIPendingAction',
    AIInteractiveButton: 'AIInteractiveButton'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "aIGuildSettings" | "aIPendingAction" | "aIInteractiveButton"
      txIsolationLevel: never
    }
    model: {
      AIGuildSettings: {
        payload: Prisma.$AIGuildSettingsPayload<ExtArgs>
        fields: Prisma.AIGuildSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AIGuildSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AIGuildSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          findFirst: {
            args: Prisma.AIGuildSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AIGuildSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          findMany: {
            args: Prisma.AIGuildSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>[]
          }
          create: {
            args: Prisma.AIGuildSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          createMany: {
            args: Prisma.AIGuildSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AIGuildSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          update: {
            args: Prisma.AIGuildSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          deleteMany: {
            args: Prisma.AIGuildSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AIGuildSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AIGuildSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIGuildSettingsPayload>
          }
          aggregate: {
            args: Prisma.AIGuildSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAIGuildSettings>
          }
          groupBy: {
            args: Prisma.AIGuildSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<AIGuildSettingsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AIGuildSettingsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AIGuildSettingsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AIGuildSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<AIGuildSettingsCountAggregateOutputType> | number
          }
        }
      }
      AIPendingAction: {
        payload: Prisma.$AIPendingActionPayload<ExtArgs>
        fields: Prisma.AIPendingActionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AIPendingActionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AIPendingActionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          findFirst: {
            args: Prisma.AIPendingActionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AIPendingActionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          findMany: {
            args: Prisma.AIPendingActionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>[]
          }
          create: {
            args: Prisma.AIPendingActionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          createMany: {
            args: Prisma.AIPendingActionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AIPendingActionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          update: {
            args: Prisma.AIPendingActionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          deleteMany: {
            args: Prisma.AIPendingActionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AIPendingActionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AIPendingActionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIPendingActionPayload>
          }
          aggregate: {
            args: Prisma.AIPendingActionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAIPendingAction>
          }
          groupBy: {
            args: Prisma.AIPendingActionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AIPendingActionGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AIPendingActionFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AIPendingActionAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AIPendingActionCountArgs<ExtArgs>
            result: $Utils.Optional<AIPendingActionCountAggregateOutputType> | number
          }
        }
      }
      AIInteractiveButton: {
        payload: Prisma.$AIInteractiveButtonPayload<ExtArgs>
        fields: Prisma.AIInteractiveButtonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AIInteractiveButtonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AIInteractiveButtonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          findFirst: {
            args: Prisma.AIInteractiveButtonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AIInteractiveButtonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          findMany: {
            args: Prisma.AIInteractiveButtonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>[]
          }
          create: {
            args: Prisma.AIInteractiveButtonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          createMany: {
            args: Prisma.AIInteractiveButtonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AIInteractiveButtonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          update: {
            args: Prisma.AIInteractiveButtonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          deleteMany: {
            args: Prisma.AIInteractiveButtonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AIInteractiveButtonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AIInteractiveButtonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AIInteractiveButtonPayload>
          }
          aggregate: {
            args: Prisma.AIInteractiveButtonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAIInteractiveButton>
          }
          groupBy: {
            args: Prisma.AIInteractiveButtonGroupByArgs<ExtArgs>
            result: $Utils.Optional<AIInteractiveButtonGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AIInteractiveButtonFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AIInteractiveButtonAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AIInteractiveButtonCountArgs<ExtArgs>
            result: $Utils.Optional<AIInteractiveButtonCountAggregateOutputType> | number
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    aIGuildSettings?: AIGuildSettingsOmit
    aIPendingAction?: AIPendingActionOmit
    aIInteractiveButton?: AIInteractiveButtonOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
    | 'updateManyAndReturn'
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
   * Models
   */

  /**
   * Model AIGuildSettings
   */

  export type AggregateAIGuildSettings = {
    _count: AIGuildSettingsCountAggregateOutputType | null
    _min: AIGuildSettingsMinAggregateOutputType | null
    _max: AIGuildSettingsMaxAggregateOutputType | null
  }

  export type AIGuildSettingsMinAggregateOutputType = {
    id: string | null
    guildId: string | null
    systemPrompt: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AIGuildSettingsMaxAggregateOutputType = {
    id: string | null
    guildId: string | null
    systemPrompt: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AIGuildSettingsCountAggregateOutputType = {
    id: number
    guildId: number
    systemPrompt: number
    triggerEvents: number
    triggerChannelIds: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AIGuildSettingsMinAggregateInputType = {
    id?: true
    guildId?: true
    systemPrompt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AIGuildSettingsMaxAggregateInputType = {
    id?: true
    guildId?: true
    systemPrompt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AIGuildSettingsCountAggregateInputType = {
    id?: true
    guildId?: true
    systemPrompt?: true
    triggerEvents?: true
    triggerChannelIds?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AIGuildSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIGuildSettings to aggregate.
     */
    where?: AIGuildSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIGuildSettings to fetch.
     */
    orderBy?: AIGuildSettingsOrderByWithRelationInput | AIGuildSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AIGuildSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIGuildSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIGuildSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AIGuildSettings
    **/
    _count?: true | AIGuildSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AIGuildSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AIGuildSettingsMaxAggregateInputType
  }

  export type GetAIGuildSettingsAggregateType<T extends AIGuildSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateAIGuildSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAIGuildSettings[P]>
      : GetScalarType<T[P], AggregateAIGuildSettings[P]>
  }




  export type AIGuildSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIGuildSettingsWhereInput
    orderBy?: AIGuildSettingsOrderByWithAggregationInput | AIGuildSettingsOrderByWithAggregationInput[]
    by: AIGuildSettingsScalarFieldEnum[] | AIGuildSettingsScalarFieldEnum
    having?: AIGuildSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AIGuildSettingsCountAggregateInputType | true
    _min?: AIGuildSettingsMinAggregateInputType
    _max?: AIGuildSettingsMaxAggregateInputType
  }

  export type AIGuildSettingsGroupByOutputType = {
    id: string
    guildId: string
    systemPrompt: string | null
    triggerEvents: $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds: string[]
    createdAt: Date
    updatedAt: Date
    _count: AIGuildSettingsCountAggregateOutputType | null
    _min: AIGuildSettingsMinAggregateOutputType | null
    _max: AIGuildSettingsMaxAggregateOutputType | null
  }

  type GetAIGuildSettingsGroupByPayload<T extends AIGuildSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AIGuildSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AIGuildSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AIGuildSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], AIGuildSettingsGroupByOutputType[P]>
        }
      >
    >


  export type AIGuildSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    guildId?: boolean
    systemPrompt?: boolean
    triggerEvents?: boolean
    triggerChannelIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["aIGuildSettings"]>



  export type AIGuildSettingsSelectScalar = {
    id?: boolean
    guildId?: boolean
    systemPrompt?: boolean
    triggerEvents?: boolean
    triggerChannelIds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AIGuildSettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "guildId" | "systemPrompt" | "triggerEvents" | "triggerChannelIds" | "createdAt" | "updatedAt", ExtArgs["result"]["aIGuildSettings"]>

  export type $AIGuildSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AIGuildSettings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      guildId: string
      /**
       * Null means the guild is still on the shipped default prompt.
       */
      systemPrompt: string | null
      /**
       * Empty means the AI never acts on its own - the safe default.
       */
      triggerEvents: $Enums.E_AI_TRIGGER_EVENT[]
      /**
       * Scopes MESSAGE_IN_CHANNEL; ignored by the other events.
       */
      triggerChannelIds: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["aIGuildSettings"]>
    composites: {}
  }

  type AIGuildSettingsGetPayload<S extends boolean | null | undefined | AIGuildSettingsDefaultArgs> = $Result.GetResult<Prisma.$AIGuildSettingsPayload, S>

  type AIGuildSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AIGuildSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AIGuildSettingsCountAggregateInputType | true
    }

  export interface AIGuildSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AIGuildSettings'], meta: { name: 'AIGuildSettings' } }
    /**
     * Find zero or one AIGuildSettings that matches the filter.
     * @param {AIGuildSettingsFindUniqueArgs} args - Arguments to find a AIGuildSettings
     * @example
     * // Get one AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AIGuildSettingsFindUniqueArgs>(args: SelectSubset<T, AIGuildSettingsFindUniqueArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AIGuildSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AIGuildSettingsFindUniqueOrThrowArgs} args - Arguments to find a AIGuildSettings
     * @example
     * // Get one AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AIGuildSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, AIGuildSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIGuildSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsFindFirstArgs} args - Arguments to find a AIGuildSettings
     * @example
     * // Get one AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AIGuildSettingsFindFirstArgs>(args?: SelectSubset<T, AIGuildSettingsFindFirstArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIGuildSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsFindFirstOrThrowArgs} args - Arguments to find a AIGuildSettings
     * @example
     * // Get one AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AIGuildSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, AIGuildSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIGuildSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findMany()
     * 
     * // Get first 10 AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aIGuildSettingsWithIdOnly = await prisma.aIGuildSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AIGuildSettingsFindManyArgs>(args?: SelectSubset<T, AIGuildSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AIGuildSettings.
     * @param {AIGuildSettingsCreateArgs} args - Arguments to create a AIGuildSettings.
     * @example
     * // Create one AIGuildSettings
     * const AIGuildSettings = await prisma.aIGuildSettings.create({
     *   data: {
     *     // ... data to create a AIGuildSettings
     *   }
     * })
     * 
     */
    create<T extends AIGuildSettingsCreateArgs>(args: SelectSubset<T, AIGuildSettingsCreateArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AIGuildSettings.
     * @param {AIGuildSettingsCreateManyArgs} args - Arguments to create many AIGuildSettings.
     * @example
     * // Create many AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AIGuildSettingsCreateManyArgs>(args?: SelectSubset<T, AIGuildSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AIGuildSettings.
     * @param {AIGuildSettingsDeleteArgs} args - Arguments to delete one AIGuildSettings.
     * @example
     * // Delete one AIGuildSettings
     * const AIGuildSettings = await prisma.aIGuildSettings.delete({
     *   where: {
     *     // ... filter to delete one AIGuildSettings
     *   }
     * })
     * 
     */
    delete<T extends AIGuildSettingsDeleteArgs>(args: SelectSubset<T, AIGuildSettingsDeleteArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AIGuildSettings.
     * @param {AIGuildSettingsUpdateArgs} args - Arguments to update one AIGuildSettings.
     * @example
     * // Update one AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AIGuildSettingsUpdateArgs>(args: SelectSubset<T, AIGuildSettingsUpdateArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AIGuildSettings.
     * @param {AIGuildSettingsDeleteManyArgs} args - Arguments to filter AIGuildSettings to delete.
     * @example
     * // Delete a few AIGuildSettings
     * const { count } = await prisma.aIGuildSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AIGuildSettingsDeleteManyArgs>(args?: SelectSubset<T, AIGuildSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AIGuildSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AIGuildSettingsUpdateManyArgs>(args: SelectSubset<T, AIGuildSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AIGuildSettings.
     * @param {AIGuildSettingsUpsertArgs} args - Arguments to update or create a AIGuildSettings.
     * @example
     * // Update or create a AIGuildSettings
     * const aIGuildSettings = await prisma.aIGuildSettings.upsert({
     *   create: {
     *     // ... data to create a AIGuildSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AIGuildSettings we want to update
     *   }
     * })
     */
    upsert<T extends AIGuildSettingsUpsertArgs>(args: SelectSubset<T, AIGuildSettingsUpsertArgs<ExtArgs>>): Prisma__AIGuildSettingsClient<$Result.GetResult<Prisma.$AIGuildSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIGuildSettings that matches the filter.
     * @param {AIGuildSettingsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const aIGuildSettings = await prisma.aIGuildSettings.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AIGuildSettingsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AIGuildSettings.
     * @param {AIGuildSettingsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const aIGuildSettings = await prisma.aIGuildSettings.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AIGuildSettingsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AIGuildSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsCountArgs} args - Arguments to filter AIGuildSettings to count.
     * @example
     * // Count the number of AIGuildSettings
     * const count = await prisma.aIGuildSettings.count({
     *   where: {
     *     // ... the filter for the AIGuildSettings we want to count
     *   }
     * })
    **/
    count<T extends AIGuildSettingsCountArgs>(
      args?: Subset<T, AIGuildSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AIGuildSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AIGuildSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AIGuildSettingsAggregateArgs>(args: Subset<T, AIGuildSettingsAggregateArgs>): Prisma.PrismaPromise<GetAIGuildSettingsAggregateType<T>>

    /**
     * Group by AIGuildSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIGuildSettingsGroupByArgs} args - Group by arguments.
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
      T extends AIGuildSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AIGuildSettingsGroupByArgs['orderBy'] }
        : { orderBy?: AIGuildSettingsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AIGuildSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAIGuildSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AIGuildSettings model
   */
  readonly fields: AIGuildSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AIGuildSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AIGuildSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AIGuildSettings model
   */
  interface AIGuildSettingsFieldRefs {
    readonly id: FieldRef<"AIGuildSettings", 'String'>
    readonly guildId: FieldRef<"AIGuildSettings", 'String'>
    readonly systemPrompt: FieldRef<"AIGuildSettings", 'String'>
    readonly triggerEvents: FieldRef<"AIGuildSettings", 'E_AI_TRIGGER_EVENT[]'>
    readonly triggerChannelIds: FieldRef<"AIGuildSettings", 'String[]'>
    readonly createdAt: FieldRef<"AIGuildSettings", 'DateTime'>
    readonly updatedAt: FieldRef<"AIGuildSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AIGuildSettings findUnique
   */
  export type AIGuildSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AIGuildSettings to fetch.
     */
    where: AIGuildSettingsWhereUniqueInput
  }

  /**
   * AIGuildSettings findUniqueOrThrow
   */
  export type AIGuildSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AIGuildSettings to fetch.
     */
    where: AIGuildSettingsWhereUniqueInput
  }

  /**
   * AIGuildSettings findFirst
   */
  export type AIGuildSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AIGuildSettings to fetch.
     */
    where?: AIGuildSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIGuildSettings to fetch.
     */
    orderBy?: AIGuildSettingsOrderByWithRelationInput | AIGuildSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIGuildSettings.
     */
    cursor?: AIGuildSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIGuildSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIGuildSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIGuildSettings.
     */
    distinct?: AIGuildSettingsScalarFieldEnum | AIGuildSettingsScalarFieldEnum[]
  }

  /**
   * AIGuildSettings findFirstOrThrow
   */
  export type AIGuildSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AIGuildSettings to fetch.
     */
    where?: AIGuildSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIGuildSettings to fetch.
     */
    orderBy?: AIGuildSettingsOrderByWithRelationInput | AIGuildSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIGuildSettings.
     */
    cursor?: AIGuildSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIGuildSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIGuildSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIGuildSettings.
     */
    distinct?: AIGuildSettingsScalarFieldEnum | AIGuildSettingsScalarFieldEnum[]
  }

  /**
   * AIGuildSettings findMany
   */
  export type AIGuildSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter, which AIGuildSettings to fetch.
     */
    where?: AIGuildSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIGuildSettings to fetch.
     */
    orderBy?: AIGuildSettingsOrderByWithRelationInput | AIGuildSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AIGuildSettings.
     */
    cursor?: AIGuildSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIGuildSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIGuildSettings.
     */
    skip?: number
    distinct?: AIGuildSettingsScalarFieldEnum | AIGuildSettingsScalarFieldEnum[]
  }

  /**
   * AIGuildSettings create
   */
  export type AIGuildSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a AIGuildSettings.
     */
    data: XOR<AIGuildSettingsCreateInput, AIGuildSettingsUncheckedCreateInput>
  }

  /**
   * AIGuildSettings createMany
   */
  export type AIGuildSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AIGuildSettings.
     */
    data: AIGuildSettingsCreateManyInput | AIGuildSettingsCreateManyInput[]
  }

  /**
   * AIGuildSettings update
   */
  export type AIGuildSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a AIGuildSettings.
     */
    data: XOR<AIGuildSettingsUpdateInput, AIGuildSettingsUncheckedUpdateInput>
    /**
     * Choose, which AIGuildSettings to update.
     */
    where: AIGuildSettingsWhereUniqueInput
  }

  /**
   * AIGuildSettings updateMany
   */
  export type AIGuildSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AIGuildSettings.
     */
    data: XOR<AIGuildSettingsUpdateManyMutationInput, AIGuildSettingsUncheckedUpdateManyInput>
    /**
     * Filter which AIGuildSettings to update
     */
    where?: AIGuildSettingsWhereInput
    /**
     * Limit how many AIGuildSettings to update.
     */
    limit?: number
  }

  /**
   * AIGuildSettings upsert
   */
  export type AIGuildSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the AIGuildSettings to update in case it exists.
     */
    where: AIGuildSettingsWhereUniqueInput
    /**
     * In case the AIGuildSettings found by the `where` argument doesn't exist, create a new AIGuildSettings with this data.
     */
    create: XOR<AIGuildSettingsCreateInput, AIGuildSettingsUncheckedCreateInput>
    /**
     * In case the AIGuildSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AIGuildSettingsUpdateInput, AIGuildSettingsUncheckedUpdateInput>
  }

  /**
   * AIGuildSettings delete
   */
  export type AIGuildSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
    /**
     * Filter which AIGuildSettings to delete.
     */
    where: AIGuildSettingsWhereUniqueInput
  }

  /**
   * AIGuildSettings deleteMany
   */
  export type AIGuildSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIGuildSettings to delete
     */
    where?: AIGuildSettingsWhereInput
    /**
     * Limit how many AIGuildSettings to delete.
     */
    limit?: number
  }

  /**
   * AIGuildSettings findRaw
   */
  export type AIGuildSettingsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIGuildSettings aggregateRaw
   */
  export type AIGuildSettingsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIGuildSettings without action
   */
  export type AIGuildSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIGuildSettings
     */
    select?: AIGuildSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIGuildSettings
     */
    omit?: AIGuildSettingsOmit<ExtArgs> | null
  }


  /**
   * Model AIPendingAction
   */

  export type AggregateAIPendingAction = {
    _count: AIPendingActionCountAggregateOutputType | null
    _min: AIPendingActionMinAggregateOutputType | null
    _max: AIPendingActionMaxAggregateOutputType | null
  }

  export type AIPendingActionMinAggregateOutputType = {
    id: string | null
    guildId: string | null
    userId: string | null
    turnId: string | null
    actionsJson: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AIPendingActionMaxAggregateOutputType = {
    id: string | null
    guildId: string | null
    userId: string | null
    turnId: string | null
    actionsJson: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AIPendingActionCountAggregateOutputType = {
    id: number
    guildId: number
    userId: number
    turnId: number
    actionsJson: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type AIPendingActionMinAggregateInputType = {
    id?: true
    guildId?: true
    userId?: true
    turnId?: true
    actionsJson?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AIPendingActionMaxAggregateInputType = {
    id?: true
    guildId?: true
    userId?: true
    turnId?: true
    actionsJson?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AIPendingActionCountAggregateInputType = {
    id?: true
    guildId?: true
    userId?: true
    turnId?: true
    actionsJson?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type AIPendingActionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIPendingAction to aggregate.
     */
    where?: AIPendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIPendingActions to fetch.
     */
    orderBy?: AIPendingActionOrderByWithRelationInput | AIPendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AIPendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIPendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIPendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AIPendingActions
    **/
    _count?: true | AIPendingActionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AIPendingActionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AIPendingActionMaxAggregateInputType
  }

  export type GetAIPendingActionAggregateType<T extends AIPendingActionAggregateArgs> = {
        [P in keyof T & keyof AggregateAIPendingAction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAIPendingAction[P]>
      : GetScalarType<T[P], AggregateAIPendingAction[P]>
  }




  export type AIPendingActionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIPendingActionWhereInput
    orderBy?: AIPendingActionOrderByWithAggregationInput | AIPendingActionOrderByWithAggregationInput[]
    by: AIPendingActionScalarFieldEnum[] | AIPendingActionScalarFieldEnum
    having?: AIPendingActionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AIPendingActionCountAggregateInputType | true
    _min?: AIPendingActionMinAggregateInputType
    _max?: AIPendingActionMaxAggregateInputType
  }

  export type AIPendingActionGroupByOutputType = {
    id: string
    guildId: string
    userId: string
    turnId: string
    actionsJson: string
    expiresAt: Date
    createdAt: Date
    _count: AIPendingActionCountAggregateOutputType | null
    _min: AIPendingActionMinAggregateOutputType | null
    _max: AIPendingActionMaxAggregateOutputType | null
  }

  type GetAIPendingActionGroupByPayload<T extends AIPendingActionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AIPendingActionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AIPendingActionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AIPendingActionGroupByOutputType[P]>
            : GetScalarType<T[P], AIPendingActionGroupByOutputType[P]>
        }
      >
    >


  export type AIPendingActionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    guildId?: boolean
    userId?: boolean
    turnId?: boolean
    actionsJson?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["aIPendingAction"]>



  export type AIPendingActionSelectScalar = {
    id?: boolean
    guildId?: boolean
    userId?: boolean
    turnId?: boolean
    actionsJson?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type AIPendingActionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "guildId" | "userId" | "turnId" | "actionsJson" | "expiresAt" | "createdAt", ExtArgs["result"]["aIPendingAction"]>

  export type $AIPendingActionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AIPendingAction"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      guildId: string
      userId: string
      /**
       * Identifies the turn that proposed these, so calls from one turn group
       * together and a later turn replaces them instead of appending.
       */
      turnId: string
      /**
       * JSON array of { toolName, fingerprint, argsJson }.
       */
      actionsJson: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["aIPendingAction"]>
    composites: {}
  }

  type AIPendingActionGetPayload<S extends boolean | null | undefined | AIPendingActionDefaultArgs> = $Result.GetResult<Prisma.$AIPendingActionPayload, S>

  type AIPendingActionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AIPendingActionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AIPendingActionCountAggregateInputType | true
    }

  export interface AIPendingActionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AIPendingAction'], meta: { name: 'AIPendingAction' } }
    /**
     * Find zero or one AIPendingAction that matches the filter.
     * @param {AIPendingActionFindUniqueArgs} args - Arguments to find a AIPendingAction
     * @example
     * // Get one AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AIPendingActionFindUniqueArgs>(args: SelectSubset<T, AIPendingActionFindUniqueArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AIPendingAction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AIPendingActionFindUniqueOrThrowArgs} args - Arguments to find a AIPendingAction
     * @example
     * // Get one AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AIPendingActionFindUniqueOrThrowArgs>(args: SelectSubset<T, AIPendingActionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIPendingAction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionFindFirstArgs} args - Arguments to find a AIPendingAction
     * @example
     * // Get one AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AIPendingActionFindFirstArgs>(args?: SelectSubset<T, AIPendingActionFindFirstArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIPendingAction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionFindFirstOrThrowArgs} args - Arguments to find a AIPendingAction
     * @example
     * // Get one AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AIPendingActionFindFirstOrThrowArgs>(args?: SelectSubset<T, AIPendingActionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIPendingActions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AIPendingActions
     * const aIPendingActions = await prisma.aIPendingAction.findMany()
     * 
     * // Get first 10 AIPendingActions
     * const aIPendingActions = await prisma.aIPendingAction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aIPendingActionWithIdOnly = await prisma.aIPendingAction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AIPendingActionFindManyArgs>(args?: SelectSubset<T, AIPendingActionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AIPendingAction.
     * @param {AIPendingActionCreateArgs} args - Arguments to create a AIPendingAction.
     * @example
     * // Create one AIPendingAction
     * const AIPendingAction = await prisma.aIPendingAction.create({
     *   data: {
     *     // ... data to create a AIPendingAction
     *   }
     * })
     * 
     */
    create<T extends AIPendingActionCreateArgs>(args: SelectSubset<T, AIPendingActionCreateArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AIPendingActions.
     * @param {AIPendingActionCreateManyArgs} args - Arguments to create many AIPendingActions.
     * @example
     * // Create many AIPendingActions
     * const aIPendingAction = await prisma.aIPendingAction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AIPendingActionCreateManyArgs>(args?: SelectSubset<T, AIPendingActionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AIPendingAction.
     * @param {AIPendingActionDeleteArgs} args - Arguments to delete one AIPendingAction.
     * @example
     * // Delete one AIPendingAction
     * const AIPendingAction = await prisma.aIPendingAction.delete({
     *   where: {
     *     // ... filter to delete one AIPendingAction
     *   }
     * })
     * 
     */
    delete<T extends AIPendingActionDeleteArgs>(args: SelectSubset<T, AIPendingActionDeleteArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AIPendingAction.
     * @param {AIPendingActionUpdateArgs} args - Arguments to update one AIPendingAction.
     * @example
     * // Update one AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AIPendingActionUpdateArgs>(args: SelectSubset<T, AIPendingActionUpdateArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AIPendingActions.
     * @param {AIPendingActionDeleteManyArgs} args - Arguments to filter AIPendingActions to delete.
     * @example
     * // Delete a few AIPendingActions
     * const { count } = await prisma.aIPendingAction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AIPendingActionDeleteManyArgs>(args?: SelectSubset<T, AIPendingActionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AIPendingActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AIPendingActions
     * const aIPendingAction = await prisma.aIPendingAction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AIPendingActionUpdateManyArgs>(args: SelectSubset<T, AIPendingActionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AIPendingAction.
     * @param {AIPendingActionUpsertArgs} args - Arguments to update or create a AIPendingAction.
     * @example
     * // Update or create a AIPendingAction
     * const aIPendingAction = await prisma.aIPendingAction.upsert({
     *   create: {
     *     // ... data to create a AIPendingAction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AIPendingAction we want to update
     *   }
     * })
     */
    upsert<T extends AIPendingActionUpsertArgs>(args: SelectSubset<T, AIPendingActionUpsertArgs<ExtArgs>>): Prisma__AIPendingActionClient<$Result.GetResult<Prisma.$AIPendingActionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIPendingActions that matches the filter.
     * @param {AIPendingActionFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const aIPendingAction = await prisma.aIPendingAction.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AIPendingActionFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AIPendingAction.
     * @param {AIPendingActionAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const aIPendingAction = await prisma.aIPendingAction.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AIPendingActionAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AIPendingActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionCountArgs} args - Arguments to filter AIPendingActions to count.
     * @example
     * // Count the number of AIPendingActions
     * const count = await prisma.aIPendingAction.count({
     *   where: {
     *     // ... the filter for the AIPendingActions we want to count
     *   }
     * })
    **/
    count<T extends AIPendingActionCountArgs>(
      args?: Subset<T, AIPendingActionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AIPendingActionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AIPendingAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AIPendingActionAggregateArgs>(args: Subset<T, AIPendingActionAggregateArgs>): Prisma.PrismaPromise<GetAIPendingActionAggregateType<T>>

    /**
     * Group by AIPendingAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIPendingActionGroupByArgs} args - Group by arguments.
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
      T extends AIPendingActionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AIPendingActionGroupByArgs['orderBy'] }
        : { orderBy?: AIPendingActionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AIPendingActionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAIPendingActionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AIPendingAction model
   */
  readonly fields: AIPendingActionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AIPendingAction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AIPendingActionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AIPendingAction model
   */
  interface AIPendingActionFieldRefs {
    readonly id: FieldRef<"AIPendingAction", 'String'>
    readonly guildId: FieldRef<"AIPendingAction", 'String'>
    readonly userId: FieldRef<"AIPendingAction", 'String'>
    readonly turnId: FieldRef<"AIPendingAction", 'String'>
    readonly actionsJson: FieldRef<"AIPendingAction", 'String'>
    readonly expiresAt: FieldRef<"AIPendingAction", 'DateTime'>
    readonly createdAt: FieldRef<"AIPendingAction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AIPendingAction findUnique
   */
  export type AIPendingActionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter, which AIPendingAction to fetch.
     */
    where: AIPendingActionWhereUniqueInput
  }

  /**
   * AIPendingAction findUniqueOrThrow
   */
  export type AIPendingActionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter, which AIPendingAction to fetch.
     */
    where: AIPendingActionWhereUniqueInput
  }

  /**
   * AIPendingAction findFirst
   */
  export type AIPendingActionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter, which AIPendingAction to fetch.
     */
    where?: AIPendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIPendingActions to fetch.
     */
    orderBy?: AIPendingActionOrderByWithRelationInput | AIPendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIPendingActions.
     */
    cursor?: AIPendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIPendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIPendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIPendingActions.
     */
    distinct?: AIPendingActionScalarFieldEnum | AIPendingActionScalarFieldEnum[]
  }

  /**
   * AIPendingAction findFirstOrThrow
   */
  export type AIPendingActionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter, which AIPendingAction to fetch.
     */
    where?: AIPendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIPendingActions to fetch.
     */
    orderBy?: AIPendingActionOrderByWithRelationInput | AIPendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIPendingActions.
     */
    cursor?: AIPendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIPendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIPendingActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIPendingActions.
     */
    distinct?: AIPendingActionScalarFieldEnum | AIPendingActionScalarFieldEnum[]
  }

  /**
   * AIPendingAction findMany
   */
  export type AIPendingActionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter, which AIPendingActions to fetch.
     */
    where?: AIPendingActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIPendingActions to fetch.
     */
    orderBy?: AIPendingActionOrderByWithRelationInput | AIPendingActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AIPendingActions.
     */
    cursor?: AIPendingActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIPendingActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIPendingActions.
     */
    skip?: number
    distinct?: AIPendingActionScalarFieldEnum | AIPendingActionScalarFieldEnum[]
  }

  /**
   * AIPendingAction create
   */
  export type AIPendingActionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * The data needed to create a AIPendingAction.
     */
    data: XOR<AIPendingActionCreateInput, AIPendingActionUncheckedCreateInput>
  }

  /**
   * AIPendingAction createMany
   */
  export type AIPendingActionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AIPendingActions.
     */
    data: AIPendingActionCreateManyInput | AIPendingActionCreateManyInput[]
  }

  /**
   * AIPendingAction update
   */
  export type AIPendingActionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * The data needed to update a AIPendingAction.
     */
    data: XOR<AIPendingActionUpdateInput, AIPendingActionUncheckedUpdateInput>
    /**
     * Choose, which AIPendingAction to update.
     */
    where: AIPendingActionWhereUniqueInput
  }

  /**
   * AIPendingAction updateMany
   */
  export type AIPendingActionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AIPendingActions.
     */
    data: XOR<AIPendingActionUpdateManyMutationInput, AIPendingActionUncheckedUpdateManyInput>
    /**
     * Filter which AIPendingActions to update
     */
    where?: AIPendingActionWhereInput
    /**
     * Limit how many AIPendingActions to update.
     */
    limit?: number
  }

  /**
   * AIPendingAction upsert
   */
  export type AIPendingActionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * The filter to search for the AIPendingAction to update in case it exists.
     */
    where: AIPendingActionWhereUniqueInput
    /**
     * In case the AIPendingAction found by the `where` argument doesn't exist, create a new AIPendingAction with this data.
     */
    create: XOR<AIPendingActionCreateInput, AIPendingActionUncheckedCreateInput>
    /**
     * In case the AIPendingAction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AIPendingActionUpdateInput, AIPendingActionUncheckedUpdateInput>
  }

  /**
   * AIPendingAction delete
   */
  export type AIPendingActionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
    /**
     * Filter which AIPendingAction to delete.
     */
    where: AIPendingActionWhereUniqueInput
  }

  /**
   * AIPendingAction deleteMany
   */
  export type AIPendingActionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIPendingActions to delete
     */
    where?: AIPendingActionWhereInput
    /**
     * Limit how many AIPendingActions to delete.
     */
    limit?: number
  }

  /**
   * AIPendingAction findRaw
   */
  export type AIPendingActionFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIPendingAction aggregateRaw
   */
  export type AIPendingActionAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIPendingAction without action
   */
  export type AIPendingActionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIPendingAction
     */
    select?: AIPendingActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIPendingAction
     */
    omit?: AIPendingActionOmit<ExtArgs> | null
  }


  /**
   * Model AIInteractiveButton
   */

  export type AggregateAIInteractiveButton = {
    _count: AIInteractiveButtonCountAggregateOutputType | null
    _min: AIInteractiveButtonMinAggregateOutputType | null
    _max: AIInteractiveButtonMaxAggregateOutputType | null
  }

  export type AIInteractiveButtonMinAggregateOutputType = {
    id: string | null
    token: string | null
    guildId: string | null
    channelId: string | null
    label: string | null
    response: string | null
    createdAt: Date | null
  }

  export type AIInteractiveButtonMaxAggregateOutputType = {
    id: string | null
    token: string | null
    guildId: string | null
    channelId: string | null
    label: string | null
    response: string | null
    createdAt: Date | null
  }

  export type AIInteractiveButtonCountAggregateOutputType = {
    id: number
    token: number
    guildId: number
    channelId: number
    label: number
    response: number
    createdAt: number
    _all: number
  }


  export type AIInteractiveButtonMinAggregateInputType = {
    id?: true
    token?: true
    guildId?: true
    channelId?: true
    label?: true
    response?: true
    createdAt?: true
  }

  export type AIInteractiveButtonMaxAggregateInputType = {
    id?: true
    token?: true
    guildId?: true
    channelId?: true
    label?: true
    response?: true
    createdAt?: true
  }

  export type AIInteractiveButtonCountAggregateInputType = {
    id?: true
    token?: true
    guildId?: true
    channelId?: true
    label?: true
    response?: true
    createdAt?: true
    _all?: true
  }

  export type AIInteractiveButtonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIInteractiveButton to aggregate.
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIInteractiveButtons to fetch.
     */
    orderBy?: AIInteractiveButtonOrderByWithRelationInput | AIInteractiveButtonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AIInteractiveButtonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIInteractiveButtons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIInteractiveButtons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AIInteractiveButtons
    **/
    _count?: true | AIInteractiveButtonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AIInteractiveButtonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AIInteractiveButtonMaxAggregateInputType
  }

  export type GetAIInteractiveButtonAggregateType<T extends AIInteractiveButtonAggregateArgs> = {
        [P in keyof T & keyof AggregateAIInteractiveButton]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAIInteractiveButton[P]>
      : GetScalarType<T[P], AggregateAIInteractiveButton[P]>
  }




  export type AIInteractiveButtonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AIInteractiveButtonWhereInput
    orderBy?: AIInteractiveButtonOrderByWithAggregationInput | AIInteractiveButtonOrderByWithAggregationInput[]
    by: AIInteractiveButtonScalarFieldEnum[] | AIInteractiveButtonScalarFieldEnum
    having?: AIInteractiveButtonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AIInteractiveButtonCountAggregateInputType | true
    _min?: AIInteractiveButtonMinAggregateInputType
    _max?: AIInteractiveButtonMaxAggregateInputType
  }

  export type AIInteractiveButtonGroupByOutputType = {
    id: string
    token: string
    guildId: string
    channelId: string
    label: string
    response: string
    createdAt: Date
    _count: AIInteractiveButtonCountAggregateOutputType | null
    _min: AIInteractiveButtonMinAggregateOutputType | null
    _max: AIInteractiveButtonMaxAggregateOutputType | null
  }

  type GetAIInteractiveButtonGroupByPayload<T extends AIInteractiveButtonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AIInteractiveButtonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AIInteractiveButtonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AIInteractiveButtonGroupByOutputType[P]>
            : GetScalarType<T[P], AIInteractiveButtonGroupByOutputType[P]>
        }
      >
    >


  export type AIInteractiveButtonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    guildId?: boolean
    channelId?: boolean
    label?: boolean
    response?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["aIInteractiveButton"]>



  export type AIInteractiveButtonSelectScalar = {
    id?: boolean
    token?: boolean
    guildId?: boolean
    channelId?: boolean
    label?: boolean
    response?: boolean
    createdAt?: boolean
  }

  export type AIInteractiveButtonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "token" | "guildId" | "channelId" | "label" | "response" | "createdAt", ExtArgs["result"]["aIInteractiveButton"]>

  export type $AIInteractiveButtonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AIInteractiveButton"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      /**
       * The value placed in the Discord custom id.
       */
      token: string
      guildId: string
      channelId: string
      label: string
      /**
       * Replied ephemerally when the button is pressed.
       */
      response: string
      createdAt: Date
    }, ExtArgs["result"]["aIInteractiveButton"]>
    composites: {}
  }

  type AIInteractiveButtonGetPayload<S extends boolean | null | undefined | AIInteractiveButtonDefaultArgs> = $Result.GetResult<Prisma.$AIInteractiveButtonPayload, S>

  type AIInteractiveButtonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AIInteractiveButtonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AIInteractiveButtonCountAggregateInputType | true
    }

  export interface AIInteractiveButtonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AIInteractiveButton'], meta: { name: 'AIInteractiveButton' } }
    /**
     * Find zero or one AIInteractiveButton that matches the filter.
     * @param {AIInteractiveButtonFindUniqueArgs} args - Arguments to find a AIInteractiveButton
     * @example
     * // Get one AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AIInteractiveButtonFindUniqueArgs>(args: SelectSubset<T, AIInteractiveButtonFindUniqueArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AIInteractiveButton that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AIInteractiveButtonFindUniqueOrThrowArgs} args - Arguments to find a AIInteractiveButton
     * @example
     * // Get one AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AIInteractiveButtonFindUniqueOrThrowArgs>(args: SelectSubset<T, AIInteractiveButtonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIInteractiveButton that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonFindFirstArgs} args - Arguments to find a AIInteractiveButton
     * @example
     * // Get one AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AIInteractiveButtonFindFirstArgs>(args?: SelectSubset<T, AIInteractiveButtonFindFirstArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AIInteractiveButton that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonFindFirstOrThrowArgs} args - Arguments to find a AIInteractiveButton
     * @example
     * // Get one AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AIInteractiveButtonFindFirstOrThrowArgs>(args?: SelectSubset<T, AIInteractiveButtonFindFirstOrThrowArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIInteractiveButtons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AIInteractiveButtons
     * const aIInteractiveButtons = await prisma.aIInteractiveButton.findMany()
     * 
     * // Get first 10 AIInteractiveButtons
     * const aIInteractiveButtons = await prisma.aIInteractiveButton.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aIInteractiveButtonWithIdOnly = await prisma.aIInteractiveButton.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AIInteractiveButtonFindManyArgs>(args?: SelectSubset<T, AIInteractiveButtonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AIInteractiveButton.
     * @param {AIInteractiveButtonCreateArgs} args - Arguments to create a AIInteractiveButton.
     * @example
     * // Create one AIInteractiveButton
     * const AIInteractiveButton = await prisma.aIInteractiveButton.create({
     *   data: {
     *     // ... data to create a AIInteractiveButton
     *   }
     * })
     * 
     */
    create<T extends AIInteractiveButtonCreateArgs>(args: SelectSubset<T, AIInteractiveButtonCreateArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AIInteractiveButtons.
     * @param {AIInteractiveButtonCreateManyArgs} args - Arguments to create many AIInteractiveButtons.
     * @example
     * // Create many AIInteractiveButtons
     * const aIInteractiveButton = await prisma.aIInteractiveButton.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AIInteractiveButtonCreateManyArgs>(args?: SelectSubset<T, AIInteractiveButtonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AIInteractiveButton.
     * @param {AIInteractiveButtonDeleteArgs} args - Arguments to delete one AIInteractiveButton.
     * @example
     * // Delete one AIInteractiveButton
     * const AIInteractiveButton = await prisma.aIInteractiveButton.delete({
     *   where: {
     *     // ... filter to delete one AIInteractiveButton
     *   }
     * })
     * 
     */
    delete<T extends AIInteractiveButtonDeleteArgs>(args: SelectSubset<T, AIInteractiveButtonDeleteArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AIInteractiveButton.
     * @param {AIInteractiveButtonUpdateArgs} args - Arguments to update one AIInteractiveButton.
     * @example
     * // Update one AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AIInteractiveButtonUpdateArgs>(args: SelectSubset<T, AIInteractiveButtonUpdateArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AIInteractiveButtons.
     * @param {AIInteractiveButtonDeleteManyArgs} args - Arguments to filter AIInteractiveButtons to delete.
     * @example
     * // Delete a few AIInteractiveButtons
     * const { count } = await prisma.aIInteractiveButton.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AIInteractiveButtonDeleteManyArgs>(args?: SelectSubset<T, AIInteractiveButtonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AIInteractiveButtons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AIInteractiveButtons
     * const aIInteractiveButton = await prisma.aIInteractiveButton.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AIInteractiveButtonUpdateManyArgs>(args: SelectSubset<T, AIInteractiveButtonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AIInteractiveButton.
     * @param {AIInteractiveButtonUpsertArgs} args - Arguments to update or create a AIInteractiveButton.
     * @example
     * // Update or create a AIInteractiveButton
     * const aIInteractiveButton = await prisma.aIInteractiveButton.upsert({
     *   create: {
     *     // ... data to create a AIInteractiveButton
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AIInteractiveButton we want to update
     *   }
     * })
     */
    upsert<T extends AIInteractiveButtonUpsertArgs>(args: SelectSubset<T, AIInteractiveButtonUpsertArgs<ExtArgs>>): Prisma__AIInteractiveButtonClient<$Result.GetResult<Prisma.$AIInteractiveButtonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AIInteractiveButtons that matches the filter.
     * @param {AIInteractiveButtonFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const aIInteractiveButton = await prisma.aIInteractiveButton.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AIInteractiveButtonFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AIInteractiveButton.
     * @param {AIInteractiveButtonAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const aIInteractiveButton = await prisma.aIInteractiveButton.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AIInteractiveButtonAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AIInteractiveButtons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonCountArgs} args - Arguments to filter AIInteractiveButtons to count.
     * @example
     * // Count the number of AIInteractiveButtons
     * const count = await prisma.aIInteractiveButton.count({
     *   where: {
     *     // ... the filter for the AIInteractiveButtons we want to count
     *   }
     * })
    **/
    count<T extends AIInteractiveButtonCountArgs>(
      args?: Subset<T, AIInteractiveButtonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AIInteractiveButtonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AIInteractiveButton.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AIInteractiveButtonAggregateArgs>(args: Subset<T, AIInteractiveButtonAggregateArgs>): Prisma.PrismaPromise<GetAIInteractiveButtonAggregateType<T>>

    /**
     * Group by AIInteractiveButton.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AIInteractiveButtonGroupByArgs} args - Group by arguments.
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
      T extends AIInteractiveButtonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AIInteractiveButtonGroupByArgs['orderBy'] }
        : { orderBy?: AIInteractiveButtonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AIInteractiveButtonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAIInteractiveButtonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AIInteractiveButton model
   */
  readonly fields: AIInteractiveButtonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AIInteractiveButton.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AIInteractiveButtonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AIInteractiveButton model
   */
  interface AIInteractiveButtonFieldRefs {
    readonly id: FieldRef<"AIInteractiveButton", 'String'>
    readonly token: FieldRef<"AIInteractiveButton", 'String'>
    readonly guildId: FieldRef<"AIInteractiveButton", 'String'>
    readonly channelId: FieldRef<"AIInteractiveButton", 'String'>
    readonly label: FieldRef<"AIInteractiveButton", 'String'>
    readonly response: FieldRef<"AIInteractiveButton", 'String'>
    readonly createdAt: FieldRef<"AIInteractiveButton", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AIInteractiveButton findUnique
   */
  export type AIInteractiveButtonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter, which AIInteractiveButton to fetch.
     */
    where: AIInteractiveButtonWhereUniqueInput
  }

  /**
   * AIInteractiveButton findUniqueOrThrow
   */
  export type AIInteractiveButtonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter, which AIInteractiveButton to fetch.
     */
    where: AIInteractiveButtonWhereUniqueInput
  }

  /**
   * AIInteractiveButton findFirst
   */
  export type AIInteractiveButtonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter, which AIInteractiveButton to fetch.
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIInteractiveButtons to fetch.
     */
    orderBy?: AIInteractiveButtonOrderByWithRelationInput | AIInteractiveButtonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIInteractiveButtons.
     */
    cursor?: AIInteractiveButtonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIInteractiveButtons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIInteractiveButtons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIInteractiveButtons.
     */
    distinct?: AIInteractiveButtonScalarFieldEnum | AIInteractiveButtonScalarFieldEnum[]
  }

  /**
   * AIInteractiveButton findFirstOrThrow
   */
  export type AIInteractiveButtonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter, which AIInteractiveButton to fetch.
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIInteractiveButtons to fetch.
     */
    orderBy?: AIInteractiveButtonOrderByWithRelationInput | AIInteractiveButtonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AIInteractiveButtons.
     */
    cursor?: AIInteractiveButtonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIInteractiveButtons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIInteractiveButtons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AIInteractiveButtons.
     */
    distinct?: AIInteractiveButtonScalarFieldEnum | AIInteractiveButtonScalarFieldEnum[]
  }

  /**
   * AIInteractiveButton findMany
   */
  export type AIInteractiveButtonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter, which AIInteractiveButtons to fetch.
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AIInteractiveButtons to fetch.
     */
    orderBy?: AIInteractiveButtonOrderByWithRelationInput | AIInteractiveButtonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AIInteractiveButtons.
     */
    cursor?: AIInteractiveButtonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AIInteractiveButtons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AIInteractiveButtons.
     */
    skip?: number
    distinct?: AIInteractiveButtonScalarFieldEnum | AIInteractiveButtonScalarFieldEnum[]
  }

  /**
   * AIInteractiveButton create
   */
  export type AIInteractiveButtonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * The data needed to create a AIInteractiveButton.
     */
    data: XOR<AIInteractiveButtonCreateInput, AIInteractiveButtonUncheckedCreateInput>
  }

  /**
   * AIInteractiveButton createMany
   */
  export type AIInteractiveButtonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AIInteractiveButtons.
     */
    data: AIInteractiveButtonCreateManyInput | AIInteractiveButtonCreateManyInput[]
  }

  /**
   * AIInteractiveButton update
   */
  export type AIInteractiveButtonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * The data needed to update a AIInteractiveButton.
     */
    data: XOR<AIInteractiveButtonUpdateInput, AIInteractiveButtonUncheckedUpdateInput>
    /**
     * Choose, which AIInteractiveButton to update.
     */
    where: AIInteractiveButtonWhereUniqueInput
  }

  /**
   * AIInteractiveButton updateMany
   */
  export type AIInteractiveButtonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AIInteractiveButtons.
     */
    data: XOR<AIInteractiveButtonUpdateManyMutationInput, AIInteractiveButtonUncheckedUpdateManyInput>
    /**
     * Filter which AIInteractiveButtons to update
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * Limit how many AIInteractiveButtons to update.
     */
    limit?: number
  }

  /**
   * AIInteractiveButton upsert
   */
  export type AIInteractiveButtonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * The filter to search for the AIInteractiveButton to update in case it exists.
     */
    where: AIInteractiveButtonWhereUniqueInput
    /**
     * In case the AIInteractiveButton found by the `where` argument doesn't exist, create a new AIInteractiveButton with this data.
     */
    create: XOR<AIInteractiveButtonCreateInput, AIInteractiveButtonUncheckedCreateInput>
    /**
     * In case the AIInteractiveButton was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AIInteractiveButtonUpdateInput, AIInteractiveButtonUncheckedUpdateInput>
  }

  /**
   * AIInteractiveButton delete
   */
  export type AIInteractiveButtonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
    /**
     * Filter which AIInteractiveButton to delete.
     */
    where: AIInteractiveButtonWhereUniqueInput
  }

  /**
   * AIInteractiveButton deleteMany
   */
  export type AIInteractiveButtonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AIInteractiveButtons to delete
     */
    where?: AIInteractiveButtonWhereInput
    /**
     * Limit how many AIInteractiveButtons to delete.
     */
    limit?: number
  }

  /**
   * AIInteractiveButton findRaw
   */
  export type AIInteractiveButtonFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIInteractiveButton aggregateRaw
   */
  export type AIInteractiveButtonAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * AIInteractiveButton without action
   */
  export type AIInteractiveButtonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AIInteractiveButton
     */
    select?: AIInteractiveButtonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AIInteractiveButton
     */
    omit?: AIInteractiveButtonOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const AIGuildSettingsScalarFieldEnum: {
    id: 'id',
    guildId: 'guildId',
    systemPrompt: 'systemPrompt',
    triggerEvents: 'triggerEvents',
    triggerChannelIds: 'triggerChannelIds',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AIGuildSettingsScalarFieldEnum = (typeof AIGuildSettingsScalarFieldEnum)[keyof typeof AIGuildSettingsScalarFieldEnum]


  export const AIPendingActionScalarFieldEnum: {
    id: 'id',
    guildId: 'guildId',
    userId: 'userId',
    turnId: 'turnId',
    actionsJson: 'actionsJson',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type AIPendingActionScalarFieldEnum = (typeof AIPendingActionScalarFieldEnum)[keyof typeof AIPendingActionScalarFieldEnum]


  export const AIInteractiveButtonScalarFieldEnum: {
    id: 'id',
    token: 'token',
    guildId: 'guildId',
    channelId: 'channelId',
    label: 'label',
    response: 'response',
    createdAt: 'createdAt'
  };

  export type AIInteractiveButtonScalarFieldEnum = (typeof AIInteractiveButtonScalarFieldEnum)[keyof typeof AIInteractiveButtonScalarFieldEnum]


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
   * Reference to a field of type 'E_AI_TRIGGER_EVENT[]'
   */
  export type ListEnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_AI_TRIGGER_EVENT[]'>
    


  /**
   * Reference to a field of type 'E_AI_TRIGGER_EVENT'
   */
  export type EnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'E_AI_TRIGGER_EVENT'>
    


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
   * Deep Input Types
   */


  export type AIGuildSettingsWhereInput = {
    AND?: AIGuildSettingsWhereInput | AIGuildSettingsWhereInput[]
    OR?: AIGuildSettingsWhereInput[]
    NOT?: AIGuildSettingsWhereInput | AIGuildSettingsWhereInput[]
    id?: StringFilter<"AIGuildSettings"> | string
    guildId?: StringFilter<"AIGuildSettings"> | string
    systemPrompt?: StringNullableFilter<"AIGuildSettings"> | string | null
    triggerEvents?: EnumE_AI_TRIGGER_EVENTNullableListFilter<"AIGuildSettings">
    triggerChannelIds?: StringNullableListFilter<"AIGuildSettings">
    createdAt?: DateTimeFilter<"AIGuildSettings"> | Date | string
    updatedAt?: DateTimeFilter<"AIGuildSettings"> | Date | string
  }

  export type AIGuildSettingsOrderByWithRelationInput = {
    id?: SortOrder
    guildId?: SortOrder
    systemPrompt?: SortOrder
    triggerEvents?: SortOrder
    triggerChannelIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AIGuildSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    guildId?: string
    AND?: AIGuildSettingsWhereInput | AIGuildSettingsWhereInput[]
    OR?: AIGuildSettingsWhereInput[]
    NOT?: AIGuildSettingsWhereInput | AIGuildSettingsWhereInput[]
    systemPrompt?: StringNullableFilter<"AIGuildSettings"> | string | null
    triggerEvents?: EnumE_AI_TRIGGER_EVENTNullableListFilter<"AIGuildSettings">
    triggerChannelIds?: StringNullableListFilter<"AIGuildSettings">
    createdAt?: DateTimeFilter<"AIGuildSettings"> | Date | string
    updatedAt?: DateTimeFilter<"AIGuildSettings"> | Date | string
  }, "id" | "guildId">

  export type AIGuildSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    guildId?: SortOrder
    systemPrompt?: SortOrder
    triggerEvents?: SortOrder
    triggerChannelIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AIGuildSettingsCountOrderByAggregateInput
    _max?: AIGuildSettingsMaxOrderByAggregateInput
    _min?: AIGuildSettingsMinOrderByAggregateInput
  }

  export type AIGuildSettingsScalarWhereWithAggregatesInput = {
    AND?: AIGuildSettingsScalarWhereWithAggregatesInput | AIGuildSettingsScalarWhereWithAggregatesInput[]
    OR?: AIGuildSettingsScalarWhereWithAggregatesInput[]
    NOT?: AIGuildSettingsScalarWhereWithAggregatesInput | AIGuildSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AIGuildSettings"> | string
    guildId?: StringWithAggregatesFilter<"AIGuildSettings"> | string
    systemPrompt?: StringNullableWithAggregatesFilter<"AIGuildSettings"> | string | null
    triggerEvents?: EnumE_AI_TRIGGER_EVENTNullableListFilter<"AIGuildSettings">
    triggerChannelIds?: StringNullableListFilter<"AIGuildSettings">
    createdAt?: DateTimeWithAggregatesFilter<"AIGuildSettings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AIGuildSettings"> | Date | string
  }

  export type AIPendingActionWhereInput = {
    AND?: AIPendingActionWhereInput | AIPendingActionWhereInput[]
    OR?: AIPendingActionWhereInput[]
    NOT?: AIPendingActionWhereInput | AIPendingActionWhereInput[]
    id?: StringFilter<"AIPendingAction"> | string
    guildId?: StringFilter<"AIPendingAction"> | string
    userId?: StringFilter<"AIPendingAction"> | string
    turnId?: StringFilter<"AIPendingAction"> | string
    actionsJson?: StringFilter<"AIPendingAction"> | string
    expiresAt?: DateTimeFilter<"AIPendingAction"> | Date | string
    createdAt?: DateTimeFilter<"AIPendingAction"> | Date | string
  }

  export type AIPendingActionOrderByWithRelationInput = {
    id?: SortOrder
    guildId?: SortOrder
    userId?: SortOrder
    turnId?: SortOrder
    actionsJson?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AIPendingActionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    guildId_userId?: AIPendingActionGuildIdUserIdCompoundUniqueInput
    AND?: AIPendingActionWhereInput | AIPendingActionWhereInput[]
    OR?: AIPendingActionWhereInput[]
    NOT?: AIPendingActionWhereInput | AIPendingActionWhereInput[]
    guildId?: StringFilter<"AIPendingAction"> | string
    userId?: StringFilter<"AIPendingAction"> | string
    turnId?: StringFilter<"AIPendingAction"> | string
    actionsJson?: StringFilter<"AIPendingAction"> | string
    expiresAt?: DateTimeFilter<"AIPendingAction"> | Date | string
    createdAt?: DateTimeFilter<"AIPendingAction"> | Date | string
  }, "id" | "guildId_userId">

  export type AIPendingActionOrderByWithAggregationInput = {
    id?: SortOrder
    guildId?: SortOrder
    userId?: SortOrder
    turnId?: SortOrder
    actionsJson?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: AIPendingActionCountOrderByAggregateInput
    _max?: AIPendingActionMaxOrderByAggregateInput
    _min?: AIPendingActionMinOrderByAggregateInput
  }

  export type AIPendingActionScalarWhereWithAggregatesInput = {
    AND?: AIPendingActionScalarWhereWithAggregatesInput | AIPendingActionScalarWhereWithAggregatesInput[]
    OR?: AIPendingActionScalarWhereWithAggregatesInput[]
    NOT?: AIPendingActionScalarWhereWithAggregatesInput | AIPendingActionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AIPendingAction"> | string
    guildId?: StringWithAggregatesFilter<"AIPendingAction"> | string
    userId?: StringWithAggregatesFilter<"AIPendingAction"> | string
    turnId?: StringWithAggregatesFilter<"AIPendingAction"> | string
    actionsJson?: StringWithAggregatesFilter<"AIPendingAction"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"AIPendingAction"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"AIPendingAction"> | Date | string
  }

  export type AIInteractiveButtonWhereInput = {
    AND?: AIInteractiveButtonWhereInput | AIInteractiveButtonWhereInput[]
    OR?: AIInteractiveButtonWhereInput[]
    NOT?: AIInteractiveButtonWhereInput | AIInteractiveButtonWhereInput[]
    id?: StringFilter<"AIInteractiveButton"> | string
    token?: StringFilter<"AIInteractiveButton"> | string
    guildId?: StringFilter<"AIInteractiveButton"> | string
    channelId?: StringFilter<"AIInteractiveButton"> | string
    label?: StringFilter<"AIInteractiveButton"> | string
    response?: StringFilter<"AIInteractiveButton"> | string
    createdAt?: DateTimeFilter<"AIInteractiveButton"> | Date | string
  }

  export type AIInteractiveButtonOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    guildId?: SortOrder
    channelId?: SortOrder
    label?: SortOrder
    response?: SortOrder
    createdAt?: SortOrder
  }

  export type AIInteractiveButtonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: AIInteractiveButtonWhereInput | AIInteractiveButtonWhereInput[]
    OR?: AIInteractiveButtonWhereInput[]
    NOT?: AIInteractiveButtonWhereInput | AIInteractiveButtonWhereInput[]
    guildId?: StringFilter<"AIInteractiveButton"> | string
    channelId?: StringFilter<"AIInteractiveButton"> | string
    label?: StringFilter<"AIInteractiveButton"> | string
    response?: StringFilter<"AIInteractiveButton"> | string
    createdAt?: DateTimeFilter<"AIInteractiveButton"> | Date | string
  }, "id" | "token">

  export type AIInteractiveButtonOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    guildId?: SortOrder
    channelId?: SortOrder
    label?: SortOrder
    response?: SortOrder
    createdAt?: SortOrder
    _count?: AIInteractiveButtonCountOrderByAggregateInput
    _max?: AIInteractiveButtonMaxOrderByAggregateInput
    _min?: AIInteractiveButtonMinOrderByAggregateInput
  }

  export type AIInteractiveButtonScalarWhereWithAggregatesInput = {
    AND?: AIInteractiveButtonScalarWhereWithAggregatesInput | AIInteractiveButtonScalarWhereWithAggregatesInput[]
    OR?: AIInteractiveButtonScalarWhereWithAggregatesInput[]
    NOT?: AIInteractiveButtonScalarWhereWithAggregatesInput | AIInteractiveButtonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    token?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    guildId?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    channelId?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    label?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    response?: StringWithAggregatesFilter<"AIInteractiveButton"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AIInteractiveButton"> | Date | string
  }

  export type AIGuildSettingsCreateInput = {
    id?: string
    guildId: string
    systemPrompt?: string | null
    triggerEvents?: AIGuildSettingsCreatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsCreatetriggerChannelIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AIGuildSettingsUncheckedCreateInput = {
    id?: string
    guildId: string
    systemPrompt?: string | null
    triggerEvents?: AIGuildSettingsCreatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsCreatetriggerChannelIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AIGuildSettingsUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    triggerEvents?: AIGuildSettingsUpdatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsUpdatetriggerChannelIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIGuildSettingsUncheckedUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    triggerEvents?: AIGuildSettingsUpdatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsUpdatetriggerChannelIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIGuildSettingsCreateManyInput = {
    id?: string
    guildId: string
    systemPrompt?: string | null
    triggerEvents?: AIGuildSettingsCreatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsCreatetriggerChannelIdsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AIGuildSettingsUpdateManyMutationInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    triggerEvents?: AIGuildSettingsUpdatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsUpdatetriggerChannelIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIGuildSettingsUncheckedUpdateManyInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    triggerEvents?: AIGuildSettingsUpdatetriggerEventsInput | $Enums.E_AI_TRIGGER_EVENT[]
    triggerChannelIds?: AIGuildSettingsUpdatetriggerChannelIdsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIPendingActionCreateInput = {
    id?: string
    guildId: string
    userId: string
    turnId: string
    actionsJson: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AIPendingActionUncheckedCreateInput = {
    id?: string
    guildId: string
    userId: string
    turnId: string
    actionsJson: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AIPendingActionUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    turnId?: StringFieldUpdateOperationsInput | string
    actionsJson?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIPendingActionUncheckedUpdateInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    turnId?: StringFieldUpdateOperationsInput | string
    actionsJson?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIPendingActionCreateManyInput = {
    id?: string
    guildId: string
    userId: string
    turnId: string
    actionsJson: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AIPendingActionUpdateManyMutationInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    turnId?: StringFieldUpdateOperationsInput | string
    actionsJson?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIPendingActionUncheckedUpdateManyInput = {
    guildId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    turnId?: StringFieldUpdateOperationsInput | string
    actionsJson?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIInteractiveButtonCreateInput = {
    id?: string
    token: string
    guildId: string
    channelId: string
    label: string
    response: string
    createdAt?: Date | string
  }

  export type AIInteractiveButtonUncheckedCreateInput = {
    id?: string
    token: string
    guildId: string
    channelId: string
    label: string
    response: string
    createdAt?: Date | string
  }

  export type AIInteractiveButtonUpdateInput = {
    token?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    response?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIInteractiveButtonUncheckedUpdateInput = {
    token?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    response?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIInteractiveButtonCreateManyInput = {
    id?: string
    token: string
    guildId: string
    channelId: string
    label: string
    response: string
    createdAt?: Date | string
  }

  export type AIInteractiveButtonUpdateManyMutationInput = {
    token?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    response?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AIInteractiveButtonUncheckedUpdateManyInput = {
    token?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    response?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumE_AI_TRIGGER_EVENTNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.E_AI_TRIGGER_EVENT[] | ListEnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel> | null
    has?: $Enums.E_AI_TRIGGER_EVENT | EnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.E_AI_TRIGGER_EVENT[] | ListEnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel>
    hasSome?: $Enums.E_AI_TRIGGER_EVENT[] | ListEnumE_AI_TRIGGER_EVENTFieldRefInput<$PrismaModel>
    isEmpty?: boolean
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

  export type AIGuildSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    systemPrompt?: SortOrder
    triggerEvents?: SortOrder
    triggerChannelIds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AIGuildSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    systemPrompt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AIGuildSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    systemPrompt?: SortOrder
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

  export type AIPendingActionGuildIdUserIdCompoundUniqueInput = {
    guildId: string
    userId: string
  }

  export type AIPendingActionCountOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    userId?: SortOrder
    turnId?: SortOrder
    actionsJson?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AIPendingActionMaxOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    userId?: SortOrder
    turnId?: SortOrder
    actionsJson?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AIPendingActionMinOrderByAggregateInput = {
    id?: SortOrder
    guildId?: SortOrder
    userId?: SortOrder
    turnId?: SortOrder
    actionsJson?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AIInteractiveButtonCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    guildId?: SortOrder
    channelId?: SortOrder
    label?: SortOrder
    response?: SortOrder
    createdAt?: SortOrder
  }

  export type AIInteractiveButtonMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    guildId?: SortOrder
    channelId?: SortOrder
    label?: SortOrder
    response?: SortOrder
    createdAt?: SortOrder
  }

  export type AIInteractiveButtonMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    guildId?: SortOrder
    channelId?: SortOrder
    label?: SortOrder
    response?: SortOrder
    createdAt?: SortOrder
  }

  export type AIGuildSettingsCreatetriggerEventsInput = {
    set: $Enums.E_AI_TRIGGER_EVENT[]
  }

  export type AIGuildSettingsCreatetriggerChannelIdsInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type AIGuildSettingsUpdatetriggerEventsInput = {
    set?: $Enums.E_AI_TRIGGER_EVENT[]
    push?: $Enums.E_AI_TRIGGER_EVENT | $Enums.E_AI_TRIGGER_EVENT[]
  }

  export type AIGuildSettingsUpdatetriggerChannelIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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