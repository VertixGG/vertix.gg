import {
    SHARD_COUNT_ENV_KEY,
    SHARD_IDS_ENV_KEY,
    getOwnedShardIds,
    getShardClientOptions,
    getShardCount,
    isSharded,
    ownsGuild,
    ownsSingletonWork
} from "@vertix.gg/bot/src/definitions/sharding";

/**
 * Discord's own routing, spelled out rather than asked of `ShardClientUtil`.
 *
 * Asking the library the same question the code asks it would only prove the two calls agree. This
 * is the formula discord documents, so a change in either direction shows up here.
 */
const expectedShardFor = ( guildId: string, shardCount: number ) =>
    Number( ( BigInt( guildId ) >> 22n ) % BigInt( shardCount ) );

const A_GUILD = "1110248409761316944",
    ANOTHER_GUILD = "1550989820170604616";

describe( "VertixBot/Definitions/Sharding", () => {
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

    afterEach( () => {
        setShards( originalCount, originalIds );
    } );

    // Every deployment today. The whole point is that this file changes nothing until somebody sets
    // both variables.
    describe( "unsharded, which is the default", () => {
        beforeEach( () => setShards( undefined, undefined ) );

        it( "should hand the client the same options it always had", () => {
            expect( getShardClientOptions() ).toEqual( { shards: "auto" } );
        } );

        it( "should report itself unsharded", () => {
            expect( isSharded() ).toBe( false );
            expect( getShardCount() ).toBeNull();
            expect( getOwnedShardIds() ).toBeNull();
        } );

        it( "should own every guild and the singleton work", () => {
            expect( ownsGuild( A_GUILD ) ).toBe( true );
            expect( ownsGuild( ANOTHER_GUILD ) ).toBe( true );
            expect( ownsSingletonWork() ).toBe( true );
        } );
    } );

    describe( "sharded", () => {
        it( "should give the client its own shards and the total", () => {
            setShards( "4", "0,1" );

            expect( getShardClientOptions() ).toEqual( { shards: [ 0, 1 ], shardCount: 4 } );
            expect( isSharded() ).toBe( true );
        } );

        // Both halves are needed to route a guild, so half an answer is no answer - and falling back
        // to `auto` is the safe direction: one process doing everything, rather than a process that
        // believes it owns a subset it cannot compute.
        it.each( [
            [ "a count with no ids", "4", undefined ],
            [ "ids with no count", undefined, "0,1" ]
        ] )( "should fall back to auto given %s", ( _name, count, ids ) => {
            setShards( count, ids );

            expect( getShardClientOptions() ).toEqual( { shards: "auto" } );
            expect( isSharded() ).toBe( false );
            expect( ownsGuild( A_GUILD ) ).toBe( true );
        } );

        it( "should ignore values that are not shard ids", () => {
            setShards( "not-a-number", "0" );

            expect( getShardClientOptions() ).toEqual( { shards: "auto" } );
        } );

        it( "should route a guild the way discord does", () => {
            const shardCount = 4,
                owner = expectedShardFor( A_GUILD, shardCount );

            setShards( String( shardCount ), String( owner ) );
            expect( ownsGuild( A_GUILD ) ).toBe( true );

            setShards( String( shardCount ), String( ( owner + 1 ) % shardCount ) );
            expect( ownsGuild( A_GUILD ) ).toBe( false );
        } );

        it( "should let exactly one process claim a guild", () => {
            const shardCount = 4;

            const claimants = [ 0, 1, 2, 3 ].filter( ( id ) => {
                setShards( String( shardCount ), String( id ) );

                return ownsGuild( ANOTHER_GUILD );
            } );

            expect( claimants ).toHaveLength( 1 );
        } );

        // Work that belongs to the bot rather than to a shard - the AI client, the top.gg count -
        // has to land on exactly one process, and shard 0 is the one every deployment has.
        it( "should give the singleton work to whoever holds shard 0", () => {
            setShards( "4", "0,1" );
            expect( ownsSingletonWork() ).toBe( true );

            setShards( "4", "2,3" );
            expect( ownsSingletonWork() ).toBe( false );
        } );
    } );
} );
