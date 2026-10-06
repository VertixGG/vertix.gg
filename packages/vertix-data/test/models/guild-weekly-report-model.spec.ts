import { GuildWeeklyReportModel } from "@vertix.gg/data/src/models/guild-weekly-report-model";

const GUILD_ID = "820000000000000001",
    CHANNEL_ID = "830000000000000001",
    APPLICATION_ID = "810000000000000001";

const WEEK = new Date( "2026-09-28T00:00:00.000Z" );

/**
 * The model off its prototype, with a prisma that keeps what it was asked and answers `updateMany`
 * with the count given.
 */
function createModel( count = 1 ) {
    const calls: Record<string, unknown[]> = { upsert: [], updateMany: [], findMany: [] };

    const model = Object.create( GuildWeeklyReportModel.prototype ) as GuildWeeklyReportModel;

    Object.assign( model, {
        prisma: {
            guildWeeklyReport: {
                upsert: async( args: unknown ) => {
                    calls.upsert.push( args );

                    return {};
                },
                updateMany: async( args: unknown ) => {
                    calls.updateMany.push( args );

                    return { count };
                },
                findMany: async( args: unknown ) => {
                    calls.findMany.push( args );

                    return [];
                }
            }
        }
    } );

    return { model, calls };
}

/**
 * A week goes out once. What keeps it to once is the filter on the claim, not anything that reads
 * first - two shards and two bots look at the same rows - so the filter is what is pinned.
 */
describe( "VertixData/Models/GuildWeeklyReportModel", () => {
    describe( "claimWeek()", () => {
        it( "should take a week only where no week as late has been taken", async() => {
            // Arrange.
            const { model, calls } = createModel( 1 );

            // Act.
            const claimed = await model.claimWeek( GUILD_ID, WEEK );

            // Assert - unset as well as null, because rows that never posted lack the field.
            expect( claimed ).toBe( true );
            expect( calls.updateMany ).toEqual( [ {
                where: {
                    guildId: GUILD_ID,
                    OR: [
                        { lastWeekStart: { isSet: false } },
                        { lastWeekStart: null },
                        { lastWeekStart: { lt: WEEK } }
                    ]
                },
                data: { lastWeekStart: WEEK, lastError: null }
            } ] );
        } );

        it( "should say it took nothing when somebody already had", async() => {
            // Arrange - the filter matched no row.
            const { model } = createModel( 0 );

            // Act & Assert.
            await expect( model.claimWeek( GUILD_ID, WEEK ) ).resolves.toBe( false );
        } );
    } );

    describe( "save()", () => {
        it( "should point the summary at the channel under the bot that checked it, and clear the old error", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.save( GUILD_ID, CHANNEL_ID, APPLICATION_ID );

            // Assert - the week last posted is kept: moving the summary does not owe last week twice.
            expect( calls.upsert ).toEqual( [ {
                where: { guildId: GUILD_ID },
                create: { guildId: GUILD_ID, channelId: CHANNEL_ID, applicationId: APPLICATION_ID },
                update: { channelId: CHANNEL_ID, applicationId: APPLICATION_ID, lastError: null }
            } ] );
        } );
    } );

    describe( "getPosting()", () => {
        it( "should ask only for the servers this bot saved a channel for", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.getPosting( APPLICATION_ID );

            // Assert.
            expect( calls.findMany ).toEqual( [ { where: { applicationId: APPLICATION_ID, channelId: { not: null } } } ] );
        } );
    } );
} );
