/**
 * Carries stored data rows over to the model names `vertix-data` now announces.
 *
 * A data row is filed under `<model name>/<key>` - `ModelDataOwnerBase.normalizeUniqueKeys()`
 * builds it that way - so renaming a model renames the key its rows are meant to live under. The
 * rows themselves do not move, and a lookup under the new name finds nothing: settings read as
 * absent and the bot falls back to its defaults, which is the shape that bug arrives in rather
 * than as an error anyone can trace.
 *
 * Dry run by default, so it can be read before it is trusted.
 *
 *   bun run --env-file=.env scripts/migrate-data-model-keys.ts
 *   bun run --env-file=.env scripts/migrate-data-model-keys.ts --apply
 */

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

/**
 * The prefixes that moved. Longest first, so a prefix that is the start of another cannot shadow
 * it. Only the leading segment is rewritten; the rest of the key names the setting and is left be.
 */
const RENAMES: ReadonlyArray<readonly [ string, string ]> = [
    [ "VertixBot/Managers/GuildCustomization", "VertixData/Managers/GuildCustomization" ],
    [ "VertixBot/VersionStrategies/", "VertixData/VersionStrategies/" ],
    [ "VertixBot/Models/", "VertixData/Models/" ],
    [ "VertixBase/Managers/", "VertixData/Managers/" ],
    [ "VertixBase/Factory/", "VertixData/Factory/" ],
    [ "VertixBase/Models/", "VertixData/Models/" ],
    [ "VertixBase/Bases/", "VertixData/Bases/" ],
    [ "VertixBase/Config/", "VertixData/Config/" ]
];

/** Every collection whose `key` is built from a model name. */
const COLLECTIONS = [ "channelData", "guildData", "userData" ] as const;

const isApply = process.argv.includes( "--apply" );

function renamed( key: string ): string | null {
    for ( const [ from, to ] of RENAMES ) {
        if ( key.startsWith( from ) ) {
            return to + key.slice( from.length );
        }
    }

    return null;
}

async function main() {
    const client = PrismaBotClient.$.getClient();

    let total = 0;

    for ( const name of COLLECTIONS ) {
        const delegate = ( client as unknown as Record<string, {
            findMany: ( args: unknown ) => Promise<Array<{ id: string; key: string }>>;
            update: ( args: unknown ) => Promise<unknown>;
        } > )[ name ];

        if ( ! delegate?.findMany ) {
            console.log( `${ name }: not in the client` );
            continue;
        }

        const rows = await delegate.findMany( { select: { id: true, key: true } } );

        const moves = rows
            .map( ( row ) => ( { id: row.id, from: row.key, to: renamed( row.key ) } ) )
            .filter( ( move ): move is { id: string; from: string; to: string } =>
                null !== move.to && move.to !== move.from );

        if ( ! moves.length ) {
            console.log( `${ name }: nothing to carry over (${ rows.length } rows)` );
            continue;
        }

        console.log( `\n${ name }: ${ moves.length } of ${ rows.length } rows` );

        moves.forEach( ( move ) => console.log( `   ${ move.from }\n   -> ${ move.to }` ) );

        total += moves.length;

        if ( ! isApply ) {
            continue;
        }

        // One row at a time: the unique index is on (ownerId, key, version), so a row whose new key
        // is already taken has to be reported rather than collided into.
        for ( const move of moves ) {
            await delegate.update( { where: { id: move.id }, data: { key: move.to } } )
                .catch( ( error: Error ) =>
                    console.error( `   ! ${ move.from } could not be carried over: ${ error.message }` ) );
        }
    }

    console.log(
        `\n${ total } row(s) ${ isApply ? "carried over." : "would be carried over - pass --apply to write." }`
    );

    await client.$disconnect();
}

await main();
