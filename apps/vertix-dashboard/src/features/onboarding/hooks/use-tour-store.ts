import { create } from "zustand";

import type { TourStatus } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourState {
    status: TourStatus;
    tourId: string | null;
    stepIndex: number;

    start: ( tourId: string ) => void;
    setStepIndex: ( stepIndex: number ) => void;
    stop: () => void;
}

/**
 * Which tour is running and how far into it the reader is.
 *
 * Deliberately ignorant of what any tour contains - it counts steps without knowing what they are,
 * so the runner is free to decide when the counting has run out.
 */
export const useTourStore = create<TourState>( ( set ) => ( {
    status: "idle",
    tourId: null,
    stepIndex: 0,

    start: ( tourId ) => set( { status: "running", tourId, stepIndex: 0 } ),

    setStepIndex: ( stepIndex ) => set( { stepIndex: Math.max( 0, stepIndex ) } ),

    stop: () => set( { status: "idle", tourId: null, stepIndex: 0 } )
} ) );
