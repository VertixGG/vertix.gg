import { SELECT_MENU_ELEMENT_TYPES } from "@vertix.gg/definitions/src/ui-export-definitions";

import type { UIExportElementDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";

export interface MeasurableElement {
    name: string;
    definition?: UIExportElementDefinition;
}

// Discord's own button box, measured in the live client: 11px of padding either side of a 1px
// border, a 60px floor, a 19px emoji with a 4px gap, and 14px/500 text that is never truncated -
// the label alone decides the width. The character advance is the average measured off real
// buttons in the client (6.2 to 8.2 depending on the glyphs), nudged up so a row keeps a little
// air rather than wrapping.
const CHARACTER_WIDTH = 7.4;
const BUTTON_CHROME = 24;
const BUTTON_MIN_WIDTH = 60;
const EMOJI_WIDTH = 24;
const ELEMENT_GAP = 8;
const ROW_SLACK = 8;
// A select menu is a fixed 400px box in discord, whatever its placeholder says.
const SELECT_WIDTH = 400;

// What surrounds the row: the node body's p-4, and the message's 4.5rem avatar column plus its
// 1rem end padding - discord indents a message by the avatar's width whether or not one is drawn.
const BODY_PADDING = 32;
const MESSAGE_GUTTER = 88;

// Discord sizes a message from what is in it: the buttons take the width their labels need, and
// the embed caps itself at 516 inside the same column. The browser does that arithmetic on the
// real glyphs, so this estimate exists only for the layout's first pass - before react flow has
// measured a node, dagre still needs a width to reserve. It predicts the same two inputs: an
// embed's cap as the floor, the widest row above it.
const EMBED_MAX_WIDTH = 516;
const MAX_CONTENT_COLUMN = 740;

export const COMPONENT_NODE_BASE_WIDTH = EMBED_MAX_WIDTH + BODY_PADDING + MESSAGE_GUTTER;
export const COMPONENT_NODE_MAX_WIDTH = MAX_CONTENT_COLUMN + BODY_PADDING + MESSAGE_GUTTER;

export function formatElementFallbackLabel( elementName: string ): string {
    const lastSegment = elementName.split( "/" ).pop() ?? elementName;

    return lastSegment
        .replace( /[-_]+/g, " " )
        .replace( /([a-z0-9])([A-Z])/g, "$1 $2" )
        .trim();
}

export function getElementLabel( element: MeasurableElement ): string {
    if ( element.definition?.labelOmitted ) {
        return "";
    }

    if ( element.definition?.label ) {
        return element.definition.label;
    }

    const candidate = element.definition?.name ?? element.name;

    return formatElementFallbackLabel( candidate );
}

export function isSelectMenu( element: MeasurableElement ): boolean {
    const elementType = element.definition?.elementType;

    if ( elementType ) {
        return ( SELECT_MENU_ELEMENT_TYPES as readonly string[] ).includes( elementType );
    }

    return element.name.toLowerCase().includes( "selectmenu" ) || element.name.toLowerCase().includes( "select" );
}

function measureElement( element: MeasurableElement ): number {
    const label = getElementLabel( element );

    if ( isSelectMenu( element ) ) {
        return SELECT_WIDTH;
    }

    const emoji = element.definition?.emoji ? EMOJI_WIDTH : 0;

    return Math.max(
        BUTTON_MIN_WIDTH,
        BUTTON_CHROME + emoji + Math.round( label.length * CHARACTER_WIDTH )
    );
}

/**
 * Function measureComponentNodeWidth() :: How wide a component node is, so its widest row fits on
 * one line.
 *
 * A row is an action row - discord already decided what belongs together, so wrapping it in the
 * editor shows a layout the member will never see. A component carrying four labelled buttons
 * asks for more room than one carrying a single button, and gets it, up to a cap that keeps the
 * graph readable.
 *
 * The one number both the rendered node and the dagre layout size themselves by, so the spacing
 * between nodes matches what is actually drawn.
 */
export function measureComponentNodeWidth( elementRows?: MeasurableElement[][] ): number {
    const widest = ( elementRows ?? [] ).reduce( ( acc, row ) => {
        if ( !row.length ) {
            return acc;
        }

        const width = row.reduce( ( sum, element ) => sum + measureElement( element ), 0 )
            + ( row.length - 1 ) * ELEMENT_GAP;

        return Math.max( acc, width );
    }, 0 );

    if ( !widest ) {
        return COMPONENT_NODE_BASE_WIDTH;
    }

    const column = Math.min(
        MAX_CONTENT_COLUMN,
        Math.max( EMBED_MAX_WIDTH, widest + ROW_SLACK )
    );

    return column + BODY_PADDING + MESSAGE_GUTTER;
}
