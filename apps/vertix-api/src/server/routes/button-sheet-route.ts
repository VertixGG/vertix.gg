import { join } from "path";

import { Resvg } from "@resvg/resvg-js";

import { buildSheetSvg } from "@vertix.gg/utils/src/button-sheet-svg";

import { API_ROUTES, HTTP_STATUS } from "@vertix.gg/api/src/server/constants";
import { getButtonSheetTiles } from "@vertix.gg/api/src/server/services/button-emoji-source";

import type { SheetConfig, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

const REPO_ROOT = join( import.meta.dirname, "..", "..", "..", "..", ".." );

const FONT_PATH = join( REPO_ROOT, "assets", "fonts", "RedHatDisplay-Bold.ttf" );

const SHEET_DEFAULTS: SheetConfig = {
    cols: 4,
    scale: 3,
    title: false,
    note: "",
    omit: [],
    items: [],
    rowBreaks: []
};

const MAX_PIXELS = 8000 * 8000;

interface SheetQuery {
    cols?: string;
    scale?: string;
    title?: string;
    note?: string;
    omit?: string;
    items?: string;
    rows?: string;
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
        items: parseItems( query.items ),
        // Where those items are divided into rows, so the legend is cut where the buttons are.
        rowBreaks: parseItems( query.rows )
            .map( ( at ) => Number( at ) )
            .filter( ( at ) => Number.isInteger( at ) && 0 < at )
    };
}

const buttonSheetRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Querystring: SheetQuery }>( API_ROUTES.BUTTON_SHEET, async( request, reply ) => {
        const config = parseQuery( request.query );

        let tiles: ReadonlyArray<SheetTile>;

        try {
            tiles = await getButtonSheetTiles();
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
