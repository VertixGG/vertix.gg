import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const PROJECT_ROOT = join( import.meta.dirname, ".." );
const ENV_PATH = join( PROJECT_ROOT, ".env" );

/**
 * What a production build is given on top of `.env` - Paddle's live checkout values, kept apart so the
 * dev servers stay on the sandbox. Git-ignored, and written on the machine that deploys.
 *
 * Handed to the build as its environment rather than left for vite to find: bun has already copied
 * `.env` into the environment, and `loadEnv()` with an empty prefix lets the environment win over every
 * file - so a `.env.production.local` vite read for itself would lose to the sandbox values.
 */
const PRODUCTION_ENV_PATH = join( PROJECT_ROOT, ".env.production.local" );

function parseEnvFile( path = ENV_PATH ) {
    const content = readFileSync( path, "utf-8" );
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
        .filter( ( [ key, value ] ) => key !== "password" && ! value )
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

    if ( ! existsSync( PRODUCTION_ENV_PATH ) ) {
        console.error( `Missing ${ PRODUCTION_ENV_PATH } - a build without it opens Paddle's sandbox checkout in production.` );
        process.exit( 1 );
    }

    console.log( `Building ${ envPrefix.toLowerCase() }...` );

    execSync( buildCommand, {
        cwd: appDir,
        stdio: "inherit",
        env: { ...process.env, ...parseEnvFile( PRODUCTION_ENV_PATH ) },
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
