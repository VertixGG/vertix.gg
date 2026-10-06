import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    UpdateDynamicSettingsPayload,
    UpdateGuildSettingsPayload
} from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

/**
 * Which channel an interaction is about.
 *
 * The question has two different answers depending on whether the interaction named a channel. One
 * that named none is a reasonable guess - whatever the member is standing in. One that named a
 * channel is not a guess at all, and the distinction is the whole of this function.
 *
 * It used to run both together: a named channel that could not be found fell through to the guess,
 * so somebody whose channel had been deleted while its screen was still open had the next press
 * land on whichever channel they had made since - silently, with nothing on screen saying the
 * subject had changed. That is three of the reports this was written for.
 *
 * `resolveTargetChannel` reads nothing off `this`, so it is called against the prototype rather
 * than standing up a service and everything the locator would want with it.
 *
 * The module is imported after the mock rather than at the top: pulling the service in builds the
 * v3 button group as a side effect of loading, and a button needs the ui service to construct.
 */

type Resolver = { resolveTargetChannel( i: UIAdapterReplyContext, a?: UIArgs ): Promise<unknown> };

async function resolveTargetChannel( interaction: unknown, args?: UIArgs ): Promise<unknown> {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } =
        await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    return ( DynamicChannelService.prototype as unknown as Resolver )
        .resolveTargetChannel.call( {}, interaction as UIAdapterReplyContext, args );
}

const aVoiceChannel = ( id: string ) => ( { id, type: ChannelType.GuildVoice } );

const aTextChannel = ( id: string ) => ( { id, type: ChannelType.GuildText } );

/**
 * A guild that knows about some channels and not others, told apart by how they are reached:
 * `cached` answers from memory, `fetchable` only over the wire, and anything else is not there.
 */
function aGuild( options: {
    cached?: Record<string, unknown>;
    fetchable?: Record<string, unknown>;
    memberVoiceChannel?: unknown;
} ) {
    const cached = new Map( Object.entries( options.cached ?? {} ) );
    const fetchable = new Map( Object.entries( options.fetchable ?? {} ) );

    return {
        channels: {
            cache: cached,
            fetch: jest.fn( async( id: string ) => fetchable.get( id ) ?? null )
        },
        members: {
            cache: new Map(),
            fetch: jest.fn( async() => ( { voice: { channel: options.memberVoiceChannel ?? null } } ) )
        }
    };
}

const GUILD_ID = "850000000000000001",
    GENERATOR_ID = "850000000000000002",
    ELSEWHERE_ID = "850000000000000003",
    ROOM_ID = "850000000000000004",
    OWNER_ID = "850000000000000005";

type Creator = { createDynamicChannel( args: unknown ): Promise<unknown> };

/**
 * Stands up what `createDynamicChannel()` reaches for on a generator nobody has configured, with the
 * real `log()` behind it - its "Cannot find master channel DB" is the symptom - and records which
 * generator the line announcing the room was filed under.
 *
 * `newState` is shaped the way discord.js keeps it: `channel` a getter over `channelId`, on the one
 * cached object every later voice update patches. That getter answering differently at the end of the
 * creation than at its start is the whole of the bug, so a plain object would not reproduce it.
 */
async function createDynamicChannel( options: { movesWhileCreating: boolean } ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    // `MasterChannelDataManager` resolves its configuration the moment it is constructed, and the
    // real registry is only populated by the bot's startup. The specs next door stub it the same way.
    const { ConfigManager } = await import( "@vertix.gg/data/src/managers/config-manager" );

    jest.spyOn( ConfigManager.$, "get" ).mockReturnValue( { getKeys: () => ( {} ) } as never );

    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { UserModel } = await import( "@vertix.gg/data/src/models/user-model" );
    const { MasterChannelDataManager } = await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { PermissionsManager } = await import( "@vertix.gg/bot/src/managers/permissions-manager" );

    const generatorDB = { id: "generator-db-id", channelId: GENERATOR_ID, version: "0.0.0.2" };

    // Only the generator has a row - the channel the member went on to is an ordinary one.
    jest.spyOn( ChannelModel.$, "getByChannelId" )
        .mockImplementation( async( channelId ) => ( GENERATOR_ID === channelId ? generatorDB : null ) as never );

    jest.spyOn( UserModel.$, "ensure" ).mockResolvedValue( { userId: OWNER_ID } as never );

    jest.spyOn( MasterChannelDataManager.$, "getChannelAutosave" ).mockResolvedValue( false as never );
    jest.spyOn( MasterChannelDataManager.$, "getChannelDefaultUserLimit" ).mockResolvedValue( undefined as never );
    jest.spyOn( MasterChannelDataManager.$, "getChannelStaffRoles" ).mockResolvedValue( [] as never );
    jest.spyOn( MasterChannelDataManager.$, "getChannelDefaultPrivacyState" ).mockResolvedValue( "public" as never );
    jest.spyOn( MasterChannelDataManager.$, "getChannelVerifiedRoles" ).mockResolvedValue( [] as never );
    jest.spyOn( MasterChannelDataManager.$, "getChannelNameTemplate" ).mockResolvedValue( "a-room" as never );

    jest.spyOn( GuildDataManager.$, "maskBadwords" ).mockImplementation( async( _guildId, name ) => name as never );

    // Building the real one asks the locator for the app service, which nothing here registers.
    jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( {
        getChannelDefaultPermissions: () => ( {} ),
        mergeChannelPermissionOverwrites: () => []
    } as never );

    const channels = new Map<string, unknown>();

    const guild = {
        id: GUILD_ID,
        name: "a-guild",
        memberCount: 9,
        members: { cache: new Map() },
        channels: { cache: channels }
    };

    const aChannel = ( id: string, name: string ) => ( { id, name, guild, guildId: GUILD_ID, userLimit: 0, parent: null } );

    channels.set( GENERATOR_ID, aChannel( GENERATOR_ID, "join-to-create" ) );
    channels.set( ELSEWHERE_ID, aChannel( ELSEWHERE_ID, "general" ) );

    const newState = {
        id: OWNER_ID,
        member: { id: OWNER_ID },
        channelId: GENERATOR_ID,
        get channel() {
            return channels.get( this.channelId ) ?? null;
        },
        setChannel: async() => undefined
    };

    const recorded = { errors: [] as string[], filedUnder: [] as string[] };

    const prototype = DynamicChannelService.prototype as unknown as Record<string, Function>;

    const state = {
        createDynamicChannel: prototype.createDynamicChannel,
        log: prototype.log,
        getChannelDefaultInheritedProperties: () => ( {} ),
        getUserCurrentGame: () => null,
        getDynamicChannelTemplateIndex: async() => 1,
        assembleChannelNameTemplate: async( template: string ) => template,
        logInChannelDebounce: async( masterChannelDB: { channelId: string } ) =>
            void recorded.filedUnder.push( masterChannelDB.channelId ),
        logger: {
            info: () => undefined,
            log: () => undefined,
            admin: () => undefined,
            error: ( _caller: unknown, message: string ) => void recorded.errors.push( message )
        },
        services: {
            channelService: {
                create: async() => {
                    // Discord takes a moment to make the room, and the member is free to click
                    // somewhere else in the meantime - the update lands on the same object.
                    if ( options.movesWhileCreating ) {
                        newState.channelId = ELSEWHERE_ID;
                    }

                    // Not voice based, so the panel the room is given a second later is never drawn.
                    return { channel: { id: ROOM_ID, isVoiceBased: () => false }, db: Promise.resolve( {} ) };
                }
            }
        }
    };

    await ( state as unknown as Creator ).createDynamicChannel( {
        username: "owner",
        displayName: "Owner",
        guild,
        oldState: {},
        newState
    } );

    return recorded;
}

type VoiceRoleSaver = {
    handleUpdateDynamicSettings( data: UpdateDynamicSettingsPayload ): Promise<void>;
    handleUpdateGuildSettings( data: UpdateGuildSettingsPayload ): Promise<void>;
};

/**
 * Stands up what a dashboard save of a voice role reaches: the two stores it lands in, the guild it
 * is for - or none, on a shard that does not hold it - and the move of the members sitting in its
 * channels, which is recorded rather than made.
 *
 * `guildRoleId` is the guild wide role as it stood before the save.
 */
async function aVoiceRoleSave( options: { guildRoleId: string | null; holdsGuild: boolean } ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );
    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );
    const { MasterChannelDataManager } = await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );
    const { GuildDataManager } = await import( "@vertix.gg/data/src/managers/guild-data-manager" );
    const { VoiceRoleManager } = await import( "@vertix.gg/bot/src/managers/voice-role-manager" );

    const generatorDB = { id: "generator-db-id", channelId: GENERATOR_ID, version: "0.0.0.2" };

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( { getById: async() => generatorDB } as never );

    const setChannelVoiceRoleId = jest.fn( async() => undefined );

    jest.spyOn( MasterChannelDataManager, "$", "get" ).mockReturnValue( { setChannelVoiceRoleId } as never );

    jest.spyOn( GuildDataManager, "$", "get" ).mockReturnValue( {
        getVoiceRoleId: async() => options.guildRoleId,
        setVoiceRoleId: async( _guildId: string, roleId: string | null ) => ( { previousRoleId: options.guildRoleId, roleId } )
    } as never );

    const resyncGuild = jest.spyOn( VoiceRoleManager.$, "resyncGuild" ).mockResolvedValue( undefined );

    const guild = { id: GUILD_ID };

    const prototype = DynamicChannelService.prototype as unknown as Record<string, Function>;

    const state = {
        handleUpdateDynamicSettings: prototype.handleUpdateDynamicSettings,
        handleUpdateGuildSettings: prototype.handleUpdateGuildSettings,
        resyncVoiceRole: prototype.resyncVoiceRole,
        logger: { log: () => undefined, error: () => undefined },
        services: {
            appService: {
                getClient: () => ( { guilds: { cache: new Map( options.holdsGuild ? [ [ GUILD_ID, guild ] ] : [] ) } } )
            }
        }
    };

    return { saver: state as unknown as VoiceRoleSaver, guild, setChannelVoiceRoleId, resyncGuild };
}

describe( "VertixBot/Services/DynamicChannel", () => {
    describe( "resolveTargetChannel()", () => {
        it( "should answer with the voice channel the interaction is already in", async() => {
            // Arrange - a press on a panel inside the channel itself.
            const channel = aVoiceChannel( "here" );

            // Act.
            const result = await resolveTargetChannel( { channel, guild: aGuild( {} ) } );

            // Assert.
            expect( result ).toBe( channel );
        } );

        it( "should answer with the channel the args name", async() => {
            // Arrange - a command typed in a text channel, naming a voice channel.
            const named = aVoiceChannel( "named" );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild: aGuild( { cached: { named } } ) },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBe( named );
        } );

        it( "should fetch the named channel when it is not in cache", async() => {
            // Arrange.
            const named = aVoiceChannel( "named" );
            const guild = aGuild( { fetchable: { named } } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBe( named );
            expect( guild.channels.fetch ).toHaveBeenCalledWith( "named" );
        } );

        it( "should read the name off `args.channel` as well as `args.channelId`", async() => {
            // Arrange - what a transition hands in, rather than a command.
            const named = aVoiceChannel( "named" );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild: aGuild( { cached: { named } } ) },
                { channel: { id: "named" } }
            );

            // Assert.
            expect( result ).toBe( named );
        } );

        /**
         * The regression. A named channel that is gone is an answer of "no", not an invitation to
         * pick another one - even when the member is sitting in a perfectly good channel that the
         * function could have returned instead.
         */
        it( "should answer with nothing when the named channel is gone", async() => {
            // Arrange - the named channel is neither cached nor fetchable, and the member is in
            // another one, which is exactly the shape that used to produce the substitution.
            const somewhereElse = aVoiceChannel( "the-one-they-made-since" );

            const guild = aGuild( { memberVoiceChannel: somewhereElse } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "deleted" }
            );

            // Assert - not the channel they are standing in.
            expect( result ).toBeNull();
            expect( result ).not.toBe( somewhereElse );
        } );

        it( "should answer with nothing when fetching the named channel fails", async() => {
            // Arrange - discord refusing is not the same as the channel being someone else's.
            const guild = aGuild( { memberVoiceChannel: aVoiceChannel( "elsewhere" ) } );

            guild.channels.fetch = jest.fn( async() => {
                throw new Error( "Missing Access" );
            } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "deleted" }
            );

            // Assert.
            expect( result ).toBeNull();
        } );

        /**
         * And the other half of the distinction: naming nothing is a question this may guess at.
         * Were the guess removed along with the substitution, `/voice rename` typed in a text
         * channel would stop finding the channel the member is sitting in.
         */
        it( "should fall back to the member's own channel when the args name none", async() => {
            // Arrange.
            const standingIn = aVoiceChannel( "standing-in" );

            // Act - no args at all.
            const result = await resolveTargetChannel( {
                channel: aTextChannel( "text" ),
                guild: aGuild( { memberVoiceChannel: standingIn } ),
                user: { id: "user-id" }
            } );

            // Assert.
            expect( result ).toBe( standingIn );
        } );

        it( "should answer with nothing when nothing is named and the member is in no channel", async() => {
            // Act.
            const result = await resolveTargetChannel( {
                channel: aTextChannel( "text" ),
                guild: aGuild( {} ),
                user: { id: "user-id" }
            } );

            // Assert.
            expect( result ).toBeNull();
        } );

        it( "should not treat a named text channel as the target", async() => {
            // Arrange - the id resolves, but not to somewhere a dynamic channel can be.
            const guild = aGuild( { cached: { named: aTextChannel( "named" ) } } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBeNull();
        } );
    } );

    describe( "createDynamicChannel()", () => {
        afterEach( () => {
            jest.restoreAllMocks();
        } );

        /**
         * The regression, from production: a member clicked the generator and then another channel
         * within the half second discord took to make their room. The line announcing the room was
         * looked up under the channel they went to, found no generator there, and logged "Cannot find
         * master channel DB" instead of reaching the generator's logs channel.
         */
        it.each( [
            [ "stayed in the generator", false ],
            [ "moved on while the room was being made", true ]
        ] )( "should file the line announcing the room under the generator when the member %s", async(
            _case,
            movesWhileCreating
        ) => {
            // Act.
            const { errors, filedUnder } = await createDynamicChannel( { movesWhileCreating } );

            // Assert.
            expect( errors ).toEqual( [] );
            expect( filedUnder ).toEqual( [ GENERATOR_ID ] );
        } );
    } );

    /**
     * A voice role saved on the dashboard, and the people already sitting in channels.
     *
     * The guild wide role is written by the bot, so it can read what it replaces. A generator's own
     * is written by the api before the bot hears of it - so what it replaced has to come with the
     * message, or the members still holding it are never found.
     */
    describe( "voice role saves from the dashboard", () => {
        afterEach( () => {
            jest.restoreAllMocks();
        } );

        it( "should move members off the role a generator gave, as the api sent it", async() => {
            // Arrange.
            const { saver, guild, setChannelVoiceRoleId, resyncGuild } =
                await aVoiceRoleSave( { guildRoleId: "role-guild", holdsGuild: true } );

            // Act.
            await saver.handleUpdateDynamicSettings( {
                guildId: GUILD_ID,
                masterChannelId: "generator-db-id",
                settings: { dynamicChannelVoiceRoleId: "role-talking" },
                previousVoiceRoleId: "role-voice"
            } );

            // Assert.
            expect( setChannelVoiceRoleId ).toHaveBeenCalledWith(
                expect.objectContaining( { id: "generator-db-id" } ), GUILD_ID, "role-talking"
            );
            expect( resyncGuild ).toHaveBeenCalledWith( guild, [ "role-voice" ] );
        } );

        // Its own role was empty, so what its channels handed out was the guild wide one.
        it( "should measure a generator that had no role of its own from the guild wide one", async() => {
            // Arrange.
            const { saver, guild, resyncGuild } = await aVoiceRoleSave( { guildRoleId: "role-guild", holdsGuild: true } );

            // Act.
            await saver.handleUpdateDynamicSettings( {
                guildId: GUILD_ID,
                masterChannelId: "generator-db-id",
                settings: { dynamicChannelVoiceRoleId: "role-talking" },
                previousVoiceRoleId: null
            } );

            // Assert.
            expect( resyncGuild ).toHaveBeenCalledWith( guild, [ "role-guild" ] );
        } );

        it( "should move members off the guild wide role it replaced", async() => {
            // Arrange.
            const { saver, guild, resyncGuild } = await aVoiceRoleSave( { guildRoleId: "role-voice", holdsGuild: true } );

            // Act.
            await saver.handleUpdateGuildSettings( { guildId: GUILD_ID, settings: { voiceRoleId: "role-talking" } } );

            // Assert.
            expect( resyncGuild ).toHaveBeenCalledWith( guild, [ "role-voice" ] );
        } );

        // Discord gives a guild to one shard, and only that one can see who sits in its channels.
        it( "should not move anybody on a shard that does not hold the guild", async() => {
            // Arrange.
            const { saver, resyncGuild } = await aVoiceRoleSave( { guildRoleId: "role-voice", holdsGuild: false } );

            // Act.
            await saver.handleUpdateGuildSettings( { guildId: GUILD_ID, settings: { voiceRoleId: "role-talking" } } );

            // Assert.
            expect( resyncGuild ).not.toHaveBeenCalled();
        } );
    } );
} );
