import type { Client } from "discord.js";

const EXCLUDED_GUILD_IDS_ENV_KEY = "DEV_GUILD_ID";

type TOwnedGuilds = {
    getOwnedGuildIds( client: Client ): string[];
    getExcludedGuildIds(): string[];
};

/**
 * Reads nothing off the worker but these two methods, so they are called against the prototype
 * rather than standing one up - which would want a discord client and a database connection.
 */
async function makeOwnedGuilds() {
    const { CleanupWorker } = await import( "@vertix.gg/bot/src/_workers/cleanup-worker" );

    const prototype = CleanupWorker.prototype as unknown as TOwnedGuilds;

    const state = {
        getOwnedGuildIds: prototype.getOwnedGuildIds,
        getExcludedGuildIds: prototype.getExcludedGuildIds
    };

    return ( guildIds: string[] ) => {
        const client = {
            guilds: { cache: new Map( guildIds.map( ( guildId ) => [ guildId, {} ] ) ) }
        } as unknown as Client;

        return ( state as unknown as TOwnedGuilds ).getOwnedGuildIds( client );
    };
}

/**
 * What bounds the sweep, and therefore what decides whether sharding reduced the database read or
 * merely repeated it.
 *
 * The sweep used to read every `Channel` row of a type and discard the ones belonging to other
 * shards afterwards, so each process paid for the whole table - on a column with no index, once per
 * shard. These ids are what the query names instead.
 */
describe( "VertixBot/Workers/CleanupWorker/getOwnedGuildIds", () => {
    const originalExcluded = process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ];

    afterEach( () => {
        if ( undefined === originalExcluded ) {
            delete process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ];
            return;
        }

        process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ] = originalExcluded;
    } );

    it( "should name the guilds this process is holding", async() => {
        delete process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ];

        const getOwnedGuildIds = await makeOwnedGuilds();

        expect( getOwnedGuildIds( [ "100", "200", "300" ] ) ).toEqual( [ "100", "200", "300" ] );
    } );

    it( "should leave out a guild the dev box is told to leave alone", async() => {
        process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ] = "200";

        const getOwnedGuildIds = await makeOwnedGuilds();

        expect( getOwnedGuildIds( [ "100", "200", "300" ] ) ).toEqual( [ "100", "300" ] );
    } );

    it( "should leave out several, however the env spaces them", async() => {
        process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ] = " 100 , 300 ";

        const getOwnedGuildIds = await makeOwnedGuilds();

        expect( getOwnedGuildIds( [ "100", "200", "300" ] ) ).toEqual( [ "200" ] );
    } );

    /**
     * The caller returns early on an empty list rather than querying, which is the difference
     * between sweeping nothing and sweeping everything: `guildId: { in: [] }` matches no rows, but
     * a caller that read this as "no filter needed" would be back to reading the whole table.
     *
     * It is empty for a real reason - a process whose guilds have not arrived yet - which is why
     * the sweep is started on `ready` rather than when `client.login()` resolves.
     */
    it( "should name nothing when no guilds have arrived", async() => {
        delete process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ];

        const getOwnedGuildIds = await makeOwnedGuilds();

        expect( getOwnedGuildIds( [] ) ).toEqual( [] );
    } );
} );
