import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001";

async function makeService() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { GuildActivityModel } = await import( "@vertix.gg/data/src/models/guild-activity-model" );
    const { GuildActivationService } = await import( "@vertix.gg/bot/src/services/guild-activation-service" );

    const model = {
        markSetup: jest.fn( async() => undefined ),
        markRoomCreated: jest.fn( async() => undefined )
    };

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildActivityModel, "$", "get" ).mockReturnValue( asInstance( model ) );

    const service = Object.create( GuildActivationService.prototype ) as InstanceType<typeof GuildActivationService>;

    return { service, model };
}

/**
 * Which channels say something about a server's use of the bot.
 *
 * The line matters in both directions: a pool's pre-opened rooms counted as use would make every
 * server with a pool look busy, and a generator not counted as a setup would make it look unused.
 */
describe( "VertixBot/Services/GuildActivation", () => {
    afterEach( () => jest.restoreAllMocks() );

    it( "should record a generator of either kind as the server setting the bot up", async() => {
        // Arrange.
        const { service, model } = await makeService();

        // Act.
        await service.record( GUILD_ID, "MASTER_CREATE_CHANNEL" );
        await service.record( GUILD_ID, "MASTER_SCALING_CHANNEL" );

        // Assert.
        expect( model.markSetup ).toHaveBeenCalledTimes( 2 );
        expect( model.markRoomCreated ).not.toHaveBeenCalled();
    } );

    it( "should count a room a member made from a generator", async() => {
        // Arrange.
        const { service, model } = await makeService();

        // Act.
        await service.record( GUILD_ID, "DYNAMIC_CHANNEL" );

        // Assert.
        expect( model.markRoomCreated ).toHaveBeenCalledWith( GUILD_ID, expect.any( Date ) );
    } );

    it( "should not count a room an auto-scaling pool opened ahead of anybody", async() => {
        // Arrange.
        const { service, model } = await makeService();

        // Act.
        await service.record( GUILD_ID, "SCALING_CHANNEL" );

        // Assert.
        expect( model.markSetup ).not.toHaveBeenCalled();
        expect( model.markRoomCreated ).not.toHaveBeenCalled();
    } );
} );
