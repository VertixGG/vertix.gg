import { GuildVoiceMemberModel } from "@vertix.gg/data/src/models/guild-voice-member-model";

const GUILD_ID = "820000000000000001",
    USER_ID = "840000000000000001";

const DAY = new Date( "2026-10-06T00:00:00.000Z" );

/**
 * The model off its prototype, with a prisma that keeps what it was asked and answers as told.
 * Constructed for real it would want a database; what is checked here is the question it asks one.
 */
function createModel( answers: { upsert?: () => Promise<object>; findMany?: () => Promise<object[]> } = {} ) {
    const calls: Record<string, unknown[]> = { upsert: [], findMany: [], deleteMany: [] };

    const model = Object.create( GuildVoiceMemberModel.prototype ) as GuildVoiceMemberModel;

    Object.assign( model, {
        prisma: {
            guildVoiceMemberDay: {
                upsert: async( args: unknown ) => {
                    calls.upsert.push( args );

                    return answers.upsert ? answers.upsert() : {};
                },
                findMany: async( args: unknown ) => {
                    calls.findMany.push( args );

                    return answers.findMany ? answers.findMany() : [];
                },
                deleteMany: async( args: unknown ) => {
                    calls.deleteMany.push( args );

                    return { count: 4 };
                }
            }
        }
    } );

    return { model, calls };
}

describe( "VertixData/Models/GuildVoiceMemberModel", () => {
    describe( "markPresent()", () => {
        it( "should write the member's day once, however often it is noted", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            await model.markPresent( GUILD_ID, USER_ID, DAY );

            // Assert - an upsert that changes nothing on a row already there.
            expect( calls.upsert ).toEqual( [ {
                where: { guildId_day_userId: { guildId: GUILD_ID, day: DAY, userId: USER_ID } },
                create: { guildId: GUILD_ID, day: DAY, userId: USER_ID },
                update: {}
            } ] );
        } );

        it( "should take losing the race to create the day's row as the row being there", async() => {
            // Arrange - two shards noted the same member in the same moment.
            const { model } = createModel( {
                upsert: async() => {
                    throw Object.assign( new Error( "Unique constraint failed" ), { code: "P2002" } );
                }
            } );

            // Act & Assert.
            await expect( model.markPresent( GUILD_ID, USER_ID, DAY ) ).resolves.toBeUndefined();
        } );

        it( "should not swallow any other failure", async() => {
            // Arrange.
            const { model } = createModel( {
                upsert: async() => {
                    throw Object.assign( new Error( "Server selection timeout" ), { code: "P2010" } );
                }
            } );

            // Act & Assert.
            await expect( model.markPresent( GUILD_ID, USER_ID, DAY ) ).rejects.toThrow( "Server selection timeout" );
        } );
    } );

    describe( "countMembers()", () => {
        it( "should count each member once over the days asked for", async() => {
            // Arrange.
            const { model, calls } = createModel( { findMany: async() => [ { userId: "a" }, { userId: "b" } ] } );

            const from = new Date( "2026-09-30T00:00:00.000Z" );

            // Act.
            const count = await model.countMembers( GUILD_ID, from, DAY );

            // Assert.
            expect( count ).toBe( 2 );
            expect( calls.findMany ).toEqual( [ {
                where: { guildId: GUILD_ID, day: { gte: from, lt: DAY } },
                select: { userId: true },
                distinct: [ "userId" ]
            } ] );
        } );
    } );

    describe( "deleteBefore()", () => {
        it( "should delete every server's days before the one given", async() => {
            // Arrange.
            const { model, calls } = createModel();

            // Act.
            const deleted = await model.deleteBefore( DAY );

            // Assert.
            expect( deleted ).toBe( 4 );
            expect( calls.deleteMany ).toEqual( [ { where: { day: { lt: DAY } } } ] );
        } );
    } );
} );
