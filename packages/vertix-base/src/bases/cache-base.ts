import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

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
 * entry is replaced - and today it never is. A TTL puts an upper bound on how long a process can
 * disagree with the database. It is not a substitute for real invalidation over
 * `VertixBase/Modules/IPC`; it is the floor under it.
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

    protected deleteCache( key: string ): boolean {
        this.cacheDebugger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        if ( !this.cache.has( key ) ) {
            this.cacheDebugger.log( this.deleteCache, `Cache for key: '${ key }' does not exist` );

            return false;
        }

        return this.cache.delete( key );
    }

    protected deleteCacheWithPrefix( prefix: string ): void {
        this.cacheDebugger.log( this.deleteCacheWithPrefix, `Deleting cache prefix: '${ prefix }'` );

        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.deleteCache( key );
            }
        }
    }

    /**
     * Drops least-recently-used entries until the cache is back inside its ceiling.
     *
     * A loop rather than a single delete because `getCacheMaxEntries()` is overridable, and a
     * subclass that lowers it at runtime would otherwise shed one entry per write forever.
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
