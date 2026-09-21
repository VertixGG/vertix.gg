import { jest } from "@jest/globals";

import type { FastifyReply, FastifyRequest } from "fastify";

const USER_ID = "310000000000000001",
    GUILD_ID = "820000000000000001",
    OTHER_GUILD_ID = "820000000000000002";

const MINUTE = 60 * 1000,
    HOUR = 60 * MINUTE;

interface IDiscordGuildLike {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
}

const refreshAccessToken = jest.fn<( userId: string ) => Promise<string | null>>(),
    getDiscordGuilds = jest.fn<( accessToken: string ) => Promise<IDiscordGuildLike[]>>();

// Mocked rather than stood up: the real one reads a token out of the database, and none of what is
// being checked here is about where the token came from.
jest.unstable_mockModule( "@vertix.gg/api/src/server/services/auth-service", () => ( {
    refreshAccessToken,
    getDiscordGuilds
} ) );

const { cacheOwnedGuilds, requireGuildOwner, resolveGuildOwnership } =
    await import( "@vertix.gg/api/src/server/middleware/guild-access" );

const aGuild = ( id: string, owner: boolean ): IDiscordGuildLike =>
    ( { id, name: `guild-${ id }`, icon: null, owner } );

interface ISessionShape {
    userId?: string;
    ownedGuilds?: { guilds: Array<{ id: string; name: string; icon: string | null }>; fetchedAt: number };
}

function aRequest( session: ISessionShape = { userId: USER_ID } ) {
    const warnings: string[] = [];

    const request = {
        session: { ... session, save: async() => undefined },
        log: { warn: ( _error: unknown, message?: unknown ) => warnings.push( String( message ?? _error ) ) }
    };

    return { request: request as unknown as FastifyRequest, warnings, session: request.session };
}

function aReply() {
    const answered: { status?: number } = {};

    const reply = {
        status( code: number ) {
            answered.status = code;

            return reply;
        },
        async send() {
            return reply;
        }
    };

    return { reply: reply as unknown as FastifyReply, answered };
}

/**
 * Whether a guild is this session's to act on.
 *
 * This is what the guild routes rest on - they compare their url against the selected guild, and
 * that selection is only worth anything because this refused the ones that were not yours. Covered
 * because a mistake here is not visible from the outside: everything keeps working, for everybody,
 * including the people it should not work for.
 */
describe( "VertixAPI/Middleware/GuildAccess", () => {
    beforeEach( () => {
        refreshAccessToken.mockReset();
        getDiscordGuilds.mockReset();

        refreshAccessToken.mockResolvedValue( "access-token" );
        getDiscordGuilds.mockResolvedValue( [ aGuild( GUILD_ID, true ), aGuild( OTHER_GUILD_ID, false ) ] );
    } );

    describe( "resolveGuildOwnership()", () => {
        it( "should own a guild discord says is owned", async() => {
            // Act.
            const { request } = aRequest();

            const ownership = await resolveGuildOwnership( request, GUILD_ID );

            // Assert.
            expect( ownership.outcome ).toBe( "owned" );
        } );

        it( "should refuse a guild the user is only a member of", async() => {
            // Act - being in a server is not owning it, and the dashboard only offers owned ones.
            const { request } = aRequest();

            // Assert.
            await expect( resolveGuildOwnership( request, OTHER_GUILD_ID ) )
                .resolves.toEqual( { outcome: "not-owned" } );
        } );

        it( "should refuse a guild discord has never heard of", async() => {
            // Act - a guild id is not a secret, so this is the answer to anybody guessing one.
            const { request } = aRequest();

            // Assert.
            await expect( resolveGuildOwnership( request, "999999999999999999" ) )
                .resolves.toEqual( { outcome: "not-owned" } );
        } );

        it( "should report a sign-in that has gone stale as its own outcome", async() => {
            // Act - told apart from a refusal because logging in again fixes one and not the other.
            refreshAccessToken.mockResolvedValue( null );

            const { request } = aRequest();

            // Assert.
            await expect( resolveGuildOwnership( request, GUILD_ID ) )
                .resolves.toEqual( { outcome: "no-token" } );
        } );

        it( "should report no session as a stale sign-in rather than a refusal", async() => {
            // Act.
            const { request } = aRequest( {} );

            // Assert.
            await expect( resolveGuildOwnership( request, GUILD_ID ) )
                .resolves.toEqual( { outcome: "no-token" } );
        } );

        it( "should answer from a fresh list without asking discord", async() => {
            // Act - discord rate limits this endpoint, and the dashboard lists then selects.
            const { request } = aRequest( {
                userId: USER_ID,
                ownedGuilds: { guilds: [ aGuild( GUILD_ID, true ) ], fetchedAt: Date.now() - MINUTE }
            } );

            const ownership = await resolveGuildOwnership( request, GUILD_ID );

            // Assert.
            expect( ownership.outcome ).toBe( "owned" );
            expect( getDiscordGuilds ).not.toHaveBeenCalled();
        } );

        it( "should ask again once the list is no longer fresh", async() => {
            // Act.
            const { request } = aRequest( {
                userId: USER_ID,
                ownedGuilds: { guilds: [], fetchedAt: Date.now() - 6 * MINUTE }
            } );

            const ownership = await resolveGuildOwnership( request, GUILD_ID );

            // Assert - the empty list is not trusted past its window, so this comes back owned.
            expect( ownership.outcome ).toBe( "owned" );
            expect( getDiscordGuilds ).toHaveBeenCalled();
        } );

        it( "should keep what it learns, so the next question is free", async() => {
            // Act.
            const { request, session } = aRequest();

            await resolveGuildOwnership( request, GUILD_ID );

            // Assert - and only the owned ones are kept.
            expect( session.ownedGuilds?.guilds.map( ( guild ) => guild.id ) ).toEqual( [ GUILD_ID ] );
        } );

        it( "should fall back to a stale list when discord cannot be reached", async() => {
            // Act - answering 500 would lock somebody out of their own dashboard because discord is
            // busy, which is the worse of the two wrongs.
            getDiscordGuilds.mockRejectedValue( new Error( "Failed to fetch Discord guilds: 429" ) );

            const { request, warnings } = aRequest( {
                userId: USER_ID,
                ownedGuilds: { guilds: [ aGuild( GUILD_ID, true ) ], fetchedAt: Date.now() - 30 * MINUTE }
            } );

            const ownership = await resolveGuildOwnership( request, GUILD_ID );

            // Assert - and it says so rather than doing it silently.
            expect( ownership.outcome ).toBe( "owned" );
            expect( warnings.join( " " ) ).toContain( "stale" );
        } );

        it( "should not fall back to a list older than the stale window", async() => {
            // Act - bounded on purpose, so deciding on old ownership cannot go on indefinitely.
            getDiscordGuilds.mockRejectedValue( new Error( "Failed to fetch Discord guilds: 429" ) );

            const { request } = aRequest( {
                userId: USER_ID,
                ownedGuilds: { guilds: [ aGuild( GUILD_ID, true ) ], fetchedAt: Date.now() - 2 * HOUR }
            } );

            // Assert.
            await expect( resolveGuildOwnership( request, GUILD_ID ) ).rejects.toThrow( "429" );
        } );

        it( "should raise discord's failure when there is nothing to fall back to", async() => {
            // Act.
            getDiscordGuilds.mockRejectedValue( new Error( "Failed to fetch Discord guilds: 401" ) );

            const { request } = aRequest();

            // Assert.
            await expect( resolveGuildOwnership( request, GUILD_ID ) ).rejects.toThrow( "401" );
        } );
    } );

    describe( "cacheOwnedGuilds()", () => {
        it( "should keep only the guilds that are owned", async() => {
            // Act.
            const { request, session } = aRequest();

            cacheOwnedGuilds( request, [ aGuild( GUILD_ID, true ), aGuild( OTHER_GUILD_ID, false ) ] );

            // Assert.
            expect( session.ownedGuilds?.guilds.map( ( guild ) => guild.id ) ).toEqual( [ GUILD_ID ] );
        } );
    } );

    describe( "requireGuildOwner()", () => {
        it( "should let the owner carry on", async() => {
            // Act.
            const { request } = aRequest();
            const { reply, answered } = aReply();

            // Assert.
            await expect( requireGuildOwner( request, reply, GUILD_ID ) ).resolves.toBe( true );
            expect( answered.status ).toBeUndefined();
        } );

        it( "should answer 401 with no session", async() => {
            // Act.
            const { request } = aRequest( {} );
            const { reply, answered } = aReply();

            // Assert.
            await expect( requireGuildOwner( request, reply, GUILD_ID ) ).resolves.toBe( false );
            expect( answered.status ).toBe( 401 );
        } );

        it( "should answer 401 when the sign-in has gone stale", async() => {
            // Act - fixable by logging in again, which 404 would not suggest.
            refreshAccessToken.mockResolvedValue( null );

            const { request } = aRequest();
            const { reply, answered } = aReply();

            // Assert.
            await expect( requireGuildOwner( request, reply, GUILD_ID ) ).resolves.toBe( false );
            expect( answered.status ).toBe( 401 );
        } );

        it( "should answer 404 rather than 403 for somebody else's guild", async() => {
            // Act - that a server exists but is not yours is a fact the asker did not have before
            // asking, and there is no reason to hand it over.
            const { request } = aRequest();
            const { reply, answered } = aReply();

            // Assert.
            await expect( requireGuildOwner( request, reply, OTHER_GUILD_ID ) ).resolves.toBe( false );
            expect( answered.status ).toBe( 404 );
        } );
    } );
} );
