/**
 * Does the gateway honour an explicit shard assignment?
 *
 * Answers that on its own, against a scratch bot, without starting vertix and without touching
 * production. It exists because a two-process production run produced the opposite of what it
 * should have - both processes holding guilds belonging to both shards - and there was no way to
 * tell a library or gateway problem from something in the bot's own startup.
 *
 * It is the control half of that question. Run it first: if the split is correct here and wrong in
 * the bot, the bot is where to look, and every layer below it has been eliminated in one command.
 *
 * Usage, from the repo root:
 *
 *   bun run --env-file=.env scripts/shard-repro.ts [TOKEN_ENV_NAME] [SHARD_COUNT]
 *
 * Defaults to `VERTIX_AI_DISCORD_TOKEN` - a bot in one guild, which makes the reading binary rather
 * than a ratio to squint at: exactly one shard should see it, the rest should see nothing. Point it
 * at any other scratch token by name. Never at a token whose bot is serving anyone: it opens a real
 * gateway connection as that bot, and a bot the gateway thinks is two things at once is a bot
 * answering everything twice.
 */
import { Client, Partials } from "discord.js";

import { createClientCacheFactory, createClientSweepers } from "@vertix.gg/bot/src/definitions/client-cache";

const AS_VERTIX = process.argv.includes( "--as-vertix" );

const TOKEN_ENV_NAME = process.argv.filter( ( a ) => ! a.startsWith( "--" ) )[ 2 ] || "VERTIX_AI_DISCORD_TOKEN",
    SHARD_COUNT = Math.max( 1, Number.parseInt( process.argv.filter( ( a ) => ! a.startsWith( "--" ) )[ 3 ] || "2", 10 ) || 2 ),
    READY_TIMEOUT_MS = 30_000;

const token = ( process.env[ TOKEN_ENV_NAME ] || "" ).trim();

if ( ! token ) {
    console.log( `No token in ${ TOKEN_ENV_NAME }. Pass the name of one that is set.` );
    process.exit( 1 );
}

/**
 * Where discord routes a guild, by discord's own formula, so the expectation is computed rather
 * than assumed - and a change in either direction shows up as the two disagreeing.
 */
const shardFor = ( guildId: string, shardCount: number ) =>
    Number( ( BigInt( guildId ) >> 22n ) % BigInt( shardCount ) );

/**
 * Connects as one shard of `shardCount`, reports what it was given, and disconnects.
 *
 * Sequential rather than concurrent: one gateway session at a time keeps this well inside the
 * identify limits of even a brand new application, and nothing here needs them up together.
 */
async function reportShard( shardId: number, shardCount: number ): Promise<string[]> {
    // `--as-vertix` builds the client the bot builds - its intents, partials, cache factory and
    // sweepers - and nothing else: no services, no command registration, no database. If the split
    // holds here and not in the bot, the difference is something the bot does after this point.
    const client = AS_VERTIX
        ? new Client( {
            intents: [
                "GuildIntegrations",
                "Guilds",
                "GuildVoiceStates",
                "GuildPresences",
                "DirectMessages"
            ],
            partials: [ Partials.Channel ],
            shards: [ shardId ],
            shardCount,
            makeCache: createClientCacheFactory(),
            sweepers: createClientSweepers()
        } )
        : new Client( { intents: [ "Guilds" ], shards: [ shardId ], shardCount } );

    const label = `shards:[${ shardId }] of ${ shardCount }${ AS_VERTIX ? " (vertix options)" : "" }`;

    const settled = new Promise<string[]>( ( resolve ) => {
        let done = false;

        const report = () => {
            if ( done ) return;
            done = true;

            const ids = [ ... client.guilds.cache.keys() ];

            void client.destroy().catch( () => {} );
            resolve( ids );
        };

        // `ready` is renamed to `clientReady` in v15 and both are live in 14.27, so whichever this
        // version emits, one of these catches it.
        client.once( "clientReady", report );
        client.once( "ready", report );

        client.login( token ).catch( ( error ) => {
            console.log( `  ${ label } - login failed: ${ ( error as Error ).message }` );

            if ( ! done ) { done = true; resolve( [] ); }
        } );
    } );

    const timeout = new Promise<string[]>( ( resolve ) => setTimeout( () => {
        console.log( `  ${ label } - timed out waiting for ready` );

        void client.destroy().catch( () => {} );
        resolve( [] );
    }, READY_TIMEOUT_MS ) );

    const ids = await Promise.race( [ settled, timeout ] );

    const wrong = ids.filter( ( id ) => shardFor( id, shardCount ) !== shardId );

    console.log(
        `  ${ label } -> ${ ids.length } guild(s)` +
        ( wrong.length ? `  <-- ${ wrong.length } belong to another shard` : "" )
    );

    for ( const id of ids ) {
        console.log( `      ${ id } (discord routes it to shard ${ shardFor( id, shardCount ) })` );
    }

    return ids;
}

console.log( `Token: ${ TOKEN_ENV_NAME }, shard count: ${ SHARD_COUNT }\n` );

const seen: string[][] = [];

for ( let shardId = 0 ; shardId < SHARD_COUNT ; shardId++ ) {
    seen.push( await reportShard( shardId, SHARD_COUNT ) );
}

// Two ways this fails, and they are worth naming separately: a guild reaching a shard that should
// not have it, and a guild reaching more than one shard at all - the second is what makes two bots
// answer the same server.
const everywhere = seen.flat(),
    duplicated = [ ... new Set( everywhere.filter( ( id, i ) => everywhere.indexOf( id ) !== i ) ) ],
    misrouted = seen.flatMap( ( ids, shardId ) => ids.filter( ( id ) => shardFor( id, SHARD_COUNT ) !== shardId ) );

console.log( `\n  ${ new Set( everywhere ).size } distinct guild(s) across ${ SHARD_COUNT } shard(s)` );

if ( duplicated.length || misrouted.length ) {
    console.log( `  SPLIT IS WRONG - ${ duplicated.length } guild(s) on more than one shard, ${ misrouted.length } misrouted` );
} else {
    console.log( "  split is correct - every guild reached exactly the shard discord routes it to" );
}

process.exit( 0 );
