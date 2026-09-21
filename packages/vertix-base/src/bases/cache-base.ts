import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type { ICacheInvalidationMessage } from "@vertix.gg/definitions/src/cache-ipc-definitions";

/**
 * How many entries one cache holds before the least recently used one is dropped.
 *
 * Every cache here is keyed by a guild, channel or owner id, so without a ceiling its size is the
 * number of distinct ids the process has ever served - which grows with how long the bot has been
 * up, not with how much is in use. Fourteen classes inherit this, so the ceiling is per cache
 * rather than shared.
 */
export const CACHE_DEFAULT_MAX_ENTRIES = 10_000;

/**
 * How long an entry is served before it is read from its source again.
 *
 * This is a staleness bound, not only a memory one. The cache lives inside one process, so a
 * settings row written by the dashboard, the api, or another shard is invisible here until the
 * entry is replaced. Cross-process invalidation is what actually keeps them in step; this is the
 * floor under it, for the window where Redis is unreachable or a message was missed.
 */
export const CACHE_DEFAULT_TTL_MS = 15 * 60 * 1000;

/**
 * Opt-outs, for a subclass whose entries are not worth expiring or counting.
 *
 * Both are deliberately explicit: a cache that wants to keep everything forever should have to say
 * so, because that is what every one of these did by accident until now.
 */
export const CACHE_NO_EXPIRY = Number.POSITIVE_INFINITY;

export const CACHE_UNBOUNDED = Number.POSITIVE_INFINITY;

interface ICacheEntry<TCacheResult> {
    value: TCacheResult;
    expiresAt: number;
}

/**
 * What the registry holds for one cache: two closures that drop an entry *without* announcing it.
 *
 * Closures rather than the instance, so that applying a message from another process cannot reach
 * `deleteCache()` and publish it onward. A cache that re-announced what it was told would have two
 * processes invalidating each other forever.
 */
interface ICacheInvalidationTarget {
    deleteKeyLocally: ( key: string ) => void;
    deletePrefixLocally: ( prefix: string ) => void;
}

type TCacheInvalidationPublisher = ( message: Omit<ICacheInvalidationMessage, "origin"> ) => void;

/**
 * Keyed by `getName()`, one entry per cache.
 *
 * Registration replaces rather than accumulates: these are singletons, so a second instance under
 * the same name is either a test building a fresh one or a bug, and in both cases the newer one is
 * the one that should receive evictions.
 */
const cacheRegistry = new Map<string, ICacheInvalidationTarget>();

/**
 * Installed at startup by whatever owns the IPC connection; null until then, and null in any
 * process that has no Redis.
 *
 * Kept as a hook rather than an import so that `CacheBase` - which every model and manager extends,
 * and which is constructed long before any service exists - does not depend on the IPC module.
 */
let cacheInvalidationPublisher: TCacheInvalidationPublisher | null = null;

export function setCacheInvalidationPublisher( publisher: TCacheInvalidationPublisher | null ): void {
    cacheInvalidationPublisher = publisher;
}

export abstract class CacheBase<CacheResult> extends InitializeBase {
    /**
     * Insertion order is the eviction order.
     *
     * A `Map` iterates in insertion order, so "oldest key first" is free as long as every read and
     * every write re-inserts the entry it touched. That is what makes this least-recently-*used*
     * rather than least-recently-written, and it is why `getCache()` deletes before it sets.
     */
    private readonly cache: Map<string, ICacheEntry<CacheResult>>;

    private cacheDebugger: Debugger;

    protected constructor( shouldDebugCache = true ) {
        super();

        this.cacheDebugger = new Debugger( this, undefined, shouldDebugCache );

        this.cache = new Map<string, ICacheEntry<CacheResult>>();

        cacheRegistry.set( this.getName(), {
            deleteKeyLocally: ( key ) => {
                this.cache.delete( key );
            },
            deletePrefixLocally: ( prefix ) => {
                for ( const key of this.cache.keys() ) {
                    if ( key.startsWith( prefix ) ) {
                        this.cache.delete( key );
                    }
                }
            }
        } );
    }

    /**
     * Applies one eviction announced by another process.
     *
     * Static because the registry holds closures rather than instances - and because the caller is
     * the IPC subscriber, which has a name on the wire and no reference to the object it belongs to.
     * Returns whether the named cache exists here: a process that does not run that model is the
     * normal case, not an error.
     */
    public static applyInvalidation( message: ICacheInvalidationMessage ): boolean {
        const target = cacheRegistry.get( message.cache );

        if ( ! target ) {
            return false;
        }

        if ( undefined !== message.prefix ) {
            target.deletePrefixLocally( message.prefix );
        } else if ( undefined !== message.key ) {
            target.deleteKeyLocally( message.key );
        }

        return true;
    }

    /**
     * Read lazily rather than in the constructor on purpose: a subclass that answers from one of
     * its own fields has not assigned them yet while `super()` is still running.
     */
    protected getCacheMaxEntries(): number {
        return CACHE_DEFAULT_MAX_ENTRIES;
    }

    protected getCacheTtlMs(): number {
        return CACHE_DEFAULT_TTL_MS;
    }

    protected getCache( key: string ) {
        this.cacheDebugger.log( this.getCache, `Getting cache for key: '${ key }'` );

        const entry = this.cache.get( key );

        if ( ! entry ) {
            return undefined;
        }

        // Expiry is settled on read rather than by a timer. Fourteen caches would otherwise be
        // fourteen intervals waking up to walk maps that are mostly untouched, and an entry nobody
        // asks for costs nothing to keep until the ceiling reclaims it anyway.
        if ( entry.expiresAt <= Date.now() ) {
            this.cacheDebugger.log( this.getCache, `Cache for key: '${ key }' expired` );

            this.cache.delete( key );

            return undefined;
        }

        this.cache.delete( key );
        this.cache.set( key, entry );

        this.cacheDebugger.log( this.getCache, `Got cache for key: '${ key }'` );
        this.cacheDebugger.dumpDown( this.setCache, entry.value );

        return entry.value;
    }

    /**
     * A snapshot of what is currently live, not the cache itself.
     *
     * The entries carry an expiry beside the value now, so handing the map out would hand out the
     * wrapper too. Writing into what this returns does not reach the cache - use `setCache()`.
     */
    protected getCacheMap(): Map<string, CacheResult> {
        const snapshot = new Map<string, CacheResult>(),
            now = Date.now();

        for ( const [ key, entry ] of this.cache ) {
            if ( entry.expiresAt > now ) {
                snapshot.set( key, entry.value );
            }
        }

        return snapshot;
    }

    protected setCache( key: string, value: CacheResult ): void {
        this.cacheDebugger.log( this.setCache, `Setting cache for key: '${ key }'` );

        this.cacheDebugger.dumpDown( this.setCache, value );

        const ttl = this.getCacheTtlMs();

        // Deleted first so that overwriting an existing key moves it to the end of the iteration
        // order rather than leaving it where it was - otherwise the key most recently written would
        // still be the first one evicted.
        this.cache.delete( key );

        this.cache.set( key, {
            value,
            expiresAt: CACHE_NO_EXPIRY === ttl ? CACHE_NO_EXPIRY : Date.now() + ttl
        } );

        this.evictOverflow();
    }

    /**
     * Drops an entry here and tells every other process to drop it too.
     *
     * Every existing caller is already positioned where it should be - immediately after the write
     * that made the entry wrong - so announcing from here is what turns each of those into a
     * cross-process invalidation without touching any of them.
     */
    protected deleteCache( key: string ): boolean {
        this.cacheDebugger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        const existed = this.cache.delete( key );

        if ( ! existed ) {
            this.cacheDebugger.log( this.deleteCache, `Cache for key: '${ key }' does not exist` );
        }

        // Announced whether or not this process held it. The point is the processes that *do*, and
        // whoever wrote the row is often not one of them.
        this.publishInvalidation( { cache: this.getName(), key } );

        return existed;
    }

    protected deleteCacheWithPrefix( prefix: string ): void {
        this.cacheDebugger.log( this.deleteCacheWithPrefix, `Deleting cache prefix: '${ prefix }'` );

        // Deleted directly rather than through `deleteCache()`, which would announce once per
        // matching key. One message carrying the prefix says the same thing.
        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.cache.delete( key );
            }
        }

        this.publishInvalidation( { cache: this.getName(), prefix } );
    }

    /**
     * Best effort, and deliberately so.
     *
     * An eviction that cannot be announced - no Redis, no publisher installed, a process that runs
     * without IPC at all - must not fail the write that triggered it. The local drop has already
     * happened and the ttl still bounds everyone else, so the cost of a lost message is staleness
     * for one ttl rather than a failed settings save.
     */
    private publishInvalidation( message: Omit<ICacheInvalidationMessage, "origin"> ): void {
        if ( ! cacheInvalidationPublisher ) {
            return;
        }

        try {
            cacheInvalidationPublisher( message );
        } catch( error ) {
            this.cacheDebugger.log(
                this.publishInvalidation,
                `Could not announce invalidation for '${ message.cache }': ${ String( error ) }`
            );
        }
    }

    /**
     * Drops least-recently-used entries until the cache is back inside its ceiling.
     *
     * A loop rather than a single delete because `getCacheMaxEntries()` is overridable, and a
     * subclass that lowers it at runtime would otherwise shed one entry per write forever. Nothing
     * is announced: this is one process reclaiming its own memory, not a row changing.
     */
    private evictOverflow(): void {
        const maxEntries = this.getCacheMaxEntries();

        if ( CACHE_UNBOUNDED === maxEntries ) {
            return;
        }

        while ( this.cache.size > maxEntries ) {
            const oldest = this.cache.keys().next();

            if ( oldest.done ) {
                return;
            }

            this.cacheDebugger.log( this.evictOverflow, `Evicting cache for key: '${ oldest.value }'` );

            this.cache.delete( oldest.value );
        }
    }
}
