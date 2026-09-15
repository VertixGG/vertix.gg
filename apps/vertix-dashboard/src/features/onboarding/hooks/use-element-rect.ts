import { useLayoutEffect, useState } from "react";

import type { TourRect } from "@vertix.gg/dashboard/src/features/onboarding/types";

function readRect( element: HTMLElement ): TourRect {
    const { top, left, width, height } = element.getBoundingClientRect();

    return { top, left, width, height };
}

function isSameRect( left: TourRect | null, right: TourRect | null ): boolean {
    if ( ! left || ! right ) {
        return left === right;
    }

    return left.top === right.top
        && left.left === right.left
        && left.width === right.width
        && left.height === right.height;
}

/**
 * Function useElementRect() :: Where an element is on screen, kept current.
 *
 * Measured once as soon as there is something to measure, and then again every frame.
 *
 * The two are not the same job. The first has to happen now: a tab in the background is handed no
 * frames at all, so a rect that waited for one would never arrive, and a step would sit there
 * dimming the whole screen instead of pointing at anything. It also spares the reader a frame of
 * that same full dim every time a step opens.
 *
 * The second is for the one anchor that moves under its own steam - a node on the canvas, which the
 * canvas moves by transforming a parent, raising neither scroll nor resize. A frame that measures
 * the same box as the last one changes no state, so a still screen settles into doing nothing.
 */
export function useElementRect( element: HTMLElement | null ): TourRect | null {
    const [ rect, setRect ] = useState<TourRect | null>( null );

    useLayoutEffect( () => {
        if ( ! element ) {
            setRect( null );

            return;
        }

        const update = () => setRect( ( previous ) => {
            const next = readRect( element );

            return isSameRect( previous, next ) ? previous : next;
        } );

        update();

        let frame = requestAnimationFrame( function track() {
            update();

            frame = requestAnimationFrame( track );
        } );

        return () => cancelAnimationFrame( frame );
    }, [ element ] );

    return rect;
}
