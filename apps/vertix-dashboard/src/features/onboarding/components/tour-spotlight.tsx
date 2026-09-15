import { SPOTLIGHT_CONFIG } from "@vertix.gg/dashboard/src/features/onboarding/lib/constants";

import type { TourRect } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourSpotlightProps {
    rect: TourRect | null;
}

const PANEL_CLASS_NAME = "fixed bg-black/60 z-40";

function clampSize( value: number ): number {
    return Math.max( 0, value );
}

/**
 * Function TourSpotlight() :: Everything but the one thing the step is about, dimmed.
 *
 * Four panels around a hole rather than one sheet with a hole cut in it, because the panels are
 * what stops a click going anywhere else - a shadow cast over the page is not hit tested, so a
 * reader would still be able to wander off mid-step. What is left uncovered is the anchor itself,
 * which a step that waits on a real click needs to stay clickable.
 */
export function TourSpotlight( { rect }: TourSpotlightProps ) {
    if ( ! rect ) {
        return <div className={ `${ PANEL_CLASS_NAME } inset-0` } />;
    }

    const top = rect.top - SPOTLIGHT_CONFIG.PADDING_PX,
        left = rect.left - SPOTLIGHT_CONFIG.PADDING_PX,
        width = rect.width + ( SPOTLIGHT_CONFIG.PADDING_PX * 2 ),
        height = rect.height + ( SPOTLIGHT_CONFIG.PADDING_PX * 2 );

    return (
        <>
            <div
                className={ PANEL_CLASS_NAME }
                style={ { top: 0, left: 0, right: 0, height: clampSize( top ) } }
            />
            <div
                className={ PANEL_CLASS_NAME }
                style={ { top: top + height, left: 0, right: 0, bottom: 0 } }
            />
            <div
                className={ PANEL_CLASS_NAME }
                style={ { top, left: 0, width: clampSize( left ), height: clampSize( height ) } }
            />
            <div
                className={ PANEL_CLASS_NAME }
                style={ { top, left: left + width, right: 0, height: clampSize( height ) } }
            />

            <div
                className="fixed z-40 border-2 border-accent pointer-events-none"
                style={ { top, left, width, height, borderRadius: SPOTLIGHT_CONFIG.RADIUS_PX } }
            />
        </>
    );
}
