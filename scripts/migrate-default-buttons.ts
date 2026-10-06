/**
 * Gives a deployment's stored v3 default button set the buttons the source has added to it since.
 *
 * The master channel config is a row in the database, and the row is how a deployment is set: on
 * startup the bot brings the row to the shape the source has but keeps every value it holds
 * (`ConfigBase.syncWithDefaults()`). `/setup` and the dashboard both create a generator from that
 * row, so a button added to the source's default set reaches no generator at all until the row is
 * given it too - this is that, for the buttons listed below.
 *
 * Dry run by default, so it can be read before it is trusted. A running bot holds the row in
 * memory, so restart it after `--apply`.
 *
 *   bun run --env-file=.env scripts/migrate-default-buttons.ts
 *   bun run --env-file=.env scripts/migrate-default-buttons.ts --apply
 */

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { MAX_BUTTONS_PER_SET } from "@vertix.gg/definitions/src/button-ids";
import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

/**
 * The buttons that joined the v3 default set, each with the button it goes in front of - a new
 * generator prints its buttons in the order its set holds them.
 *
 * Listed rather than read off the source's defaults: a button a deployment took out of its default
 * set on purpose is not one to put back, only a button the source has added since.
 */
const ADDED: ReadonlyArray<{ id: string; before: string }> = [
    { id: "lfm", before: "claim-button" }
];

const isApply = process.argv.includes( "--apply" );

function isJsonObject( value: PrismaBot.Prisma.JsonValue | undefined ): value is PrismaBot.Prisma.JsonObject {
    return !! value && "object" === typeof value && ! Array.isArray( value );
}

function toIds( value: PrismaBot.Prisma.JsonValue | undefined ): string[] {
    return Array.isArray( value ) ? value.filter( ( id ): id is string => "string" === typeof id ) : [];
}

async function main() {
    const client = PrismaBotClient.$.getClient();

    const row = await client.config.findUnique( {
        where: { key_version: { key: "Vertix/Config/MasterChannel", version: VERSION_UI_V3 } }
    } );

    const stored = row?.object ?? undefined;

    if ( ! row || ! isJsonObject( stored ) ) {
        console.log( "No v3 master channel config row - the bot writes one from the source's defaults on its next start." );

        await client.$disconnect();

        return;
    }

    const current = toIds( stored.dynamicChannelButtonsTemplate ),
        next = [ ... current ];

    for ( const { id, before } of ADDED ) {
        if ( next.includes( id ) ) {
            console.log( `${ id }: already in the default set` );
            continue;
        }

        if ( MAX_BUTTONS_PER_SET <= next.length ) {
            console.log( `${ id }: not added - the default set already holds ${ MAX_BUTTONS_PER_SET }, the most a set can` );
            continue;
        }

        const at = next.indexOf( before );

        next.splice( -1 === at ? next.length : at, 0, id );

        console.log( `${ id }: added ${ -1 === at ? "at the end" : `before ${ before }` }` );
    }

    if ( next.length === current.length ) {
        console.log( "\nNothing to write." );

        await client.$disconnect();

        return;
    }

    console.log( `\nbefore (${ current.length }): ${ current.join( ", " ) }` );
    console.log( `after  (${ next.length }): ${ next.join( ", " ) }` );

    if ( ! isApply ) {
        console.log( "\nDry run - pass --apply to write." );

        await client.$disconnect();

        return;
    }

    await client.config.update( {
        where: { id: row.id },
        data: { object: { ... stored, dynamicChannelButtonsTemplate: next } }
    } );

    console.log( "\nWritten. Restart the bot - a running one holds the set it read at startup." );

    await client.$disconnect();
}

await main();
