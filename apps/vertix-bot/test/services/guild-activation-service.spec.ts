import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001";

const NOW = new Date( "2026-10-06T12:00:00.000Z" );

const daysFromNow = ( days: number ) => new Date( NOW.getTime() + days * 24 * 60 * 60 * 1000 );

async function makeService() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { GuildActivityModel } = await import( "@vertix.gg/data/src/models/guild-activity-model" );
    const { GuildModel } = await import( "@vertix.gg/data/src/models/guild-model" );
    const { GuildActivationService } = await import( "@vertix.gg/bot/src/services/guild-activation-service" );

    const model = {
        markSetup: jest.fn( async() => undefined ),
        markRoomCreated: jest.fn( async() => undefined )
    };

    const guildModel = {
        startTrial: jest.fn( async( _guildId: string, _endsAt: Date ) => true )
    };

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildActivityModel, "$", "get" ).mockReturnValue( asInstance( model ) );
    jest.spyOn( GuildModel, "$", "get" ).mockReturnValue( asInstance( guildModel ) );

    const service = Object.create( GuildActivationService.prototype ) as InstanceType<typeof GuildActivationService>;

    Object.assign( service, { logger: { info: () => undefined } } );

    return { service, model, guildModel };
}

/**
 * Which channels say something about a server's use of the bot.
 *
 * The line matters in both directions: a pool's pre-opened rooms counted as use would make every
 * server with a pool look busy, and a generator not counted as a setup would make it look unused.
 */
describe( "VertixBot/Services/GuildActivation", () => {
    const configuredPrice = process.env.PADDLE_PRICE_PRO;

    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );

        // The trial is of a tier this deployment sells, and one whose id is not in the environment
        // is not sold - so without this the suite would be testing a deployment with nothing to try.
        process.env.PADDLE_PRICE_PRO = "pri_pro";
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        if ( undefined === configuredPrice ) {
            delete process.env.PADDLE_PRICE_PRO;
        } else {
            process.env.PADDLE_PRICE_PRO = configuredPrice;
        }
    } );

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

    describe( "the free trial", () => {
        it( "should start from a room a member made, for the fourteen days Pro offers", async() => {
            // Arrange.
            const { service, guildModel } = await makeService();

            // Act.
            await service.record( GUILD_ID, "DYNAMIC_CHANNEL" );

            // Assert - whether this is the server's first trial is the row's to say, not this.
            expect( guildModel.startTrial ).toHaveBeenCalledWith( GUILD_ID, daysFromNow( 14 ) );
        } );

        it( "should not start from setting up, or from a room a pool opened", async() => {
            // Arrange - neither is anybody using the bot yet, and a trial nobody sees is wasted.
            const { service, guildModel } = await makeService();

            // Act.
            await service.record( GUILD_ID, "MASTER_CREATE_CHANNEL" );
            await service.record( GUILD_ID, "MASTER_SCALING_CHANNEL" );
            await service.record( GUILD_ID, "SCALING_CHANNEL" );

            // Assert.
            expect( guildModel.startTrial ).not.toHaveBeenCalled();
        } );

        it( "should start none on a deployment that cannot sell Pro", async() => {
            // Arrange - a trial of a plan the bot would not honour is a trial of nothing.
            delete process.env.PADDLE_PRICE_PRO;

            const { service, model, guildModel } = await makeService();

            // Act.
            await service.record( GUILD_ID, "DYNAMIC_CHANNEL" );

            // Assert - the room is still counted; only the trial is not given.
            expect( model.markRoomCreated ).toHaveBeenCalled();
            expect( guildModel.startTrial ).not.toHaveBeenCalled();
        } );
    } );
} );
