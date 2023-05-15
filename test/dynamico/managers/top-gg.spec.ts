import { Api } from "@top-gg/sdk";

import { TopGGManager } from "@dynamico/managers/top-gg";

jest.mock( "@top-gg/sdk" );

describe( "TopGGManager", () => {
    const userId = "userId";

    let topGGManager: TopGGManager;

    beforeEach( () => {
        topGGManager = new TopGGManager();

        // Mock the workingMiddleware method directly.
        topGGManager[ "workingMiddleware" ] = jest.fn().mockReturnValue( true );
    } );

    afterEach( () => {
        jest.resetAllMocks();
    } );

    describe( "isVoted", () => {
        it( "should return false if workingMiddleware returns false", async () => {
            // Arrange.
            const expectedWorkingMiddlewareResult = false;

            // Mock the workingMiddleware method indirectly
            topGGManager[ "workingMiddleware" ] = jest.fn().mockReturnValue( expectedWorkingMiddlewareResult );

            // Act.
            const result = await topGGManager.isVoted( userId );

            // Assert.
            expect( result ).toBe( false );
        } );

        it( "should return true if cache is available and not expired", async () => {
            // Arrange.
            const apiInstance = new Api( "TOP_GG_TOKEN" ),
                originalHasVoted = apiInstance.hasVoted;

            // Mock api instance.
            topGGManager[ "api" ] = apiInstance;

            // Make api.hasVoted return true.
            apiInstance.hasVoted = jest.fn().mockResolvedValue( true );

            // Trigger the cache.
            await topGGManager.isVoted( userId );

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
            apiInstance.hasVoted = jest.fn().mockResolvedValue( false );

            // Mock the getCache method indirectly with an expired cache.
            topGGManager[ "getCache" ] = jest.fn().mockReturnValue(
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
