/**
 * What became of every install: set up, used, still there - and which link brought it.
 *
 * The measure the growth plan is judged by. An install is a server adding the bot; it counts as set up
 * once it made a generator, as used once its members made rooms, and as a server that runs on the bot
 * when it is still there and still making rooms at day 45.
 *
 * Read-only. Three `findMany` calls and nothing else - no update, no delete, no raw query.
 *
 *   bun run --env-file=.env scripts/report-activation.ts
 *   bun run --env-file=.env scripts/report-activation.ts --since=2026-10-01
 *
 * Only what happened after this was deployed is recorded: a server that set up or made rooms before
 * then shows neither until it does it again, and installs before then are unattributed.
 */

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import {
    ACTIVATION_JUDGED_DAY,
    buildActivationReport
} from "@vertix.gg/data/src/reports/activation-report";

import type { IActivationSummary } from "@vertix.gg/data/src/reports/activation-report";

function readSince(): Date {
    const argument = process.argv.find( ( arg ) => arg.startsWith( "--since=" ) );

    if ( ! argument ) {
        return new Date( 0 );
    }

    const since = new Date( `${ argument.slice( "--since=".length ) }T00:00:00.000Z` );

    if ( Number.isNaN( since.getTime() ) ) {
        throw new Error( `Not a date: ${ argument } - use --since=YYYY-MM-DD` );
    }

    return since;
}

function formatDate( at: Date | null ): string {
    return at ? at.toISOString().slice( 0, 10 ) : "-";
}

function formatShare( part: number, whole: number ): string {
    return whole ? `${ part }/${ whole } (${ Math.round( part / whole * 100 ) }%)` : "-";
}

function printSummary( summary: IActivationSummary ) {
    console.log(
        `${ summary.source.padEnd( 24 ) }` +
        `${ String( summary.installs ).padStart( 8 ) }` +
        `${ formatShare( summary.setUpAtOnce, summary.installs ).padStart( 16 ) }` +
        `${ formatShare( summary.setUpEver, summary.installs ).padStart( 16 ) }` +
        `${ formatShare( summary.firstRoomEarly, summary.installs ).padStart( 16 ) }` +
        `${ formatShare( summary.activeRecently, summary.installs ).padStart( 16 ) }` +
        `${ formatShare( summary.stillInstalled, summary.installs ).padStart( 16 ) }` +
        `${ formatShare( summary.aliveAtJudgedDay, summary.judged ).padStart( 16 ) }`
    );
}

async function main() {
    const since = readSince(),
        prisma = PrismaBotClient.$.getClient();

    const [ guilds, installs, days ] = await Promise.all( [
        prisma.guild.findMany( {
            select: {
                guildId: true,
                name: true,
                isInGuild: true,
                createdAt: true,
                joinedAt: true,
                leftAt: true,
                setupAt: true,
                firstRoomAt: true
            }
        } ),
        prisma.guildInstall.findMany( { select: { guildId: true, source: true, createdAt: true } } ),
        prisma.guildActivityDay.findMany( { select: { guildId: true, day: true, roomsCreated: true } } )
    ] );

    const report = buildActivationReport( { guilds, installs, days, now: new Date(), since } );

    console.log( `Installs since ${ formatDate( since ) }: ${ report.installs.length }\n` );

    console.log(
        `${ "Source".padEnd( 24 ) }${ "Installs".padStart( 8 ) }${ "Set up in 24h".padStart( 16 ) }` +
        `${ "Set up ever".padStart( 16 ) }${ "Room in 7d".padStart( 16 ) }${ "Rooms last 7d".padStart( 16 ) }` +
        `${ "Still there".padStart( 16 ) }${ `Alive day ${ ACTIVATION_JUDGED_DAY }`.padStart( 16 ) }`
    );

    report.bySource.forEach( printSummary );

    printSummary( report.total );

    console.log( "\nInstalled    Left         Set up       First room   Rooms 7d  Source                  Server" );

    for ( const install of report.installs ) {
        console.log(
            `${ formatDate( install.installedAt ).padEnd( 13 ) }${ formatDate( install.leftAt ).padEnd( 13 ) }` +
            `${ formatDate( install.setupAt ).padEnd( 13 ) }${ formatDate( install.firstRoomAt ).padEnd( 13 ) }` +
            `${ String( install.roomsRecently ).padStart( 8 ) }  ${ install.source.padEnd( 24 ) }${ install.name } (${ install.guildId })`
        );
    }

    console.log( `\n"Alive day ${ ACTIVATION_JUDGED_DAY }" counts only installs at least ${ ACTIVATION_JUDGED_DAY } days old: still in the server, with rooms in the week before.` );
}

main()
    .catch( ( error ) => {
        console.error( error );

        process.exitCode = 1;
    } )
    .finally( () => PrismaBotClient.$.getClient().$disconnect() );
