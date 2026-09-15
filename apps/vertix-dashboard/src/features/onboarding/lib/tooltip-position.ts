import { TOOLTIP_CONFIG } from "@vertix.gg/dashboard/src/features/onboarding/lib/constants";

import type { TourPlacement, TourRect } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface Position {
    top: number;
    left: number;
}

interface ViewportSize {
    width: number;
    height: number;
}

/** The side to try when the asked-for one has no room left on it. */
const OPPOSITE_PLACEMENT: Record<TourPlacement, TourPlacement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
    center: "center"
};

function placeBeside( placement: TourPlacement, rect: TourRect, height: number ): Position {
    switch ( placement ) {
        case "top":
            return { top: rect.top - height - TOOLTIP_CONFIG.GAP_PX, left: rect.left };

        case "bottom":
            return { top: rect.top + rect.height + TOOLTIP_CONFIG.GAP_PX, left: rect.left };

        case "left":
            return { top: rect.top, left: rect.left - TOOLTIP_CONFIG.WIDTH_PX - TOOLTIP_CONFIG.GAP_PX };

        default:
            return { top: rect.top, left: rect.left + rect.width + TOOLTIP_CONFIG.GAP_PX };
    }
}

function fitsInViewport( position: Position, height: number, viewport: ViewportSize ): boolean {
    return position.top >= TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX
        && position.left >= TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX
        && position.top + height <= viewport.height - TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX
        && position.left + TOOLTIP_CONFIG.WIDTH_PX <= viewport.width - TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX;
}

function clampToViewport( position: Position, height: number, viewport: ViewportSize ): Position {
    const maxTop = viewport.height - height - TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX,
        maxLeft = viewport.width - TOOLTIP_CONFIG.WIDTH_PX - TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX;

    return {
        top: Math.min( Math.max( position.top, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX ), Math.max( maxTop, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX ) ),
        left: Math.min( Math.max( position.left, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX ), Math.max( maxLeft, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX ) )
    };
}

/**
 * Function resolveTooltipPosition() :: Where the card goes for this step.
 *
 * The asked-for side first, the far side when that one has run out of room, and failing both, the
 * asked-for side pushed back inside the window. A card that hangs off the screen says nothing, so
 * being slightly over its anchor beats being correct about which side it is on.
 *
 * With no anchor to sit beside it goes in the middle, which is where a step about the whole screen
 * belongs anyway.
 */
export function resolveTooltipPosition(
    rect: TourRect | null,
    placement: TourPlacement,
    height: number,
    viewport: ViewportSize
): Position {
    if ( ! rect || "center" === placement ) {
        return {
            top: Math.max( ( viewport.height - height ) / 2, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX ),
            left: Math.max( ( viewport.width - TOOLTIP_CONFIG.WIDTH_PX ) / 2, TOOLTIP_CONFIG.VIEWPORT_MARGIN_PX )
        };
    }

    const preferred = placeBeside( placement, rect, height );

    if ( fitsInViewport( preferred, height, viewport ) ) {
        return preferred;
    }

    const alternative = placeBeside( OPPOSITE_PLACEMENT[ placement ], rect, height );

    if ( fitsInViewport( alternative, height, viewport ) ) {
        return alternative;
    }

    return clampToViewport( preferred, height, viewport );
}
