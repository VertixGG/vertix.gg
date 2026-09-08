import { fetchUIComponents, loadEmojiManifest } from "@vertix.gg/discord-ui";

import { BUTTONS_MENU_ELEMENT, tilesFromSelectOptions } from "@vertix.gg/utils/src/button-sheet-svg";

import { iconSource } from "@vertix.gg/website/src/vertix/pages/tools/button-sheet/sheet-icons";

import type { SheetConfig, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";

export const SHEET_DEFAULTS: SheetConfig = {
    cols: 4,
    scale: 3,
    title: false,
    note: "",
    omit: []
};

const NOTE_LIMIT = 120;

/** An absent or empty parameter has to read as `NaN`, because `Number( null )` is a perfectly
    finite zero and would silently clamp into range instead of falling back to the default. */
function readNumber( params: URLSearchParams, key: string ): number {
    const raw = params.get( key );

    return raw ? Number( raw ) : Number.NaN;
}

function clamp( value: number, min: number, max: number, fallback: number ): number {
    if ( ! Number.isFinite( value ) ) {
        return fallback;
    }

    return Math.min( max, Math.max( min, Math.round( value ) ) );
}

/**
 * Function parseSheetConfig() :: The sheet a url is asking for.
 *
 * Nothing here rejects: a number out of range is clamped and an unknown button id is ignored, so a
 * link written against an older button set still draws a sheet rather than an error.
 */
export function parseSheetConfig( params: URLSearchParams ): SheetConfig {
    const omit = ( params.get( "omit" ) ?? "" )
        .split( "," )
        .map( ( id ) => id.trim() )
        .filter( ( id ) => id.length > 0 );

    return {
        cols: clamp( readNumber( params, "cols" ), 3, 6, SHEET_DEFAULTS.cols ),
        scale: clamp( readNumber( params, "scale" ), 1, 4, SHEET_DEFAULTS.scale ),
        title: "on" === params.get( "title" ),
        note: ( params.get( "note" ) ?? "" ).slice( 0, NOTE_LIMIT ),
        omit
    };
}

/** Only what differs from the default reaches the address bar, so the plain sheet has a plain url. */
export function serialiseSheetConfig( config: SheetConfig ): Record<string, string> {
    const params: Record<string, string> = {};

    if ( config.cols !== SHEET_DEFAULTS.cols ) {
        params.cols = String( config.cols );
    }

    if ( config.scale !== SHEET_DEFAULTS.scale ) {
        params.scale = String( config.scale );
    }

    if ( config.title ) {
        params.title = "on";
    }

    if ( config.note ) {
        params.note = config.note;
    }

    if ( config.omit.length ) {
        params.omit = config.omit.join( "," );
    }

    return params;
}

/**
 * Function fetchSheetTiles() :: The buttons, read from the bot's own UI export.
 *
 * The export is what the site already renders its screenshots from, so the sheet lists exactly the
 * buttons the bot ships, in the order it sorts them, and gains a button the moment the bot does.
 */
export async function fetchSheetTiles(): Promise<ReadonlyArray<SheetTile>> {
    // The artwork is resolved from Discord, so make sure the manifest is in hand before `iconSource`
    // is asked for any icon.
    const [ components ] = await Promise.all( [ fetchUIComponents(), loadEmojiManifest() ] );

    for ( const component of components ) {
        for ( const group of component.elementsGroups ) {
            for ( const row of group.items ) {
                for ( const item of row ) {
                    const definition = item.definition;

                    if ( item.element !== BUTTONS_MENU_ELEMENT || ! ( "selectOptions" in definition ) ) {
                        continue;
                    }

                    return tilesFromSelectOptions( definition.selectOptions ?? [], iconSource );
                }
            }
        }
    }

    throw new Error( `Could not find '${ BUTTONS_MENU_ELEMENT }' in the UI export` );
}
