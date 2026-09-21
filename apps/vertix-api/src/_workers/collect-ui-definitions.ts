/**
 * Subprocess script for collecting UI definitions with a fresh module cache.
 *
 * Run via `Bun.spawn(["bun", "run", thisFile])` from the main API process.
 * Because this runs as a separate process, it gets its own `globalThis` and
 * module cache — solving the ESM / ServiceLocator caching problem that
 * worker_threads (which share globalThis in Bun) cannot solve.
 *
 * - Logs go to **stderr** (so they don't pollute the result).
 * - The JSON result is written to **stdout** on success.
 * - Exits with code 1 on error.
 */

/**
 * Anything somebody hands to `console`, since all of it goes through `String()`.
 *
 * Written out rather than left open: these five are assigned over the real console, and a signature
 * that accepts everything is how a worker whose stdout is reserved for one json document ends up
 * with a log line in the middle of it.
 */
type TPrintable = string | number | boolean | bigint | symbol | object | null | undefined;

// Redirect ALL console output to stderr BEFORE any imports.
// The Logger class (and many libraries) use console.log which writes to stdout.
// We reserve stdout exclusively for the JSON result.
console.log = ( ...args: TPrintable[] ) => process.stderr.write( args.map( String ).join( " " ) + "\n" );
console.info = ( ...args: TPrintable[] ) => process.stderr.write( args.map( String ).join( " " ) + "\n" );
console.debug = ( ...args: TPrintable[] ) => process.stderr.write( args.map( String ).join( " " ) + "\n" );
console.warn = ( ...args: TPrintable[] ) => process.stderr.write( args.map( String ).join( " " ) + "\n" );
console.error = ( ...args: TPrintable[] ) => process.stderr.write( args.map( String ).join( " " ) + "\n" );

function log( message: string ) {
    process.stderr.write( `[collect-ui-defs] ${ message }\n` );
}

async function main() {
    log( "Starting UI definition collection..." );

    const { bootstrapUIRuntimeHeadless } = await import( "@vertix.gg/bot/src/entrypoint" );
    const { collectUIDefinitions } = await import( "@vertix.gg/gui/src/runtime/ui-definition-exporter" );

    const uiService = await bootstrapUIRuntimeHeadless();

    log( "Headless UI runtime bootstrapped, collecting definitions..." );

    const collections = await collectUIDefinitions( uiService, {
        outputDir: "",
        includeAdapters: true,
        includeComponents: true,
        includeFlows: true
    } );

    log(
        `Collected: ${ collections.meta.counts.flows } flows, ${ collections.meta.counts.components } components, ${ collections.adapters.length } adapters`
    );

    // Write the result as JSON to stdout — the parent process reads this
    process.stdout.write( JSON.stringify( collections ) );

    // Force exit — the headless bootstrap opens DB/Redis connections and timers
    // that would keep the process alive indefinitely.
    process.exit( 0 );
}

try {
    await main();
} catch( error ) {
    log( `Fatal error: ${ error }` );
    process.exit( 1 );
}

export {};
