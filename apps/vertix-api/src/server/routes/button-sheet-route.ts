import { readFileSync } from "fs";
import { join } from "path";

import { Resvg } from "@resvg/resvg-js";

import {
    BUTTONS_MENU_ELEMENT,
    buildSheetSvg,
    tilesFromSelectOptions
} from "@vertix.gg/utils/src/button-sheet-svg";

import { API_ROUTES, HTTP_STATUS } from "@vertix.gg/api/src/server/constants";

import type { SheetConfig, SheetSourceOption, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

const REPO_ROOT = join( import.meta.dirname, "..", "..", "..", "..", ".." );

const COMPONENTS_PATH = join( REPO_ROOT, "exports", "ui", "components.json" ),
    ICONS_DIR = join( REPO_ROOT, "assets", "svg" ),
    FONT_PATH = join( REPO_ROOT, "assets", "fonts", "RedHatDisplay-Bold.ttf" );

const SHEET_DEFAULTS: SheetConfig = {
    cols: 4,
    scale: 3,
    title: false,
    note: "",
    omit: [],
    items: []
};

const MAX_PIXELS = 8000 * 8000;

interface SheetQuery {
    cols?: string;
    scale?: string;
    title?: string;
    note?: string;
    omit?: string;
    items?: string;
}

function parseIdList( raw: string | undefined ): string[] {
    return ( raw ?? "" ).split( "," ).map( ( id ) => id.trim() ).filter( ( id ) => id.length > 0 );
}

// `items` may arrive as a plain "a,b" list, or - when the bot builds it from its
// buttons-template array arg, which the UI framework serialises as JSON - as
// `["a","b"]`. Accept both.
function parseItems( raw: string | undefined ): string[] {
    const value = ( raw ?? "" ).trim();

    if ( value.startsWith( "[" ) ) {
        try {
            const parsed: unknown = JSON.parse( value );

            if ( Array.isArray( parsed ) ) {
                return parsed.map( ( id ) => String( id ).trim() ).filter( ( id ) => id.length > 0 );
            }
        } catch {
            // Fall through to the comma parser.
        }
    }

    return parseIdList( value );
}

function clamp( value: number, min: number, max: number, fallback: number ): number {
    if ( ! Number.isFinite( value ) ) {
        return fallback;
    }

    return Math.min( max, Math.max( min, Math.round( value ) ) );
}

function readNumber( raw: string | undefined ): number {
    return raw ? Number( raw ) : Number.NaN;
}

function parseQuery( query: SheetQuery ): SheetConfig {
    return {
        cols: clamp( readNumber( query.cols ), 3, 6, SHEET_DEFAULTS.cols ),
        scale: clamp( readNumber( query.scale ), 1, 4, SHEET_DEFAULTS.scale ),
        title: "on" === query.title,
        note: ( query.note ?? "" ).slice( 0, 120 ),
        omit: parseIdList( query.omit ),
        items: parseItems( query.items )
    };
}

const iconCache = new Map<string, string | null>();

function loadIcon( baseName: string ): string | null {
    if ( ! baseName || ! /^[A-Za-z0-9_-]+$/.test( baseName ) ) {
        return null;
    }

    if ( ! iconCache.has( baseName ) ) {
        try {
            iconCache.set( baseName, readFileSync( join( ICONS_DIR, `${ baseName }.svg` ), "utf-8" ) );
        } catch {
            iconCache.set( baseName, null );
        }
    }

    return iconCache.get( baseName ) ?? null;
}

let cachedTiles: ReadonlyArray<SheetTile> | null = null;

/**
 * Function loadTiles() :: The buttons, read off the bot's own ui export.
 *
 * The page reaches the same export over http; here it is a file on disk. What each option becomes
 * is decided by `tilesFromSelectOptions`, shared with the website, so the two cannot disagree about
 * a label.
 */
function loadTiles(): ReadonlyArray<SheetTile> {
    if ( cachedTiles ) {
        return cachedTiles;
    }

    const parsed: unknown = JSON.parse( readFileSync( COMPONENTS_PATH, "utf-8" ) );

    for ( const component of asArray( parsed ) ) {
        for ( const group of asArray( property( component, "elementsGroups" ) ) ) {
            for ( const row of asArray( property( group, "items" ) ) ) {
                for ( const item of asArray( row ) ) {
                    if ( property( item, "element" ) !== BUTTONS_MENU_ELEMENT ) {
                        continue;
                    }

                    const options = property( property( item, "definition" ), "selectOptions" );

                    cachedTiles = tilesFromSelectOptions(
                        asArray( options ) as ReadonlyArray<SheetSourceOption>,
                        loadIcon
                    );

                    return cachedTiles;
                }
            }
        }
    }

    throw new Error( `Could not find '${ BUTTONS_MENU_ELEMENT }' in the UI export` );
}

function asArray( value: unknown ): ReadonlyArray<unknown> {
    return Array.isArray( value ) ? value : [];
}

function property( value: unknown, key: string ): unknown {
    return value && "object" === typeof value ? ( value as Record<string, unknown> )[ key ] : undefined;
}

const buttonSheetRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Querystring: SheetQuery }>( API_ROUTES.BUTTON_SHEET, async( request, reply ) => {
        const config = parseQuery( request.query );

        let tiles: ReadonlyArray<SheetTile>;

        try {
            tiles = loadTiles();
        } catch( error ) {
            fastify.log.error( error );

            return await reply.status( HTTP_STATUS.INTERNAL_SERVER_ERROR )
                .send( { error: "The button list could not be read" } );
        }

        const { svg, width, height } = buildSheetSvg( tiles, config );

        if ( width * config.scale * height * config.scale > MAX_PIXELS ) {
            return await reply.status( HTTP_STATUS.BAD_REQUEST ).send( { error: "That sheet is too large" } );
        }

        const rendered = new Resvg( svg, {
            fitTo: { mode: "width", value: Math.round( width * config.scale ) },
            font: {
                fontFiles: [ FONT_PATH ],
                loadSystemFonts: false,
                defaultFontFamily: "Red Hat Display"
            }
        } ).render();

        return await reply
            .type( "image/png" )
            .header( "Cache-Control", "public, max-age=3600" )
            .send( rendered.asPng() );
    } );
};

export default buttonSheetRoutePlugin;
