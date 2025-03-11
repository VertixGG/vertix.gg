import process from "process";

export function isDebugEnabled ( debugType: string, entityName: string ) {
    const envVar = process.env[ `DEBUG_${ debugType }` ];
    if ( !envVar ) return false;

    // Clean up the environment variable string:
    // 1. Split by newlines
    // 2. Filter out empty lines and comments
    // 3. Trim whitespace from each line
    const cleanedEnvVar = envVar
        .split( "\n" )
        .filter( line => line.trim() && !line.trim().startsWith( "#" ) )
        .map( line => line.trim() );

    return cleanedEnvVar.includes( entityName );
}
