import { useCallback } from "react";

import { create } from "zustand";

interface TourAnchorState {
    anchors: Record<string, HTMLElement>;
    setAnchor: ( anchorId: string, element: HTMLElement | null ) => void;
}

const useTourAnchorStore = create<TourAnchorState>( ( set ) => ( {
    anchors: {},

    setAnchor: ( anchorId, element ) => set( ( state ) => {
        if ( ! element ) {
            if ( ! ( anchorId in state.anchors ) ) {
                return state;
            }

            const remaining = { ...state.anchors };

            delete remaining[ anchorId ];

            return { anchors: remaining };
        }

        if ( state.anchors[ anchorId ] === element ) {
            return state;
        }

        return { anchors: { ...state.anchors, [ anchorId ]: element } };
    } )
} ) );

/**
 * Function useTourAnchor() :: Makes an element addressable by a tour.
 *
 * Handed back as a ref for the element to carry, rather than found on the page afterwards by a
 * selector: a step then points at what react actually rendered, and an element that unmounts takes
 * its anchor with it instead of leaving a step aimed at nothing.
 *
 * Nothing here knows what any tour is about. An element says what it is, and a tour written later
 * decides whether it has anything to say about it.
 */
export function useTourAnchor( anchorId: string ) {
    const setAnchor = useTourAnchorStore( ( state ) => state.setAnchor );

    return useCallback( ( element: HTMLElement | null ) => {
        setAnchor( anchorId, element );
    }, [ anchorId, setAnchor ] );
}

/**
 * Function useTourAnchorElement() :: The element an anchor currently stands for.
 *
 * Null while the screen it lives on has not been drawn yet, which is the ordinary state of an
 * anchor on a page the reader has not reached.
 */
export function useTourAnchorElement( anchorId: string | undefined ): HTMLElement | null {
    return useTourAnchorStore( ( state ) => anchorId ? state.anchors[ anchorId ] ?? null : null );
}
