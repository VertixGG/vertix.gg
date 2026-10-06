import { GuildModel } from "@vertix.gg/data/src/models/guild-model";

const GUILD_ID = "820000000000000001";

/**
 * The model off its prototype, with a prisma that answers `updateMany` with the count given and
 * keeps what it was asked. Constructed for real it would want a database; what is checked here is
 * the question it asks one.
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
