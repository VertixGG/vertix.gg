export interface SheetTile {
    id: string;
    label: string;
    iconSvg: string | null;
}

export interface SheetConfig {
    cols: number;
    scale: number;
    title: boolean;
    note: string;
    omit: ReadonlyArray<string>;
}

export interface SheetSvg {
    svg: string;
    width: number;
    height: number;
}

export interface SheetSvgOptions {
    /**
     * A base64 truetype face to carry inside the document.
     *
     * The page needs nothing here - inline svg resolves fonts against the document, and the site
     * already loads the webfont. A rasteriser is the opposite case: an svg opened as an image may
     * not fetch anything, so without this the labels silently fall back to a system face.
     */
    embeddedFont?: string;
}

export const BUTTONS_MENU_ELEMENT = "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu";

const EMOJI_NAME = /^<emoji name='([^']+)'>$/;

/** Labels that read better on two lines than as one long pill. */
const WRAPPED_LABELS: Readonly<Record<string, string>> = {
    "edit-primary-message": "EDIT PRIMARY\nMESSAGE"
};

export interface SheetSourceOption {
    value?: string | null;
    label?: string | null;
    emoji?: string | null;
}

/**
 * Function tilesFromSelectOptions() :: The buttons the bot ships, as sheet tiles.
 *
 * Both the page and the api go through here, so the label text, the wrapping and the artwork
 * lookup are decided once. Each side only has to find the menu and say how to load an icon.
 */
export function tilesFromSelectOptions(
    options: ReadonlyArray<SheetSourceOption>,
    loadIcon: ( baseName: string ) => string | null
): ReadonlyArray<SheetTile> {
    return options.map( ( option ) => {
        const id = option.value ?? "",
            baseName = EMOJI_NAME.exec( option.emoji ?? "" )?.[ 1 ] ?? "";

        return {
            id,
            label: WRAPPED_LABELS[ id ] ?? ( option.label ?? "" ).toUpperCase(),
            iconSvg: loadIcon( baseName )
        };
    } );
}

export const SHEET_FONT_FAMILY = "Red Hat Display";

const FONT_SIZE = 26;

/**
 * Advance widths of Red Hat Display 700, in em, measured off the live face.
 *
 * Pure svg has no auto sizing grid, so every column width is computed rather than discovered, and
 * that needs real metrics. A wrong table does not fail loudly - it produces pills whose text
 * overflows or floats - so these are measured values, not estimates.
 */
const ADVANCE: Readonly<Record<string, number>> = {
    " ": 0.2052, "!": 0.2274, "#": 0.7239, "&": 0.6741, "'": 0.2322, "(": 0.4047, ")": 0.4047,
    ",": 0.25, "-": 0.4548, ".": 0.25, "/": 0.4948, ":": 0.25, "?": 0.5197,
    "0": 0.6777, "1": 0.3302, "2": 0.6, "3": 0.6, "4": 0.6558, "5": 0.6, "6": 0.6, "7": 0.6,
    "8": 0.6, "9": 0.6282,
    A: 0.7153, B: 0.6805, C: 0.7191, D: 0.7323, E: 0.6361, F: 0.6291, G: 0.7919, H: 0.7312,
    I: 0.259, J: 0.6285, K: 0.6719, L: 0.6202, M: 0.871, N: 0.7412, O: 0.8115, P: 0.6705,
    Q: 0.8115, R: 0.6685, S: 0.6216, T: 0.641, U: 0.7182, V: 0.7153, W: 0.9247, X: 0.6802,
    Y: 0.6846, Z: 0.6128
};

const FALLBACK_ADVANCE = 0.62;

const EM = {
    gap: 0.7,
    padding: 1.05,
    tileHeight: 2.6,
    radius: 0.62,
    icon: 1.35,
    iconGap: 0.46,
    padLeft: 0.6,
    padRight: 0.8,
    letterSpacing: 0.015,
    lineHeight: 1.02,
    capHeight: 0.7,
    wordmark: 0.82,
    note: 0.55,
    noteLineHeight: 1.35
} as const;

const COLOR = {
    page: "#1b1e22",
    pill: "#3a3d43",
    text: "#ffffff",
    note: "#b6bcc4"
} as const;

export function measureText( text: string, fontSize: number ): number {
    let advances = 0;

    for ( const character of text ) {
        advances += ADVANCE[ character.toUpperCase() ] ?? FALLBACK_ADVANCE;
    }

    return ( advances * fontSize ) + ( EM.letterSpacing * fontSize * text.length );
}

function escapeXml( value: string ): string {
    return value
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" )
        .replace( /"/g, "&quot;" );
}

/**
 * Function inlineIcon() :: One icon, pinned into the sheet and made unable to touch the others.
 *
 * Every id in the file is rewritten behind a per icon prefix. The eleven icons between them declare
 * over a hundred ids and reuse the same names, so without this a `url(#a)` in the tenth icon
 * resolves to the first icon's gradient and the sheet silently repaints itself.
 */
function inlineIcon( source: string, prefix: string, x: number, y: number, size: number ): string {
    const withoutProlog = source
        .replace( /<\?xml[\s\S]*?\?>/g, "" )
        .replace( /<!DOCTYPE[\s\S]*?>/g, "" )
        .trim();

    const namespaced = withoutProlog
        .replace( /\bid="([^"]+)"/g, ( _match, id: string ) => `id="${ prefix }${ id }"` )
        .replace( /url\(#([^)]+)\)/g, ( _match, id: string ) => `url(#${ prefix }${ id })` )
        .replace( /\b(xlink:href|href)="#([^"]+)"/g, ( _match, attribute: string, id: string ) =>
            `${ attribute }="#${ prefix }${ id }"` );

    return namespaced.replace( /<svg\b([^>]*)>/, ( _match, attributes: string ) => {
        const kept = attributes
            .replace( /\s(width|height|x|y)="[^"]*"/g, "" )
            .trim();

        return `<svg ${ kept } x="${ round( x ) }" y="${ round( y ) }"` +
            ` width="${ round( size ) }" height="${ round( size ) }">`;
    } );
}

function round( value: number ): number {
    return Math.round( value * 100 ) / 100;
}

function labelLines( label: string ): ReadonlyArray<string> {
    return label.split( "\n" );
}

function labelWidth( label: string, fontSize: number ): number {
    return labelLines( label ).reduce( ( widest, line ) => Math.max( widest, measureText( line, fontSize ) ), 0 );
}

/**
 * Function buildSheetSvg() :: The sheet, as a standalone svg document.
 *
 * This is the single renderer: the page shows exactly this markup inline, and the api hands the very
 * same string to a rasteriser. Anything drawn here is drawn identically in the png.
 */
export function buildSheetSvg(
    tiles: ReadonlyArray<SheetTile>,
    config: SheetConfig,
    options: SheetSvgOptions = {}
): SheetSvg {
    const fontSize = FONT_SIZE,
        gap = EM.gap * fontSize,
        padding = EM.padding * fontSize,
        tileHeight = EM.tileHeight * fontSize,
        iconSize = EM.icon * fontSize;

    const shown = tiles.filter( ( tile ) => ! config.omit.includes( tile.id ) );

    const columns = Math.max( 1, config.cols ),
        rows = Math.max( 1, Math.ceil( shown.length / columns ) );

    const fixed = ( EM.padLeft + EM.icon + EM.iconGap + EM.padRight ) * fontSize;

    const columnWidths: number[] = [];

    for ( let column = 0; column < columns; column++ ) {
        let widest = 0;

        for ( let index = column; index < shown.length; index += columns ) {
            widest = Math.max( widest, labelWidth( shown[ index ].label, fontSize ) );
        }

        columnWidths.push( widest + fixed );
    }

    const gridWidth = columnWidths.reduce( ( total, width ) => total + width, 0 ) + ( gap * ( columns - 1 ) );

    const headHeight = config.title ? ( EM.wordmark * 1.2 * fontSize ) + ( 0.2 * fontSize ) : 0,
        noteHeight = config.note ? ( EM.note * EM.noteLineHeight * fontSize ) + ( 0.2 * fontSize ) : 0;

    const noteWidth = config.note ? measureText( config.note, EM.note * fontSize ) : 0;

    const width = Math.ceil( Math.max( gridWidth, noteWidth ) + ( padding * 2 ) ),
        height = Math.ceil(
            ( padding * 2 ) + headHeight + noteHeight + ( rows * tileHeight ) + ( gap * ( rows - 1 ) )
        );

    const parts: string[] = [];

    if ( options.embeddedFont ) {
        parts.push(
            "<defs><style>@font-face{font-family:\"" + SHEET_FONT_FAMILY + "\";font-weight:700;" +
            `src:url(data:font/ttf;base64,${ options.embeddedFont }) format("truetype");}</style></defs>`
        );
    }

    parts.push( `<rect width="${ width }" height="${ height }" fill="${ COLOR.page }"/>` );

    let cursorY = padding;

    if ( config.title ) {
        const wordmarkSize = EM.wordmark * fontSize;

        parts.push(
            `<text x="${ round( padding ) }"` +
            ` y="${ round( cursorY + ( EM.capHeight * wordmarkSize ) ) }"` +
            ` fill="${ COLOR.text }" font-family="${ SHEET_FONT_FAMILY }" font-weight="700"` +
            ` font-size="${ round( wordmarkSize ) }" letter-spacing="${ round( 0.02 * wordmarkSize ) }"` +
            ">VoiceChannels</text>"
        );

        cursorY += headHeight;
    }

    if ( config.note ) {
        const noteSize = EM.note * fontSize;

        parts.push(
            `<text x="${ round( padding ) }"` +
            ` y="${ round( cursorY + ( EM.capHeight * noteSize ) ) }" fill="${ COLOR.note }"` +
            ` font-family="${ SHEET_FONT_FAMILY }" font-weight="500" font-size="${ round( noteSize ) }">` +
            escapeXml( config.note ) +
            "</text>"
        );

        cursorY += noteHeight;
    }

    shown.forEach( ( tile, index ) => {
        const column = index % columns,
            row = Math.floor( index / columns );

        let x = padding;

        for ( let before = 0; before < column; before++ ) {
            x += columnWidths[ before ] + gap;
        }

        const y = cursorY + ( row * ( tileHeight + gap ) ),
            tileWidth = columnWidths[ column ];

        parts.push(
            `<rect x="${ round( x ) }" y="${ round( y ) }" width="${ round( tileWidth ) }"` +
            ` height="${ round( tileHeight ) }" rx="${ round( EM.radius * fontSize ) }" fill="${ COLOR.pill }"/>`
        );

        const iconX = x + ( EM.padLeft * fontSize ),
            iconY = y + ( ( tileHeight - iconSize ) / 2 );

        if ( tile.iconSvg ) {
            parts.push( inlineIcon( tile.iconSvg, `s${ index }_`, iconX, iconY, iconSize ) );
        }

        const textX = iconX + iconSize + ( EM.iconGap * fontSize ),
            lines = labelLines( tile.label ),
            lineHeight = EM.lineHeight * fontSize,
            blockTop = y + ( ( tileHeight - ( lines.length * lineHeight ) ) / 2 );

        lines.forEach( ( line, lineIndex ) => {
            const baseline = blockTop + ( lineIndex * lineHeight ) + ( lineHeight / 2 ) +
                ( EM.capHeight * fontSize / 2 );

            parts.push(
                `<text x="${ round( textX ) }" y="${ round( baseline ) }" fill="${ COLOR.text }"` +
                ` font-family="${ SHEET_FONT_FAMILY }" font-weight="700" font-size="${ fontSize }"` +
                ` letter-spacing="${ round( EM.letterSpacing * fontSize ) }">` +
                escapeXml( line ) +
                "</text>"
            );
        } );
    } );

    const svg =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"" +
        ` width="${ width }" height="${ height }" viewBox="0 0 ${ width } ${ height }">` +
        parts.join( "" ) +
        "</svg>";

    return { svg, width, height };
}
