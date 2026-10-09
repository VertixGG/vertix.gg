import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const GUILD_ID = "820000000000000001",
    MASTER_CHANNEL_ID = "840000000000000001",
    CONTROL_CHANNEL_ID = "840000000000000009";

interface IFakeChannel {
    id: string;
    type: number;
    name: string;
    parent: object | null;
    deletable: boolean;
    isThread(): boolean;
    delete(): Promise<void>;
}

/**
 * A channel that loses its parent when it is deleted, because discord's does.
 *
 * Faithful on that one point deliberately: the cleanup reads `.parent` *before* deleting the
 * generator, and a fake that kept answering afterwards would let that ordering be broken without
 * any test noticing.
 */
const aChannel = (
    id: string,
    type: number = ChannelType.GuildVoice,
    parent: object | null = null
): IFakeChannel => {
    const channel: IFakeChannel = {
        id,
        type,
        name: `channel-${ id }`,
        parent,
        deletable: true,
        isThread: () => false,
        delete: async() => {
            channel.parent = null;
        }
    };

    return channel;
};

interface IWorld {
    /** Null stands for a guild the bot can no longer reach. */
    guildExists: boolean;
    master: IFakeChannel | null;
    hasMasterRow: boolean;
    controlChannelId: string | null;
    /** Rows the database holds for this generator's rooms. */
    dynamicRows: string[];
    /** Of those, the ones discord still has. */
    liveInDiscord: string[];
    /** Rooms whose deletion discord refuses. */
    undeletable: string[];
}

/**
 * Stands up the cleanup with a guild, a generator and whatever rooms the world says exist.
 *
 * Everything it reaches for is static or a singleton, so all of it is intercepted rather than
 * assigned; the service itself is built off the prototype, since none of its base wiring decides
 * anything here.
 */
async function makeCleanup( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        guildExists: true,
        master: aChannel( MASTER_CHANNEL_ID, ChannelType.GuildVoice, { id: "category-1" } ),
        hasMasterRow: true,
        controlChannelId: null,
        dynamicRows: [],
        liveInDiscord: [],
        undeletable: [],
        ... world
    };

    const deletedInDiscord: string[] = [],
        deletedRows: string[] = [],
        categoriesSwept: Array<string | null> = [];

    const { ChannelUtils } = await import( "@vertix.gg/bot/src/utils/channel-utils" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { MasterChannelDataManager } =
        await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );
    const { ChannelCleanupService } = await import( "@vertix.gg/bot/src/services/channel-cleanup-service" );

    const asInstance = <T>( fake: object ): T => fake as T;
    const asChannel = <T>( fake: object | null ): T => fake as T;

    const guild = {
        id: GUILD_ID,
        channels: {
            cache: new Map<string, IFakeChannel>(
                settled.liveInDiscord.map( ( id ) => [ id, aChannel( id ) ] )
            )
        }
    };

    jest.spyOn( ChannelUtils, "cacheOrFetchGuild" )
        .mockImplementation( async() => asChannel( settled.guildExists ? guild : null ) );

    jest.spyOn( ChannelUtils, "cacheOrFetchChannel" )
        .mockImplementation( async( _guild, channelId ) => asChannel(
            channelId === MASTER_CHANNEL_ID ? settled.master : aChannel( channelId )
        ) );

    jest.spyOn( ChannelUtils, "cleanupEmptyCategoryIfNeeded" )
        .mockImplementation( async( parent ) => {
            categoriesSwept.push( ( parent as { id?: string } | null )?.id ?? null );
        } );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getByChannelId: async() => ( settled.hasMasterRow ? { id: "row-1", channelId: MASTER_CHANNEL_ID } : null ),
        getDynamicsByMasterId: async() => settled.dynamicRows.map( ( channelId ) => ( { channelId } ) ),
        delete: async( where: { channelId: string } ) => {
            deletedRows.push( where.channelId );
        }
    } ) );

    jest.spyOn( MasterChannelDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { dynamicChannelControlChannelId: settled.controlChannelId } )
    } ) );

    const service = Object.create( ChannelCleanupService.prototype ) as {
        deleteDynamicMasterChannelWithCleanup(
            args: { guildId: string; masterChannelId: string }
        ): Promise<boolean>;
    };

    Object.assign( service, {
        logger: { log: () => undefined, error: () => undefined },
        services: {
            channelService: {
                delete: async( args: { channel: { id: string } } ) => {
                    if ( settled.undeletable.includes( args.channel.id ) ) {
                        throw new Error( `discord refused to delete ${ args.channel.id }` );
                    }

                    deletedInDiscord.push( args.channel.id );
                }
            }
        }
    } );

    return {
        deletedInDiscord,
        deletedRows,
        categoriesSwept,
        run: () => service.deleteDynamicMasterChannelWithCleanup( {
            guildId: GUILD_ID,
            masterChannelId: MASTER_CHANNEL_ID
        } )
    };
}

/**
 * Taking a generator down, and everything it made.
 *
 * Covered because it is the one path here that destroys things. Its guards are the interesting
 * part: each returns false and touches nothing, and the one that checks the channel type is what
 * stands between "delete this generator" and deleting whatever else happens to carry that id.
 */
describe( "VertixBot/Services/ChannelCleanup/dynamic generator", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should refuse a guild it can no longer reach", async() => {
        // Act.
        const { run, deletedInDiscord, deletedRows } = await makeCleanup( { guildExists: false } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deletedInDiscord ).toEqual( [] );
        expect( deletedRows ).toEqual( [] );
    } );

    it( "should refuse a generator discord no longer has", async() => {
        // Act.
        const { run, deletedRows } = await makeCleanup( { master: null } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deletedRows ).toEqual( [] );
    } );

    it( "should refuse anything that is not a voice channel", async() => {
        // Act - the guard between taking a generator down and deleting whatever else carries that
        // id. A text channel with the same id is not a generator and must survive this.
        const { run, deletedInDiscord, deletedRows } = await makeCleanup( {
            master: aChannel( MASTER_CHANNEL_ID, ChannelType.GuildText )
        } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deletedInDiscord ).toEqual( [] );
        expect( deletedRows ).toEqual( [] );
    } );

    it( "should refuse a channel the database does not know as a generator", async() => {
        // Act.
        const { run, deletedInDiscord } = await makeCleanup( { hasMasterRow: false } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deletedInDiscord ).toEqual( [] );
    } );

    it( "should take the control channel with it", async() => {
        // Act.
        const { run, deletedInDiscord } = await makeCleanup( { controlChannelId: CONTROL_CHANNEL_ID } );

        // Assert.
        await expect( run() ).resolves.toBe( true );
        expect( deletedInDiscord ).toContain( CONTROL_CHANNEL_ID );
    } );

    it( "should delete the rooms discord still has", async() => {
        // Act.
        const { run, deletedInDiscord } = await makeCleanup( {
            dynamicRows: [ "room-a", "room-b" ],
            liveInDiscord: [ "room-a", "room-b" ]
        } );

        await run();

        // Assert.
        expect( deletedInDiscord ).toEqual( expect.arrayContaining( [ "room-a", "room-b" ] ) );
    } );

    it( "should clear the row of a room discord has already lost", async() => {
        // Act - the row outlives the channel when somebody deletes it by hand, and leaving it
        // behind is what makes a generator look fuller than it is.
        const { run, deletedRows, deletedInDiscord } = await makeCleanup( {
            dynamicRows: [ "ghost-room" ],
            liveInDiscord: []
        } );

        await run();

        // Assert.
        expect( deletedRows ).toContain( "ghost-room" );
        expect( deletedInDiscord ).not.toContain( "ghost-room" );
    } );

    it( "should carry on after a room discord refuses to delete", async() => {
        // Act - one room that cannot go should not strand the rest, nor the generator itself.
        const { run, deletedInDiscord, deletedRows } = await makeCleanup( {
            dynamicRows: [ "stubborn", "room-b" ],
            liveInDiscord: [ "stubborn", "room-b" ],
            undeletable: [ "stubborn" ]
        } );

        // Assert.
        await expect( run() ).resolves.toBe( true );
        expect( deletedInDiscord ).toContain( "room-b" );
        expect( deletedRows ).toContain( MASTER_CHANNEL_ID );
    } );

    it( "should sweep the category the generator was in", async() => {
        // Act - read before the generator is deleted, because a deleted channel has no parent to
        // ask about afterwards.
        const { run, categoriesSwept } = await makeCleanup();

        await run();

        // Assert.
        expect( categoriesSwept ).toEqual( [ "category-1" ] );
    } );
} );

const LOBBY_ROW_ID = "lobby-row-1",
    LOBBY_CHANNEL_ID = "840000000000000002",
    PANEL_CHANNEL_ID = "870000000000000002";

interface ILobbyWorld {
    guildExists: boolean;
    /** The category the lobby's split is open in, or null while it is not split. */
    sessionCategoryId: string | null;
    /** Whether the row asked for is a lobby, rather than a generator of another kind. */
    isLobby: boolean;
    /** Rows the database holds for the lobby's rooms. */
    roomRows: string[];
    /** Of those, the ones discord still has. */
    liveInDiscord: string[];
    /** Whether discord still has the lobby's panel channel - it can be deleted by hand. */
    isPanelChannelLive: boolean;
}

/**
 * Stands up the cleanup with a team lobby and whatever rooms the world says it is split into, keeping
 * what was deleted - in discord and in the database - in the order it went.
 */
async function makeLobbyCleanup( world: Partial<ILobbyWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: ILobbyWorld = {
        guildExists: true,
        sessionCategoryId: null,
        isLobby: true,
        roomRows: [],
        liveInDiscord: [],
        isPanelChannelLive: true,
        ... world
    };

    const deleted: string[] = [],
        categoriesSwept: Array<string | null> = [];

    const { ChannelUtils } = await import( "@vertix.gg/bot/src/utils/channel-utils" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { LobbyChannelDataModel } = await import( "@vertix.gg/data/src/models/master-channel/lobby-channel-data-model" );
    const { ChannelCleanupService } = await import( "@vertix.gg/bot/src/services/channel-cleanup-service" );

    const asInstance = <T>( fake: object ): T => fake as T;
    const asNullable = <T>( fake: object | null ): T => fake as T;

    const sessionCategoriesDeleted: Array<{ id: string; closed: readonly string[] }> = [];

    const lobby = {
        id: LOBBY_CHANNEL_ID,
        name: "🎮 Team Lobby",
        parent: { id: "lobby-category" } as object | null,
        isVoiceBased: () => true,
        delete: async() => {
            deleted.push( `discord:${ LOBBY_CHANNEL_ID }` );
            lobby.parent = null;
        }
    };

    const guild = {
        id: GUILD_ID,
        name: "Guild",
        memberCount: 10,
        channels: {
            cache: new Map(
                [ ... settled.liveInDiscord, ... ( settled.sessionCategoryId ? [ settled.sessionCategoryId ] : [] ) ]
                    .map( ( id ) => [ id, { id, isThread: () => false } ] )
            )
        }
    };

    jest.spyOn( ChannelUtils, "cacheOrFetchGuild" )
        .mockImplementation( async() => asNullable( settled.guildExists ? guild : null ) );

    const panelChannel = { id: PANEL_CHANNEL_ID, isThread: () => false };

    jest.spyOn( ChannelUtils, "cacheOrFetchChannel" ).mockImplementation( async( _guild, channelId ) => {
        if ( PANEL_CHANNEL_ID === channelId ) {
            return asNullable( settled.isPanelChannelLive ? panelChannel : null );
        }

        return asInstance( lobby );
    } );

    jest.spyOn( ChannelUtils, "cleanupEmptyCategoryIfNeeded" ).mockImplementation( async( parent ) => {
        categoriesSwept.push( ( parent as { id?: string } | null )?.id ?? null );

        return true;
    } );

    jest.spyOn( ChannelUtils, "deleteCategoryUnlessUsed" ).mockImplementation( async( category, _guild, closed ) => {
        sessionCategoriesDeleted.push( { id: ( category as { id: string } ).id, closed } );

        return true;
    } );

    jest.spyOn( LobbyChannelDataModel, "$", "get" ).mockReturnValue( asInstance( {
        getLobbySettings: async() => ( {
            lobbySessionCategoryId: settled.sessionCategoryId,
            lobbyPanelChannelId: PANEL_CHANNEL_ID
        } )
    } ) );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getById: async() => ( { id: LOBBY_ROW_ID, channelId: LOBBY_CHANNEL_ID, isLobbyMaster: settled.isLobby } ),
        getLobbyRoomsByLobbyId: async() => settled.roomRows.map( ( channelId ) => ( { channelId } ) ),
        delete: async( where: { channelId?: string; id?: string } ) => {
            deleted.push( `row:${ where.channelId ?? where.id }` );
        }
    } ) );

    const service = Object.create( ChannelCleanupService.prototype ) as {
        deleteLobbyMasterChannelWithCleanup( args: { guildId: string; masterChannelId: string } ): Promise<boolean>;
    };

    Object.assign( service, {
        logger: { log: () => undefined, info: () => undefined, error: () => undefined, admin: () => undefined },
        services: {
            channelService: {
                delete: async( args: { channel: { id: string } } ) => {
                    deleted.push( `channel:${ args.channel.id }` );
                }
            }
        }
    } );

    return {
        deleted,
        categoriesSwept,
        sessionCategoriesDeleted,
        run: () => service.deleteLobbyMasterChannelWithCleanup( { guildId: GUILD_ID, masterChannelId: LOBBY_ROW_ID } )
    };
}

/**
 * Taking a team lobby down, and the rooms it is split into.
 */
describe( "VertixBot/Services/ChannelCleanup/team lobby", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should close its rooms and its panel channel, then forget the lobby before deleting it, and sweep its category", async() => {
        // Arrange - one room discord still has, one it already lost.
        const { run, deleted, categoriesSwept } = await makeLobbyCleanup( {
            roomRows: [ "room-a", "room-b" ],
            liveInDiscord: [ "room-a" ]
        } );

        // Act.
        const result = await run();

        // Assert - the row before the channel, so the delete discord announces back finds nothing left.
        expect( result ).toBe( true );
        expect( deleted ).toEqual( [
            "channel:room-a",
            "row:room-b",
            `channel:${ PANEL_CHANNEL_ID }`,
            `row:${ LOBBY_ROW_ID }`,
            `discord:${ LOBBY_CHANNEL_ID }`
        ] );
        expect( categoriesSwept ).toEqual( [ "lobby-category" ] );
    } );

    it( "should still delete a lobby whose panel channel was already deleted by hand", async() => {
        // Arrange.
        const { run, deleted } = await makeLobbyCleanup( { isPanelChannelLive: false } );

        // Act.
        const result = await run();

        // Assert.
        expect( result ).toBe( true );
        expect( deleted ).toEqual( [ `row:${ LOBBY_ROW_ID }`, `discord:${ LOBBY_CHANNEL_ID }` ] );
    } );

    it( "should take down the category its split is open in, with the rooms that were in it", async() => {
        // Arrange.
        const { run, sessionCategoriesDeleted } = await makeLobbyCleanup( {
            sessionCategoryId: "session-1",
            roomRows: [ "room-a", "room-b" ],
            liveInDiscord: [ "room-a" ]
        } );

        // Act.
        await run();

        // Assert.
        expect( sessionCategoriesDeleted ).toEqual( [ { id: "session-1", closed: [ "room-a", "room-b" ] } ] );
    } );

    it( "should leave every other category alone while the lobby is not split", async() => {
        // Arrange.
        const { run, sessionCategoriesDeleted } = await makeLobbyCleanup();

        // Act.
        await run();

        // Assert.
        expect( sessionCategoriesDeleted ).toEqual( [] );
    } );

    it( "should refuse a row that is not a lobby, and touch nothing", async() => {
        // Act.
        const { run, deleted } = await makeLobbyCleanup( { isLobby: false, roomRows: [ "room-a" ] } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deleted ).toEqual( [] );
    } );

    it( "should refuse a guild it can no longer reach", async() => {
        // Act.
        const { run, deleted } = await makeLobbyCleanup( { guildExists: false } );

        // Assert.
        await expect( run() ).resolves.toBe( false );
        expect( deleted ).toEqual( [] );
    } );
} );
