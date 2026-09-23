import { jest } from "@jest/globals";

const A_GUILD = "830000000000000001",
    ANOTHER_GUILD = "830000000000000002",
    A_GUILD_NEVER_JOINED = "830000000000000003";

/**
 * Spies on the one query before the service is imported, since it takes the client at module load.
 * `getClient()` answers the same instance every time, which is what makes that work.
 */
async function makeSelect( rows: { guildId: string }[] ) {
    const { PrismaBotClient } = await import( "@vertix.gg/prisma/bot-client" );

    const client = PrismaBotClient.$.getClient();

    const findMany = jest.spyOn( client.guild, "findMany" )
        .mockResolvedValue( rows as never );

    const { selectGuildIdsWithBot } =
        await import( "@vertix.gg/api/src/server/services/dashboard-service" );

    return { findMany, selectGuildIdsWithBot };
}

/**
 * What lets the server picker say which servers it can actually manage.
 *
 * The alternative it replaces is the reason to have it: `getGuildBotPresence()` asks Discord once
 * per server, so drawing one page of a picker for somebody who owns thirty would be thirty REST
 * calls against a rate limit, every time that page opens.
 */
describe( "VertixAPI/DashboardService/selectGuildIdsWithBot", () => {
    afterEach( () => jest.restoreAllMocks() );

    it( "should name the servers the table says the bot is in", async() => {
        const { selectGuildIdsWithBot } = await makeSelect( [ { guildId: A_GUILD } ] );

        const result = await selectGuildIdsWithBot( [ A_GUILD, ANOTHER_GUILD ] );

        expect( result.has( A_GUILD ) ).toBe( true );
        expect( result.has( ANOTHER_GUILD ) ).toBe( false );
    } );

    /**
     * A server the bot has never been in has no row at all, so it is absent rather than false -
     * which is the same answer, and only by way of the set being built from what came back.
     */
    it( "should leave out a server that has no row", async() => {
        const { selectGuildIdsWithBot } = await makeSelect( [] );

        expect( await selectGuildIdsWithBot( [ A_GUILD_NEVER_JOINED ] ) ).toEqual( new Set() );
    } );

    /**
     * Both halves of the filter matter. Without the ids it reads the whole table to answer about
     * three servers; without `isInGuild` it names every server the bot has ever been in, and the
     * picker marks a server the bot was removed from as ready to manage.
     */
    it( "should ask only about the servers it was given, and only for ones the bot is in", async() => {
        const { findMany, selectGuildIdsWithBot } = await makeSelect( [] );

        await selectGuildIdsWithBot( [ A_GUILD, ANOTHER_GUILD ] );

        expect( findMany ).toHaveBeenCalledTimes( 1 );
        expect( findMany.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
            where: { guildId: { in: [ A_GUILD, ANOTHER_GUILD ] }, isInGuild: true }
        } );
    } );

    /**
     * `guildId: { in: [] }` matches nothing, so the answer would be right either way - this is
     * about not spending a round trip to be told so, on a page that opens on every sign-in.
     */
    it( "should not ask at all when there are no servers", async() => {
        const { findMany, selectGuildIdsWithBot } = await makeSelect( [] );

        expect( await selectGuildIdsWithBot( [] ) ).toEqual( new Set() );
        expect( findMany ).not.toHaveBeenCalled();
    } );
} );
