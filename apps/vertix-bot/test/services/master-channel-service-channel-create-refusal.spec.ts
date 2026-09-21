import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { TChannelCreateRefusal } from "@vertix.gg/bot/src/services/master-channel-service";

const GUILD_ID = "820000000000000001",
    MASTER_DB_ID = "65f0000000000000000000a1",
    MASTER_CHANNEL_ID = "840000000000000001";

/** The default in the guild config, and the number this is named after. */
const DEFAULT_ROOMS_LIMIT = 20;

interface IWorld {
    isCovered: boolean;
    roomsLimit: number;
    roomsOpen: number;
}

/**
 * Stands up the one decision and the three things it asks.
 *
 * Called against the prototype with a fabricated `this`, because the handler it lives in is two
 * hundred lines of discord state and none of that is what decides this - which is the whole reason
 * the decision is its own method.
 */
async function makeRefusalCheck( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        isCovered: true,
        roomsLimit: DEFAULT_ROOMS_LIMIT,
        roomsOpen: 0,
        ... world
    };

    const asked = { coverage: 0, count: 0 };

    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { MasterChannelService } = await import( "@vertix.gg/bot/src/services/master-channel-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( {
            isMasterChannelCovered: async() => {
                asked.coverage ++;

                return settled.isCovered;
            }
        } )
    } ) );

    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { maxActiveDynamicChannels: settled.roomsLimit } )
    } ) );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getDynamicsCountByMasterId: async() => {
            asked.count ++;

            return settled.roomsOpen;
        }
    } ) );

    const proto = MasterChannelService.prototype as unknown as {
        findChannelCreateRefusal(
            guildId: string,
            masterChannelDbId: string,
            masterChannelId: string
        ): Promise<TChannelCreateRefusal | undefined>;
    };

    const state = { logger: { warn: () => undefined } };

    return {
        asked,
        find: () => proto.findChannelCreateRefusal.call( state, GUILD_ID, MASTER_DB_ID, MASTER_CHANNEL_ID )
    };
}

/**
 * Why a generator will not make a room.
 *
 * The room cap was the one rule with no test on it - the spec called an end-to-end twenty rooms
 * against `CHANNEL_OPEN_SPACING_MS` too expensive, and it is, but the decision itself is two
 * questions asked in a particular order and neither needs a room to exist.
 */
describe( "VertixBot/Services/MasterChannel/channel create refusal", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should refuse nothing while a generator is working", async() => {
        // Act.
        const { find } = await makeRefusalCheck( { roomsOpen: 3 } );

        // Assert - undefined is the ordinary case, which is why this reads as finding a reason
        // rather than checking permission.
        await expect( find() ).resolves.toBeUndefined();
    } );

    it( "should refuse once the generator is at its limit", async() => {
        // Act - at, not past: the twentieth room is the last one, so the check is `>=`.
        const { find } = await makeRefusalCheck( { roomsOpen: DEFAULT_ROOMS_LIMIT } );

        // Assert.
        await expect( find() ).resolves.toEqual( {
            isGeneratorFull: true,
            roomsLimit: DEFAULT_ROOMS_LIMIT
        } );
    } );

    it( "should still make the last room", async() => {
        // Act - one under the limit is allowed, or the cap would be off by one against its name.
        const { find } = await makeRefusalCheck( { roomsOpen: DEFAULT_ROOMS_LIMIT - 1 } );

        // Assert.
        await expect( find() ).resolves.toBeUndefined();
    } );

    it( "should refuse past the limit as well as at it", async() => {
        // Act - a guild whose limit was lowered under it is over rather than at.
        const { find } = await makeRefusalCheck( { roomsOpen: 25 } );

        // Assert.
        await expect( find() ).resolves.toEqual( {
            isGeneratorFull: true,
            roomsLimit: DEFAULT_ROOMS_LIMIT
        } );
    } );

    it( "should carry the guild's own limit rather than the default", async() => {
        // Act - the number is a setting, and the screen prints it back at somebody.
        const { find } = await makeRefusalCheck( { roomsLimit: 5, roomsOpen: 5 } );

        // Assert.
        await expect( find() ).resolves.toEqual( { isGeneratorFull: true, roomsLimit: 5 } );
    } );

    it( "should refuse a generator the plan does not reach", async() => {
        // Act.
        const { find } = await makeRefusalCheck( { isCovered: false } );

        // Assert.
        await expect( find() ).resolves.toEqual( { isNotCovered: true } );
    } );

    it( "should say the plan before it says full, when both are true", async() => {
        // Act - telling somebody a generator is full would be true and useless: they would close a
        // room and be refused anyway, because the plan is what is stopping them.
        const { find } = await makeRefusalCheck( {
            isCovered: false,
            roomsOpen: DEFAULT_ROOMS_LIMIT
        } );

        // Assert.
        await expect( find() ).resolves.toEqual( { isNotCovered: true } );
    } );

    it( "should not even count the rooms of a generator the plan does not reach", async() => {
        // Act - the ordering is not only which answer comes back; the count is a query, and there
        // is nothing to learn from it once the generator is known to be past the allowance.
        const { find, asked } = await makeRefusalCheck( {
            isCovered: false,
            roomsOpen: DEFAULT_ROOMS_LIMIT
        } );

        await find();

        // Assert.
        expect( asked.coverage ).toBe( 1 );
        expect( asked.count ).toBe( 0 );
    } );
} );
