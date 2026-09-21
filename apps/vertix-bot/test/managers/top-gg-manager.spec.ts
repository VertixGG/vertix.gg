import { jest } from "@jest/globals";

import { Api } from "@top-gg/sdk";
import { EventBusMock } from "@vertix.gg/test-utils/src/__mock__/event-bus-mock";

import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

jest.mock( "@top-gg/sdk" );

// Mock original ServiceLocator.
ServiceLocatorMock.mockOrigin();

// Mock original EventBus.
EventBusMock.mockOrigin();

describe( "VertixBot/Managers/TopGG", () => {
    const userId = "userId";

    let topGGManager: TopGGManager;

    beforeEach( async() => {
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/app-service" ) ).AppService );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();

        topGGManager = new TopGGManager();

        // Mock the workingMiddleware method directly.
        topGGManager[ "workingMiddleware" ] = jest.fn<typeof topGGManager[ "workingMiddleware" ]>()
            .mockReturnValue( true );
    } );

    afterEach( () => {
        // Reset ServiceLocator.
        ServiceLocatorMock.reset();

        // Reset EventBusMock.
        EventBusMock.reset();
    } );

    describe( "isVoted()", () => {
        it( "should return true if workingMiddleware returns false", async() => {
            // Arrange.
            const expectedWorkingMiddlewareResult = false;

            // Mock the workingMiddleware method indirectly
            topGGManager[ "workingMiddleware" ] = jest.fn<typeof topGGManager[ "workingMiddleware" ]>()
                .mockReturnValue( expectedWorkingMiddlewareResult );

            // Act.
            const result = await topGGManager.isVoted( userId );

            // Assert.
            expect( result ).toBe( true );
        } );

        it( "should return true if cache is available and not expired", async() => {
            // Arrange.
            const apiInstance = new Api( "TOP_GG_TOKEN" ),
                originalHasVoted = apiInstance.hasVoted;

            // Mock api instance.
            topGGManager[ "api" ] = apiInstance;

            // Make api.hasVoted return true.
            apiInstance.hasVoted = jest.fn<typeof apiInstance.hasVoted>().mockResolvedValue( true );

            // Trigger the cache.
            await topGGManager.isVoted( userId, true, false );

            // Cleanup hasVoted mock.
            apiInstance.hasVoted = originalHasVoted;

            // Act
            const fromCache = await topGGManager.isVoted( userId );

            // Assert.
            expect( fromCache ).toBe( true );
        } );

        it( "should return false if cache is available but expired", async() => {
            // Arrange.
            const apiInstance = new Api( "TOP_GG_TOKEN" ),
                originalHasVoted = apiInstance.hasVoted;

            // Mock api instance.
            topGGManager[ "api" ] = apiInstance;

            // Make api.hasVoted return true.
            apiInstance.hasVoted = jest.fn<typeof apiInstance.hasVoted>().mockResolvedValue( false );

            // Mock the getCache method indirectly with an expired cache.
            topGGManager[ "getCache" ] = jest.fn<typeof topGGManager[ "getCache" ]>().mockReturnValue(
                new Date( "2023-01-01" ) // Assuming an expired date in the past
            );

            // Act.
            const result = await topGGManager.isVoted( userId );

            // Assert.
            expect( result ).toBe( false );

            // Cleanup hasVoted mock.
            apiInstance.hasVoted = originalHasVoted;
        } );
    } );

    describe( "updateStats()", () => {
        const originalCount = process.env.SHARD_COUNT,
            originalIds = process.env.SHARD_IDS;

        let posted: { serverCount?: number; shardId?: number; shardCount?: number }[];

        const setShards = ( count?: string, ids?: string ) => {
            count ? process.env.SHARD_COUNT = count : delete process.env.SHARD_COUNT;
            ids ? process.env.SHARD_IDS = ids : delete process.env.SHARD_IDS;
        };

        /** One cached guild per entry, on the shard that entry names. */
        const withGuildsOnShards = ( shardIds: number[] ) => {
            topGGManager[ "client" ] = {
                guilds: {
                    cache: new Map( shardIds.map( ( shardId, index ) => [ String( index ), { shardId } ] ) )
                }
            } as never;
        };

        beforeEach( () => {
            posted = [];

            topGGManager[ "api" ] = {
                postStats: async( stats: unknown ) => {
                    posted.push( stats as { serverCount?: number } );

                    return stats;
                }
            } as never;
        } );

        afterEach( () => setShards( originalCount, originalIds ) );

        // Every deployment today.
        it( "should post once for the whole bot when unsharded", async() => {
            setShards( undefined, undefined );
            withGuildsOnShards( [ 0, 0, 0 ] );

            await topGGManager.updateStats();

            expect( posted ).toEqual( [ { serverCount: 3, shardId: 0, shardCount: 1 } ] );
        } );

        // top.gg sums what each shard reports, so a process posts for the shards it holds and no
        // others - the guild on shard 2 belongs to a different process.
        it( "should post per owned shard, counting only that shard's guilds", async() => {
            setShards( "4", "0,1" );
            withGuildsOnShards( [ 0, 0, 1, 2 ] );

            await topGGManager.updateStats();

            expect( posted ).toEqual( [
                { serverCount: 2, shardId: 0, shardCount: 4 },
                { serverCount: 1, shardId: 1, shardCount: 4 }
            ] );
        } );

        // A process that holds no shard 0 is not a special case - it reports its own shards and
        // nothing else, the same as any other.
        it( "should report its own shards when it does not hold shard 0", async() => {
            setShards( "4", "2,3" );
            withGuildsOnShards( [ 2, 3, 3 ] );

            await topGGManager.updateStats();

            expect( posted ).toEqual( [
                { serverCount: 1, shardId: 2, shardCount: 4 },
                { serverCount: 2, shardId: 3, shardCount: 4 }
            ] );
        } );
    } );
} );
