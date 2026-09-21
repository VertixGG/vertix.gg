import {
    ChannelManager,
    GuildChannelManager,
    GuildManager,
    GuildMemberManager,
    GuildMessageManager,
    LimitedCollection,
    MessageManager,
    PermissionOverwriteManager,
    PresenceManager,
    RoleManager,
    UserManager
} from "discord.js";

import {
    CLIENT_CACHE_MAX_GUILD_MEMBERS,
    CLIENT_CACHE_MAX_MESSAGES_PER_CHANNEL,
    CLIENT_CACHE_MAX_PRESENCES,
    CLIENT_CACHE_MAX_USERS,
    createClientCacheFactory,
    createClientSweepers
} from "@vertix.gg/bot/src/definitions/client-cache";

import type { Collection, Guild, GuildMember, Presence, User } from "discord.js";

const CLIENT_USER_ID = "bot-1",
    IN_VOICE_ID = "user-in-voice",
    IDLE_ID = "user-idle";

/**
 * The guild is reduced to the one thing every filter asks it: who is in a voice channel.
 *
 * `isInVoice()` reads `guild.voiceStates.cache` rather than `member.voice` precisely so that this
 * is the only state a test has to build, and so that a member already swept out of the member cache
 * cannot change the answer.
 */
function aGuild( userIdsInVoice: readonly string[] ): Guild {
    return {
        id: "guild-1",
        voiceStates: {
            cache: new Map( userIdsInVoice.map( ( id ) => [ id, { channelId: `voice-${ id }` } ] ) )
        }
    } as unknown as Guild;
}

function aMember( id: string, guild: Guild ): GuildMember {
    return { id, guild, client: { user: { id: CLIENT_USER_ID } } } as unknown as GuildMember;
}

function aUser( id: string ): User {
    return { id, client: { user: { id: CLIENT_USER_ID } } } as unknown as User;
}

function aPresence( userId: string, guild: Guild ): Presence {
    return { userId, guild } as unknown as Presence;
}

/**
 * Stands in for `CachedManager`, which calls `makeCache( managerType, holds, manager )` with the
 * manager *class* in both the first and third slot - and with the class named by
 * `MakeCacheOverrideSymbol` in the first when a subclass declares one. That indirection is the only
 * reason a single `MessageManager` entry reaches `GuildMessageManager`, so the shape is reproduced
 * here rather than assumed.
 */
type ManagerClass = Parameters<ReturnType<typeof createClientCacheFactory>>[ 0 ];

function cacheFor( manager: unknown, managerType: unknown = manager ): Collection<string, unknown> {
    return createClientCacheFactory()(
        managerType as ManagerClass,
        Object as never,
        manager as ManagerClass
    ) as Collection<string, unknown>;
}

describe( "VertixBot/Definitions/ClientCache", () => {
    describe( "createClientCacheFactory()", () => {
        // discord.js documents that overriding these "will break functionality", and the bot reads
        // all five on every interaction. A limit landing on one of them is the kind of change that
        // passes review and then loses a channel's permission overwrites in production.
        it.each( [
            [ "GuildManager", GuildManager ],
            [ "ChannelManager", ChannelManager ],
            [ "GuildChannelManager", GuildChannelManager ],
            [ "RoleManager", RoleManager ],
            [ "PermissionOverwriteManager", PermissionOverwriteManager ]
        ] )( "should leave %s unbounded", ( _name, manager ) => {
            expect( cacheFor( manager ) ).not.toBeInstanceOf( LimitedCollection );
        } );

        it.each( [
            [ "GuildMemberManager", GuildMemberManager, CLIENT_CACHE_MAX_GUILD_MEMBERS ],
            [ "UserManager", UserManager, CLIENT_CACHE_MAX_USERS ],
            [ "PresenceManager", PresenceManager, CLIENT_CACHE_MAX_PRESENCES ]
        ] )( "should bound %s at its configured ceiling", ( _name, manager, expected ) => {
            const cache = cacheFor( manager );

            expect( cache ).toBeInstanceOf( LimitedCollection );
            expect( ( cache as LimitedCollection<string, unknown> ).maxSize ).toBe( expected );
        } );

        // The bot never touches these, so anything they hold is held and never read.
        it( "should refuse to store the managers nothing in the bot reads", () => {
            const cache = cacheFor( class GuildBanManager {} );

            cache.set( "some-ban", {} );

            expect( cache.size ).toBe( 0 );
        } );

        it( "should reach GuildMessageManager through the MessageManager entry", () => {
            const cache = cacheFor( GuildMessageManager, MessageManager );

            expect( cache ).toBeInstanceOf( LimitedCollection );
            expect( ( cache as LimitedCollection<string, unknown> ).maxSize )
                .toBe( CLIENT_CACHE_MAX_MESSAGES_PER_CHANNEL );
        } );
    } );

    describe( "keepOverLimit", () => {
        it( "should exempt the bot's own member and anyone in voice, and no one else", () => {
            const guild = aGuild( [ IN_VOICE_ID ] ),
                keep = ( cacheFor( GuildMemberManager ) as LimitedCollection<string, GuildMember> )
                    .keepOverLimit!;

            expect( keep( aMember( CLIENT_USER_ID, guild ), CLIENT_USER_ID, null as never ) ).toBe( true );
            expect( keep( aMember( IN_VOICE_ID, guild ), IN_VOICE_ID, null as never ) ).toBe( true );
            expect( keep( aMember( IDLE_ID, guild ), IDLE_ID, null as never ) ).toBe( false );
        } );

        it( "should exempt only the bot's own user", () => {
            const keep = ( cacheFor( UserManager ) as LimitedCollection<string, User> ).keepOverLimit!;

            expect( keep( aUser( CLIENT_USER_ID ), CLIENT_USER_ID, null as never ) ).toBe( true );
            expect( keep( aUser( IDLE_ID ), IDLE_ID, null as never ) ).toBe( false );
        } );
    } );

    describe( "createClientSweepers()", () => {
        const sweepers = createClientSweepers()!;

        // A sweeper filter returns true for the entries it REMOVES, so every expectation below
        // reads as "is this one thrown away".
        it( "should sweep a presence for somebody not in voice, and keep one for somebody who is", () => {
            const guild = aGuild( [ IN_VOICE_ID ] ),
                sweep = sweepers.presences!.filter!()!;

            expect( sweep( aPresence( IDLE_ID, guild ), IDLE_ID, null as never ) ).toBe( true );
            expect( sweep( aPresence( IN_VOICE_ID, guild ), IN_VOICE_ID, null as never ) ).toBe( false );
        } );

        // `Sweepers` does not protect the client's own member; losing it takes out `guild.members.me`
        // and with it every permission check the bot makes.
        it( "should never sweep the bot's own member", () => {
            const guild = aGuild( [] ),
                sweep = sweepers.guildMembers!.filter!()!;

            expect( sweep( aMember( CLIENT_USER_ID, guild ), CLIENT_USER_ID, null as never ) ).toBe( false );
        } );

        it( "should sweep an idle member but keep one sitting in a dynamic channel", () => {
            const guild = aGuild( [ IN_VOICE_ID ] ),
                sweep = sweepers.guildMembers!.filter!()!;

            expect( sweep( aMember( IDLE_ID, guild ), IDLE_ID, null as never ) ).toBe( true );
            expect( sweep( aMember( IN_VOICE_ID, guild ), IN_VOICE_ID, null as never ) ).toBe( false );
        } );

        it( "should never sweep the bot's own user", () => {
            const sweep = sweepers.users!.filter!()!;

            expect( sweep( aUser( CLIENT_USER_ID ), CLIENT_USER_ID, null as never ) ).toBe( false );
            expect( sweep( aUser( IDLE_ID ), IDLE_ID, null as never ) ).toBe( true );
        } );

        // Spread in rather than replaced - dropping it would leave archived threads accumulating,
        // which is the one sweeper discord.js did ship.
        it( "should keep the default thread sweeper", () => {
            expect( sweepers.threads ).toBeDefined();
        } );
    } );
} );
