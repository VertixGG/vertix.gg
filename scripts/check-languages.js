// scripts/check-languages.js
//
// Verifies language files stay in sync:
//   1. every translatable UI entity in exports/ui/ exists in en.json
//   2. every entry in en.json exists in each other locale
//   3. every baked select menu holds the same options as the menu it translates
//
// Exits non-zero when something is missing, so it can gate CI. Pass --json for
// machine-readable output, or --locale=<code> to list one locale's gaps.

import { readFileSync, readdirSync, existsSync } from "fs";
import { basename, join, resolve } from "path";

const ROOT = resolve( import.meta.dirname, ".." );
const LANG_DIR = join( ROOT, "apps/vertix-bot/assets/languages" );
const EXPORTS_DIR = join( ROOT, "exports/ui" );

// Entities whose name ends in one of these carry user-facing text. Anything
// ending in "Group" is a structural wrapper (ElementsGroup, EmbedGroup, ...)
// and holds no copy of its own.
const TRANSLATABLE_SUFFIXES = [ "Button", "Input", "SelectMenu", "Menu", "Modal", "Embed", "Markdown" ];

// Only entity names are namespaced; a bare "name" also appears inside select
// options and embed fields ("English", "▹ Name: <#{id}>") and must not count.
//
// An entity is not always named under "name": a component references its embeds and its elements
// by id under "embed" and "element", and almost every embed in the export appears only that way.
// Reading just "name" left those embeds outside the comparison entirely, so one with no entry in
// en.json still counted as full coverage.
const NAME_KEYS = [ "name", "embed", "element" ];

function collectNames( node, acc = new Set() ) {
    if ( Array.isArray( node ) ) {
        node.forEach( ( item ) => collectNames( item, acc ) );
    } else if ( node && typeof node === "object" ) {
        NAME_KEYS.forEach( ( key ) => {
            if ( typeof node[ key ] === "string" && node[ key ].startsWith( "VertixBot/" ) ) {
                acc.add( node[ key ] );
            }
        } );
        Object.values( node ).forEach( ( value ) => collectNames( value, acc ) );
    }
    return acc;
}

/**
 * Function collectMenuOptions() :: The options each select menu in the export carries.
 *
 * A menu is the one entity whose copy is a list rather than a string, and a list is the one thing
 * an entity level comparison cannot see into: a menu with every option renamed still has its
 * entry, so it still counts as covered. That blind spot is not cosmetic - baked options are
 * matched to live ones by `value`, and by position when they carry none, so a button inserted
 * mid-menu hands its label to whatever used to sit at that index and every option below it shifts.
 */
function collectMenuOptions( node, acc = new Map() ) {
    if ( Array.isArray( node ) ) {
        node.forEach( ( item ) => collectMenuOptions( item, acc ) );
    } else if ( node && typeof node === "object" ) {
        if ( typeof node.name === "string" && Array.isArray( node.selectOptions ) ) {
            acc.set( node.name, node.selectOptions );
        }
        Object.values( node ).forEach( ( value ) => collectMenuOptions( value, acc ) );
    }
    return acc;
}

function collectLanguageMenus( language ) {
    const menus = new Map();

    for ( const menu of language?.elements?.selectMenus || [] ) {
        if ( Array.isArray( menu?.content?.selectOptions ) ) {
            menus.set( menu.name, menu.content.selectOptions );
        }
    }

    return menus;
}

/**
 * Function compareMenuOptions() :: How a baked menu differs from the one it translates, if it does.
 *
 * Counts first, because a count that disagrees is the drift itself rather than evidence of it.
 * Then which options, as a set: the runtime pairs a baked option with a live one by `value`, so a
 * menu holding the same values in another order translates correctly and has nothing wrong with
 * it. Comparing the order too only reports the exporter having once walked the menu differently.
 *
 * Values only when both sides carry them throughout - a baked menu with no values is reported
 * separately as the positional match it is, and pairing its options against ids it never held
 * would say nothing true.
 */
function compareMenuOptions( expected, actual ) {
    if ( expected.length !== actual.length ) {
        return `has ${ actual.length } option(s), the menu has ${ expected.length }`;
    }

    const values = ( options ) => options.every( ( option ) => undefined !== option.value )
        ? new Set( options.map( ( option ) => String( option.value ) ) )
        : null;

    const expectedValues = values( expected ),
        actualValues = values( actual );

    if ( ! expectedValues || ! actualValues ) {
        return null;
    }

    const missing = [ ...expectedValues ].filter( ( value ) => ! actualValues.has( value ) ),
        extra = [ ...actualValues ].filter( ( value ) => ! expectedValues.has( value ) );

    if ( ! missing.length && ! extra.length ) {
        return null;
    }

    return [
        missing.length ? `is missing ${ missing.map( ( value ) => `'${ value }'` ).join( ", " ) }` : "",
        extra.length ? `has ${ extra.map( ( value ) => `'${ value }'` ).join( ", " ) } the menu does not` : ""
    ].filter( Boolean ).join( " and " );
}

// A flow names its states and transitions after what they open, so a transition to a modal is
// called "...Transitions/OpenNameModal" and ends in a translatable suffix while being a node in a
// state machine rather than anything with copy. Matched on the path rather than the suffix,
// because the suffix is exactly what they have in common.
const FLOW_NODE_SEGMENTS = [ "/Transitions/", "/States/" ];

function isTranslatable( name ) {
    if ( FLOW_NODE_SEGMENTS.some( ( segment ) => name.includes( segment ) ) ) {
        return false;
    }

    const last = name.split( "/" ).pop();

    if ( last.endsWith( "Group" ) ) {
        return false;
    }

    return TRANSLATABLE_SUFFIXES.some( ( suffix ) => last.endsWith( suffix ) );
}

function readJson( filePath ) {
    return JSON.parse( readFileSync( filePath, "utf-8" ) );
}

const args = process.argv.slice( 2 );
const asJson = args.includes( "--json" );
const onlyLocale = ( args.find( ( arg ) => arg.startsWith( "--locale=" ) ) || "" ).split( "=" )[ 1 ];

const enLanguage = readJson( join( LANG_DIR, "en.json" ) );
const enNames = collectNames( enLanguage );
const enMenus = collectLanguageMenus( enLanguage );

// 1. exports/ui -> en.json
const exportNames = new Set();
const exportMenus = new Map();

for ( const file of [ "components.json", "adapters.json", "flows.json" ] ) {
    const full = join( EXPORTS_DIR, file );

    if ( existsSync( full ) ) {
        const definitions = readJson( full );

        collectNames( definitions, exportNames );
        collectMenuOptions( definitions, exportMenus );
    }
}

const missingFromEn = [ ...exportNames ].filter( ( name ) => isTranslatable( name ) && ! enNames.has( name ) ).sort();

// 3. exports/ui -> en.json, option by option.
//
// Only menus that were baked at all: one whose options come from the guild rather than the code has
// nothing to translate, and the exporter's view of it is whatever default args it happened to see.
const menuDrift = [];
const positionalMenus = [];

for ( const [ name, options ] of enMenus ) {
    const expected = exportMenus.get( name );

    if ( ! expected ) {
        continue;
    }

    const difference = compareMenuOptions( expected, options );

    if ( difference ) {
        menuDrift.push( { locale: "en", name, difference } );
    }

    if ( ! options.every( ( option ) => undefined !== option.value ) ) {
        positionalMenus.push( name );
    }
}

// 2. en.json -> every other locale
const locales = {};

for ( const file of readdirSync( LANG_DIR ).sort() ) {
    if ( ! file.endsWith( ".json" ) || file === "en.json" ) {
        continue;
    }

    const code = basename( file, ".json" );

    if ( onlyLocale && code !== onlyLocale ) {
        continue;
    }

    const language = readJson( join( LANG_DIR, file ) );
    const names = collectNames( language );
    const missing = [ ...enNames ].filter( ( name ) => ! names.has( name ) ).sort();

    for ( const [ name, options ] of collectLanguageMenus( language ) ) {
        const expected = enMenus.get( name );

        if ( ! expected ) {
            continue;
        }

        const difference = compareMenuOptions( expected, options );

        if ( difference ) {
            menuDrift.push( { locale: code, name, difference } );
        }
    }

    locales[ code ] = {
        present: enNames.size - missing.length,
        total: enNames.size,
        coverage: Number( ( ( enNames.size - missing.length ) / enNames.size * 100 ).toFixed( 1 ) ),
        missing,
    };
}

const failed = missingFromEn.length > 0
    || menuDrift.length > 0
    || Object.values( locales ).some( ( locale ) => locale.missing.length > 0 );

if ( asJson ) {
    console.log( JSON.stringify( { missingFromEn, menuDrift, positionalMenus, locales, ok: ! failed }, null, 2 ) );
} else {
    if ( missingFromEn.length ) {
        console.error( `\nMissing from en.json (${ missingFromEn.length }) - defined in the UI but has no copy:` );
        missingFromEn.forEach( ( name ) => console.error( `  ${ name }` ) );
    } else {
        console.log( `\nen.json covers all ${ enNames.size } translatable entities.` );
    }

    if ( menuDrift.length ) {
        console.error( `\nSelect menus out of step (${ menuDrift.length }) - baked options no longer match the menu:` );
        menuDrift.forEach( ( { locale, name, difference } ) => console.error( `  [${ locale }] ${ name } ${ difference }` ) );
    }

    // Not a failure: every one of these is a menu whose options have not moved, and failing on
    // them would gate CI on copy nobody has touched. Worth saying, because it is the state a
    // single inserted option turns into every label below it being wrong.
    if ( positionalMenus.length ) {
        console.log( `\nMatched by position (${ positionalMenus.length }) - baked options carry no value, so inserting one shifts the rest:` );
        positionalMenus.forEach( ( name ) => console.log( `  ${ name }` ) );
    }

    console.log( "\nlocale   present  missing  coverage" );

    for ( const [ code, info ] of Object.entries( locales ) ) {
        console.log(
            `${ code.padEnd( 8 ) } ${ String( info.present ).padStart( 6 ) } ` +
            `${ String( info.missing.length ).padStart( 8 ) }  ${ String( info.coverage ).padStart( 6 ) }%`
        );
    }

    if ( onlyLocale && locales[ onlyLocale ] ) {
        console.log( `\nMissing in ${ onlyLocale }:` );
        locales[ onlyLocale ].missing.forEach( ( name ) => console.log( `  ${ name }` ) );
    } else {
        console.log( "\nRun with --locale=<code> to list that locale's missing keys, or --json for full output." );
    }
}

process.exit( failed ? 1 : 0 );
