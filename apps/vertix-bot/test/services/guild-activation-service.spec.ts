import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { IChannelEnterGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

const GUILD_ID = "820000000000000001",
    GENERATOR_ID = "830000000000000001",
    ROOM_ID = "830000000000000002",
    POOL_ROOM_ID = "830000000000000003",
    TEXT_CHANNEL_ID = "830000000000000004",
    OWNER_ID = "840000000000000001",
    MEMBER_ID = "840000000000000002";

const NOW = new Date( "2026-10-06T13:45:00.000Z" ),
    TODAY = new Date( "2026-10-06T00:00:00.000Z" );

/** The channels the bot keeps a row for, as their rows say what kind each is. */
const CHANNEL_ROWS: Record<string, { isDynamic: boolean; isScaling: boolean }> = {
    [ ROOM_ID ]: { isDynamic: true, isScaling: false },
    [ POOL_ROOM_ID ]: { isDynamic: false, isScaling: true },
    [ GENERATOR_ID ]: { isDynamic: false, isScaling: false }
};

async function makeService() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { GuildActivityModel } = await import( "@vertix.gg/data/src/models/guild-activity-model" );
    const { GuildVoiceMemberModel } = await import( "@vertix.gg/data/src/models/guild-voice-member-model" );
    const { GuildActivationService } = await import( "@vertix.gg/bot/src/services/guild-activation-service" );

    const model = {
        markSetup: jest.fn( async() => undefined ),
        markRoomCreated: jest.fn( async( _guildId: string, _at: Date, _generatorId?: string | null ) => undefined )
    };

    const members = {
        markPresent: jest.fn( async( _guildId: string, _userId: string, _day: Date ) => undefined ),
        deleteBefore: jest.fn( async( _day: Date ) => 0 )
    };

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildActivityModel, "$", "get" ).mockReturnValue( asInstance( model ) );
    jest.spyOn( GuildVoiceMemberModel, "$", "get" ).mockReturnValue( asInstance( members ) );
    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getByChannelId: async( channelId: string ) => CHANNEL_ROWS[ channelId ] ?? null
    } ) );

    const service = Object.create( GuildActivationService.prototype ) as InstanceType<typeof GuildActivationService>;

    // Built off the prototype, so the fields a constructor would have set are set here.
    Object.assign( service, { notedToday: new Set<string>(), notedDay: 0 } );

    return { service, model, members };
}

/** A member arriving in a channel, as the channel service hands it on. */
function joining( channelId: string, userId = MEMBER_ID, isBot = false ) {
    return {
        newState: {
            id: userId,
            channelId,
            guild: { id: GUILD_ID },
            member: { id: userId, user: { bot: isBot } }
        }
    } as unknown as IChannelEnterGenericArgs;
}

/**
 * Which channels say something about a server's use of the bot.
 *
 * The line matters in both directions: a pool's pre-opened rooms counted as use would make every
 * server with a pool look busy, and a generator not counted as a setup would make it look unused.
 */
describe( "VertixBot/Services/GuildActivation", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();
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

    it( "should count a room a member made from a generator, under that generator", async() => {
        // Arrange.
        const { service, model } = await makeService();

        // Act.
        await service.record( GUILD_ID, "DYNAMIC_CHANNEL", GENERATOR_ID, OWNER_ID );

        // Assert.
        expect( model.markRoomCreated ).toHaveBeenCalledWith( GUILD_ID, NOW, GENERATOR_ID );
    } );

    it( "should not count a room an auto-scaling pool opened ahead of anybody", async() => {
        // Arrange.
        const { service, model, members } = await makeService();

        // Act.
        await service.record( GUILD_ID, "SCALING_CHANNEL", "pool-row-id", OWNER_ID );

        // Assert.
        expect( model.markSetup ).not.toHaveBeenCalled();
        expect( model.markRoomCreated ).not.toHaveBeenCalled();
        expect( members.markPresent ).not.toHaveBeenCalled();
    } );

    it( "should record a team lobby as the server setting the bot up, and not count the rooms it splits into", async() => {
        // Arrange.
        const { service, model, members } = await makeService();

        // Act.
        await service.record( GUILD_ID, "MASTER_LOBBY_CHANNEL" );
        await service.record( GUILD_ID, "LOBBY_ROOM_CHANNEL", "lobby-discord-id", OWNER_ID );

        // Assert - a split's rooms are opened by a host for a group, not made by a member for themselves.
        expect( model.markSetup ).toHaveBeenCalledTimes( 1 );
        expect( model.markRoomCreated ).not.toHaveBeenCalled();
        expect( members.markPresent ).not.toHaveBeenCalled();
    } );

    describe( "members in rooms", () => {
        it( "should note the member a room was made for as soon as it is made", async() => {
            // Arrange - they are moved in before the room's row is written, so their join cannot be
            // told for a room's; the room being made for them is what says they are in one.
            const { service, members } = await makeService();

            // Act.
            await service.record( GUILD_ID, "DYNAMIC_CHANNEL", GENERATOR_ID, OWNER_ID );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledWith( GUILD_ID, OWNER_ID, TODAY );
        } );

        it( "should not note the admin who set up a generator", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.record( GUILD_ID, "MASTER_CREATE_CHANNEL", null, OWNER_ID );

            // Assert.
            expect( members.markPresent ).not.toHaveBeenCalled();
        } );

        it( "should note a member who joins a room, once a day however often they come", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.notePresence( joining( ROOM_ID ) );
            await service.notePresence( joining( ROOM_ID ) );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledTimes( 1 );
            expect( members.markPresent ).toHaveBeenCalledWith( GUILD_ID, MEMBER_ID, TODAY );
        } );

        it( "should not note the owner again when their move into the room arrives after it was made", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.record( GUILD_ID, "DYNAMIC_CHANNEL", GENERATOR_ID, OWNER_ID );
            await service.notePresence( joining( ROOM_ID, OWNER_ID ) );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should note a member in a pool's room - a pool's rooms are not counted as made, but its members are there", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.notePresence( joining( POOL_ROOM_ID ) );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledWith( GUILD_ID, MEMBER_ID, TODAY );
        } );

        it( "should not note a member in a channel that is not a room", async() => {
            // Arrange - a generator, and a channel the bot keeps no row for.
            const { service, members } = await makeService();

            // Act.
            await service.notePresence( joining( GENERATOR_ID ) );
            await service.notePresence( joining( TEXT_CHANNEL_ID ) );

            // Assert.
            expect( members.markPresent ).not.toHaveBeenCalled();
        } );

        it( "should not note a bot", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.notePresence( joining( ROOM_ID, MEMBER_ID, true ) );

            // Assert.
            expect( members.markPresent ).not.toHaveBeenCalled();
        } );

        it( "should note a member again on a new UTC day", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.notePresence( joining( ROOM_ID ) );

            jest.setSystemTime( new Date( "2026-10-07T00:30:00.000Z" ) );

            await service.notePresence( joining( ROOM_ID ) );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledTimes( 2 );
            expect( members.markPresent ).toHaveBeenLastCalledWith( GUILD_ID, MEMBER_ID, new Date( "2026-10-07T00:00:00.000Z" ) );
        } );

        it( "should delete the members' days that nothing counts back over any more", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.forgetOldMembers( NOW );

            // Assert - sixty days before today, as the privacy policy says.
            expect( members.deleteBefore ).toHaveBeenCalledWith( new Date( "2026-08-07T00:00:00.000Z" ) );
        } );

        it( "should try again at the next join when noting a member failed", async() => {
            // Arrange - the database did not answer the first time.
            const { service, members } = await makeService();

            members.markPresent.mockRejectedValueOnce( new Error( "Server selection timeout" ) );

            // Act.
            await expect( service.notePresence( joining( ROOM_ID ) ) ).rejects.toThrow( "Server selection timeout" );
            await service.notePresence( joining( ROOM_ID ) );

            // Assert.
            expect( members.markPresent ).toHaveBeenCalledTimes( 2 );
        } );
    } );
} );
