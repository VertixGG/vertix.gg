// scripts/check-notice-order.js
//
// Finds a notice posted before the redraw that follows it, in one press.
//
// A press is answered once. The first of `ephemeral()` and `editReplyWithStep()` to run takes the
// interaction's reply, and whichever runs second is then aimed at the wrong message: warn first
// and the redraw patches the notice rather than the screen - silently overwriting the warning on
// an embeds screen, and refused outright on a Components V2 container
// (`MESSAGE_CANNOT_USE_LEGACY_FIELDS_WITH_COMPONENTS_V2`), where the admin keeps the notice and
// never gets their screen back. See AGENTS.md, "Drawing a UI Screen".
//
// Nothing else catches this: the embeds half leaves no error at all, and the V2 half only throws
// once somebody presses that exact control. Exits non-zero on a finding, so it can gate CI. Pass
// --json for machine-readable output.

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve } from "path";

const ROOT = resolve( import.meta.dirname, ".." );

const SEARCH_ROOTS = [ "apps", "packages" ];

const SKIP_DIRS = new Set( [ "node_modules", "dist", "build", "test", "__tests__", ".git", ".claude" ] );

// What takes the interaction's single initial response.
//
// `deferReply` is deliberately absent: a deferred reply is *meant* to be edited afterwards, which
// is how `runWhileThinking()` shows thinking and then writes the screen into that same reply.
const NOTICE_CALL = new RegExp( [
    "\\.(ephemeral|ephemeralWithStep)\\s*\\(",
    "\\b\\w+\\.(reply|followUp|showModal)\\s*\\(",
    "\\.triggerTransition\\s*\\("
].join( "|" ) );

// What aims at that response - as opposed to `editMessage()`, which edits a message directly and
// costs the press nothing.
const REDRAW_CALL = /\.(editReply|editReplyWithStep)\s*\(|\b\w+\.update\s*\(/;

const EXIT_STATEMENT = /^(return|break|continue|throw)\b/;

// A handler boundary. Crossing one means the redraw belongs to another press, so the search stops:
// a named function or method, or the arrow handler each `bindButton` / `bindSelectMenu` is given.
const HANDLER_BOUNDARY = new RegExp( [
    "^\\s*(export\\s+)?(async\\s+)?function\\s+\\w+",
    "^\\s*(public|private|protected)\\s+(static\\s+)?(async\\s+)?\\w+\\s*[(<]",
    "=>\\s*\\{\\s*$",
    "^\\s*async\\s*\\("
].join( "|" ) );

// How far past a notice a redraw still counts as the same handler. Long enough for every handler
// in the tree, short enough that a missed boundary cannot reach across a file.
const SEARCH_WINDOW = 120;

/**
 * Function listSources() :: Every `.ts` file worth reading, specs excluded.
 */
function listSources( dir, acc = [] ) {
    for ( const entry of readdirSync( dir ) ) {
        if ( SKIP_DIRS.has( entry ) ) {
            continue;
        }

        const path = join( dir, entry );

        if ( statSync( path ).isDirectory() ) {
            listSources( path, acc );
        } else if ( entry.endsWith( ".ts" ) && ! entry.endsWith( ".spec.ts" ) ) {
            acc.push( path );
        }
    }

    return acc;
}

/**
 * Function readLines() :: A file as lines, each with the brace depth it opens at and a copy with
 * comments and string literals taken out.
 *
 * Both have to go before anything is matched: a doc comment explaining this very rule names both
 * calls in prose, and a step name is a string that can hold anything.
 */
function readLines( path ) {
    const lines = readFileSync( path, "utf-8" ).split( "\n" );

    const annotated = [];

    let depth = 0, inBlockComment = false;

    for ( let index = 0; index < lines.length; index++ ) {
        const raw = lines[ index ];

        let code = raw;

        if ( inBlockComment ) {
            const closes = code.indexOf( "*/" );

            if ( -1 === closes ) {
                annotated.push( { number: index + 1, source: raw.trim(), depth, code: "" } );
                continue;
            }

            code = code.slice( closes + 2 );
            inBlockComment = false;
        }

        // Block comments that open and close on this line go first, so one that opens and stays
        // open is the only thing left to carry over.
        code = code.replace( /\/\*[\s\S]*?\*\//g, " " );

        const opens = code.indexOf( "/*" );

        if ( -1 !== opens ) {
            code = code.slice( 0, opens );
            inBlockComment = true;
        }

        code = code.replace( /\/\/.*$/, "" );
        code = code.replace( /"[^"]*"|'[^']*'|`[^`]*`/g, '""' );

        annotated.push( { number: index + 1, source: raw.trim(), depth, code } );

        depth += ( code.match( /\{/g ) || [] ).length - ( code.match( /\}/g ) || [] ).length;
    }

    return annotated;
}

/**
 * Function collectNoticeHelpers() :: The names of functions that post a notice themselves.
 *
 * A call site rarely posts one directly - it calls `warnOnUnassignableVoiceRole()`, and the
 * `ephemeral()` is a file away. Closed over its own result, so a helper that only calls another
 * helper counts too.
 */
function collectNoticeHelpers( sources ) {
    const bodies = new Map();

    for ( const path of sources ) {
        const text = readFileSync( path, "utf-8" );

        for ( const match of text.matchAll( /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\([\s\S]*?\n\}/g ) ) {
            const name = match[ 1 ];

            bodies.set( name, ( bodies.get( name ) || [] ).concat( match[ 0 ] ) );
        }
    }

    const helpers = new Set();

    for ( const [ name, texts ] of bodies ) {
        if ( texts.some( ( text ) => NOTICE_CALL.test( text ) ) ) {
            helpers.add( name );
        }
    }

    let grew = true;

    while ( grew ) {
        grew = false;

        for ( const [ name, texts ] of bodies ) {
            if ( helpers.has( name ) ) {
                continue;
            }

            const callsOne = texts.some( ( text ) =>
                [ ...helpers ].some( ( helper ) => new RegExp( `\\b${ helper }\\s*\\(` ).test( text ) ) );

            if ( callsOne ) {
                helpers.add( name );
                grew = true;
            }
        }
    }

    // A handler is not a helper: `onLogChannelSelected` posting a notice is the thing being
    // checked, not a reason to treat every call to it as one.
    return new Set( [ ...helpers ].filter( ( name ) => ! name.startsWith( "on" ) ) );
}

/**
 * Function findInFile() :: Each notice in one file that a redraw follows on the same press.
 */
function findInFile( path, noticePattern ) {
    const lines = readLines( path ), findings = [];

    for ( let index = 0; index < lines.length; index++ ) {
        const notice = lines[ index ];

        if ( ! noticePattern.test( notice.code ) || HANDLER_BOUNDARY.test( notice.code ) ) {
            continue;
        }

        for ( const line of lines.slice( index + 1, index + 1 + SEARCH_WINDOW ) ) {
            if ( HANDLER_BOUNDARY.test( line.code ) || ( 0 === line.depth && line.source ) ) {
                break;
            }

            // The notice's own path ends here, so a redraw below it is another path's.
            if ( line.depth <= notice.depth && EXIT_STATEMENT.test( line.code.trim() ) ) {
                break;
            }

            if ( REDRAW_CALL.test( line.code ) ) {
                findings.push( {
                    file: relative( ROOT, path ),
                    notice: { line: notice.number, source: notice.source },
                    redraw: { line: line.number, source: line.source }
                } );
                break;
            }
        }
    }

    return findings;
}

const sources = SEARCH_ROOTS.flatMap( ( dir ) => listSources( join( ROOT, dir ) ) );

const helpers = collectNoticeHelpers( sources );

const noticePattern = new RegExp(
    `${ NOTICE_CALL.source }|\\b(${ [ ...helpers ].sort().join( "|" ) })\\s*\\(`
);

const findings = sources.flatMap( ( path ) => findInFile( path, noticePattern ) );

if ( process.argv.includes( "--json" ) ) {
    console.log( JSON.stringify( { helpers: [ ...helpers ].sort(), findings }, null, 2 ) );
} else if ( findings.length ) {
    console.error( `A notice posted before the redraw that follows it (${ findings.length }):\n` );

    for ( const finding of findings ) {
        console.error( `  ${ finding.file }` );
        console.error( `    notice ${ finding.notice.line }: ${ finding.notice.source }` );
        console.error( `    redraw ${ finding.redraw.line }: ${ finding.redraw.source }\n` );
    }

    console.error( "Redraw first, then warn: `ephemeral()` then sends the notice as a `followUp()`," );
    console.error( "so the screen is updated and the notice is its own message. See AGENTS.md," );
    console.error( "\"Drawing a UI Screen\"." );
} else {
    console.log(
        `No notice posted before a redraw. ${ sources.length } file(s) read, ` +
        `${ helpers.size } notice-posting helper(s) followed.`
    );
}

process.exit( findings.length ? 1 : 0 );
