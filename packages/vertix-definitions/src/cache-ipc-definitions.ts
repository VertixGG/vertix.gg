/**
 * The channel a cache eviction travels on.
 *
 * Spelled out as a literal rather than built from a class name, for the reason every other
 * persisted identifier here is: it is a contract between processes that were deployed at different
 * times. A bot still running last week's build has to agree with the api on this string, and a
 * rename that only reaches one of them does not fail - it silently stops delivering.
 */
export const CACHE_IPC_CHANNELS = {
    INVALIDATE: "vertix:cache:invalidate"
} as const;

/**
 * One eviction, addressed to a named cache in every other process.
 *
 * `cache` is the `getName()` of the `CacheBase` that owns the entry - "VertixData/Managers/GuildData"
 * and so on. It is carried rather than broadcast to everything because the caches are keyed
 * independently: an owner id that means a guild in one is a channel in another, and dropping the
 * wrong one is a pointless database round trip at best.
 *
 * Exactly one of `key` or `prefix` is set, matching the two ways a cache is invalidated locally.
 */
export interface ICacheInvalidationMessage {
    /**
     * Which process sent it.
     *
     * Redis delivers a published message to every subscriber including the one that sent it, so
     * without this each eviction would come straight back and drop an entry the sender had already
     * dropped. Harmless, but it doubles the traffic and muddies the logs.
     */
    origin: string;

    cache: string;

    key?: string;

    prefix?: string;
}
