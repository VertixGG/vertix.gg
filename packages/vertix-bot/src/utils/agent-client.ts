import * as fsNative from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import { spawn } from "child_process";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const REPO_ROOT = path.resolve( __dirname, "../../../../" );

const MAX_DISCORD_RESPONSE_LENGTH = 1900;
const MAX_LOG_BUFFER_LENGTH = 8000;
const HELP_TIMEOUT_MS = 3000;
const CODEX_TIMEOUT_MS = 60000;

let codexBinaryPromise: Promise<string | null> | null = null;

export const isOpenAIConfigured = () => true;

function appendToLimitedBuffer( current: string, chunk: string ) {
    if ( current.length >= MAX_LOG_BUFFER_LENGTH ) {
        return current;
    }

    const remaining = MAX_LOG_BUFFER_LENGTH - current.length;

    return current + chunk.slice( 0, remaining );
}

async function isOpenAICodexCli( binaryPath: string ): Promise<boolean> {
    return await new Promise( ( resolve ) => {
        const child = spawn( binaryPath, [ "--help" ], {
            cwd: REPO_ROOT,
            env: {
                ...process.env,
                NODE_OPTIONS: "",
                NODE_PATH: ""
            }
        } );

        const timeout = setTimeout( () => {
            child.kill();
            resolve( false );
        }, HELP_TIMEOUT_MS );

        let stdout = "";
        let stderr = "";

        child.stdout.on( "data", ( data ) => {
            stdout = appendToLimitedBuffer( stdout, data.toString() );
        } );

        child.stderr.on( "data", ( data ) => {
            stderr = appendToLimitedBuffer( stderr, data.toString() );
        } );

        child.on( "error", () => {
            clearTimeout( timeout );
            resolve( false );
        } );

        child.on( "close", ( code ) => {
            clearTimeout( timeout );

            if ( code !== 0 ) {
                return resolve( false );
            }

            const combined = `${ stdout }\n${ stderr }`;

            resolve( combined.includes( "Codex CLI" ) || combined.includes( "OpenAI Codex" ) );
        } );
    } );
}

async function resolveCodexBinary(): Promise<string | null> {
    const configured = process.env.AI_CHAT_CODEX_BIN?.trim();

    if ( configured ) {
        const isValid = await isOpenAICodexCli( configured );

        if ( isValid ) {
            return configured;
        }

        GlobalLogger.$.error(
            resolveCodexBinary,
            `AI_CHAT_CODEX_BIN is set but does not look like OpenAI Codex CLI: '${ configured }'`
        );

        return null;
    }

    const pathValue = process.env.PATH ?? "";
    const entries = pathValue
        .split( path.delimiter )
        .map( ( entry ) => entry.trim() )
        .filter( ( entry ) => entry.length > 0 );

    const repoNodeModulesPrefix = path.join( REPO_ROOT, "node_modules" ) + path.sep;

    const names = process.platform === "win32"
        ? [ "codex.exe", "codex.cmd", "codex.bat", "codex" ]
        : [ "codex" ];

    for ( const dir of entries ) {
        for ( const name of names ) {
            const candidate = path.join( dir, name );

            const realPath = await fs.realpath( candidate ).catch( () => null );

            if ( !realPath ) {
                continue;
            }

            if ( realPath.startsWith( repoNodeModulesPrefix ) ) {
                continue;
            }

            const isValid = await isOpenAICodexCli( candidate );

            if ( isValid ) {
                return candidate;
            }
        }
    }

    return null;
}

async function getCodexBinary(): Promise<string | null> {
    if ( !codexBinaryPromise ) {
        codexBinaryPromise = resolveCodexBinary();
    }

    return await codexBinaryPromise;
}

type CodexRunResult = {
    response: string;
    logs: Buffer;
};

const EMPTY_LOGS = Buffer.alloc( 0 );

async function runCodex( prompt: string, includeLogs: boolean ): Promise<CodexRunResult> {
    const codexBinary = await getCodexBinary();

    if ( !codexBinary ) {
        return {
            response: "Codex CLI is not configured. Set AI_CHAT_CODEX_BIN to the OpenAI Codex CLI path.",
            logs: EMPTY_LOGS
        };
    }

    const outputFile = path.join( os.tmpdir(), `codex-reply-${ crypto.randomUUID() }.txt` );
    const logsFile = includeLogs
        ? path.join( os.tmpdir(), `codex-logs-${ crypto.randomUUID() }.txt` )
        : null;

    return await new Promise<CodexRunResult>( ( resolve ) => {
        const logsStream = logsFile ? fsNative.createWriteStream( logsFile, { flags: "w" } ) : null;

        const child = spawn( codexBinary, [
            "exec",
            "-",
            "--sandbox",
            "read-only",
            "-o",
            outputFile
        ], {
            cwd: REPO_ROOT,
            env: {
                ...process.env,
                NODE_OPTIONS: "",
                NODE_PATH: ""
            }
        } );

        GlobalLogger.$.log( runCodex, `Executing Codex (${ codexBinary })...` );

        let hasTimedOut = false;

        const timeout = setTimeout( () => {
            hasTimedOut = true;
            GlobalLogger.$.error( runCodex, `Codex timed out after ${ CODEX_TIMEOUT_MS }ms.` );
            child.kill();
        }, CODEX_TIMEOUT_MS );

        let stdout = "";
        let stderr = "";
        let settled = false;

        const settle = async( response: string ) => {
            if ( settled ) {
                return;
            }

            settled = true;
            clearTimeout( timeout );

            const finalizeLogs = async() => {
                if ( !logsStream || !logsFile ) {
                    return EMPTY_LOGS;
                }

                logsStream.end();

                await new Promise<void>( ( done ) => {
                    logsStream.once( "finish", () => done() );
                } );

                return await fs.readFile( logsFile ).catch( () => EMPTY_LOGS );
            };

            const logs = await finalizeLogs();

            if ( await fs.stat( outputFile ).catch( () => null ) ) {
                await fs.unlink( outputFile );
            }

            if ( logsFile && await fs.stat( logsFile ).catch( () => null ) ) {
                await fs.unlink( logsFile );
            }

            resolve( { response, logs } );
        };

        const onStdout = ( data: Buffer ) => {
            if ( logsStream ) {
                logsStream.write( data );
            }

            stdout = appendToLimitedBuffer( stdout, data.toString() );
        };

        const onStderr = ( data: Buffer ) => {
            if ( logsStream ) {
                logsStream.write( data );
            }

            stderr = appendToLimitedBuffer( stderr, data.toString() );
        };

        child.stdout.on( "data", onStdout );
        child.stderr.on( "data", onStderr );

        child.on( "error", ( error ) => {
            GlobalLogger.$.error( runCodex, "Failed to spawn Codex", error );
            void settle( `Error spawning Codex: ${ error.message }` );
        } );

        child.on( "close", ( code ) => {
            void ( async() => {
                if ( hasTimedOut ) {
                    await settle( "I couldn't generate a reply. Codex timed out." );
                    return;
                }

                if ( code !== 0 ) {
                    GlobalLogger.$.error(
                        runCodex,
                        `Codex exited with code ${ code }.\nStdout: ${ stdout }\nStderr: ${ stderr }`
                    );

                    await settle( "I couldn't generate a reply. Codex failed to run." );
                    return;
                }

                const exists = await fs.stat( outputFile ).then( () => true ).catch( () => false );

                if ( !exists ) {
                    GlobalLogger.$.error(
                        runCodex,
                        `Codex finished but reply file was not created.\nStdout: ${ stdout }\nStderr: ${ stderr }`
                    );

                    if ( stdout.trim() ) {
                        await settle( sanitizeResponse( stdout ) );
                        return;
                    }

                    await settle( "I couldn't generate a reply. Codex didn't provide any output." );
                    return;
                }

                const responseContent = await fs.readFile( outputFile, "utf-8" ).catch( () => "" );

                GlobalLogger.$.log( runCodex, "Codex response received." );

                await settle( sanitizeResponse( responseContent ) );
            } )();
        } );

        child.stdin.write( prompt );
        child.stdin.end();
    } );
}

export async function runAgentChat( prompt: string, _temperature = 0.7 ) {
    const result = await runCodex( prompt, false );

    return result.response;
}

export async function runAgentChatWithLogs( prompt: string ) {
    return await runCodex( prompt, true );
}

export function sanitizeResponse( text?: string | null ) {
    if ( !text ) {
        return "I wasn't able to generate a reply.";
    }

    const trimmed = text.trim();

    if ( trimmed.length <= MAX_DISCORD_RESPONSE_LENGTH ) {
        return trimmed;
    }

    return `${ trimmed.slice( 0, MAX_DISCORD_RESPONSE_LENGTH ) }\n... (truncated)`;
}
