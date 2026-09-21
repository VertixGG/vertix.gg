import process from "process";

/**
 * Function isDebugTypeEnabled() :: Whether a debug type names anything at all.
 *
 * `isDebugEnabled()` answers "is this *entity* named", and the list it looks in has empty lines
 * filtered out of it - so asking it about `""` can never be true, whatever the variable is set to.
 * Two callers were asking exactly that as their outer gate, which meant the block behind them never
 * ran and setting `DEBUG_DISCORD` produced silence rather than logs.
 *
 * This is the question those callers meant: is the variable set, and does it list something.
 */
export function isDebugTypeEnabled( debugType: string ) {
    return 0 < readDebugEntries( debugType ).length;
}

function readDebugEntries( debugType: string ) {
    const envVar = process.env[ `DEBUG_${ debugType }` ];

    if ( !envVar ) return [];

    // Clean up the environment variable string:
    // 1. Split by newlines
    // 2. Filter out empty lines and comments
    // 3. Trim whitespace from each line
    return envVar
        .split( "\n" )
        .filter( line => line.trim() && !line.trim().startsWith( "#" ) )
        .map( line => line.trim() );
}

export function isDebugEnabled( debugType: string, entityName: string ) {
    return readDebugEntries( debugType ).includes( entityName );
}
