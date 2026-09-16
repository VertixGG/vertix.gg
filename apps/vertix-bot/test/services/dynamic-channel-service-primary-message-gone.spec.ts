import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const CHANNEL_ID = "830000000000000042",
    GUILD_ID = "830000000000000001",
    OWNER_ID = "830000000000000007";

/**
 * Stands up only what `createPrimaryMessage` reaches for, the way the log buffer spec next door
 * does. What is recorded is the one thing that matters: whether the message was sent.
 */
async function makeService( { channelStillExists }: { channelStillExists: boolean } ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );

    jest.spyOn( ChannelModel.$, "getByChannelId" ).mockResolvedValue( null as never );

    const sent: unknown[] = [];

    const service = Object.create( DynamicChannelService.prototype ) as InstanceType<typeof DynamicChannelService>;

    Object.assign( service, {
        logger: { log: () => {}, error: () => {} },
        getMemberRoleIds: async() => [],
        services: {
            uiVersioningAdapterService: {
                get: async() => ( {
                    send: async( ... args: unknown[] ) => {
                        sent.push( args );
                    }
                } )
            }
        }
    } );

    const channel = {
        id: CHANNEL_ID,
        guild: {
            id: GUILD_ID,
            channels: {
                cache: new Map( channelStillExists ? [ [ CHANNEL_ID, {} ] ] : [] )
            }
        }
    };

    return { service, channel, sent };
}

const DYNAMIC_CHANNEL_DB = { userOwnerId: OWNER_ID, ownerChannelId: "830000000000000002" };

describe( "VertixBot/Services/DynamicChannel/createPrimaryMessage", () => {

    it( "should send the primary message to a channel that is still there", async() => {
        const { service, channel, sent } = await makeService( { channelStillExists: true } );

        await service.createPrimaryMessage( channel as never, DYNAMIC_CHANNEL_DB as never );

        expect( sent ).toHaveLength( 1 );
    } );

    /**
     * The regression this exists for: everything before the send is awaited, and a member who joins
     * a generator and leaves again straight away has their room created and deleted inside that
     * window. Posting into it then answers `Unknown Channel`, which was logged as a fault and read
     * like one, for a member who did nothing wrong.
     */
    it( "should not send to a channel that is already gone", async() => {
        const { service, channel, sent } = await makeService( { channelStillExists: false } );

        await expect(
            service.createPrimaryMessage( channel as never, DYNAMIC_CHANNEL_DB as never )
        ).resolves.toBeUndefined();

        expect( sent ).toEqual( [] );
    } );
} );
