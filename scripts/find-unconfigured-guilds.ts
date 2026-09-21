/**
 * Counts the servers that installed the bot and never got a working generator.
 *
 * Between 2026-09-05 and 2026-09-16 the bot asked for channel overwrites it did not hold, so
 * Discord refused the whole create and setup failed silently. What nobody has measured is how many
 * servers that cost - and, more usefully, whether the rate came back down after the fix, which is
 * the only evidence we have that it worked on somebody else's server rather than a test guild.
 *
 * A month-by-month rate is printed rather than a bare total, because installing a bot and never
 * opening it is ordinary: a guild that never configured means nothing without the background rate
 * to read it against.
 *
 * Read-only. Two `findMany` calls and nothing else - no update, no delete, no raw query.
 *
 *   bun run --env-file=.env scripts/find-unconfigured-guilds.ts
 */

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { MASTER_INTERNAL_TYPES } from "@vertix.gg/data/src/models/channel/channel-model";

/** The window the permission bug was live in. */
const BUG_WINDOW_START = new Date( "2026-09-05T00:00:00.000Z" ),
    BUG_WINDOW_END = new Date( "2026-09-17T00:00:00.000Z" );

/**
 * Squad Zero, which hit the bug and removed the bot. It is known to belong in the results, so it
 * doubles as the check on them: if this is reported missing, the query is wrong and the rest of
 * the output should not be believed.
 */
const KNOWN_CASUALTY_GUILD_ID = "1548866455599185980";

/** Long enough to have opened the interface at all. Below it, leaving reads as a failed setup. */
const GAVE_UP_QUICKLY_HOURS = 24;

type GuildRow = {
    guildId: string;
    name: string;
    isInGuild: boolean;
    createdAt: Date;
    updatedAt: Date;
};

function monthOf( date: Date ) {
    return `${ date.getUTCFullYear() }-${ String( date.getUTCMonth() + 1 ).padStart( 2, "0" ) }`;
}

function hoursBetween( from: Date, to: Date ) {
    return ( to.getTime() - from.getTime() ) / ( 1000 * 60 * 60 );
}

function formatDuration( hours: number ) {
    if ( hours < 24 ) {
        return `${ hours.toFixed( 1 ) }h`;
    }

    return `${ Math.floor( hours / 24 ) }d`;
}

/**
 * `updatedAt` is the last time anything on the row changed, so it dates a departure only for a
 * guild that has left - and even then only as "no later than". It is the closest the schema gets.
 */
function isInBugWindow( date: Date ) {
    return date >= BUG_WINDOW_START && date < BUG_WINDOW_END;
}

function printMonthlyRates( guilds: GuildRow[], unconfigured: Set<string> ) {
    const byMonth = new Map<string, { installed: number; unconfigured: number }>();

    guilds.forEach( ( guild ) => {
        const month = monthOf( guild.createdAt ),
            row = byMonth.get( month ) ?? { installed: 0, unconfigured: 0 };

        row.installed++;

        if ( unconfigured.has( guild.guildId ) ) {
            row.unconfigured++;
        }

        byMonth.set( month, row );
    } );

    console.log( "\nMonth      Installed   Never configured   Rate" );

    [ ...byMonth.entries() ]
        .sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
        .forEach( ( [ month, row ] ) => {
            const rate = row.installed ? Math.round( ( row.unconfigured / row.installed ) * 100 ) : 0;

            console.log(
                `${ month }   ${ String( row.installed ).padStart( 9 ) }   ${ String( row.unconfigured ).padStart( 16 ) }   ${ String( rate ).padStart( 3 ) }%`
            );
        } );
}

function printBugWindow( unconfiguredGuilds: GuildRow[] ) {
    const joinedInWindow = unconfiguredGuilds.filter( ( guild ) => isInBugWindow( guild.createdAt ) );

    const stillPresent = joinedInWindow.filter( ( guild ) => guild.isInGuild ),
        gone = joinedInWindow.filter( ( guild ) => ! guild.isInGuild ),
        goneQuickly = gone.filter( ( guild ) => hoursBetween( guild.createdAt, guild.updatedAt ) < GAVE_UP_QUICKLY_HOURS ),
        goneLater = gone.filter( ( guild ) => hoursBetween( guild.createdAt, guild.updatedAt ) >= GAVE_UP_QUICKLY_HOURS );

    console.log( `\n${ BUG_WINDOW_START.toISOString().slice( 0, 10 ) } to ${ BUG_WINDOW_END.toISOString().slice( 0, 10 ) }, never configured` );
    console.log( `  Still present                 : ${ stillPresent.length }` );
    console.log( `  Left within ${ GAVE_UP_QUICKLY_HOURS }h              : ${ goneQuickly.length }` );
    console.log( `  Left later                    : ${ goneLater.length }` );

    if ( goneQuickly.length ) {
        console.log( `\n  Left within ${ GAVE_UP_QUICKLY_HOURS }h:` );

        goneQuickly
            .sort( ( a, b ) => a.createdAt.getTime() - b.createdAt.getTime() )
            .forEach( ( guild ) => {
                const lasted = formatDuration( hoursBetween( guild.createdAt, guild.updatedAt ) );

                console.log(
                    `    ${ guild.name.slice( 0, 28 ).padEnd( 28 ) } ${ guild.guildId }  joined ${ guild.createdAt.toISOString().slice( 5, 10 ) }  lasted ${ lasted }`
                );
            } );
    }
}

function printSelfCheck( guilds: GuildRow[], unconfigured: Set<string> ) {
    const known = guilds.find( ( guild ) => guild.guildId === KNOWN_CASUALTY_GUILD_ID );

    console.log( "\nSelf-check" );

    if ( ! known ) {
        console.log( `  ${ KNOWN_CASUALTY_GUILD_ID }: NO GUILD ROW - the query is wrong, ignore the numbers above` );
        return;
    }

    if ( ! unconfigured.has( known.guildId ) ) {
        console.log( `  ${ known.name }: has a master channel, so it is NOT counted - expected it to be, ignore the numbers above` );
        return;
    }

    const lasted = formatDuration( hoursBetween( known.createdAt, known.updatedAt ) );

    console.log(
        `  ${ known.name }: FOUND, ${ known.isInGuild ? "still present" : "left" }, joined ${ known.createdAt.toISOString().slice( 0, 10 ) }, lasted ${ lasted }`
    );
}

async function main() {
    const client = PrismaBotClient.$.getClient();

    // Every guild that ever got a working generator.
    const configured = new Set(
        ( await client.channel.findMany( {
            where: { internalType: { in: MASTER_INTERNAL_TYPES } },
            select: { guildId: true }
        } ) ).map( ( channel ) => channel.guildId )
    );

    const guilds = await client.guild.findMany( {
        select: { guildId: true, name: true, isInGuild: true, createdAt: true, updatedAt: true }
    } ) as GuildRow[];

    const unconfiguredGuilds = guilds.filter( ( guild ) => ! configured.has( guild.guildId ) ),
        unconfigured = new Set( unconfiguredGuilds.map( ( guild ) => guild.guildId ) );

    console.log( `Guilds: ${ guilds.length }   with a generator: ${ configured.size }   never configured: ${ unconfiguredGuilds.length }` );

    printMonthlyRates( guilds, unconfigured );
    printBugWindow( unconfiguredGuilds );
    printSelfCheck( guilds, unconfigured );

    console.log( "\nRead the months, not the window. A spike only means something against the background rate,\nand the months after 2026-09-16 are what say whether the fix held." );
}

await main();
