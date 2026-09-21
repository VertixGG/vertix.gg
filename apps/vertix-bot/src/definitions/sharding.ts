import { ShardClientUtil } from "discord.js";

/**
 * How many shards the bot is split across, in total, counting every process.
 *
 * Unset means the bot is not sharded and discord decides - which is what it has always done.
 */
export const SHARD_COUNT_ENV_KEY = "SHARD_COUNT";

/**
 * Which of those shards *this* process runs, comma separated - "0,1" for the first two.
 *
 * One process per shard group, rather than a `ShardingManager` spawning a child per shard. That is
 * not a stylistic choice: `ecosystem.config.cjs` documents that every app on the box is deliberately
 * one process, because pm2 walks a process tree with a `pgrep -P` per node and that fan-out has
 * already exhausted the macOS process ceiling once and taken the daemon down with it. A manager
 * process spawning children is exactly the tree it cannot supervise.
 *
 * Splitting by environment instead means each shard group is its own pm2 app, one process each,
 * supervised the way everything else there already is.
 */
export const SHARD_IDS_ENV_KEY = "SHARD_IDS";

function readShardCount(): number | null {
    const raw = process.env[ SHARD_COUNT_ENV_KEY ]?.trim();

    if ( ! raw ) {
        return null;
    }

    const count = Number.parseInt( raw, 10 );

    return Number.isInteger( count ) && count > 0 ? count : null;
}

function readShardIds(): number[] | null {
    const raw = process.env[ SHARD_IDS_ENV_KEY ]?.trim();

    if ( ! raw ) {
        return null;
    }

    const ids = raw
        .split( "," )
        .map( ( id ) => Number.parseInt( id.trim(), 10 ) )
        .filter( ( id ) => Number.isInteger( id ) && id >= 0 );

    return ids.length ? ids : null;
}

/**
 * Function getShardCount() :: The total, or null when the bot is not sharded.
 */
export function getShardCount(): number | null {
    return readShardCount();
}

/**
 * Function getOwnedShardIds() :: The shards this process runs, or null when it runs all of them.
 */
export function getOwnedShardIds(): number[] | null {
    return readShardIds();
}

/**
 * Function isSharded() :: Whether the bot is split across processes at all.
 *
 * Both halves are required. A count with no ids does not say which shards this process is, and ids
 * with no count do not say how many there are in total - and discord needs both to route a guild.
 */
export function isSharded(): boolean {
    return null !== readShardCount() && null !== readShardIds();
}

/**
 * Function getShardClientOptions() :: The `shards` and `shardCount` a `Client` should be built with.
 *
 * Unsharded - which is every deployment today - this is `{ shards: "auto" }`, exactly what the bot
 * has always passed. Nothing changes until both environment variables are set.
 */
export function getShardClientOptions(): { shards: "auto" | number[]; shardCount?: number } {
    const shardCount = readShardCount(),
        shardIds = readShardIds();

    if ( null === shardCount || null === shardIds ) {
        return { shards: "auto" };
    }

    return { shards: shardIds, shardCount };
}

/**
 * Function ownsGuild() :: Whether this process is the one holding that guild.
 *
 * Discord routes a guild to `(guild_id >> 22) % shard_count`, which `ShardClientUtil` computes as a
 * static - no `ShardingManager` needed, and no need to have the guild cached to answer.
 *
 * This is what keeps work that must happen exactly once from happening once per shard. Every shard
 * subscribes to the same Redis channels, so without it a single dashboard request would be answered
 * by every process the bot runs in.
 */
export function ownsGuild( guildId: string ): boolean {
    const shardCount = readShardCount(),
        shardIds = readShardIds();

    if ( null === shardCount || null === shardIds ) {
        return true;
    }

    return shardIds.includes( ShardClientUtil.shardIdForGuildId( guildId, shardCount ) );
}

/**
 * Function ownsSingletonWork() :: Whether this process is the one that does the once-per-bot work.
 *
 * Some things belong to the bot rather than to any shard - posting the server count to top.gg, the
 * cleanup worker, and the AI chat client, which is a second gateway connection that would otherwise
 * be opened once per shard process.
 *
 * Shard 0 is the convention. It has no special meaning to discord; it is simply the one every
 * deployment has, so "the process that owns it" names exactly one process without needing anywhere
 * else to agree.
 */
export function ownsSingletonWork(): boolean {
    const shardIds = readShardIds();

    if ( null === shardIds ) {
        return true;
    }

    return shardIds.includes( 0 );
}
