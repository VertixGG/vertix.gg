import { GuildActivityModel, toUtcHour } from "@vertix.gg/data/src/models/guild-activity-model";

const GUILD_ID = "820000000000000001",
    GENERATOR_ID = "830000000000000001";

const AT = new Date( "2026-10-06T13:45:12.000Z" );

interface ICountArgs {
    where: object;
    create: object;
    update: object;
}

/**
 * The model off its prototype, with a prisma whose count writes are kept, and answered as `answer` says
 * for each one's attempt - the first, the second. Constructed for real it would want a database; what is
 * checked here is what it asks one to write.
 */
function createModel( answer: ( attempt: number ) => Promise<object> = async() => ( {} ) ) {
    const days: ICountArgs[] = [],
        hours: ICountArgs[] = [],
        generators: ICountArgs[] = [];

    const model = Object.create( GuildActivityModel.prototype ) as GuildActivityModel;

    Object.assign( model, {
        prisma: {
            guild: {
                updateMany: async() => ( { count: 0 } )
            },
            guildActivityDay: {
                upsert: async( args: ICountArgs ) => {
                    days.push( args );

                    return answer( days.length );
                }
            },
            guildActivityHour: {
                upsert: async( args: ICountArgs ) => {
                    hours.push( args );

                    return answer( hours.length );
                }
            },
            guildGeneratorActivityDay: {
                upsert: async( args: ICountArgs ) => {
                    generators.push( args );

                    return answer( generators.length );
                }
            }
        }
    } );

    return { model, days, hours, generators };
}

/**
 * A room is counted in its day, its hour and - told the generator that made it - that generator's day,
 * and each count is the same upsert, raced the same way.
 */
describe( "VertixData/Models/GuildActivityModel/markRoomCreated", () => {
    it( "should count a room in the UTC day and the UTC hour it was made in", async() => {
        // Arrange.
        const { model, days, hours } = createModel();

        // Act.
        await model.markRoomCreated( GUILD_ID, AT );

        // Assert.
        expect( days ).toEqual( [ {
            where: { guildId_day: { guildId: GUILD_ID, day: new Date( "2026-10-06T00:00:00.000Z" ) } },
            create: { guildId: GUILD_ID, day: new Date( "2026-10-06T00:00:00.000Z" ), roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ] );
        expect( hours ).toEqual( [ {
            where: { guildId_hour: { guildId: GUILD_ID, hour: new Date( "2026-10-06T13:00:00.000Z" ) } },
            create: { guildId: GUILD_ID, hour: new Date( "2026-10-06T13:00:00.000Z" ), roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ] );
    } );

    it( "should count a room in its generator's UTC day too, when it is told the generator", async() => {
        // Arrange.
        const { model, generators } = createModel();

        // Act.
        await model.markRoomCreated( GUILD_ID, AT, GENERATOR_ID );

        // Assert - by the generator's discord id, which is what a room holds as `ownerChannelId`.
        expect( generators ).toEqual( [ {
            where: { generatorId_day: { generatorId: GENERATOR_ID, day: new Date( "2026-10-06T00:00:00.000Z" ) } },
            create: { guildId: GUILD_ID, generatorId: GENERATOR_ID, day: new Date( "2026-10-06T00:00:00.000Z" ), roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ] );
    } );

    it( "should count no generator when it is not told one", async() => {
        // Arrange.
        const { model, generators } = createModel();

        // Act.
        await model.markRoomCreated( GUILD_ID, AT );

        // Assert.
        expect( generators ).toEqual( [] );
    } );

    it( "should write a count again when it lost the race to create its row", async() => {
        // Arrange - another room created both rows a moment before this one tried to.
        const { model, days, hours } = createModel( async( attempt ) => {
            if ( 1 === attempt ) {
                throw Object.assign( new Error( "Unique constraint failed" ), { code: "P2002" } );
            }

            return {};
        } );

        // Act.
        await model.markRoomCreated( GUILD_ID, AT );

        // Assert - each count tried twice, the second landing on the row the other room made.
        expect( days ).toHaveLength( 2 );
        expect( hours ).toHaveLength( 2 );
    } );

    it( "should not write again when a count failed for any other reason", async() => {
        // Arrange - the database is not answering.
        const { model, days } = createModel( async() => {
            throw Object.assign( new Error( "Server selection timeout" ), { code: "P2010" } );
        } );

        // Act & Assert.
        await expect( model.markRoomCreated( GUILD_ID, AT ) ).rejects.toThrow( "Server selection timeout" );
        expect( days ).toHaveLength( 1 );
    } );
} );

describe( "VertixData/Models/GuildActivityModel/toUtcHour", () => {
    it( "should file a moment under the start of its UTC hour", () => {
        // Act & Assert.
        expect( toUtcHour( AT ) ).toEqual( new Date( "2026-10-06T13:00:00.000Z" ) );
    } );
} );
