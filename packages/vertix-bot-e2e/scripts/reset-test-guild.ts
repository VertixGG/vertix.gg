import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DiscordRest } from "@vertix.gg/bot-e2e/src/discord/discord-rest";

import type * as PrismaBot from "@vertix.gg/prisma/._bot-client-internal";

type TChannelType = PrismaBot.E_INTERNAL_CHANNEL_TYPES;

const MASTER_CHANNEL_TYPES: TChannelType[] = [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL" ];

// `DEFAULT_CHANNEL` belongs here because that is what a generator's control panel is stored as. The
// reset deletes the category and discord takes the panel with it, so nothing is left to find - but
// the row stayed, once per run, forever. Eighty-one of them had built up in the test guild before
// anybody counted, every one naming a channel that no longer exists.
const SWEPT_CHANNEL_TYPES: TChannelType[] = [
    ...MASTER_CHANNEL_TYPES,
    "DYNAMIC_CHANNEL",
    "SCALING_CHANNEL",
    "DEFAULT_CHANNEL"
];

interface IChannelRow {
    channelId: string;
    categoryId: string | null;
    internalType: string;
}

function sleep( milliseconds: number ): Promise<void> {
    return new Promise( ( resolve ) => setTimeout( resolve, milliseconds ) );
}

function findRows( guildId: string, types: TChannelType[] ): Promise<IChannelRow[]> {
    return PrismaBotClient.getPrismaClient().channel.findMany( {
        where: { guildId, internalType: { in: types } },
        select: { channelId: true, categoryId: true, internalType: true }
    } );
}

async function pruneOrphanRows( guildId: string, liveIds: Set<string> ): Promise<number> {
    const orphans = ( await findRows( guildId, SWEPT_CHANNEL_TYPES ) )
        .filter( ( row ) => ! liveIds.has( row.channelId ) );

    if ( ! orphans.length ) {
        return 0;
    }

    await PrismaBotClient.getPrismaClient().channel.deleteMany( {
        where: { guildId, channelId: { in: orphans.map( ( row ) => row.channelId ) } }
    } );

    return orphans.length;
}

/**
 * Deleting a generator in discord is the supported way to remove one: the bot hears `channelDelete`,
 * removes every dynamic channel it made and drops its own row. So the reset deletes in discord and
 * then waits for the database to agree.
 *
 * What it will not do is wait for an event nobody is going to send. A row whose channel is already
 * gone from discord is an orphan - the bot was down when it went, and no amount of waiting will make
 * it notice. The first version failed on exactly that, and because the reset runs before every run, a
 * single crash locked the suite out until somebody cleaned the database by hand.
 *
 * So: wait for the bot where waiting can work, prune where it cannot, and fail only when a row's
 * channel is still there and the bot still has not reacted - which is the one case that really does
 * mean the bot is not running.
 */
async function waitForMastersToClear( guildId: string, rest: DiscordRest ): Promise<number> {
    const deadline = Date.now() + E2E_TIMEOUTS.GUILD_RESET_MS;

    while ( Date.now() < deadline ) {
        if ( ! ( await findRows( guildId, MASTER_CHANNEL_TYPES ) ).length ) {
            return 0;
        }

        await sleep( E2E_INTERVALS.POLL_MS );
    }

    const live = new Set( ( await rest.listGuildChannels( guildId ) ).map( ( channel ) => channel.id ) );

    const pruned = await pruneOrphanRows( guildId, live );

    const stubborn = ( await findRows( guildId, MASTER_CHANNEL_TYPES ) )
        .filter( ( row ) => live.has( row.channelId ) );

    if ( stubborn.length ) {
        throw new Error(
            `Guild ${ guildId } still has ${ stubborn.length } master channel(s) the bot has not removed ` +
            `after ${ E2E_TIMEOUTS.GUILD_RESET_MS }ms, and their channels are still in discord - is the bot running?`
        );
    }

    return pruned;
}

async function removeCategoryTrees( rest: DiscordRest, guildId: string, categoryIds: string[] ): Promise<number> {
    if ( ! categoryIds.length ) {
        return 0;
    }

    const channels = await rest.listGuildChannels( guildId );

    const wanted = new Set( categoryIds );

    const children = channels.filter( ( channel ) => channel.parent_id && wanted.has( channel.parent_id ) );

    for ( const child of children ) {
        await rest.deleteChannel( child.id );
    }

    const categories = channels.filter( ( channel ) => wanted.has( channel.id ) && DiscordRest.isCategory( channel ) );

    for ( const category of categories ) {
        await rest.deleteChannel( category.id );
    }

    return children.length + categories.length;
}

async function resetTestGuild(): Promise<void> {
    const config = E2EConfig.$;

    config.assertUsable();

    const rest = new DiscordRest( config.botToken );

    const live = new Set( ( await rest.listGuildChannels( config.guildId ) ).map( ( channel ) => channel.id ) );

    const rows = await findRows( config.guildId, SWEPT_CHANNEL_TYPES );

    // Whatever the bot made and still exists goes back through discord, so the bot sees it happen.
    for ( const row of rows.filter( ( candidate ) => live.has( candidate.channelId ) ) ) {
        await rest.deleteChannel( row.channelId );
    }

    const prunedBefore = await pruneOrphanRows( config.guildId, live );

    const prunedAfter = await waitForMastersToClear( config.guildId, rest );

    const categoryIds = rows
        .filter( ( row ) => MASTER_CHANNEL_TYPES.includes( row.internalType as TChannelType ) )
        .map( ( row ) => row.categoryId )
        .filter( ( categoryId ): categoryId is string => null !== categoryId );

    const removedChannels = await removeCategoryTrees( rest, config.guildId, [ ...new Set( categoryIds ) ] );

    process.stdout.write(
        JSON.stringify( {
            guildId: config.guildId,
            removedMasters: rows.filter( ( row ) => MASTER_CHANNEL_TYPES.includes( row.internalType as TChannelType ) ).length,
            removedChannels,
            prunedOrphanRows: prunedBefore + prunedAfter
        } ) + "\n"
    );
}

await resetTestGuild();

process.exit( 0 );
