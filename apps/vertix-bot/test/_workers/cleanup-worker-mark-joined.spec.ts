type TGuildRow = { guildId: string; name: string; isInGuild: boolean };

type TReconcile = {
    reconcileGuildRows(
        prisma: unknown,
        ownedGuilds: { guildId: string; name: string }[]
    ): Promise<{ rejoined: number; created: number }>;
};

const A_GUILD = "1550989820170604616",
    A_REJOINED_GUILD = "1549730174306619402",
    AN_UNRECORDED_GUILD = "1110248409761316944";

const guild = ( guildId: string ) => ( { guildId, name: `guild-${ guildId }` } );

/**
 * A table that answers and remembers, rather than a mock that only records the call - the second
 * query reads what the first wrote, so a double that forgets would make the create step untestable.
 */
function makeTable( rows: TGuildRow[] ) {
    const calls: { updateMany: unknown[]; createMany: unknown[] } = { updateMany: [], createMany: [] };

    const prisma = {
        guild: {
            updateMany: async( args: { where: { guildId: { in: string[] }; isInGuild: boolean }; data: { isInGuild: boolean } } ) => {
                calls.updateMany.push( args );

                const matched = rows.filter( ( row ) =>
                    args.where.guildId.in.includes( row.guildId ) && row.isInGuild === args.where.isInGuild );

                matched.forEach( ( row ) => ( row.isInGuild = args.data.isInGuild ) );

                return { count: matched.length };
            },

            findMany: async( args: { where: { guildId: { in: string[] } } } ) => (
                rows.filter( ( row ) => args.where.guildId.in.includes( row.guildId ) )
                    .map( ( row ) => ( { guildId: row.guildId } ) )
            ),

            createMany: async( args: { data: TGuildRow[] } ) => {
                calls.createMany.push( args );

                rows.push( ... args.data );

                return { count: args.data.length };
            }
        }
    };

    return { prisma, rows, calls };
}

async function makeReconcile() {
    const { CleanupWorker } = await import( "@vertix.gg/bot/src/_workers/cleanup-worker" );

    const prototype = CleanupWorker.prototype as unknown as TReconcile;

    const state = { reconcileGuildRows: prototype.reconcileGuildRows };

    return ( prisma: unknown, ownedGuilds: { guildId: string; name: string }[] ) =>
        ( state as unknown as TReconcile ).reconcileGuildRows.call( state, prisma, ownedGuilds );
}

/**
 * What keeps `isInGuild` true for a server the bot is in.
 *
 * The column has one writer that can turn it back on - `GuildManager.onJoin()`, off `guildCreate` -
 * and discord.js raises that only for a guild joined after `ready`, never for the ones that arrive
 * during startup. So a bot removed from a server and added back while it was down kept the `false`
 * its leave wrote, and every screen reading the column said it was not in a server it was in.
 */
describe( "VertixBot/Workers/CleanupWorker/reconcileGuildRows", () => {
    it( "should turn a row back on for a guild it is holding", async() => {
        const { prisma, rows } = makeTable( [
            { ... guild( A_REJOINED_GUILD ), isInGuild: false }
        ] );

        const reconcile = await makeReconcile();

        expect( await reconcile( prisma, [ guild( A_REJOINED_GUILD ) ] ) )
            .toEqual( { rejoined: 1, created: 0 } );

        expect( rows[ 0 ].isInGuild ).toBe( true );
    } );

    it( "should write a row for a guild it has never recorded", async() => {
        const { prisma, rows } = makeTable( [] );

        const reconcile = await makeReconcile();

        expect( await reconcile( prisma, [ guild( AN_UNRECORDED_GUILD ) ] ) )
            .toEqual( { rejoined: 0, created: 1 } );

        expect( rows ).toEqual( [ { ... guild( AN_UNRECORDED_GUILD ), isInGuild: true } ] );
    } );

    it( "should leave a row that already says so alone", async() => {
        const { prisma, calls } = makeTable( [ { ... guild( A_GUILD ), isInGuild: true } ] );

        const reconcile = await makeReconcile();

        expect( await reconcile( prisma, [ guild( A_GUILD ) ] ) ).toEqual( { rejoined: 0, created: 0 } );
        expect( calls.createMany ).toHaveLength( 0 );
    } );

    /**
     * The half that keeps a shard to its own guilds. The caller passes this process's cache, so a
     * guild another shard holds is never in the list - but the query must be bounded by that list
     * rather than by `isInGuild: false` alone, which would claim every left guild in the table.
     */
    it( "should name only the guilds it was given", async() => {
        const { prisma, rows, calls } = makeTable( [
            { ... guild( A_REJOINED_GUILD ), isInGuild: false },
            { ... guild( A_GUILD ), isInGuild: false }
        ] );

        const reconcile = await makeReconcile();

        expect( await reconcile( prisma, [ guild( A_REJOINED_GUILD ) ] ) )
            .toEqual( { rejoined: 1, created: 0 } );

        expect( calls.updateMany[ 0 ] ).toMatchObject( {
            where: { guildId: { in: [ A_REJOINED_GUILD ] }, isInGuild: false }
        } );

        // The other shard's guild is still recorded as left, which is its own shard's business.
        expect( rows.find( ( row ) => A_GUILD === row.guildId )?.isInGuild ).toBe( false );
    } );
} );

type TJoinRow = { guildId: string; joinedAt: Date | null; leftAt?: Date | null };

/**
 * A table of join times that answers and remembers, like the one above.
 */
function makeJoinTable( rows: TJoinRow[] ) {
    const updates: { where: { guildId: string }; data: { joinedAt: Date; leftAt: null } }[] = [];

    const prisma = {
        guild: {
            findMany: async( args: { where: { guildId: { in: string[] } } } ) =>
                rows.filter( ( row ) => args.where.guildId.in.includes( row.guildId ) )
                    .map( ( row ) => ( { guildId: row.guildId, joinedAt: row.joinedAt } ) ),

            update: async( args: { where: { guildId: string }; data: { joinedAt: Date; leftAt: null } } ) => {
                updates.push( args );

                const row = rows.find( ( candidate ) => candidate.guildId === args.where.guildId );

                if ( row ) {
                    Object.assign( row, args.data );
                }

                return row;
            }
        }
    };

    return { prisma, rows, updates };
}

async function makeRecordJoinTimes() {
    const { CleanupWorker } = await import( "@vertix.gg/bot/src/_workers/cleanup-worker" );

    type TRecordJoinTimes = typeof CleanupWorker.prototype[ "recordJoinTimes" ];

    const asPrisma = ( fake: object ): Parameters<TRecordJoinTimes>[ 0 ] => fake as Parameters<TRecordJoinTimes>[ 0 ];

    return ( prisma: object, ownedGuilds: { guildId: string; joinedAt: Date }[] ) =>
        CleanupWorker.prototype[ "recordJoinTimes" ].call( {}, asPrisma( prisma ), ownedGuilds );
}

/**
 * What gives every install a join time to be measured from.
 *
 * A join reaches the row only through `guildCreate`, which discord.js does not raise for the guilds
 * that arrive at startup - so a server added while the bot was down, and every server from before join
 * times were recorded, would otherwise have none.
 */
describe( "VertixBot/Workers/CleanupWorker/recordJoinTimes", () => {
    const JOINED = new Date( "2026-09-20T10:00:00.000Z" );

    it( "should give a row with no join time the one discord has", async() => {
        const { prisma, rows } = makeJoinTable( [ { guildId: A_GUILD, joinedAt: null } ] );

        const recordJoinTimes = await makeRecordJoinTimes();

        expect( await recordJoinTimes( prisma, [ { guildId: A_GUILD, joinedAt: JOINED } ] ) ).toBe( 1 );
        expect( rows[ 0 ] ).toMatchObject( { joinedAt: JOINED, leftAt: null } );
    } );

    it( "should move a join time forward for a server that added the bot again while it was down", async() => {
        const { prisma, rows } = makeJoinTable( [
            { guildId: A_REJOINED_GUILD, joinedAt: new Date( "2026-01-01T00:00:00.000Z" ), leftAt: new Date( "2026-05-01T00:00:00.000Z" ) }
        ] );

        const recordJoinTimes = await makeRecordJoinTimes();

        await recordJoinTimes( prisma, [ { guildId: A_REJOINED_GUILD, joinedAt: JOINED } ] );

        expect( rows[ 0 ] ).toMatchObject( { joinedAt: JOINED, leftAt: null } );
    } );

    it( "should leave a row that already has this join alone", async() => {
        const { prisma, updates } = makeJoinTable( [ { guildId: A_GUILD, joinedAt: JOINED } ] );

        const recordJoinTimes = await makeRecordJoinTimes();

        expect( await recordJoinTimes( prisma, [ { guildId: A_GUILD, joinedAt: JOINED } ] ) ).toBe( 0 );
        expect( updates ).toHaveLength( 0 );
    } );

    it( "should not write a row that does not exist", async() => {
        const { prisma, updates } = makeJoinTable( [] );

        const recordJoinTimes = await makeRecordJoinTimes();

        await recordJoinTimes( prisma, [ { guildId: AN_UNRECORDED_GUILD, joinedAt: JOINED } ] );

        expect( updates ).toHaveLength( 0 );
    } );
} );
