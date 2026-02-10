import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const PROJECT_ROOT = join( import.meta.dirname, ".." );
const ENV_PATH = join( PROJECT_ROOT, ".env" );

function parseEnvFile() {
    const content = readFileSync( ENV_PATH, "utf-8" );
    const vars = {};

    for ( const line of content.split( "\n" ) ) {
        const trimmed = line.trim();

        if ( ! trimmed || trimmed.startsWith( "#" ) ) {
            continue;
        }

        const [ key, ...valueParts ] = trimmed.split( "=" );

        if ( key && valueParts.length > 0 ) {
            vars[ key.trim() ] = valueParts.join( "=" ).trim();
        }
    }

    return vars;
}

function resolveDeployConfig( prefix ) {
    const env = parseEnvFile();

    const config = {
        host: env[ `${ prefix }_HOST` ],
        port: env[ `${ prefix }_PORT` ],
        username: env[ `${ prefix }_USERNAME` ],
        password: env[ `${ prefix }_PASSWORD` ],
        deployPath: env[ `${ prefix }_PATH` ],
        sshKey: env[ `${ prefix }_KEY` ],
    };

    const missing = Object.entries( config )
        .filter( ( [ , value ] ) => ! value )
        .map( ( [ key ] ) => `${ prefix }_${ key.toUpperCase() }` );

    if ( missing.length > 0 ) {
        console.error( "Missing required environment variables:" );
        missing.forEach( ( name ) => console.error( `  ${ name }` ) );
        process.exit( 1 );
    }

    return config;
}

function deploy( { envPrefix, appDir, buildCommand } ) {
    const config = resolveDeployConfig( envPrefix );
    const distDir = join( appDir, "dist" );

    console.log( `Building ${ envPrefix.toLowerCase() }...` );

    execSync( buildCommand, {
        cwd: appDir,
        stdio: "inherit",
    } );

    console.log( "Uploading to server and replacing content..." );

    const rsyncCommand = `rsync -avz --progress --delete -e "ssh -p ${ config.port } -i ${ config.sshKey }" "${ distDir }/" ${ config.username }@${ config.host }:${ config.deployPath }/`;

    execSync(
        `expect -c '
            set timeout -1
            spawn ${ rsyncCommand }
            expect {
                "passphrase" { send "${ config.password }\\r"; exp_continue }
                "password:" { send "${ config.password }\\r"; exp_continue }
                "yes/no" { send "yes\\r"; exp_continue }
                eof
            }
        '`,
        {
            stdio: "inherit",
        }
    );

    console.log( "Deployment completed!" );
}

export { deploy, resolveDeployConfig, parseEnvFile, PROJECT_ROOT };
