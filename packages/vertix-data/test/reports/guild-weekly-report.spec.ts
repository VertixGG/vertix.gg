import { buildGuildWeeklySummary } from "@vertix.gg/data/src/reports/guild-weekly-report";

/** Monday 28 September 2026 - the week the summary is about. */
const WEEK = new Date( "2026-09-28T00:00:00.000Z" );

const at = ( iso: string ) => new Date( iso );

function build( options: Partial<Parameters<typeof buildGuildWeeklySummary>[ 0 ]> = {} ) {
    return buildGuildWeeklySummary( {
        weekStart: WEEK,
        days: [],
        hours: [],
        generators: [],
        members: 0,
        membersBefore: 0,
        ... options
    } );
}

/**
 * What a weekly summary says, from the rows it is given. Each figure is held to its own week, so a row
 * that strayed in from the week after cannot inflate the one being summed.
 */
describe( "VertixData/Reports/GuildWeeklyReport", () => {
    it( "should add up the week's rooms and the week before's apart", () => {
        // Act.
        const summary = build( {
            days: [
                { day: at( "2026-09-28T00:00:00.000Z" ), roomsCreated: 4 },
                { day: at( "2026-10-04T00:00:00.000Z" ), roomsCreated: 6 },
                { day: at( "2026-09-21T00:00:00.000Z" ), roomsCreated: 3 },
                { day: at( "2026-09-27T00:00:00.000Z" ), roomsCreated: 2 }
            ]
        } );

        // Assert.
        expect( summary ).toMatchObject( { rooms: 10, roomsBefore: 5 } );
    } );

    it( "should leave out a day from the week after", () => {
        // Act.
        const summary = build( { days: [ { day: at( "2026-10-05T00:00:00.000Z" ), roomsCreated: 9 } ] } );

        // Assert.
        expect( summary.rooms ).toBe( 0 );
    } );

    it( "should carry the members counted for each week as they were given", () => {
        // Act & Assert.
        expect( build( { members: 31, membersBefore: 27 } ) ).toMatchObject( { members: 31, membersBefore: 27 } );
    } );

    it( "should name the hour the most rooms were made in, the earliest of those that tie", () => {
        // Act.
        const summary = build( {
            hours: [
                { hour: at( "2026-10-02T21:00:00.000Z" ), roomsCreated: 6 },
                { hour: at( "2026-09-29T19:00:00.000Z" ), roomsCreated: 6 },
                { hour: at( "2026-09-30T12:00:00.000Z" ), roomsCreated: 2 }
            ]
        } );

        // Assert.
        expect( summary.busiestHour ).toEqual( at( "2026-09-29T19:00:00.000Z" ) );
        expect( summary.busiestHourRooms ).toBe( 6 );
    } );

    it( "should name the generator with the most rooms over the week, a tie going to the lower id", () => {
        // Act.
        const summary = build( {
            generators: [
                { generatorId: "830000000000000002", day: at( "2026-09-28T00:00:00.000Z" ), roomsCreated: 3 },
                { generatorId: "830000000000000002", day: at( "2026-09-30T00:00:00.000Z" ), roomsCreated: 4 },
                { generatorId: "830000000000000001", day: at( "2026-10-01T00:00:00.000Z" ), roomsCreated: 7 },
                { generatorId: "830000000000000003", day: at( "2026-10-05T00:00:00.000Z" ), roomsCreated: 50 }
            ]
        } );

        // Assert - the third generator's rooms were made the week after, so they are not this week's.
        expect( summary.topGenerator ).toEqual( { generatorId: "830000000000000001", rooms: 7 } );
    } );

    it( "should name no hour and no generator for a week with no rooms", () => {
        // Act.
        const summary = build();

        // Assert.
        expect( summary ).toMatchObject( { rooms: 0, busiestHour: null, busiestHourRooms: 0, topGenerator: null } );
    } );
} );
