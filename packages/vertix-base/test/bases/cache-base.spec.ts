import { jest } from "@jest/globals";

import {
    CACHE_NO_EXPIRY,
    CACHE_UNBOUNDED,
    CacheBase,
    setCacheInvalidationPublisher
} from "@vertix.gg/base/src/bases/cache-base";

import type { ICacheInvalidationMessage } from "@vertix.gg/definitions/src/cache-ipc-definitions";

const THIS_CACHE = "VertixBase/Test/CacheBase";

const A_TTL = 1_000,
    A_MAX = 3;

/**
 * The protected surface, opened up so a test can drive it.
 *
 * The two ceilings arrive as constructor parameter properties, which TypeScript assigns *after*
 * `super()` returns - so a base that read them while constructing would see `undefined`. That it
 * works here is the test of `getCacheMaxEntries()` / `getCacheTtlMs()` being read lazily.
 */
class TestCache extends CacheBase<string> {
    public static getName() {
        return THIS_CACHE;
    }

    public constructor(
        private readonly maxEntries: number = A_MAX,
        private readonly ttlMs: number = A_TTL
    ) {
        super( false );
    }

    protected override getCacheMaxEntries(): number {
        return this.maxEntries;
    }

    protected override getCacheTtlMs(): number {
        return this.ttlMs;
    }

    public read( key: string ) {
        return this.getCache( key );
    }

    public write( key: string, value: string ) {
        this.setCache( key, value );
    }

    public drop( key: string ) {
        return this.deleteCache( key );
    }

    public dropPrefix( prefix: string ) {
        this.deleteCacheWithPrefix( prefix );
    }

    public snapshot() {
        return this.getCacheMap();
    }
}

describe( "VertixBase/Bases/CacheBase", () => {
    let now: number;

    beforeEach( () => {
        now = 1_000_000;

        jest.spyOn( Date, "now" ).mockImplementation( () => now );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    const advance = ( ms: number ) => {
        now += ms;
    };

    describe( "read-through behaviour", () => {
        it( "should return a value that was written", () => {
            const cache = new TestCache();

            cache.write( "guild-1", "settings" );

            expect( cache.read( "guild-1" ) ).toBe( "settings" );
        } );

        it( "should return undefined for a key it never held", () => {
            expect( new TestCache().read( "guild-nope" ) ).toBeUndefined();
        } );

        // The value is wrapped beside its expiry now, so the emptiness check is on the wrapper. A
        // falsy value still has to survive the round trip.
        it( "should return a falsy value rather than treating it as a miss", () => {
            const cache = new TestCache();

            cache.write( "guild-1", "" );

            expect( cache.read( "guild-1" ) ).toBe( "" );
        } );
    } );

    describe( "expiry", () => {
        it( "should still serve an entry inside its ttl", () => {
            const cache = new TestCache();

            cache.write( "guild-1", "settings" );
            advance( A_TTL - 1 );

            expect( cache.read( "guild-1" ) ).toBe( "settings" );
        } );

        // A miss is the point: every caller falls through to the database, so an expired entry
        // costs a round trip rather than returning something stale.
        it( "should miss once the ttl has passed", () => {
            const cache = new TestCache();

            cache.write( "guild-1", "settings" );
            advance( A_TTL );

            expect( cache.read( "guild-1" ) ).toBeUndefined();
        } );

        it( "should drop the expired entry rather than leave it occupying the ceiling", () => {
            const cache = new TestCache();

            cache.write( "guild-1", "settings" );
            advance( A_TTL );
            cache.read( "guild-1" );

            expect( cache.snapshot().size ).toBe( 0 );
        } );

        it( "should never expire when the subclass asks for CACHE_NO_EXPIRY", () => {
            const cache = new TestCache( A_MAX, CACHE_NO_EXPIRY );

            cache.write( "guild-1", "settings" );
            advance( Number.MAX_SAFE_INTEGER );

            expect( cache.read( "guild-1" ) ).toBe( "settings" );
        } );
    } );

    describe( "eviction", () => {
        it( "should hold the ceiling, dropping the least recently used", () => {
            const cache = new TestCache();

            cache.write( "a", "1" );
            cache.write( "b", "2" );
            cache.write( "c", "3" );
            cache.write( "d", "4" );

            expect( cache.snapshot().size ).toBe( A_MAX );
            expect( cache.read( "a" ) ).toBeUndefined();
            expect( cache.read( "d" ) ).toBe( "4" );
        } );

        // Least recently *used*, not least recently written - which is the whole reason `getCache()`
        // re-inserts on a hit. Without it a hot key written once would be evicted while colder keys
        // written later survived.
        it( "should treat a read as recent use", () => {
            const cache = new TestCache();

            cache.write( "a", "1" );
            cache.write( "b", "2" );
            cache.write( "c", "3" );

            cache.read( "a" );
            cache.write( "d", "4" );

            expect( cache.read( "a" ) ).toBe( "1" );
            expect( cache.read( "b" ) ).toBeUndefined();
        } );

        it( "should treat overwriting a key as recent use", () => {
            const cache = new TestCache();

            cache.write( "a", "1" );
            cache.write( "b", "2" );
            cache.write( "c", "3" );

            cache.write( "a", "1-again" );
            cache.write( "d", "4" );

            expect( cache.read( "a" ) ).toBe( "1-again" );
            expect( cache.read( "b" ) ).toBeUndefined();
        } );

        it( "should never evict when the subclass asks for CACHE_UNBOUNDED", () => {
            const cache = new TestCache( CACHE_UNBOUNDED );

            for ( let i = 0 ; i < A_MAX * 10 ; i++ ) {
                cache.write( `key-${ i }`, String( i ) );
            }

            expect( cache.snapshot().size ).toBe( A_MAX * 10 );
        } );
    } );

    describe( "explicit invalidation", () => {
        it( "should delete a key and report whether it held one", () => {
            const cache = new TestCache();

            cache.write( "a", "1" );

            expect( cache.drop( "a" ) ).toBe( true );
            expect( cache.drop( "a" ) ).toBe( false );
            expect( cache.read( "a" ) ).toBeUndefined();
        } );

        it( "should delete every key under a prefix and leave the rest", () => {
            const cache = new TestCache( CACHE_UNBOUNDED );

            cache.write( "guild-1-x", "1" );
            cache.write( "guild-1-y", "2" );
            cache.write( "guild-2-x", "3" );

            cache.dropPrefix( "guild-1" );

            expect( cache.read( "guild-1-x" ) ).toBeUndefined();
            expect( cache.read( "guild-1-y" ) ).toBeUndefined();
            expect( cache.read( "guild-2-x" ) ).toBe( "3" );
        } );
    } );

    describe( "getCacheMap()", () => {
        it( "should omit entries that have expired", () => {
            const cache = new TestCache( CACHE_UNBOUNDED );

            cache.write( "a", "1" );
            advance( A_TTL );
            cache.write( "b", "2" );

            expect( [ ... cache.snapshot().keys() ] ).toEqual( [ "b" ] );
        } );

        // A snapshot, not the cache. Writing into it used to reach the real map.
        it( "should hand back a copy that does not write through", () => {
            const cache = new TestCache();

            cache.write( "a", "1" );
            cache.snapshot().set( "b", "2" );

            expect( cache.read( "b" ) ).toBeUndefined();
        } );
    } );

    describe( "cross-process invalidation", () => {
        let announced: Array<Omit<ICacheInvalidationMessage, "origin">>;

        beforeEach( () => {
            announced = [];

            setCacheInvalidationPublisher( ( message ) => {
                announced.push( message );
            } );
        } );

        afterEach( () => {
            setCacheInvalidationPublisher( null );
        } );

        describe( "announcing", () => {
            it( "should announce a deleted key, naming its own cache", () => {
                new TestCache().drop( "guild-1" );

                expect( announced ).toEqual( [ { cache: THIS_CACHE, key: "guild-1" } ] );
            } );

            // One message carrying the prefix, not one per matching key - a guild with fifty
            // settings rows would otherwise put fifty messages on the wire for one save.
            it( "should announce a prefix once rather than once per matching key", () => {
                const cache = new TestCache( CACHE_UNBOUNDED );

                cache.write( "guild-1-a", "1" );
                cache.write( "guild-1-b", "2" );
                cache.write( "guild-1-c", "3" );

                cache.dropPrefix( "guild-1" );

                expect( announced ).toEqual( [ { cache: THIS_CACHE, prefix: "guild-1" } ] );
            } );

            // Whoever wrote the row often does not hold the entry - the api saves what the bot has
            // cached. Announcing only on a local hit would skip exactly that case.
            it( "should announce even when this process held nothing", () => {
                const cache = new TestCache();

                expect( cache.drop( "never-cached" ) ).toBe( false );
                expect( announced ).toHaveLength( 1 );
            } );

            // These are one process reclaiming its own memory, not a row changing. Announcing them
            // would have every process drop a perfectly good entry whenever any one of them filled up.
            it( "should stay silent on expiry and on eviction", () => {
                const expiring = new TestCache( 1, A_TTL );

                expiring.write( "a", "1" );
                advance( A_TTL );
                expiring.read( "a" );

                expiring.write( "b", "2" );
                expiring.write( "c", "3" );

                expect( announced ).toHaveLength( 0 );
            } );
        } );

        describe( "applying", () => {
            it( "should drop a key another process announced", () => {
                const cache = new TestCache();

                cache.write( "guild-1", "settings" );

                expect( CacheBase.applyInvalidation( {
                    origin: "somewhere-else",
                    cache: THIS_CACHE,
                    key: "guild-1"
                } ) ).toBe( true );

                expect( cache.read( "guild-1" ) ).toBeUndefined();
            } );

            it( "should drop every key under an announced prefix", () => {
                const cache = new TestCache( CACHE_UNBOUNDED );

                cache.write( "guild-1-a", "1" );
                cache.write( "guild-1-b", "2" );
                cache.write( "guild-2-a", "3" );

                CacheBase.applyInvalidation( {
                    origin: "somewhere-else",
                    cache: THIS_CACHE,
                    prefix: "guild-1"
                } );

                expect( cache.read( "guild-1-a" ) ).toBeUndefined();
                expect( cache.read( "guild-1-b" ) ).toBeUndefined();
                expect( cache.read( "guild-2-a" ) ).toBe( "3" );
            } );

            // The one that matters. If applying a message went back through `deleteCache()` it
            // would announce it onward, and two processes would invalidate each other forever.
            it( "should not re-announce what it was told", () => {
                const cache = new TestCache();

                cache.write( "guild-1", "settings" );

                CacheBase.applyInvalidation( {
                    origin: "somewhere-else",
                    cache: THIS_CACHE,
                    key: "guild-1"
                } );

                expect( announced ).toHaveLength( 0 );
            } );

            // A process that does not run that model is the normal case, not an error.
            it( "should report a miss for a cache this process does not have", () => {
                expect( CacheBase.applyInvalidation( {
                    origin: "somewhere-else",
                    cache: "VertixData/Models/NotHere",
                    key: "guild-1"
                } ) ).toBe( false );
            } );
        } );

        describe( "failing open", () => {
            // The write that triggered this already succeeded and the local entry is already gone.
            // Losing the announcement costs staleness for one ttl; throwing would cost the save.
            it( "should still delete when no publisher is installed", () => {
                setCacheInvalidationPublisher( null );

                const cache = new TestCache();

                cache.write( "a", "1" );

                expect( () => cache.drop( "a" ) ).not.toThrow();
                expect( cache.read( "a" ) ).toBeUndefined();
            } );

            it( "should still delete when the publisher throws", () => {
                setCacheInvalidationPublisher( () => {
                    throw new Error( "redis is down" );
                } );

                const cache = new TestCache();

                cache.write( "a", "1" );

                expect( () => cache.drop( "a" ) ).not.toThrow();
                expect( cache.read( "a" ) ).toBeUndefined();
            } );
        } );
    } );
} );
