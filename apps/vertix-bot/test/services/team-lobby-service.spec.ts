import { jest } from "@jest/globals";

import { ChannelType, Collection, MessageFlags, OverwriteType, PermissionsBitField } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { TeamLobbyService } from "@vertix.gg/bot/src/services/team-lobby-service";

const GUILD_ID = "820000000000000001",
    GUILD_OWNER_ID = "810000000000000099",
    BOT_ID = "800000000000000001",
    LOBBY_ID = "840000000000000001",
    LOBBY_ROW_ID = "lobby-row-1",
    PANEL_ID = "870000000000000001",
    PANEL_ROW_ID = "panel-row-1",
    CATEGORY_ID = "830000000000000001",
    HOST_ROLE_ID = "860000000000000001";

const LOBBY_CATEGORY_POSITION = 3;

const NAMING = {
    lobbyChannelsCategoryName: "༄ Team Lobby",
    lobbyChannelName: "🎮 Team Lobby",
    lobbyControlPanelName: "🎮・lobby-panel",
    lobbySessionCategoryName: "↳ {lobby}",
    lobbyTeamRoomName: "{color} Team {index}",
    lobbyTeamRoomColors: [ "🔴", "🔵", "🟢", "🟡" ],
    lobbyGroupRoomName: "👥 Group {index}"
};

interface IRow {
    id: string;
    channelId: string;
    guildId: string;
    ownerChannelId: string | null;
    internalType: string;
    isLobbyMaster: boolean;
    isLobbyRoom: boolean;
}

interface IFakeMember {
    id: string;
    user: { bot: boolean };
    guild: IFakeGuild;
    roles: { cache: Map<string, object> };
    permissions: { has(): boolean };
    voice: { channelId: string | null; setChannel( channel: { id: string } ): Promise<void> };
}

interface IFakeOverwrite {
    id: string;
    type: OverwriteType;
    allow: PermissionsBitField;
    deny: PermissionsBitField;
}

interface IFakeChannel {
    id: string;
    type: number;
    name: string;
    position: number;
    parentId: string | null;
    userLimit: number;
    bitrate: number;
    rtcRegion: string | null;
    guild: IFakeGuild;
    parent: IFakeCategory | null;
    client: { user: { id: string } };
    members: Collection<string, IFakeMember>;
    messages: { fetch( id: string ): Promise<{ id: string }> };
    permissionOverwrites: {
        cache: Collection<string, IFakeOverwrite>;
        edit( id: string, change: Record<string, boolean> ): Promise<void>;
        delete( id: string ): Promise<void>;
    };
    permissionsFor(): { has(): boolean };
    isVoiceBased(): boolean;
    isThread(): boolean;
}

interface IFakeCategory {
    id: string;
    type: number;
    name: string;
    position: number;
    parentId: null;
    permissionOverwrites: { cache: Map<string, object> };
    setPosition( position: number ): Promise<void>;
}

interface IFakeGuild {
    id: string;
    ownerId: string;
    name: string;
    memberCount: number;
    channels: { cache: Collection<string, IFakeChannel | IFakeCategory>; fetch( id: string ): Promise<never> };
    roles: { everyone: { id: string } };
    members: { cache: Collection<string, IFakeMember> };
    client: { user: { id: string } };
}

interface IWorld {
    /** Whether the server's allowance reaches the lobby. */
    isCovered: boolean;
    hostRoleIds: string[];
    roomsLimit: number;
    missingPermissions: string[];
    /** Discord refuses every room past this many. */
    refuseRoomsAfter: number;
    /** The panel the lobby remembers posting in its panel channel, and whether discord still has it. */
    panelMessageId: string | null;
    panelMessageExists: boolean;
    /** The same panel in the lobby's own chat. */
    chatPanelMessageId: string | null;
    /** Discord refuses to draw the panel - neither an edit nor a new post goes through. */
    panelRefused: boolean;
    /** Whether the lobby's panel channel is standing - it is made with the lobby, and can be deleted by hand. */
    hasPanelChannel: boolean;
    /** What the panel would show if drawn now - a new version of the bot can draw something else. */
    panelDrawing: string;
    /** Whether the panel draws as a container now, and whether the panels already posted are one. */
    isPanelContainer: boolean;
    isPostedContainer: boolean;
}

/**
 * Stands up the service in a guild with a lobby, and members to stand in it.
 *
 * Everything the service reaches for is a singleton, so all of it is intercepted rather than
 * assigned; the service itself is built off its prototype. The fakes keep one record of who is in
 * which channel, so a channel's members are whoever the moves last put there - which is what lets a
 * split, a call back and an abandoned lobby be read off the same world.
 */
async function makeLobby( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        isCovered: true,
        hostRoleIds: [],
        roomsLimit: 20,
        missingPermissions: [],
        refuseRoomsAfter: Number.POSITIVE_INFINITY,
        panelMessageId: null,
        panelMessageExists: true,
        chatPanelMessageId: null,
        panelRefused: false,
        hasPanelChannel: true,
        panelDrawing: "v1",
        isPanelContainer: false,
        isPostedContainer: false,
        ... world
    };

    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { ConfigManager } = await import( "@vertix.gg/data/src/managers/config-manager" );
    const { LobbyChannelDataModel } = await import( "@vertix.gg/data/src/models/master-channel/lobby-channel-data-model" );
    const { PermissionsManager } = await import( "@vertix.gg/bot/src/managers/permissions-manager" );
    const { CategoryManager } = await import( "@vertix.gg/bot/src/managers/category-manager" );
    const { TeamLobbyService } = await import( "@vertix.gg/bot/src/services/team-lobby-service" );
    const { ChannelUtils } = await import( "@vertix.gg/bot/src/utils/channel-utils" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const members: IFakeMember[] = [];

    const rows: IRow[] = [ {
        id: LOBBY_ROW_ID,
        channelId: LOBBY_ID,
        guildId: GUILD_ID,
        ownerChannelId: null,
        internalType: "MASTER_LOBBY_CHANNEL",
        isLobbyMaster: true,
        isLobbyRoom: false
    } ];

    const client = { user: { id: BOT_ID } };

    const guild: IFakeGuild = {
        id: GUILD_ID,
        ownerId: GUILD_OWNER_ID,
        name: "Guild",
        memberCount: 10,
        channels: {
            cache: new Collection(),
            // Asked only for a channel the cache does not hold, which is one deleted by hand.
            fetch: async() => {
                throw new Error( "Unknown Channel" );
            }
        },
        roles: { everyone: { id: GUILD_ID } },
        members: { cache: new Collection() },
        client
    };

    const categories = {
        created: [] as Array<{ id: string; name: string }>,
        deleted: [] as string[],
        moved: [] as Array<[ string, number ]>
    };

    const aCategory = ( id: string, name: string, position: number ): IFakeCategory => ( {
        id,
        type: ChannelType.GuildCategory,
        name,
        position,
        parentId: null,
        permissionOverwrites: { cache: new Map() },
        setPosition: async( to: number ) => {
            categories.moved.push( [ id, to ] );
        }
    } );

    const category = aCategory( CATEGORY_ID, NAMING.lobbyChannelsCategoryName, LOBBY_CATEGORY_POSITION );

    guild.channels.cache.set( CATEGORY_ID, category );

    // What was changed on a channel's overwrites after it was made - a member kept out of it, or let
    // back in - in order.
    const overwriteChanges: Array<{ channelId: string; id: string; change: Record<string, boolean> | "delete" }> = [];

    const anOverwriteManager = ( channelId: string ): IFakeChannel[ "permissionOverwrites" ] => {
        const cache = new Collection<string, IFakeOverwrite>();

        return {
            cache,
            edit: async( id, change ) => {
                overwriteChanges.push( { channelId, id, change } );

                const flags = Object.entries( change )
                    .filter( ( [ , value ] ) => false === value )
                    .map( ( [ name ] ) => PermissionsBitField.Flags[ name as keyof typeof PermissionsBitField.Flags ] );

                cache.set( id, { id, type: OverwriteType.Member, allow: new PermissionsBitField(), deny: new PermissionsBitField( flags ) } );
            },
            delete: async( id ) => {
                overwriteChanges.push( { channelId, id, change: "delete" } );
                cache.delete( id );
            }
        };
    };

    const aChannel = (
        id: string,
        name: string,
        userLimit = 0,
        parent: IFakeCategory = category,
        type: number = ChannelType.GuildVoice
    ): IFakeChannel => ( {
        id,
        type,
        name,
        position: 0,
        parentId: parent.id,
        userLimit,
        bitrate: 64000,
        rtcRegion: null,
        guild,
        parent,
        client,
        get members() {
            return new Collection( members
                .filter( ( member ) => member.voice.channelId === id )
                .map( ( member ) => [ member.id, member ] ) );
        },
        messages: {
            fetch: async( messageId: string ) => {
                const posted = LOBBY_ID === id ? settled.chatPanelMessageId : settled.panelMessageId;

                if ( ! settled.panelMessageExists || messageId !== posted ) {
                    throw new Error( "Unknown Message" );
                }

                return {
                    id: messageId,
                    flags: { has: () => settled.isPostedContainer },
                    delete: async() => {
                        panels.deleted.push( messageId );
                    }
                };
            }
        },
        permissionOverwrites: anOverwriteManager( id ),
        // Everybody may see every channel unless a test says otherwise.
        permissionsFor: () => ( { has: () => true } ),
        isVoiceBased: () => ChannelType.GuildVoice === type,
        isThread: () => false
    } );

    const lobby = aChannel( LOBBY_ID, NAMING.lobbyChannelName );

    guild.channels.cache.set( LOBBY_ID, lobby );

    // The panel channel a lobby is made with, right below it - its row names the lobby as its owner.
    const panelChannels = new Map<string, string>();

    if ( settled.hasPanelChannel ) {
        guild.channels.cache.set( PANEL_ID, aChannel( PANEL_ID, NAMING.lobbyControlPanelName, 0, category, ChannelType.GuildText ) );

        rows.push( {
            id: PANEL_ROW_ID,
            channelId: PANEL_ID,
            guildId: GUILD_ID,
            ownerChannelId: LOBBY_ID,
            internalType: "DEFAULT_CHANNEL",
            isLobbyMaster: false,
            isLobbyRoom: false
        } );

        panelChannels.set( LOBBY_ROW_ID, PANEL_ID );
    }

    const aMember = ( id: string, options: { in?: string | null; bot?: boolean; admin?: boolean; roles?: string[] } = {} ) => {
        const member: IFakeMember = {
            id,
            user: { bot: !! options.bot },
            guild,
            roles: { cache: new Map( ( options.roles ?? [] ).map( ( roleId ) => [ roleId, {} ] ) ) },
            permissions: { has: () => !! options.admin },
            voice: {
                channelId: undefined === options.in ? LOBBY_ID : options.in,
                setChannel: async( channel ) => {
                    member.voice.channelId = channel.id;
                }
            }
        };

        members.push( member );
        guild.members.cache.set( id, member );

        return member;
    };

    const roomsOf = () => rows.filter( ( row ) => row.isLobbyRoom && row.ownerChannelId === LOBBY_ID );

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( {
        getByChannelId: async( channelId: string ) => rows.find( ( row ) => row.channelId === channelId ) ?? null,
        getLobbyRoomsByLobbyId: async( _guildId: string, lobbyId: string ) =>
            rows.filter( ( row ) => row.isLobbyRoom && row.ownerChannelId === lobbyId ),
        getLobbyRoomsCountByLobbyId: async( _guildId: string, lobbyId: string ) =>
            rows.filter( ( row ) => row.isLobbyRoom && row.ownerChannelId === lobbyId ).length,
        findMany: async( args: { where: { internalType: string } } ) =>
            rows.filter( ( row ) => row.internalType === args.where.internalType ),
        delete: async( where: { channelId?: string; id?: string } ) => {
            const index = rows.findIndex( ( row ) => row.channelId === where.channelId || row.id === where.id );

            if ( index >= 0 ) {
                rows.splice( index, 1 );
            }
        }
    } ) );

    const savedSettings: Array<{ ownerId: string; settings: object }> = [],
        panelWrites: Array<{ ownerId: string; settings: object }> = [];

    let sessionCategoryId: string | null = null,
        splitMode: string | null = null,
        panelHash: string | null = null,
        chatPanelHash: string | null = null;

    jest.spyOn( LobbyChannelDataModel, "$", "get" ).mockReturnValue( asInstance( {
        getLobbySettings: async( ownerId: string ) => ( {
            lobbyHostRoleIds: settled.hostRoleIds,
            lobbyPanelChannelId: panelChannels.get( ownerId ) ?? null,
            lobbyPanelMessageId: settled.panelMessageId,
            lobbySessionCategoryId: sessionCategoryId,
            lobbySplitMode: splitMode,
            lobbyPanelMessageHash: panelHash,
            lobbyChatPanelMessageId: settled.chatPanelMessageId,
            lobbyChatPanelMessageHash: chatPanelHash
        } ),
        setLobbySettings: async(
            ownerId: string,
            settings: {
                lobbyHostRoleIds?: string[];
                lobbyPanelChannelId?: string;
                lobbyPanelMessageId?: string;
                lobbySessionCategoryId?: string | null;
                lobbySplitMode?: string | null;
                lobbyPanelMessageHash?: string;
                lobbyChatPanelMessageId?: string;
                lobbyChatPanelMessageHash?: string;
            }
        ) => {
            // Where the panels are and what they showed - bookkeeping, kept apart from what a test
            // reads back as written.
            if ( settings.lobbyPanelMessageHash || settings.lobbyChatPanelMessageHash ) {
                panelHash = settings.lobbyPanelMessageHash ?? panelHash;
                chatPanelHash = settings.lobbyChatPanelMessageHash ?? chatPanelHash;

                if ( settings.lobbyPanelMessageId ) {
                    settled.panelMessageId = settings.lobbyPanelMessageId;
                    settled.panelMessageExists = true;
                }

                if ( settings.lobbyChatPanelMessageId ) {
                    settled.chatPanelMessageId = settings.lobbyChatPanelMessageId;
                }

                panelWrites.push( { ownerId, settings } );

                return;
            }

            if ( "lobbySessionCategoryId" in settings ) {
                sessionCategoryId = settings.lobbySessionCategoryId ?? null;
                splitMode = settings.lobbySplitMode ?? null;

                return;
            }

            if ( settings.lobbyPanelChannelId ) {
                panelChannels.set( ownerId, settings.lobbyPanelChannelId );

                return;
            }

            savedSettings.push( { ownerId, settings } );

            if ( settings.lobbyHostRoleIds ) {
                settled.hostRoleIds = settings.lobbyHostRoleIds;
            }

            if ( settings.lobbyPanelMessageId ) {
                settled.panelMessageId = settings.lobbyPanelMessageId;
                settled.panelMessageExists = true;
            }
        }
    } ) );

    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( asInstance( {
        getAllSettings: async() => ( { maxActiveDynamicChannels: settled.roomsLimit } )
    } ) );

    jest.spyOn( ConfigManager, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( { data: NAMING } )
    } ) );

    jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( asInstance( {
        getMissingChannelPermissionsForBot: () => settled.missingPermissions,
        getChannelDefaultInheritedPermissions: () => [],
        mergeChannelPermissionOverwrites: ( ... lists: object[][] ) => lists.flat()
    } ) );

    jest.spyOn( CategoryManager, "$", "get" ).mockReturnValue( asInstance( {
        create: async( args: { name: string } ) => {
            const created = aCategory( `category-${ categories.created.length + 1 }`, args.name, 99 );

            guild.channels.cache.set( created.id, created );
            categories.created.push( { id: created.id, name: args.name } );

            return created;
        },
        delete: async( target: { id: string } ) => {
            guild.channels.cache.delete( target.id );
            categories.deleted.push( target.id );
        }
    } ) );

    let roomsOpened = 0;

    // What each channel was asked to be made with, in order.
    const created: Array<Record<string, unknown>> = [];

    const channelService = {
        create: async( args: {
            name: string;
            type?: number;
            userLimit?: number;
            ownerChannelId?: string;
            internalType: string;
            parent?: IFakeCategory;
        } ) => {
            if ( "LOBBY_ROOM_CHANNEL" === args.internalType && roomsOpened >= settled.refuseRoomsAfter ) {
                return null;
            }

            roomsOpened++;
            created.push( args );

            const channel = aChannel( `room-${ roomsOpened }`, args.name, args.userLimit ?? 0, args.parent, args.type ),
                row: IRow = {
                    id: `row-${ channel.id }`,
                    channelId: channel.id,
                    guildId: GUILD_ID,
                    ownerChannelId: args.ownerChannelId ?? null,
                    internalType: args.internalType,
                    isLobbyMaster: "MASTER_LOBBY_CHANNEL" === args.internalType,
                    isLobbyRoom: "LOBBY_ROOM_CHANNEL" === args.internalType
                };

            guild.channels.cache.set( channel.id, channel );
            rows.push( row );

            return { channel, db: Promise.resolve( row ) };
        },
        delete: async( args: { channel: { id: string } } ) => {
            guild.channels.cache.delete( args.channel.id );

            const index = rows.findIndex( ( row ) => row.channelId === args.channel.id );

            if ( index >= 0 ) {
                rows.splice( index, 1 );
            }

            // Deleting a voice channel disconnects whoever was in it.
            members
                .filter( ( member ) => member.voice.channelId === args.channel.id )
                .forEach( ( member ) => member.voice.channelId = null );
        }
    };

    const panels = { sent: [] as string[], redrawn: [] as string[], deleted: [] as string[] };

    const panelAdapter = {
        render: async( channel: { id: string } ) => ( {
            channelId: channel.id,
            drawing: settled.panelDrawing,
            ... ( settled.isPanelContainer ? { flags: MessageFlags.IsComponentsV2 } : {} )
        } ),
        send: async( channel: { id: string } ) => {
            if ( settled.panelRefused ) {
                throw new Error( "Missing Access" );
            }

            panels.sent.push( channel.id );

            return { id: `panel-${ panels.sent.length }` };
        },
        rerenderMessage: async( message: { id: string } ) => {
            if ( settled.panelRefused ) {
                throw new Error( "Missing Access" );
            }

            panels.redrawn.push( message.id );
        }
    };

    const noop = () => undefined;

    // What the dashboard asked the cleanup to delete, through the lobby service.
    const cleanups: { guildId: string; masterChannelId: string }[] = [];

    // A guild the dashboard names is found the way the bot finds one, off the client.
    jest.spyOn( ChannelUtils, "cacheOrFetchGuild" ).mockImplementation( async( guildId: string ) =>
        GUILD_ID === guildId ? asInstance( guild ) : null
    );

    const service = Object.create( TeamLobbyService.prototype ) as TeamLobbyService;

    Object.assign( service, {
        logger: { info: noop, log: noop, warn: noop, error: noop, admin: noop },
        running: new Map(),
        presenceWatchers: new Map(),
        services: {
            channelService,
            channelCleanupService: {
                deleteLobbyMasterChannelWithCleanup: async( args: { guildId: string; masterChannelId: string } ) => {
                    cleanups.push( args );
                }
            },
            entitlementService: {
                // Answered by the row id, as the real one is - a discord id asked in its place reads as
                // not covered.
                isMasterChannelCovered: async( _guildId: string, masterChannelDbId: string ) =>
                    settled.isCovered && LOBBY_ROW_ID === masterChannelDbId
            },
            appService: { getClient: () => ( { guilds: { cache: new Map( [ [ GUILD_ID, guild ] ] ) } } ) },
            uiService: { get: ( name: string ) => "VertixBot/UI-V3/TeamLobbyAdapter" === name ? panelAdapter : undefined }
        }
    } );

    // The two listeners are private - the event bus is what calls them - so they are reached as it does.
    const listeners = service as unknown as {
        refreshPanels(): Promise<void>;
        onJoin( args: { newState: { channelId: string | null; guild: IFakeGuild; member: IFakeMember } } ): Promise<void>;
        onLeave( args: { oldState: { channelId: string | null; guild: IFakeGuild } } ): Promise<void>;
        onChannelGuildVoiceDelete( channel: IFakeChannel ): Promise<void>;
        closeAbandonedSplits(): Promise<void>;
    };

    const asLobby = () => lobby as unknown as Parameters<TeamLobbyService[ "split" ]>[ 0 ][ "lobby" ];
    const asMember = ( member: IFakeMember ) => member as unknown as Parameters<TeamLobbyService[ "split" ]>[ 0 ][ "member" ];

    const rooms = () => roomsOf().map( ( row ) => guild.channels.cache.get( row.channelId ) as IFakeChannel );

    return {
        service, listeners, world: settled, guild, lobby, category, members, rows, savedSettings, panels, categories,
        cleanups, created, overwriteChanges, panelWrites, aMember, asLobby, asMember, rooms,
        panelChannelOf: ( ownerId: string ) => panelChannels.get( ownerId ) ?? null,
        splitMode: () => splitMode,
        sessionCategoryId: () => sessionCategoryId
    };
}

/**
 * A team lobby: members gather, are split into team or group rooms beside it, and are called back.
 *
 * What is pinned here is who ends up where - which is the whole of what a lobby is for - and every
 * reason it can refuse, since each of those is a screen somebody will read.
 */
describe( "VertixBot/Services/TeamLobby", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "split()", () => {
        it( "should deal everyone in the lobby into the team rooms and move them there", async() => {
            // Arrange - four players and a music bot.
            const { service, aMember, asLobby, asMember, rooms, rows } = await makeLobby();

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );
            const bot = aMember( "bot-1", { bot: true } );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 4, missed: 0 } ) );
            expect( rooms().map( ( room ) => room.name ) ).toEqual( [ "🔴 Team 1", "🔵 Team 2" ] );
            expect( rooms().map( ( room ) => room.members.size ) ).toEqual( [ 2, 2 ] );
            expect( rows.filter( ( row ) => row.isLobbyRoom ).every( ( row ) => LOBBY_ID === row.ownerChannelId ) ).toBe( true );
            expect( bot.voice.channelId ).toBe( LOBBY_ID );
        } );

        it( "should open picked teams empty, each held to its share, and move nobody", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms, lobby } = await makeLobby();

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4", "member-5" ].forEach( ( id ) => aMember( id ) );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 0 } ) );
            expect( rooms().map( ( room ) => [ room.name, room.userLimit ] ) ).toEqual( [ [ "🔴 Team 1", 3 ], [ "🔵 Team 2", 3 ] ] );
            expect( lobby.members.size ).toBe( 5 );
        } );

        it( "should pair everyone up for groups of two, each room held to two", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby();

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "groups", count: 2 } );

            // Assert.
            expect( rooms().map( ( room ) => [ room.name, room.userLimit, room.members.size ] ) ).toEqual( [
                [ "👥 Group 1", 2, 2 ],
                [ "👥 Group 2", 2, 2 ]
            ] );
        } );

        it( "should refuse a group of one", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "groups", count: 1 } );

            // Assert.
            expect( result ).toEqual( { code: "invalid-count" } );
            expect( rooms() ).toEqual( [] );
        } );

        it( "should refuse a lobby past the server's allowance, and open nothing", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby( { isCovered: false } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "not-covered" } );
            expect( rooms() ).toEqual( [] );
        } );

        it( "should leave a lobby that names hosts to them alone", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const player = aMember( "member-1" ),
                host = aMember( "member-2", { roles: [ HOST_ROLE_ID ] } );

            // Act.
            const byPlayer = await service.split( { lobby: asLobby(), member: asMember( player ), mode: "random-teams", count: 2 } );
            const byHost = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( byPlayer ).toEqual( { code: "not-host" } );
            expect( byHost ).toEqual( expect.objectContaining( { code: "success" } ) );
        } );

        it( "should not let somebody outside a lobby that names no hosts split it", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const outsider = aMember( "member-1", { in: null } );

            [ "member-2", "member-3" ].forEach( ( id ) => aMember( id ) );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( outsider ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "not-host" } );
        } );

        it( "should let an admin split it from anywhere", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const admin = aMember( "admin-1", { in: null, admin: true } );

            [ "member-2", "member-3" ].forEach( ( id ) => aMember( id ) );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( admin ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 2 } ) );
        } );

        it( "should refuse to split a lobby that is split already", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "already-split" } );
        } );

        it( "should open one set of rooms for two presses at once", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const results = await Promise.all( [
                service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } ),
                service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } )
            ] );

            // Assert.
            expect( results.map( ( result ) => result.code ) ).toEqual( [ "success", "already-split" ] );
            expect( rooms() ).toHaveLength( 2 );
        } );

        it( "should refuse more teams than there are members to fill them", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 3 } );

            // Assert.
            expect( result ).toEqual( { code: "too-few-members" } );
        } );

        it( "should refuse to deal out a lobby nobody is in", async() => {
            // Arrange - an admin pressing from outside, and only a bot inside.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const admin = aMember( "admin-1", { in: null, admin: true } );

            aMember( "bot-1", { bot: true } );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( admin ), mode: "groups", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "nobody-to-split" } );
        } );

        it( "should refuse a team count outside what a split may ask for", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const host = aMember( "member-1" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 9 } );

            // Assert.
            expect( result ).toEqual( { code: "invalid-count" } );
        } );

        it( "should refuse a split that opens more rooms than one setup may", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby( { roomsLimit: 2 } );

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4", "member-5" ].forEach( ( id ) => aMember( id ) );

            // Act - five members in groups of two make three rooms.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "groups", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "too-many-rooms", roomsLimit: 2 } );
            expect( rooms() ).toEqual( [] );
        } );

        it( "should say what the bot is missing on the lobby", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby( { missingPermissions: [ "MoveMembers" ] } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "missing-permissions", missingPermissions: [ "MoveMembers" ] } );
        } );

        it( "should close the rooms it opened when discord refuses one, and move nobody", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms, lobby } = await makeLobby( { refuseRoomsAfter: 1 } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( { code: "failed" } );
            expect( rooms() ).toEqual( [] );
            expect( lobby.members.size ).toBe( 2 );
        } );
    } );

    describe( "recall()", () => {
        it( "should move everyone in the rooms back to the lobby and close the rooms", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms, lobby } = await makeLobby();

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Act - pressed by the host from inside their team's room, which is still the lobby's.
            const result = await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( result ).toEqual( { code: "success", moved: 4, missed: 0 } );
            expect( rooms() ).toEqual( [] );
            expect( lobby.members.size ).toBe( 4 );
        } );

        it( "should still call everyone back once the lobby has fallen past the server's allowance", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, world, lobby } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            world.isCovered = false;

            // Act.
            const result = await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 2 } ) );
            expect( lobby.members.size ).toBe( 2 );
        } );

        it( "should say there is nothing to call back on a lobby that is not split", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const host = aMember( "member-1" );

            // Act.
            const result = await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( result ).toEqual( { code: "not-split" } );
        } );

        it( "should leave calling back to the hosts of a lobby that names them", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const host = aMember( "member-1", { roles: [ HOST_ROLE_ID ] } ),
                player = aMember( "member-2" );

            aMember( "member-3" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Act.
            const result = await service.recall( { lobby: asLobby(), member: asMember( player ) } );

            // Assert.
            expect( result ).toEqual( { code: "not-host" } );
            expect( rooms() ).toHaveLength( 2 );
        } );
    } );

    describe( "an abandoned split", () => {
        it( "should close the rooms once nobody is left in the lobby or any of them", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, rooms, members, guild } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            const lastRoomId = host.voice.channelId;

            members.forEach( ( member ) => member.voice.channelId = null );

            // Act.
            await listeners.onLeave( { oldState: { channelId: lastRoomId, guild } } );

            // Assert.
            expect( rooms() ).toEqual( [] );
        } );

        it( "should keep a team's room standing while the split goes on, however empty it is", async() => {
            // Arrange - picked teams: one member steps into a team and back out to the lobby.
            const { service, listeners, aMember, asLobby, asMember, rooms, guild } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            const [ teamOne ] = rooms();

            host.voice.channelId = teamOne.id;
            host.voice.channelId = LOBBY_ID;

            // Act.
            await listeners.onLeave( { oldState: { channelId: teamOne.id, guild } } );

            // Assert.
            expect( rooms() ).toHaveLength( 2 );
        } );

        it( "should close at startup the splits everybody left while the bot was away", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, rooms, members } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            members.forEach( ( member ) => member.voice.channelId = null );

            // Act.
            await listeners.closeAbandonedSplits();

            // Assert.
            expect( rooms() ).toEqual( [] );
        } );
    } );

    describe( "a channel deleted by hand", () => {
        it( "should close a deleted lobby's rooms and forget the lobby", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, rooms, rows, lobby, guild, categories } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            guild.channels.cache.delete( LOBBY_ID );

            // Act.
            await listeners.onChannelGuildVoiceDelete( lobby );

            // Assert - its panel channel goes with it.
            expect( rooms() ).toEqual( [] );
            expect( rows ).toEqual( [] );
            expect( guild.channels.cache.has( PANEL_ID ) ).toBe( false );
            expect( categories.deleted ).toEqual( [ "category-1" ] );
        } );

        it( "should forget a room deleted by hand", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, rooms, rows, guild } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            const [ teamOne ] = rooms();

            guild.channels.cache.delete( teamOne.id );

            // Act.
            await listeners.onChannelGuildVoiceDelete( teamOne );

            // Assert.
            expect( rows.filter( ( row ) => row.isLobbyRoom ).map( ( row ) => row.channelId ) ).toEqual( [ "room-2" ] );
        } );
    } );

    describe( "the split's category", () => {
        it( "should open the split's rooms in a category of their own, right below the lobby's", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms, categories, sessionCategoryId } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert - discord nests no category in another, so right below the lobby's is where it goes.
            expect( categories.created ).toEqual( [ { id: "category-1", name: "↳ 🎮 Team Lobby" } ] );
            expect( categories.moved ).toEqual( [ [ "category-1", LOBBY_CATEGORY_POSITION + 1 ] ] );
            expect( rooms().map( ( room ) => room.parentId ) ).toEqual( [ "category-1", "category-1" ] );
            expect( sessionCategoryId() ).toBe( "category-1" );
        } );

        it( "should take the category down with its rooms on Recall", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, categories, sessionCategoryId } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Act.
            await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( categories.deleted ).toEqual( [ "category-1" ] );
            expect( sessionCategoryId() ).toBeNull();
        } );

        it( "should open a new category for every split", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, categories } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );
            await service.recall( { lobby: asLobby(), member: asMember( host ) } );
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "groups", count: 2 } );

            // Assert.
            expect( categories.created.map( ( created ) => created.id ) ).toEqual( [ "category-1", "category-2" ] );
            expect( categories.deleted ).toEqual( [ "category-1" ] );
        } );

        it( "should take it down when everybody has left", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, members, guild, categories } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            const lastRoomId = host.voice.channelId;

            members.forEach( ( member ) => member.voice.channelId = null );

            // Act.
            await listeners.onLeave( { oldState: { channelId: lastRoomId, guild } } );

            // Assert.
            expect( categories.deleted ).toEqual( [ "category-1" ] );
        } );

        it( "should leave it standing when somebody put a channel of their own in it", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, guild, categories, sessionCategoryId } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            guild.channels.cache.set( "notes", {
                ... ( guild.channels.cache.get( LOBBY_ID ) as IFakeChannel ),
                id: "notes",
                name: "notes",
                parentId: "category-1"
            } );

            // Act.
            await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert - the rooms were the split's, the channel is somebody's own.
            expect( categories.deleted ).toEqual( [] );
            expect( sessionCategoryId() ).toBeNull();
        } );

        it( "should take it down when discord refuses one of its rooms", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, categories } = await makeLobby( { refuseRoomsAfter: 1 } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( categories.deleted ).toEqual( [ "category-1" ] );
        } );

        it( "should take it down once the last of its rooms was deleted by hand", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, rooms, guild, categories } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            const [ teamOne, teamTwo ] = rooms();

            // Act.
            guild.channels.cache.delete( teamOne.id );
            await listeners.onChannelGuildVoiceDelete( teamOne );

            const afterOne = [ ... categories.deleted ];

            guild.channels.cache.delete( teamTwo.id );
            await listeners.onChannelGuildVoiceDelete( teamTwo );

            // Assert.
            expect( afterOne ).toEqual( [] );
            expect( categories.deleted ).toEqual( [ "category-1" ] );
        } );
    } );

    describe( "the panel", () => {
        it( "should post the panel in the lobby's panel channel and in its own chat, and remember both", async() => {
            // Arrange.
            const { service, asLobby, panels, panelWrites } = await makeLobby();

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert - one write for both places.
            expect( panels.sent ).toEqual( [ PANEL_ID, LOBBY_ID ] );
            expect( panelWrites ).toEqual( [ {
                ownerId: LOBBY_ROW_ID,
                settings: {
                    lobbyPanelMessageId: "panel-1",
                    lobbyPanelMessageHash: expect.any( String ),
                    lobbyChatPanelMessageId: "panel-2",
                    lobbyChatPanelMessageHash: expect.any( String )
                }
            } ] );
        } );

        it( "should make the panel channel again, beside the lobby, when it was deleted by hand", async() => {
            // Arrange - its id is still remembered, and discord no longer has it.
            const { service, asLobby, panels, guild, created, rows, panelChannelOf } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9"
            } );

            guild.channels.cache.delete( PANEL_ID );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert - a new channel owned by the lobby, remembered, and a new panel in it.
            expect( created ).toEqual( [ expect.objectContaining( {
                name: NAMING.lobbyControlPanelName,
                type: ChannelType.GuildText,
                internalType: "DEFAULT_CHANNEL",
                ownerChannelId: LOBBY_ID,
                position: 1
            } ) ] );
            expect( rows ).toContainEqual( expect.objectContaining( { channelId: "room-1", ownerChannelId: LOBBY_ID } ) );
            expect( panelChannelOf( LOBBY_ROW_ID ) ).toBe( "room-1" );
            expect( panels.sent ).toEqual( [ "room-1" ] );
            expect( panels.redrawn ).toEqual( [ "chat-panel-9" ] );
        } );

        it( "should keep the panel channel read only, shown to whoever may see the lobby", async() => {
            // Arrange - a role the lobby lets in and lets speak.
            const { service, asLobby, guild, lobby, created } = await makeLobby( { hasPanelChannel: false } );

            lobby.permissionOverwrites.cache.set( HOST_ROLE_ID, {
                id: HOST_ROLE_ID,
                type: OverwriteType.Role,
                allow: new PermissionsBitField( [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Speak ] ),
                deny: new PermissionsBitField()
            } );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert - nobody writes under the panel, and the role is carried over to see it and no more.
            const overwrites = ( created[ 0 ] as { permissionOverwrites: Array<{ id: string; allow: bigint; deny: bigint }> } )
                .permissionOverwrites;

            const everyone = overwrites.find( ( overwrite ) => guild.roles.everyone.id === overwrite.id ),
                role = overwrites.find( ( overwrite ) => HOST_ROLE_ID === overwrite.id );

            expect( everyone?.allow ).toBe( PermissionsBitField.Flags.ViewChannel );
            expect( ( everyone?.deny ?? 0n ) & PermissionsBitField.Flags.SendMessages ).toBe( PermissionsBitField.Flags.SendMessages );
            expect( role ).toEqual( expect.objectContaining( { allow: PermissionsBitField.Flags.ViewChannel, deny: 0n } ) );
        } );

        it( "should replace a panel posted before it became a container, rather than edit it", async() => {
            // Arrange - both posted as embeds, which an edit cannot turn into a container.
            const { service, asLobby, panels } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9",
                isPanelContainer: true
            } );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert.
            expect( panels.deleted ).toEqual( [ "panel-9", "chat-panel-9" ] );
            expect( panels.sent ).toEqual( [ PANEL_ID, LOBBY_ID ] );
            expect( panels.redrawn ).toEqual( [] );
        } );

        it( "should edit a panel that is a container already", async() => {
            // Arrange.
            const { service, asLobby, panels } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9",
                isPanelContainer: true,
                isPostedContainer: true
            } );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert.
            expect( panels.deleted ).toEqual( [] );
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9" ] );
        } );

        it( "should redraw the panels it posted rather than post others", async() => {
            // Arrange.
            const { service, asLobby, panels } = await makeLobby( { panelMessageId: "panel-9", chatPanelMessageId: "chat-panel-9" } );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert.
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9" ] );
            expect( panels.sent ).toEqual( [] );
        } );

        it( "should post it again when the one it remembered was deleted by hand", async() => {
            // Arrange.
            const { service, asLobby, panels } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9",
                panelMessageExists: false
            } );

            // Act.
            await service.refreshPanel( asLobby() );

            // Assert.
            expect( panels.redrawn ).toEqual( [] );
            expect( panels.sent ).toEqual( [ PANEL_ID, LOBBY_ID ] );
        } );

        it( "should redraw it after a split and after a call back", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, panels } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9"
            } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );
            await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9", "panel-9", "chat-panel-9" ] );
        } );

        it( "should still answer a split as done when discord would not redraw the panel", async() => {
            // Arrange - the members are moved before the panel is drawn, so a split that worked must
            // not read as a press that failed.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby( {
                panelMessageId: "panel-9",
                panelRefused: true
            } );

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 2 } ) );
            expect( rooms() ).toHaveLength( 2 );
        } );

        it( "should show the rooms the lobby is split into, and who runs it", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const host = aMember( "member-1", { roles: [ HOST_ROLE_ID ] } );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Act.
            const args = await service.getPanelArgs( asLobby() );

            // Assert.
            expect( args ).toEqual( { lobbyId: LOBBY_ID, roomIds: [ "room-1", "room-2" ], hostRoleIds: [ HOST_ROLE_ID ] } );
        } );

        it( "should redraw it when the lobby's hosts change", async() => {
            // Arrange.
            const { service, guild, rows, panels, world } = await makeLobby( { panelMessageId: "panel-9" } );

            // Act.
            await service.setHostRoles(
                guild as unknown as Parameters<TeamLobbyService[ "setHostRoles" ]>[ 0 ],
                rows[ 0 ] as unknown as Parameters<TeamLobbyService[ "setHostRoles" ]>[ 1 ],
                [ HOST_ROLE_ID ]
            );

            // Assert.
            expect( world.hostRoleIds ).toEqual( [ HOST_ROLE_ID ] );
            expect( panels.redrawn ).toEqual( [ "panel-9" ] );
        } );
    } );

    describe( "a split for the members picked", () => {
        const ACCESS = PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.Connect;

        const bits = ( value: unknown ) => new PermissionsBitField( ( value ?? 0n ) as bigint ).bitfield;

        it.each( [ [ "random-teams" ], [ "groups" ] ] as const )(
            "should deal only the members picked into %s rooms, and leave the rest in the lobby",
            async( mode ) => {
                // Arrange - four in the lobby, two of them picked.
                const { service, aMember, asLobby, asMember, rooms, lobby } = await makeLobby();

                const host = aMember( "member-1" );

                [ "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

                // Act.
                const result = await service.split( {
                    lobby: asLobby(),
                    member: asMember( host ),
                    mode,
                    count: 2,
                    playerIds: [ "member-1", "member-2" ]
                } );

                // Assert.
                expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 2 } ) );
                expect( rooms().flatMap( ( room ) => [ ... room.members.keys() ] ).sort() ).toEqual( [ "member-1", "member-2" ] );
                expect( [ ... lobby.members.keys() ].sort() ).toEqual( [ "member-3", "member-4" ] );
            }
        );

        it( "should leave out a member picked who is not in the lobby, since only the lobby can be moved", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );
            aMember( "member-3", { in: null } );

            // Act.
            const result = await service.split( {
                lobby: asLobby(),
                member: asMember( host ),
                mode: "random-teams",
                count: 2,
                playerIds: [ "member-1", "member-2", "member-3" ]
            } );

            // Assert.
            expect( result ).toEqual( expect.objectContaining( { code: "success", moved: 2, missed: 0 } ) );
        } );

        it( "should refuse when fewer of the members picked are in the lobby than teams", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const result = await service.split( {
                lobby: asLobby(),
                member: asMember( host ),
                mode: "random-teams",
                count: 2,
                playerIds: [ "member-1" ]
            } );

            // Assert.
            expect( result ).toEqual( { code: "too-few-members" } );
            expect( rooms() ).toEqual( [] );
        } );

        it( "should open picked teams' rooms to the members picked alone, each held to its share of them", async() => {
            // Arrange - the host is not playing.
            const { service, aMember, asLobby, asMember, created, guild } = await makeLobby();

            const host = aMember( "member-1" );

            [ "member-2", "member-3", "member-4", "member-5" ].forEach( ( id ) => aMember( id ) );

            // Act.
            await service.split( {
                lobby: asLobby(),
                member: asMember( host ),
                mode: "pick-teams",
                count: 2,
                playerIds: [ "member-2", "member-3", "member-4", "member-5" ]
            } );

            // Assert - every room lets in the four picked and nobody else, two to a room.
            const made = created.filter( ( args ) => "LOBBY_ROOM_CHANNEL" === args.internalType );

            expect( made ).toHaveLength( 2 );

            made.forEach( ( args ) => {
                const overwrites = args.permissionOverwrites as Array<{ id: string; allow?: unknown; deny?: unknown }>,
                    everyone = overwrites.find( ( overwrite ) => guild.roles.everyone.id === overwrite.id ),
                    letIn = overwrites
                        .filter( ( overwrite ) => BOT_ID !== overwrite.id && ACCESS === ( bits( overwrite.allow ) & ACCESS ) )
                        .map( ( overwrite ) => overwrite.id )
                        .sort();

                expect( args.userLimit ).toBe( 2 );
                expect( bits( everyone?.deny ) & ACCESS ).toBe( ACCESS );
                expect( letIn ).toEqual( [ "member-2", "member-3", "member-4", "member-5" ] );
            } );
        } );
    } );

    describe( "keeping each team to its own room", () => {
        const ACCESS = PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.Connect;

        const bits = ( value: unknown ) => new PermissionsBitField( ( value ?? 0n ) as bigint ).bitfield;

        type TMadeOverwrite = { id: string; allow?: unknown; deny?: unknown };

        // What each of the split's rooms was made with, in the order they were made.
        const roomsMade = ( created: Array<Record<string, unknown>> ) => created
            .filter( ( args ) => "LOBBY_ROOM_CHANNEL" === args.internalType )
            .map( ( args ) => args.permissionOverwrites as TMadeOverwrite[] );

        it.each( [ [ "random-teams" ], [ "groups" ] ] as const )(
            "should make each %s room visible and joinable only to the members dealt into it",
            async( mode ) => {
                // Arrange - four in the lobby, dealt two to a room.
                const { service, aMember, asLobby, asMember, created, rooms, guild } = await makeLobby();

                const host = aMember( "member-1" );

                [ "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

                // Act.
                await service.split( { lobby: asLobby(), member: asMember( host ), mode, count: 2 } );

                // Assert - everybody else kept out, and each room lets in exactly whoever was moved into it.
                const made = roomsMade( created );

                expect( made ).toHaveLength( 2 );

                rooms().forEach( ( room, index ) => {
                    const everyone = made[ index ].find( ( overwrite ) => guild.roles.everyone.id === overwrite.id ),
                        letIn = made[ index ]
                            .filter( ( overwrite ) => BOT_ID !== overwrite.id && ACCESS === ( bits( overwrite.allow ) & ACCESS ) )
                            .map( ( overwrite ) => overwrite.id )
                            .sort();

                    expect( bits( everyone?.deny ) & ACCESS ).toBe( ACCESS );
                    expect( letIn ).toEqual( [ ... room.members.keys() ].sort() );
                } );
            }
        );

        it( "should let the lobby's hosts into every dealt room, as a teacher goes between groups", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, created } = await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const host = aMember( "member-1", { roles: [ HOST_ROLE_ID ] } );

            aMember( "member-2" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Assert.
            roomsMade( created ).forEach( ( made ) => {
                const hostRole = made.find( ( overwrite ) => HOST_ROLE_ID === overwrite.id );

                expect( bits( hostRole?.allow ) & ACCESS ).toBe( ACCESS );
            } );
        } );

        it( "should open picked teams' rooms to the whole lobby until somebody walks into one", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, created, guild } = await makeLobby();

            const host = aMember( "member-1" );

            // Act.
            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Assert.
            roomsMade( created ).forEach( ( made ) => {
                const everyone = made.find( ( overwrite ) => guild.roles.everyone.id === overwrite.id );

                expect( bits( everyone?.deny ) & ACCESS ).toBe( 0n );
            } );
        } );

        it( "should close the other teams' rooms on a member who walks into a picked team's room", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, guild, overwriteChanges } = await makeLobby();

            const host = aMember( "member-1" ),
                player = aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Act - from the lobby into the first team's room, out to the lobby, and back again.
            await listeners.onJoin( { newState: { channelId: "room-1", guild, member: player } } );
            await listeners.onJoin( { newState: { channelId: "room-1", guild, member: player } } );

            // Assert - shut once, and not again for coming back.
            expect( overwriteChanges ).toEqual( [
                { channelId: "room-2", id: "member-2", change: { ViewChannel: false, Connect: false } }
            ] );
        } );

        it( "should leave the lobby's hosts free to go between picked rooms", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, guild, overwriteChanges } =
                await makeLobby( { hostRoleIds: [ HOST_ROLE_ID ] } );

            const host = aMember( "member-1", { roles: [ HOST_ROLE_ID ] } );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            // Act.
            await listeners.onJoin( { newState: { channelId: "room-1", guild, member: host } } );

            // Assert.
            expect( overwriteChanges ).toEqual( [] );
        } );

        it( "should keep a member a host moved to the other team to that team instead", async() => {
            // Arrange - they picked the first team.
            const { service, listeners, aMember, asLobby, asMember, guild, overwriteChanges } = await makeLobby();

            const host = aMember( "member-1" ),
                player = aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            await listeners.onJoin( { newState: { channelId: "room-1", guild, member: player } } );

            // Act - dragged into the second.
            await listeners.onJoin( { newState: { channelId: "room-2", guild, member: player } } );

            // Assert - the first shut on them now, and the second open again.
            expect( overwriteChanges ).toEqual( [
                { channelId: "room-2", id: "member-2", change: { ViewChannel: false, Connect: false } },
                { channelId: "room-1", id: "member-2", change: { ViewChannel: false, Connect: false } },
                { channelId: "room-2", id: "member-2", change: { ViewChannel: true, Connect: true } }
            ] );
        } );

        it( "should leave a dealt room as it was made when somebody joins it", async() => {
            // Arrange.
            const { service, listeners, aMember, asLobby, asMember, guild, overwriteChanges } = await makeLobby();

            const host = aMember( "member-1" ),
                player = aMember( "member-2" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "random-teams", count: 2 } );

            // Act.
            await listeners.onJoin( { newState: { channelId: "room-1", guild, member: player } } );

            // Assert.
            expect( overwriteChanges ).toEqual( [] );
        } );

        it( "should forget how the lobby was split once it is called back", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, splitMode } = await makeLobby();

            const host = aMember( "member-1" );

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            const whileSplit = splitMode();

            // Act.
            await service.recall( { lobby: asLobby(), member: asMember( host ) } );

            // Assert.
            expect( whileSplit ).toBe( "pick-teams" );
            expect( splitMode() ).toBeNull();
        } );
    } );

    describe( "the panels at startup", () => {
        afterEach( () => {
            delete process.env.SHARD_COUNT;
            delete process.env.SHARD_IDS;
        } );

        it( "should redraw a lobby's panels as the bot starts", async() => {
            // Arrange.
            const { listeners, panels } = await makeLobby( { panelMessageId: "panel-9", chatPanelMessageId: "chat-panel-9" } );

            // Act.
            await listeners.refreshPanels();

            // Assert.
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9" ] );
            expect( panels.sent ).toEqual( [] );
        } );

        it( "should leave a panel alone that would be drawn as it already is", async() => {
            // Arrange - drawn once, by the restart before.
            const { listeners, panels } = await makeLobby( { panelMessageId: "panel-9", chatPanelMessageId: "chat-panel-9" } );

            await listeners.refreshPanels();

            // Act.
            await listeners.refreshPanels();

            // Assert - no second edit for nothing new.
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9" ] );
        } );

        it( "should redraw a panel once what it shows has changed, as after an update", async() => {
            // Arrange.
            const { listeners, panels, world } = await makeLobby( { panelMessageId: "panel-9", chatPanelMessageId: "chat-panel-9" } );

            await listeners.refreshPanels();

            world.panelDrawing = "v2";

            // Act.
            await listeners.refreshPanels();

            // Assert.
            expect( panels.redrawn ).toEqual( [ "panel-9", "chat-panel-9", "panel-9", "chat-panel-9" ] );
        } );

        it( "should put back a panel channel deleted while the bot was away", async() => {
            // Arrange.
            const { listeners, panels, guild, panelChannelOf } = await makeLobby( {
                panelMessageId: "panel-9",
                chatPanelMessageId: "chat-panel-9"
            } );

            await listeners.refreshPanels();

            guild.channels.cache.delete( PANEL_ID );

            // Act.
            await listeners.refreshPanels();

            // Assert - a channel of its own again, and a panel posted in it.
            expect( panelChannelOf( LOBBY_ROW_ID ) ).toBe( "room-1" );
            expect( panels.sent ).toEqual( [ "room-1" ] );
        } );

        it( "should leave the lobbies of a guild another shard holds to that shard", async() => {
            // Arrange - the guild is on shard 1, and this process runs shard 0.
            process.env.SHARD_COUNT = "2";
            process.env.SHARD_IDS = "0";

            const { listeners, panels } = await makeLobby( { panelMessageId: "panel-9" } );

            // Act.
            await listeners.refreshPanels();

            // Assert.
            expect( panels.redrawn ).toEqual( [] );
            expect( panels.sent ).toEqual( [] );
        } );
    } );

    describe( "getSplitPlanRefusal()", () => {
        it( "should find nothing in the way of a split the lobby can make", async() => {
            // Arrange.
            const { service, aMember, asLobby } = await makeLobby();

            [ "member-1", "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

            // Act & Assert.
            await expect( service.getSplitPlanRefusal( asLobby(), "random-teams", 2 ) ).resolves.toBeNull();
            await expect( service.getSplitPlanRefusal( asLobby(), "groups", 2 ) ).resolves.toBeNull();
        } );

        it( "should find too few people for more teams than the lobby holds, or a group bigger than it", async() => {
            // Arrange - three in the lobby.
            const { service, aMember, asLobby, rooms } = await makeLobby();

            [ "member-1", "member-2", "member-3" ].forEach( ( id ) => aMember( id ) );

            // Act & Assert - neither opens anything.
            await expect( service.getSplitPlanRefusal( asLobby(), "random-teams", 4 ) ).resolves.toEqual( { code: "too-few-members" } );
            await expect( service.getSplitPlanRefusal( asLobby(), "groups", 4 ) ).resolves.toEqual( { code: "too-few-members" } );
            expect( rooms() ).toEqual( [] );
        } );

        it( "should count only the members picked who are in the lobby", async() => {
            // Arrange - four in the lobby, two of them picked for three teams.
            const { service, aMember, asLobby } = await makeLobby();

            [ "member-1", "member-2", "member-3", "member-4" ].forEach( ( id ) => aMember( id ) );

            // Act & Assert.
            await expect( service.getSplitPlanRefusal( asLobby(), "random-teams", 3, [ "member-1", "member-2" ] ) )
                .resolves.toEqual( { code: "too-few-members" } );
        } );

        it( "should find nothing in the way of picked teams, whose rooms fill as members walk in", async() => {
            // Arrange - nobody in the lobby yet.
            const { service, asLobby } = await makeLobby();

            // Act & Assert.
            await expect( service.getSplitPlanRefusal( asLobby(), "pick-teams", 4 ) ).resolves.toBeNull();
        } );

        it( "should refuse groups at a split too, when fewer people are in the lobby than the group size", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, rooms } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );
            aMember( "member-3" );

            // Act.
            const result = await service.split( { lobby: asLobby(), member: asMember( host ), mode: "groups", count: 4 } );

            // Assert.
            expect( result ).toEqual( { code: "too-few-members" } );
            expect( rooms() ).toEqual( [] );
        } );
    } );

    describe( "who a split is for, and the screens waiting on them", () => {
        it( "should call a member picked ready only when they are a person in the lobby", async() => {
            // Arrange.
            const { service, aMember, asLobby } = await makeLobby();

            aMember( "member-1" );
            aMember( "member-2", { in: null } );
            aMember( "music-bot", { bot: true } );

            // Act.
            const presence = service.getPlayersPresence( asLobby(), [ "member-1", "member-2", "music-bot", "member-9" ] );

            // Assert.
            expect( presence ).toEqual( [
                { id: "member-1", isReady: true },
                { id: "member-2", isReady: false },
                { id: "music-bot", isReady: false },
                { id: "member-9", isReady: false }
            ] );
        } );

        it( "should draw a waiting screen again whenever somebody comes into the lobby or leaves it", async() => {
            // Arrange.
            const { service, listeners, aMember, guild } = await makeLobby();

            const redraw = jest.fn( async() => undefined ),
                member = aMember( "member-1" );

            service.watchLobbyPresence( LOBBY_ID, "screen-1", redraw, Date.now() + 60_000 );

            // Act.
            await listeners.onJoin( { newState: { channelId: LOBBY_ID, guild, member } } );
            await listeners.onLeave( { oldState: { channelId: LOBBY_ID, guild } } );

            // Assert.
            expect( redraw ).toHaveBeenCalledTimes( 2 );
        } );

        it( "should leave alone a screen waiting on another lobby", async() => {
            // Arrange.
            const { service, listeners, aMember, guild } = await makeLobby();

            const redraw = jest.fn( async() => undefined ),
                member = aMember( "member-1" );

            service.watchLobbyPresence( LOBBY_ID, "screen-1", redraw, Date.now() + 60_000 );

            // Act.
            await listeners.onJoin( { newState: { channelId: "850000000000000099", guild, member } } );

            // Assert.
            expect( redraw ).not.toHaveBeenCalled();
        } );

        it( "should let go of a screen past the time discord takes its edits", async() => {
            // Arrange.
            const { service, listeners, aMember, guild } = await makeLobby();

            const redraw = jest.fn( async() => undefined ),
                member = aMember( "member-1" );

            service.watchLobbyPresence( LOBBY_ID, "screen-1", redraw, Date.now() - 1 );

            // Act.
            await listeners.onJoin( { newState: { channelId: LOBBY_ID, guild, member } } );

            // Assert.
            expect( redraw ).not.toHaveBeenCalled();
        } );

        it( "should let go of a screen that can no longer be drawn - dismissed, or replaced by another press", async() => {
            // Arrange.
            const { service, listeners, aMember, guild } = await makeLobby();

            const redraw = jest.fn( async() => {
                    throw new Error( "Unknown Message" );
                } ),
                member = aMember( "member-1" );

            service.watchLobbyPresence( LOBBY_ID, "screen-1", redraw, Date.now() + 60_000 );

            // Act - the first move finds it gone; the second must not try again.
            await listeners.onJoin( { newState: { channelId: LOBBY_ID, guild, member } } );
            await listeners.onJoin( { newState: { channelId: LOBBY_ID, guild, member } } );

            // Assert.
            expect( redraw ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should stop drawing a screen that was let go", async() => {
            // Arrange.
            const { service, listeners, aMember, guild } = await makeLobby();

            const redraw = jest.fn( async() => undefined ),
                member = aMember( "member-1" );

            service.watchLobbyPresence( LOBBY_ID, "screen-1", redraw, Date.now() + 60_000 );

            // Act.
            service.unwatchLobbyPresence( LOBBY_ID, "screen-1" );

            await listeners.onJoin( { newState: { channelId: LOBBY_ID, guild, member } } );

            // Assert.
            expect( redraw ).not.toHaveBeenCalled();
        } );
    } );

    describe( "getSplitAccessRefusal()", () => {
        it( "should say why before anybody picks how many", async() => {
            // Arrange.
            const { service, aMember, asLobby, asMember, world } = await makeLobby();

            const host = aMember( "member-1" );

            aMember( "member-2" );

            // Act.
            const whileFree = await service.getSplitAccessRefusal( asLobby(), asMember( host ) );

            world.isCovered = false;

            const pastAllowance = await service.getSplitAccessRefusal( asLobby(), asMember( host ) );

            world.isCovered = true;

            await service.split( { lobby: asLobby(), member: asMember( host ), mode: "pick-teams", count: 2 } );

            const whileSplit = await service.getSplitAccessRefusal( asLobby(), asMember( host ) );

            // Assert.
            expect( whileFree ).toBeNull();
            expect( pastAllowance ).toEqual( { code: "not-covered" } );
            expect( whileSplit ).toEqual( { code: "already-split" } );
        } );
    } );

    describe( "createLobby()", () => {
        it( "should make the server its lobby, with the hosts it named", async() => {
            // Arrange.
            const { service, guild, savedSettings, panels, panelChannelOf } = await makeLobby();

            // Act.
            const result = await service.createLobby( {
                guild: guild as unknown as Parameters<TeamLobbyService[ "createLobby" ]>[ 0 ][ "guild" ],
                userOwnerId: GUILD_OWNER_ID,
                hostRoleIds: [ HOST_ROLE_ID ]
            } );

            // Assert - its hosts written, and its panel posted in a panel channel of its own below it.
            expect( result ).toEqual( expect.objectContaining( { code: "success" } ) );
            expect( savedSettings ).toContainEqual( { ownerId: "row-room-1", settings: { lobbyHostRoleIds: [ HOST_ROLE_ID ] } } );
            expect( panelChannelOf( "row-room-1" ) ).toBe( "room-2" );
            expect( panels.sent ).toEqual( [ "room-2", "room-1" ] );
        } );
    } );

    describe( "getLobbyByPanelChannel()", () => {
        it( "should find the lobby a panel channel runs", async() => {
            // Arrange.
            const { service, guild, lobby } = await makeLobby();

            // Act.
            const found = await service.getLobbyByPanelChannel( {
                id: PANEL_ID,
                guild: guild as unknown as Parameters<TeamLobbyService[ "getLobbyByPanelChannel" ]>[ 0 ][ "guild" ]
            } );

            // Assert.
            expect( found ).toBe( lobby );
        } );

        it( "should find the lobby itself for the panel in the lobby's own chat", async() => {
            // Arrange.
            const { service, guild, lobby } = await makeLobby();

            // Act.
            const found = await service.getLobbyByPanelChannel( {
                id: LOBBY_ID,
                guild: guild as unknown as Parameters<TeamLobbyService[ "getLobbyByPanelChannel" ]>[ 0 ][ "guild" ]
            } );

            // Assert.
            expect( found ).toBe( lobby );
        } );

        it( "should find none for a panel whose lobby is gone", async() => {
            // Arrange - deleted while the bot was away, so nothing took the panel down with it.
            const { service, guild } = await makeLobby();

            guild.channels.cache.delete( LOBBY_ID );

            // Act.
            const found = await service.getLobbyByPanelChannel( {
                id: PANEL_ID,
                guild: guild as unknown as Parameters<TeamLobbyService[ "getLobbyByPanelChannel" ]>[ 0 ][ "guild" ]
            } );

            // Assert.
            expect( found ).toBeNull();
        } );
    } );

    describe( "handleCreateLobbySetup()", () => {
        it( "should make the lobby the dashboard asked for, run by anyone in it until hosts are named", async() => {
            // Arrange.
            const { service, savedSettings, panels } = await makeLobby();

            // Act.
            await service.handleCreateLobbySetup( { guildId: GUILD_ID, userOwnerId: GUILD_OWNER_ID } );

            // Assert.
            expect( savedSettings ).toContainEqual( { ownerId: "row-room-1", settings: { lobbyHostRoleIds: [] } } );
            expect( panels.sent ).toEqual( [ "room-2", "room-1" ] );
        } );

        it( "should make nothing for a guild the bot is not in", async() => {
            // Arrange.
            const { service, savedSettings, panels, rows } = await makeLobby();

            // Act.
            await service.handleCreateLobbySetup( { guildId: "820000000000000999", userOwnerId: GUILD_OWNER_ID } );

            // Assert.
            expect( savedSettings ).toEqual( [] );
            expect( panels.sent ).toEqual( [] );
            expect( rows.filter( ( row ) => row.isLobbyMaster ) ).toHaveLength( 1 );
        } );
    } );

    describe( "handleDeleteLobbySetup()", () => {
        it( "should hand the lobby the dashboard deleted to the cleanup, by its row id", async() => {
            // Arrange.
            const { service, cleanups } = await makeLobby();

            // Act.
            await service.handleDeleteLobbySetup( { guildId: GUILD_ID, masterChannelId: LOBBY_ROW_ID } );

            // Assert.
            expect( cleanups ).toEqual( [ { guildId: GUILD_ID, masterChannelId: LOBBY_ROW_ID } ] );
        } );
    } );
} );
