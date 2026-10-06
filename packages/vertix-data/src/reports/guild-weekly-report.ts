import { addWeeks } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type { IGuildWeeklySummary } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

/**
 * What a server's weekly summary says, worked out from its counts.
 *
 * Kept apart from where the rows come from, as the other reports are, so every figure can be checked
 * against rows made up for it.
 */

export interface IWeeklyDayRow {
    day: Date;
    roomsCreated: number;
}

export interface IWeeklyHourRow {
    hour: Date;
    roomsCreated: number;
}

export interface IWeeklyGeneratorRow {
    generatorId: string;
    day: Date;
    roomsCreated: number;
}

function isWithin( at: Date, from: Date, to: Date ) {
    return at.getTime() >= from.getTime() && at.getTime() < to.getTime();
}

function sumRooms( rows: { roomsCreated: number }[] ) {
    return rows.reduce( ( sum, row ) => sum + row.roomsCreated, 0 );
}

/**
 * Function findBusiestHour() :: The hour the most rooms were made in - the earliest of those that tie.
 */
function findBusiestHour( rows: IWeeklyHourRow[] ): IWeeklyHourRow | null {
    return rows
        .filter( ( row ) => row.roomsCreated > 0 )
        .reduce<IWeeklyHourRow | null>( ( busiest, row ) => {
            if ( ! busiest || row.roomsCreated > busiest.roomsCreated ) {
                return row;
            }

            return row.roomsCreated === busiest.roomsCreated && row.hour.getTime() < busiest.hour.getTime()
                ? row
                : busiest;
        }, null );
}

/**
 * Function findTopGenerator() :: The generator whose rooms were made most - a tie goes to the lower id, so the
 * same rows always name the same generator.
 */
function findTopGenerator( rows: IWeeklyGeneratorRow[] ): IGuildWeeklySummary[ "topGenerator" ] {
    const byGenerator = new Map<string, number>();

    for ( const row of rows ) {
        byGenerator.set( row.generatorId, ( byGenerator.get( row.generatorId ) ?? 0 ) + row.roomsCreated );
    }

    const [ top ] = [ ... byGenerator.entries() ]
        .filter( ( [ , rooms ] ) => rooms > 0 )
        .sort( ( [ idA, roomsA ], [ idB, roomsB ] ) => roomsB - roomsA || idA.localeCompare( idB ) );

    return top ? { generatorId: top[ 0 ], rooms: top[ 1 ] } : null;
}

/**
 * Function buildGuildWeeklySummary() :: One week of a server's rooms and members, beside the week before.
 *
 * Rows outside the weeks they are counted in are left out rather than trusted to have been asked for
 * exactly - a day row from the week after is not this week's.
 */
export function buildGuildWeeklySummary( options: {
    /** Monday 00:00 UTC of the week the summary is about. */
    weekStart: Date;
    /** The server's rooms per day, for this week and the week before it. */
    days: IWeeklyDayRow[];
    /** The server's rooms per hour, for this week. */
    hours: IWeeklyHourRow[];
    /** Its generators' rooms per day, for this week. */
    generators: IWeeklyGeneratorRow[];
    members: number;
    membersBefore: number;
} ): IGuildWeeklySummary {
    const { weekStart } = options,
        weekEnd = addWeeks( weekStart, 1 ),
        weekBefore = addWeeks( weekStart, -1 );

    const busiest = findBusiestHour( options.hours.filter( ( row ) => isWithin( row.hour, weekStart, weekEnd ) ) );

    return {
        weekStart,
        rooms: sumRooms( options.days.filter( ( row ) => isWithin( row.day, weekStart, weekEnd ) ) ),
        roomsBefore: sumRooms( options.days.filter( ( row ) => isWithin( row.day, weekBefore, weekStart ) ) ),
        members: options.members,
        membersBefore: options.membersBefore,
        busiestHour: busiest?.hour ?? null,
        busiestHourRooms: busiest?.roomsCreated ?? 0,
        topGenerator: findTopGenerator( options.generators.filter( ( row ) => isWithin( row.day, weekStart, weekEnd ) ) )
    };
}
