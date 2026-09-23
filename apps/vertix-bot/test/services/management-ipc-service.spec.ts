import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_UNLIMITED_MASTER_CHANNELS
} from "@vertix.gg/definitions/src/billing-definitions";

const GUILD_ID = "820000000000000001";

/** The default in the guild config. */
const DEFAULT_ROOMS_LIMIT = 20;

interface IConfigLimits {
    maxMasterChannels: number | null;
    maxActiveDynamicChannels: number;
}

/**
 * Stands up the two answers, and records which guild each was asked about.
 *
 * The method reads nothing off the service - only the locator, the guild settings and one helper -
 * so it is called against the prototype with an empty `this` rather than standing a service up.
 */
async function makeConfigLimits( allowance: number, roomsLimit = DEFAULT_ROOMS_LIMIT ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const asked = { allowance: [] as string[], settings: [] as string[] };

    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { ManagementIPCService } = await import( "@vertix.gg/bot/src/services/management-ipc-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( {
            getMaxMasterChannels: async( guildId: string ) => {
                asked.allowance.push( guildId );

                return allowance;
            }
        } )
    } ) );

    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async( guildId: string ) => {
            asked.settings.push( guildId );

            return { maxActiveDynamicChannels: roomsLimit };
        }
    } ) );

    const proto = ManagementIPCService.prototype as unknown as {
        getConfigLimits( guildId: string ): Promise<IConfigLimits>;
    };

    return { asked, read: () => proto.getConfigLimits.call( {}, GUILD_ID ) };
}

/**
 * The limits the dashboard refuses at, and measures against.
 *
 * Worth its own cover because it is the seam where the two halves have drifted apart before: this
 * once answered one number for every guild, so a server with an allowance of its own got it in
 * discord and not in the dashboard. Now that a tier can be paid for, the same drift would mean
 * somebody pays for nine generators and is refused at two by the screen they paid on.
 */
describe( "VertixBot/Services/ManagementIPC/config limits", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should answer the allowance this guild actually has", async() => {
        // Act.
        const { read } = await makeConfigLimits( 9 );

        // Assert.
        await expect( read() ).resolves.toEqual( {
            maxMasterChannels: 9,
            maxActiveDynamicChannels: DEFAULT_ROOMS_LIMIT
        } );
    } );

    it( "should ask about the guild it was given", async() => {
        // Act - the whole of "per guild". Asked without one, this answers the same for everybody,
        // which is exactly how it was wrong before.
        const { read, asked } = await makeConfigLimits( 9 );

        await read();

        // Assert.
        expect( asked ).toEqual( { allowance: [ GUILD_ID ], settings: [ GUILD_ID ] } );
    } );

    it( "should send an unlimited allowance as null", async() => {
        // Act - `JSON.stringify( Infinity )` is `null`, so the conversion is made here on purpose
        // rather than discovered on the other side of the wire.
        const { read } = await makeConfigLimits( BILLING_UNLIMITED_MASTER_CHANNELS );

        // Assert.
        await expect( read() ).resolves.toMatchObject( { maxMasterChannels: null } );
    } );

    it( "should not turn a merely large allowance into unlimited", async() => {
        // Act - null means "nothing to hold anybody to", so a finite number must survive as one.
        const { read } = await makeConfigLimits( 500 );

        // Assert.
        await expect( read() ).resolves.toMatchObject( { maxMasterChannels: 500 } );
    } );

    it( "should carry the free allowance through unchanged", async() => {
        // Act - every server that has never paid, which is most of them.
        const { read } = await makeConfigLimits( BILLING_FREE_MAX_MASTER_CHANNELS );

        // Assert.
        await expect( read() ).resolves.toMatchObject( {
            maxMasterChannels: BILLING_FREE_MAX_MASTER_CHANNELS
        } );
    } );

    it( "should answer the channels a generator may have open from this guild's settings", async() => {
        // Act - a guild granted more than the default, so the answer cannot be the config's own
        // number by coincidence. It is what the refusal counts against, and the dashboard's bar
        // measures a generator by it.
        const { read } = await makeConfigLimits( BILLING_FREE_MAX_MASTER_CHANNELS, 35 );

        // Assert.
        await expect( read() ).resolves.toMatchObject( { maxActiveDynamicChannels: 35 } );
    } );
} );
