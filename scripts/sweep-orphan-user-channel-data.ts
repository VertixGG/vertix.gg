/**
 * Reaps `UserChannelData` rows whose generator is gone.
 *
 * `channelId` names a `Channel` row but was not a relation, so nothing cascaded when that channel
 * was deleted - `cleanup-worker` drops channels on its sweep, `ChannelData` went with them through
 * its own relation, and these rows stayed behind. Nothing reads them and nothing reaped them, so
 * they only ever accumulated.
 *
 * The relation added alongside this script stops new ones arriving. This clears the ones already
 * stranded, and has to run before that relation reaches production: a required relation pointing at
 * a channel that is not there is an inconsistent read waiting for whoever asks for it.
 *
 * Dry run by default, so it can be read before it is trusted.
 *
 *   bun run --env-file=.env scripts/sweep-orphan-user-channel-data.ts
 *   bun run --env-file=.env scripts/sweep-orphan-user-channel-data.ts --apply
 */

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

/** Deleted in batches: one `in` holding every stranded id is a document the server can refuse. */
const DELETE_BATCH_SIZE = 500;

const isApply = process.argv.includes( "--apply" );

async function main() {
    const client = PrismaBotClient.$.getClient();

    const [ rows, channels ] = await Promise.all( [
        client.userChannelData.findMany( { select: { id: true, channelId: true } } ),
        client.channel.findMany( { select: { id: true } } )
    ] );

    const living = new Set( channels.map( ( channel ) => channel.id ) );

    const orphans = rows.filter( ( row ) => ! living.has( row.channelId ) );

    if ( ! orphans.length ) {
        console.log( `Nothing stranded - ${ rows.length } row(s) across ${ living.size } channel(s).` );

        await client.$disconnect();

        return;
    }

    const countsByChannel = new Map<string, number>();

    orphans.forEach( ( row ) =>
        countsByChannel.set( row.channelId, ( countsByChannel.get( row.channelId ) ?? 0 ) + 1 ) );

    console.log(
        `${ orphans.length } of ${ rows.length } row(s) point at ${ countsByChannel.size } channel(s) that are gone:\n`
    );

    countsByChannel.forEach( ( count, channelId ) => console.log( `   ${ channelId }: ${ count } row(s)` ) );

    if ( ! isApply ) {
        console.log( `\n${ orphans.length } row(s) would be reaped - pass --apply to write.` );

        await client.$disconnect();

        return;
    }

    let reaped = 0;

    for ( let index = 0; index < orphans.length; index += DELETE_BATCH_SIZE ) {
        const batch = orphans.slice( index, index + DELETE_BATCH_SIZE );

        const result = await client.userChannelData.deleteMany( {
            where: { id: { in: batch.map( ( row ) => row.id ) } }
        } );

        reaped += result.count;
    }

    console.log( `\n${ reaped } row(s) reaped.` );

    await client.$disconnect();
}

await main();
