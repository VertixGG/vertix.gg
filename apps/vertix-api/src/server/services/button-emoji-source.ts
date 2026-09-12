import { readFileSync, statSync } from "fs";
import { join } from "path";

import {
    BUTTONS_MENU_ELEMENT,
    iconSvgFromImage,
    tilesFromSelectOptions
} from "@vertix.gg/utils/src/button-sheet-svg";

import { emojiPreviewService } from "@vertix.gg/utils/src/emoji-preview-service";

import {
    DYNAMIC_CHANNEL_COMPONENT as DYNAMIC_CHANNEL_COMPONENTS,
    V2_ELEMENT_TO_V3_BUTTON_ID,
    isV2Version
} from "@vertix.gg/utils/src/button-ids";

import type { SheetSourceOption, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";

/**
 * The button artwork, resolved from Discord rather than shipped in the repo.
 *
 * The emoji a button carries already lives on the running application as a custom emoji - the bot
 * cannot render the button without it - so that emoji is the single source of truth. This module
 * resolves each emoji to its cdn image once, on the server that holds the bot token, and hands the
 * result to two consumers that cannot reach Discord themselves:
 *
 *   - the sheet renderer, which needs the artwork inlined because resvg does not fetch remote refs;
 *   - the browser (site + dashboard), which must never hold a bot token, via `getEmojiManifest()`.
 *
 * A new button therefore draws its emoji the moment the bot ships it, with nothing to add here.
 */

const REPO_ROOT = join( import.meta.dirname, "..", "..", "..", "..", ".." );

const COMPONENTS_PATH = join( REPO_ROOT, "exports", "ui", "components.json" );

const EMOJI_ICON_SIZE = 96;

// The cdn markdown that `emoji-preview-service` caches, `<:Name:id>` (animated: `<a:Name:id>`).
const EMOJI_MARKDOWN = /^<a?:[^:]+:(\d+)>$/;

// name -> `data:image/png;base64,...`. Successes only, so a transient cdn failure retries on the
// next request instead of being remembered as a permanent blank.
const dataUriCache = new Map<string, string>();

let cachedOptions: ReadonlyArray<SheetSourceOption> | null = null;
let cachedNames: ReadonlyArray<string> | null = null;
let cachedAtModified = 0;

/**
 * Function isExportStale() :: Whether the ui export has been written since it was last read.
 *
 * The buttons come out of a file on disk that a deploy replaces, and the sheet is what names
 * them - so a button added to the interface would go on missing from its own legend until
 * somebody restarted the process. Compared by mtime rather than re-parsed per request: the
 * file changes on a release, not between two page loads.
 */
function isExportStale(): boolean {
    try {
        return statSync( COMPONENTS_PATH ).mtimeMs !== cachedAtModified;
    } catch {
        return false;
    }
}

function asArray( value: unknown ): ReadonlyArray<unknown> {
    return Array.isArray( value ) ? value : [];
}

function property( value: unknown, key: string ): unknown {
    return value && "object" === typeof value ? ( value as Record<string, unknown> )[ key ] : undefined;
}

/**
 * Function loadOptions() :: The buttons menu options, off the bot's own ui export.
 *
 * Re-read when the file changes and otherwise held, and shared by the sheet and the name
 * discovery below, so the two cannot disagree about which buttons exist.
 */
function loadOptions(): ReadonlyArray<SheetSourceOption> {
    if ( cachedOptions && ! isExportStale() ) {
        return cachedOptions;
    }

    cachedNames = null;

    try {
        cachedAtModified = statSync( COMPONENTS_PATH ).mtimeMs;
    } catch {
        cachedAtModified = 0;
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

                    cachedOptions = asArray( options ) as ReadonlyArray<SheetSourceOption>;

                    return cachedOptions;
                }
            }
        }
    }

    throw new Error( `Could not find '${ BUTTONS_MENU_ELEMENT }' in the UI export` );
}

/** The component whose elements a generator's buttons are drawn by. */
const DYNAMIC_CHANNEL_COMPONENT = DYNAMIC_CHANNEL_COMPONENTS.V3;

/**
 * Function loadElementsByEmoji() :: The dynamic channel's elements, keyed by the artwork they draw.
 *
 * The buttons menu names a button `rename` and the component names an element
 * `.../DynamicChannelRenameButton`, and nothing in the export carries both. The emoji token does,
 * because it is the same artwork in each - so the join happens here, once, against the file that
 * holds both halves, rather than being guessed at by every reader downstream.
 */
function loadElementsByEmoji(): ReadonlyMap<string, string> {
    const parsed: unknown = JSON.parse( readFileSync( COMPONENTS_PATH, "utf-8" ) ),
        byEmoji = new Map<string, string>();

    for ( const component of asArray( parsed ) ) {
        if ( property( component, "name" ) !== DYNAMIC_CHANNEL_COMPONENT ) {
            continue;
        }

        for ( const group of asArray( property( component, "elementsGroups" ) ) ) {
            for ( const row of asArray( property( group, "items" ) ) ) {
                for ( const item of asArray( row ) ) {
                    const name = property( item, "element" ),
                        emoji = property( property( item, "definition" ), "emoji" );

                    if ( "string" === typeof name && "string" === typeof emoji ) {
                        byEmoji.set( emoji, name );
                    }
                }
            }
        }
    }

    return byEmoji;
}

/**
 * Function discoverNames() :: The emoji base names the sheet asks for.
 *
 * The name lives inside each option's `<emoji name='...'>` token, and the parser that reads it is
 * private to `tilesFromSelectOptions`. Rather than duplicate that regex, run the tiler with a
 * loader that records every name it is handed - the one authority on how a name is extracted.
 */
function discoverNames( options: ReadonlyArray<SheetSourceOption> ): ReadonlyArray<string> {
    const names = new Set<string>();

    tilesFromSelectOptions( options, ( baseName ) => {
        if ( baseName ) {
            names.add( baseName );
        }

        return null;
    } );

    return [ ...names ];
}

function emojiId( markdown: string ): string | null {
    return EMOJI_MARKDOWN.exec( markdown )?.[ 1 ] ?? null;
}

async function fetchDataUri( name: string ): Promise<string | null> {
    const entry = emojiPreviewService.getCacheSnapshot()?.[ name ];

    if ( ! entry ) {
        return null;
    }

    const id = emojiId( entry.markdown );

    if ( ! id ) {
        return null;
    }

    try {
        const response = await fetch(
            `https://cdn.discordapp.com/emojis/${ id }.png?size=${ EMOJI_ICON_SIZE }`
        );

        if ( ! response.ok ) {
            return null;
        }

        const base64 = Buffer.from( await response.arrayBuffer() ).toString( "base64" );

        return `data:image/png;base64,${ base64 }`;
    } catch {
        return null;
    }
}

async function ensureDataUris( names: ReadonlyArray<string> ): Promise<void> {
    await emojiPreviewService.ensureCache();

    await Promise.all( names.map( async( name ) => {
        if ( dataUriCache.has( name ) ) {
            return;
        }

        const dataUri = await fetchDataUri( name );

        if ( dataUri ) {
            dataUriCache.set( name, dataUri );
        }
    } ) );
}

/** One button a generator can carry, as the dashboard and the site read it. */
export interface ButtonCatalogueEntry {
    value: string;
    label: string;
    emoji: string | null;
    element: string | null;
}

/**
 * Function getButtonCatalogueV2() :: The same list for a generator on the older interface.
 *
 * V2 draws a narrower set and draws it with plain unicode emoji rather than the application emoji
 * v3 uses, so a v2 generator described out of v3's catalogue showed the wrong artwork and offered
 * buttons - invite, region, templates, knock - that its channels cannot draw at all.
 *
 * Keyed by the v3 slug regardless, because that is the one vocabulary every reader shares once a
 * stored set has been through `toV3ButtonIds()`. Two v2 buttons collapse onto `privacy`, so the
 * first of them wins and the list stays one entry per button v3 knows.
 */
function getButtonCatalogueV2(): ReadonlyArray<ButtonCatalogueEntry> {
    const parsed: unknown = JSON.parse( readFileSync( COMPONENTS_PATH, "utf-8" ) ),
        entries = new Map<string, ButtonCatalogueEntry>();

    // V2's privacy buttons name themselves at runtime - their stored label is the `{displayText}`
    // placeholder - so those borrow v3's name for the same button rather than printing the
    // template at an admin. The artwork still comes from v2.
    const namesFromV3 = new Map( getButtonCatalogueV3().map( ( entry ) => [ entry.value, entry.label ] ) );

    // `visibility` is v2's alone - v3 folded it into one privacy button - so there is no v3 name to
    // borrow and the id itself is titled instead of being printed as a slug.
    const titleFor = ( value: string ) => value
        .split( "-" )
        .map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
        .join( " " );

    const nameFor = ( value: string, label: unknown ) => {
        if ( "string" === typeof label && ! label.includes( "{" ) ) {
            return label;
        }

        return namesFromV3.get( value ) ?? titleFor( value );
    };

    for ( const component of asArray( parsed ) ) {
        if ( property( component, "name" ) !== DYNAMIC_CHANNEL_COMPONENTS.V2 ) {
            continue;
        }

        for ( const group of asArray( property( component, "elementsGroups" ) ) ) {
            for ( const row of asArray( property( group, "items" ) ) ) {
                for ( const item of asArray( row ) ) {
                    const element = property( item, "element" );

                    if ( "string" !== typeof element ) {
                        continue;
                    }

                    const value = V2_ELEMENT_TO_V3_BUTTON_ID[ element ];

                    if ( ! value || entries.has( value ) ) {
                        continue;
                    }

                    const definition = property( item, "definition" ),
                        label = property( definition, "label" ),
                        emoji = property( definition, "emoji" );

                    entries.set( value, {
                        value,
                        label: nameFor( value, label ),
                        emoji: "string" === typeof emoji ? emoji : null,
                        element
                    } );
                }
            }
        }
    }

    return [ ...entries.values() ];
}

/**
 * Function getButtonCatalogue() :: Every button a generator can carry, as the dashboard needs it.
 *
 * The same list the buttons picker inside discord offers, read from the ui export rather than
 * restated here - so a button added to the interface appears in both without being named twice.
 * In the order the panel draws them, which is the order the export carries.
 */
export function getButtonCatalogue( version?: string | null ): ReadonlyArray<ButtonCatalogueEntry> {
    return isV2Version( version ) ? getButtonCatalogueV2() : getButtonCatalogueV3();
}

function getButtonCatalogueV3(): ReadonlyArray<ButtonCatalogueEntry> {
    const elementsByEmoji = loadElementsByEmoji();

    return loadOptions()
        .filter( ( option ): option is SheetSourceOption & { value: string } => Boolean( option.value ) )
        .map( ( option ) => ( {
            value: option.value,
            label: option.label ?? option.value,
            emoji: option.emoji ?? null,
            // Which element of the component draws this button, so the editor can arrange the
            // elements it already shows rather than list the same buttons a second time.
            element: option.emoji ? elementsByEmoji.get( option.emoji ) ?? null : null
        } ) );
}

/**
 * Function getButtonSheetTiles() :: The buttons the bot ships, as sheet tiles with Discord artwork.
 *
 * Tiles are rebuilt per call from the resolved-icon cache rather than memoised, so a button whose
 * emoji failed to resolve once picks its artwork up on a later request without a server restart.
 */
export async function getButtonSheetTiles(): Promise<ReadonlyArray<SheetTile>> {
    const options = loadOptions();

    if ( ! cachedNames ) {
        cachedNames = discoverNames( options );
    }

    await ensureDataUris( cachedNames );

    return tilesFromSelectOptions( options, ( name ) => {
        const dataUri = dataUriCache.get( name );

        return dataUri ? iconSvgFromImage( dataUri ) : null;
    } );
}

/**
 * Function getEmojiManifest() :: Every application custom emoji as `name -> data uri`.
 *
 * The browser cannot resolve a custom emoji id itself - that needs the bot token - so the site and
 * dashboard read their emoji artwork from here. Data uris rather than cdn urls, so the same string
 * works in a live `<img>`, in inlined svg, and in the sheet tool's canvas export, none of which can
 * agree on whether a remote reference is allowed to load.
 */
export async function getEmojiManifest(): Promise<Record<string, string>> {
    await emojiPreviewService.ensureCache();

    const names = Object.keys( emojiPreviewService.getCacheSnapshot() ?? {} );

    await ensureDataUris( names );

    const manifest: Record<string, string> = {};

    for ( const name of names ) {
        const dataUri = dataUriCache.get( name );

        if ( dataUri ) {
            manifest[ name ] = dataUri;
        }
    }

    return manifest;
}

/**
 * Function warmEmojiManifest() :: Builds the manifest before anyone asks for it.
 *
 * Resolving it means one call to Discord for the emoji list and then one download per emoji, and
 * on a cold cache that work landed on whichever browser happened to ask first - which measured
 * around nineteen seconds against half a second warm. The client gives up after four, and gives up
 * for good, so that one unlucky visitor lost every icon on the page for their whole session.
 *
 * Awaited by nobody: the server has no reason to delay accepting connections for artwork, and a
 * request arriving mid-warm simply awaits the same promises through `ensureDataUris()`.
 */
export function warmEmojiManifest(): void {
    void getEmojiManifest().catch( () => {
        // A cold manifest is not a reason to fail startup; the first request retries the fetch.
    } );
}
