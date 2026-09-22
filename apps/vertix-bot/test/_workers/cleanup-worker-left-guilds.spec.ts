import { SHARD_COUNT_ENV_KEY, SHARD_IDS_ENV_KEY } from "@vertix.gg/bot/src/definitions/sharding";

import type { Client } from "discord.js";

type TRow = { guildId: string; name: string };

type TLeftGuilds = {
    selectLeftGuildCandidates( client: Client, rows: TRow[] ): TRow[];
};

/**
 * Two guilds that discord routes to different shards of two, so "another shard's guild" is a real
 * routing answer here rather than an assumption. `(id >> 22) % 2`.
 */
const SHARD_0_GUILD = "1550989820170604616",
    SHARD_1_GUILD = "1110248409761316944";

/** Discord's own routing, so the two names above are checked rather than trusted. */
const shardFor = ( guildId: string, shardCount: number ) =>
    Number( ( BigInt( guildId ) >> 22n ) % BigInt( shardCount ) );

const row = ( guildId: string ): TRow => ( { guildId, name: `guild-${ guildId }` } );

/**
 * Reads nothing off the worker but the one method, so it is called against the prototype rather
 * than standing one up - which would want a discord client and a database connection.
 */
async function makeSelect() {
    const { CleanupWorker } = await import( "@vertix.gg/bot/src/_workers/cleanup-worker" );

    const prototype = CleanupWorker.prototype as unknown as TLeftGuilds;

    const state = { selectLeftGuildCandidates: prototype.selectLeftGuildCandidates };

    return ( cachedGuildIds: string[], rows: TRow[] ) => {
        const client = {
            guilds: { cache: new Map( cachedGuildIds.map( ( guildId ) => [ guildId, {} ] ) ) }
        } as unknown as Client;

        return ( state as unknown as TLeftGuilds ).selectLeftGuildCandidates( client, rows );
    };
}

/**
 * The backstop deletes a guild's rows, and `ChannelData` cascades, so what this nominates is a
 * server's settings. Nothing downstream widens the set - discord is asked about each one and only
 * "that guild does not exist" deletes - but nothing downstream narrows it either.
 */
describe( "VertixBot/Workers/CleanupWorker/selectLeftGuildCandidates", () => {
    const originalCount = process.env[ SHARD_COUNT_ENV_KEY ],
        originalIds = process.env[ SHARD_IDS_ENV_KEY ];

    const setShards = ( count?: string, ids?: string ) => {
        if ( undefined === count ) {
            delete process.env[ SHARD_COUNT_ENV_KEY ];
        } else {
            process.env[ SHARD_COUNT_ENV_KEY ] = count;
        }

        if ( undefined === ids ) {
            delete process.env[ SHARD_IDS_ENV_KEY ];
        } else {
            process.env[ SHARD_IDS_ENV_KEY ] = ids;
        }
    };

    afterEach( () => setShards( originalCount, originalIds ) );

    // Everything below reads as nonsense if these two ever stop straddling the split.
    it( "should be using one guild from each shard of two", () => {
        expect( shardFor( SHARD_0_GUILD, 2 ) ).toBe( 0 );
        expect( shardFor( SHARD_1_GUILD, 2 ) ).toBe( 1 );
    } );

    it( "should not nominate a guild it is holding", async() => {
        setShards( undefined, undefined );

        const select = await makeSelect();

        expect( select( [ SHARD_0_GUILD ], [ row( SHARD_0_GUILD ) ] ) ).toEqual( [] );
    } );

    it( "should nominate a guild recorded as joined that it is not holding", async() => {
        setShards( undefined, undefined );

        const select = await makeSelect();

        expect( select( [], [ row( SHARD_0_GUILD ) ] ) ).toEqual( [ row( SHARD_0_GUILD ) ] );
    } );

    /**
     * The one that matters. Another shard's guilds are absent from this process's cache for the
     * ordinary reason that they are not its guilds - so on the cache check alone every shard would
     * nominate every other shard's guilds, and the first to finish asking discord would delete the
     * rows of every server the rest are serving.
     */
    it( "should not nominate a guild that belongs to another shard", async() => {
        setShards( "2", "0" );

        const select = await makeSelect();

        const candidates = select( [ SHARD_0_GUILD ], [ row( SHARD_0_GUILD ), row( SHARD_1_GUILD ) ] );

        expect( candidates ).toEqual( [] );
    } );

    it( "should nominate its own missing guild while leaving the other shard's alone", async() => {
        setShards( "2", "0" );

        const select = await makeSelect();

        const candidates = select( [], [ row( SHARD_0_GUILD ), row( SHARD_1_GUILD ) ] );

        expect( candidates ).toEqual( [ row( SHARD_0_GUILD ) ] );
    } );

    /**
     * Unsharded, `ownsGuild()` answers true for every id, so the cache is the only thing standing
     * between a row and a deletion - which is why the sweep is started on `ready` and not when
     * `client.login()` resolves.
     */
    it( "should nominate everything missing when the bot is not sharded", async() => {
        setShards( undefined, undefined );

        const select = await makeSelect();

        const candidates = select( [], [ row( SHARD_0_GUILD ), row( SHARD_1_GUILD ) ] );

        expect( candidates ).toEqual( [ row( SHARD_0_GUILD ), row( SHARD_1_GUILD ) ] );
    } );
} );
