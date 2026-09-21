import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_UNLIMITED_MASTER_CHANNELS
} from "@vertix.gg/definitions/src/billing-definitions";

const GUILD_ID = "820000000000000001";

interface IConfigLimits {
    maxMasterChannels: number | null;
}

/**
 * Stands up the one answer, and records which guild was asked about.
 *
 * The method reads nothing off the service - only the locator and one helper - so it is called
 * against the prototype with an empty `this` rather than standing a service up.
 */
async function makeConfigLimits( allowance: number ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const asked: string[] = [];

    const { ServiceLocator } = await import( "@vertix.gg/base/src/modules/service/service-locator" );
    const { ManagementIPCService } = await import( "@vertix.gg/bot/src/services/management-ipc-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( {
            getMaxMasterChannels: async( guildId: string ) => {
                asked.push( guildId );

                return allowance;
            }
        } )
    } ) );

    const proto = ManagementIPCService.prototype as unknown as {
        getConfigLimits( guildId: string ): Promise<IConfigLimits>;
    };

    return { asked, read: () => proto.getConfigLimits.call( {}, GUILD_ID ) };
}

/**
 * The allowance the dashboard refuses at.
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
        await expect( read() ).resolves.toEqual( { maxMasterChannels: 9 } );
    } );

    it( "should ask about the guild it was given", async() => {
        // Act - the whole of "per guild". Asked without one, this answers the same for everybody,
        // which is exactly how it was wrong before.
        const { read, asked } = await makeConfigLimits( 9 );

        await read();

        // Assert.
        expect( asked ).toEqual( [ GUILD_ID ] );
    } );

    it( "should send an unlimited allowance as null", async() => {
        // Act - `JSON.stringify( Infinity )` is `null`, so the conversion is made here on purpose
        // rather than discovered on the other side of the wire.
        const { read } = await makeConfigLimits( BILLING_UNLIMITED_MASTER_CHANNELS );

        // Assert.
        await expect( read() ).resolves.toEqual( { maxMasterChannels: null } );
    } );

    it( "should not turn a merely large allowance into unlimited", async() => {
        // Act - null means "nothing to hold anybody to", so a finite number must survive as one.
        const { read } = await makeConfigLimits( 500 );

        // Assert.
        await expect( read() ).resolves.toEqual( { maxMasterChannels: 500 } );
    } );

    it( "should carry the free allowance through unchanged", async() => {
        // Act - every server that has never paid, which is most of them.
        const { read } = await makeConfigLimits( BILLING_FREE_MAX_MASTER_CHANNELS );

        // Assert.
        await expect( read() ).resolves.toEqual( {
            maxMasterChannels: BILLING_FREE_MAX_MASTER_CHANNELS
        } );
    } );
} );
