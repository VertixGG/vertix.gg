import { GuildModel } from "@vertix.gg/data/src/models/guild-model";

const GUILD_ID = "820000000000000001";

/**
 * The model off its prototype, with a prisma that answers `updateMany` with the count given, and
 * `findMany` with no rows, and keeps what it was asked. Constructed for real it would want a
 * database; what is checked here is the question it asks one.
 */
function createModel( count: number ) {
    const calls: unknown[] = [];

    const model = Object.create( GuildModel.prototype ) as GuildModel;

    Object.assign( model, {
        prisma: {
            guild: {
                updateMany: async( args: unknown ) => {
                    calls.push( args );

                    return { count };
                },
                findMany: async( args: unknown ) => {
                    calls.push( args );

                    return [];
                }
            }
        }
    } );

    return { model, calls };
}

/**
 * A server gets one free trial. What keeps it to one is the filter on the write, not anything that
 * reads first - so the filter is what is pinned.
 */
describe( "VertixData/Models/GuildModel/startTrial", () => {
    it( "should write the date only onto a server that never had a trial", async() => {
        // Arrange.
        const { model, calls } = createModel( 1 );

        const endsAt = new Date( "2026-10-20T12:00:00.000Z" );

        // Act.
        const started = await model.startTrial( GUILD_ID, endsAt );

        // Assert - unset as well as null, because rows written before the field existed lack it.
        expect( started ).toBe( true );
        expect( calls ).toEqual( [ {
            where: { guildId: GUILD_ID, OR: [ { trialEndsAt: { isSet: false } }, { trialEndsAt: null } ] },
            data: { trialEndsAt: endsAt }
        } ] );
    } );

    it( "should say it started nothing for a server that already had its trial", async() => {
        // Arrange - the filter matched no row: this server's date was already there.
        const { model } = createModel( 0 );

        // Act & Assert.
        await expect( model.startTrial( GUILD_ID, new Date( "2026-10-20T12:00:00.000Z" ) ) ).resolves.toBe( false );
    } );
} );

/**
 * A server is told once that its trial is running out. As with the trial itself, what keeps it to
 * once is the filter on the write - two shards and two bots look at the same rows.
 */
describe( "VertixData/Models/GuildModel/claimTrialWarning", () => {
    it( "should take the telling only where nobody has taken it", async() => {
        // Arrange.
        const { model, calls } = createModel( 1 );

        const at = new Date( "2026-10-18T12:00:00.000Z" );

        // Act.
        const claimed = await model.claimTrialWarning( GUILD_ID, at );

        // Assert - unset as well as null, because rows written before the field existed lack it.
        expect( claimed ).toBe( true );
        expect( calls ).toEqual( [ {
            where: { guildId: GUILD_ID, OR: [ { trialWarnedAt: { isSet: false } }, { trialWarnedAt: null } ] },
            data: { trialWarnedAt: at }
        } ] );
    } );

    it( "should say it took nothing when somebody already had", async() => {
        // Arrange - the filter matched no row: the other process got there first.
        const { model } = createModel( 0 );

        // Act & Assert.
        await expect( model.claimTrialWarning( GUILD_ID, new Date( "2026-10-18T12:00:00.000Z" ) ) ).resolves.toBe( false );
    } );
} );

describe( "VertixData/Models/GuildModel/getTrialsToWarn", () => {
    it( "should ask for servers with the bot whose trial is still running out by the cutoff, not yet told", async() => {
        // Arrange.
        const { model, calls } = createModel( 0 );

        const now = new Date( "2026-10-18T12:00:00.000Z" ),
            cutoff = new Date( "2026-10-20T12:00:00.000Z" );

        // Act.
        await model.getTrialsToWarn( now, cutoff );

        // Assert - after `now`, so a trial that already ended is not warned about.
        expect( calls ).toEqual( [ {
            where: {
                isInGuild: true,
                trialEndsAt: { gt: now, lte: cutoff },
                OR: [ { trialWarnedAt: { isSet: false } }, { trialWarnedAt: null } ]
            },
            select: { guildId: true, trialEndsAt: true }
        } ] );
    } );
} );
