import fs from "node:fs";
import path from "node:path";

const ENV_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/;

function unquote( value: string ): string {
    const trimmed = value.trim();

    const isQuoted =
        ( trimmed.startsWith( "\"" ) && trimmed.endsWith( "\"" ) ) ||
        ( trimmed.startsWith( "'" ) && trimmed.endsWith( "'" ) );

    return isQuoted ? trimmed.slice( 1, -1 ) : trimmed;
}

export function loadEnvFile( repositoryRoot: string ): void {
    const envPath = path.join( repositoryRoot, ".env" );

    if ( ! fs.existsSync( envPath ) ) {
        return;
    }

    for ( const line of fs.readFileSync( envPath, "utf8" ).split( "\n" ) ) {
        if ( line.trim().startsWith( "#" ) ) {
            continue;
        }

        const matched = ENV_LINE.exec( line );

        if ( ! matched ) {
            continue;
        }

        const [ , key, rawValue ] = matched;

        if ( undefined !== process.env[ key ] ) {
            continue;
        }

        process.env[ key ] = unquote( rawValue );
    }
}
