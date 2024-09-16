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

    beforeEach( async () => {
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
        it( "should return true if workingMiddleware returns false", async () => {
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

        it( "should return true if cache is available and not expired", async () => {
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

        it( "should return false if cache is available but expired", async () => {
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
} );
