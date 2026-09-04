// scripts/check-languages.js
//
// Verifies language files stay in sync:
//   1. every translatable UI entity in exports/ui/ exists in en.json
//   2. every entry in en.json exists in each other locale
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

function collectNames( node, acc = new Set() ) {
    if ( Array.isArray( node ) ) {
        node.forEach( ( item ) => collectNames( item, acc ) );
    } else if ( node && typeof node === "object" ) {
        if ( typeof node.name === "string" ) {
            acc.add( node.name );
        }
        Object.values( node ).forEach( ( value ) => collectNames( value, acc ) );
    }
    return acc;
}

function isTranslatable( name ) {
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

const enNames = collectNames( readJson( join( LANG_DIR, "en.json" ) ) );

// 1. exports/ui -> en.json
const exportNames = new Set();

for ( const file of [ "components.json", "adapters.json", "flows.json" ] ) {
    const full = join( EXPORTS_DIR, file );

    if ( existsSync( full ) ) {
        collectNames( readJson( full ), exportNames );
    }
}

const missingFromEn = [ ...exportNames ].filter( ( name ) => isTranslatable( name ) && ! enNames.has( name ) ).sort();

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

    const names = collectNames( readJson( join( LANG_DIR, file ) ) );
    const missing = [ ...enNames ].filter( ( name ) => ! names.has( name ) ).sort();

    locales[ code ] = {
        present: enNames.size - missing.length,
        total: enNames.size,
        coverage: Number( ( ( enNames.size - missing.length ) / enNames.size * 100 ).toFixed( 1 ) ),
        missing,
    };
}

const failed = missingFromEn.length > 0 || Object.values( locales ).some( ( locale ) => locale.missing.length > 0 );

if ( asJson ) {
    console.log( JSON.stringify( { missingFromEn, locales, ok: ! failed }, null, 2 ) );
} else {
    if ( missingFromEn.length ) {
        console.error( `\nMissing from en.json (${ missingFromEn.length }) - defined in the UI but has no copy:` );
        missingFromEn.forEach( ( name ) => console.error( `  ${ name }` ) );
    } else {
        console.log( `\nen.json covers all ${ enNames.size } translatable entities.` );
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
