import fs from "fs";
import path from "path";

import { getAllCommandDefinitions } from "@vertix.gg/bot/src/commands/definitions";

import { COMMAND_HANDLERS } from "@vertix.gg/bot/src/commands/handlers";

/**
 * What a command hands its interface has to reach the screen.
 *
 * A button stores what the next screen needs and then navigates, so the screen reads it back out of
 * the store. A command has nothing stored yet - it hands the same thing in with the opening - and a
 * `getReplyArgs()` that only reads the store drops it on the floor.
 *
 * Nothing about that fails: the screen renders, having been given args it can build from, and only
 * the parts that came from the command are missing. `/knock` drew a picker asking which channel to
 * knock on with nothing in it to pick, three separate times before this was written down.
 *
 * Only the commands with a handler are asked, because only they hand anything in. `/voice privacy`
 * opens its screen and passes nothing, so there is nothing for its screen to miss; `/knock` works
 * out which channels can be knocked on and passes the list, and that list is what went missing.
 *
 * Which adapters those are is read from the definitions and the handler registry rather than listed,
 * so a command that grows a handler tomorrow is covered without anyone remembering.
 */

const UI_ROOT = path.resolve( process.cwd(), "src/ui" );

const sourcesUnder = ( dir: string ): string[] =>
    fs.readdirSync( dir, { withFileTypes: true } ).flatMap( ( entry ) => {
        const full = path.join( dir, entry.name );

        return entry.isDirectory() ? sourcesUnder( full ) : ( entry.name.endsWith( ".ts" ) ? [ full ] : [] );
    } );

const ALL_SOURCES = sourcesUnder( UI_ROOT );

const HANDLER_SOURCES = sourcesUnder( path.resolve( process.cwd(), "src/commands/handlers" ) )
    .map( ( file ) => fs.readFileSync( file, "utf-8" ) );

/**
 * Whether this command's handler opens a screen at all.
 *
 * `/voice claim` has a handler and opens nothing - it reads whether a vote is running and answers
 * in words - so there is no screen of its own to hand anything to.
 */
const opensAScreen = ( handlerName: string ) =>
    HANDLER_SOURCES.some( ( source ) =>
        source.includes( "export async function " + handlerName )
        && ( source.includes( "ephemeralWithStep(" ) || source.includes( "adapter.ephemeral(" ) )
    );

/** The file that declares an adapter, found by the name it is built with. */
const fileDeclaring = ( adapterName: string ) =>
    ALL_SOURCES.find( ( file ) =>
        new RegExp( "AdapterBuilder(<[^>]*>)?\\(\\s*\\n?\\s*\"" + adapterName + "\"" )
            .test( fs.readFileSync( file, "utf-8" ) )
    );

/**
 * Function mergesHandedInArgs() :: Whether a reply-args body ends by including what it was given.
 *
 * The last `return` is the one that matters. Every one of these bugs looked the same: a branch for
 * one particular screen that did read `argsFromManager`, and a fall-through for all the others that
 * returned the store alone - so asking merely whether the name appears anywhere says yes about code
 * that drops the args on every path a command actually takes.
 */
const mergesHandedInArgs = ( source: string, functionName: string ): boolean => {
    const start = source.indexOf( "export async function " + functionName );

    if ( -1 === start ) {
        return false;
    }

    const body = source.slice( start );
    const returns = [ ...body.matchAll( /\n {4}return ([\s\S]*?);\n/g ) ];

    if ( ! returns.length ) {
        return false;
    }

    const last = returns[ returns.length - 1 ][ 1 ];

    if ( last.includes( "argsFromManager" ) ) {
        return true;
    }

    // Or it returns something built from them - `const mergedArgs = Object.assign( {}, stored,
    // argsFromManager )` and then `return Object.assign( {}, mergedArgs, ... )`, which is the same
    // thing said in two steps.
    const merged = [ ...body.matchAll( /const (\w+) = [^;]*argsFromManager[^;]*;/g ) ]
        .map( ( match ) => match[ 1 ] );

    return merged.some( ( name ) => new RegExp( "\\b" + name + "\\b" ).test( last ) );
};

/**
 * Whether the reply args this adapter uses look at what it was opened with.
 *
 * Written inline, that means naming `argsFromManager` on the way out. Passed by name, the answer is
 * in whichever file exports that function - the shared states file, which is the one place both
 * doors read.
 */
const readsHandedInArgs = ( file: string ): boolean => {
    const source = fs.readFileSync( file, "utf-8" );

    const byName = source.match( /\.getReplyArgs\( (\w+) \)/ );

    if ( byName ) {
        const declaring = ALL_SOURCES.find( ( candidate ) =>
            mergesHandedInArgs( fs.readFileSync( candidate, "utf-8" ), byName[ 1 ] )
        );

        return Boolean( declaring );
    }

    return source.includes( "argsFromManager" );
};

describe( "VertixBot/Commands/ReplyArgs", () => {
    const opened = [ ...new Set(
        getAllCommandDefinitions()
            .filter( ( definition ) => {
                const handler = COMMAND_HANDLERS[ definition.flowTransition ];

                return handler && opensAScreen( handler.name );
            } )
            .flatMap( ( definition ) =>
                [ definition.adapterName, definition.adapterNameV2 ].filter( Boolean ) as string[] )
    ) ];

    it( "should find the adapter every command opens", () => {
        const missing = opened.filter( ( name ) => ! fileDeclaring( name ) );

        expect( missing ).toEqual( [] );
    } );

    it( "should let a command's own args reach the screen it opens", () => {
        const deaf = opened
            .map( ( name ) => [ name, fileDeclaring( name ) ] as const )
            .filter( ( [ , file ] ) => file && ! readsHandedInArgs( file ) )
            .map( ( [ name ] ) => name );

        expect( deaf ).toEqual( [] );
    } );
} );
