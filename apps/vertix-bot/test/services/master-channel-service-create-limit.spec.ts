import { jest } from "@jest/globals";

import { BILLING_UNLIMITED_MASTER_CHANNELS } from "@vertix.gg/definitions/src/billing-definitions";
import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001",
    OWNER_ID = "830000000000000001";

/** What the guild's own settings row allows - the free two, on a server nobody granted anything. */
const GRANTED = 2;

interface IWorld {
    /** What `EntitlementService` answers: the grant, or what the server pays for when that is more. */
    entitled: number;
    /** Setups of both kinds, as `getMastersCount()` counts them. */
    setups: number;
}

/**
 * Stands up `createMasterChannel()` as far as its allowance check and one step past it.
 *
 * Built off the prototype rather than constructed, so none of the base class's wiring has to exist.
 * The step past the check is finding the guild, and a guild it cannot find ends the call there -
 * which is how far this needs to go to tell a refusal from a creation that went ahead.
 */
async function makeCreate( world: IWorld ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const asked = { guildLookups: 0 };

    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { ChannelUtils } = await import( "@vertix.gg/bot/src/utils/channel-utils" );
    const { MasterChannelService } = await import( "@vertix.gg/bot/src/services/master-channel-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( { getMaxMasterChannels: async() => world.entitled } )
    } ) );

    // The free two whatever the server pays for, on purpose: the grant is what the check used to
    // read, and a server paying for more than it was granted is exactly the one it refused.
    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { maxMasterChannels: GRANTED } )
    } ) );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getMastersCount: async() => world.setups
    } ) );

    jest.spyOn( ChannelUtils, "cacheOrFetchGuild" ).mockImplementation( async() => {
        asked.guildLookups ++;

        return null;
    } );

    const service = Object.create( MasterChannelService.prototype ) as InstanceType<typeof MasterChannelService>;

    Object.assign( service, {
        debugger: { log: () => undefined },
        logger: { admin: () => undefined }
    } );

    return {
        asked,
        create: () => service.createMasterChannel( {
            guildId: GUILD_ID,
            userOwnerId: OWNER_ID,
            version: VERSION_UI_V3
        } )
    };
}

/**
 * Whether a server may add a generator, asked at the moment one is created.
 *
 * The setup screen asks the entitlement before it opens the wizard; this is asked again when the
 * wizard finishes, and by the dashboard's create. It used to ask the grant there instead, so a
 * server paying for Pro was shown the wizard and refused at its last step - and the dashboard,
 * which does not wait for the answer, reported the refusal as a success.
 */
describe( "VertixBot/Services/MasterChannel/create limit", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should let a server paying for Pro create past the free two", async() => {
        // Arrange.
        const { create, asked } = await makeCreate( {
            entitled: BILLING_UNLIMITED_MASTER_CHANNELS,
            setups: GRANTED
        } );

        // Act.
        const result = await create();

        // Assert - past the check and on to finding the guild, which this harness cannot supply.
        expect( result.code ).not.toBe( "limit-reached" );
        expect( result.maxMasterChannels ).toBeUndefined();
        expect( asked.guildLookups ).toBe( 1 );
    } );

    it( "should refuse a server on the free allowance at its second", async() => {
        // Arrange.
        const { create } = await makeCreate( { entitled: GRANTED, setups: GRANTED } );

        // Act.
        const result = await create();

        // Assert - and the number it refused at, which the wizard prints back.
        expect( result ).toEqual( { code: "limit-reached", maxMasterChannels: GRANTED } );
    } );

    it( "should still create the last one the allowance reaches", async() => {
        // Arrange - one under is allowed, or the allowance would be off by one against its number.
        const { create } = await makeCreate( { entitled: GRANTED, setups: GRANTED - 1 } );

        // Act.
        const result = await create();

        // Assert.
        expect( result.code ).not.toBe( "limit-reached" );
    } );
} );
