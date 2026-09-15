import { useCallback, useEffect, useRef, useState } from "react";

import { TourSpotlight } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-spotlight";
import { TourTooltip } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-tooltip";
import { useTourStore } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-store";
import { useTourAnchorElement } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-anchor";
import { useElementRect } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-element-rect";
import { OPTIONAL_STEP_GRACE_MS } from "@vertix.gg/dashboard/src/features/onboarding/lib/constants";

import type { TourDefinition } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourRunnerProps {
    tour: TourDefinition;
    onFinish: () => void;
}

/**
 * Function TourRunner() :: Walks a tour, whatever the tour happens to be about.
 *
 * Knows only the shape of a step: what it is about, and whether it is waiting on the reader.
 * Everything a particular tour has to say lives in its own definition, so a second tour is another
 * list rather than another runner.
 *
 * It does not move the reader anywhere. Pointing at the thing to press and pressing it for them are
 * different lessons, and only one of them is still true tomorrow when the tour is not there.
 */
export function TourRunner( { tour, onFinish }: TourRunnerProps ) {
    const status = useTourStore( ( state ) => state.status );
    const tourId = useTourStore( ( state ) => state.tourId );
    const stepIndex = useTourStore( ( state ) => state.stepIndex );
    const setStepIndex = useTourStore( ( state ) => state.setStepIndex );
    const stop = useTourStore( ( state ) => state.stop );

    const isRunning = "running" === status && tourId === tour.id,
        step = isRunning ? tour.steps[ stepIndex ] : undefined;

    const element = useTourAnchorElement( step?.anchor ),
        rect = useElementRect( element );

    const [ isGateOpen, setIsGateOpen ] = useState( false );

    /**
     * The steps the reader has already done the thing for.
     *
     * Going back over a step must not ask for it again, because it often cannot be given again -
     * the Edit button is gone once the editor is open, so a step that re-locked behind it would be
     * a dead end with Skip as the only way out.
     */
    const satisfiedGatesRef = useRef<Set<string>>( new Set() );

    useEffect( () => {
        satisfiedGatesRef.current = new Set();
    }, [ tourId ] );

    useEffect( () => {
        setIsGateOpen( step ? satisfiedGatesRef.current.has( step.id ) : false );
    }, [ stepIndex, tourId, step ] );

    useEffect( () => {
        if ( ! step?.gate || ! element ) {
            return;
        }

        const { on, satisfiedBy } = step.gate;

        const openGate = () => {
            if ( satisfiedBy && ! satisfiedBy( element ) ) {
                return;
            }

            satisfiedGatesRef.current.add( step.id );

            setIsGateOpen( true );
        };

        element.addEventListener( on, openGate );

        return () => element.removeEventListener( on, openGate );
    }, [ step?.gate, element ] );

    // An optional step whose anchor never turns up is not this server's step. The wait is what
    // tells the two apart: an anchor on a panel still being drawn arrives and cancels it, and one
    // that is not on this screen at all never does.
    useEffect( () => {
        if ( ! step?.optional || element ) {
            return;
        }

        const timer = setTimeout( () => setStepIndex( stepIndex + 1 ), OPTIONAL_STEP_GRACE_MS );

        return () => clearTimeout( timer );
    }, [ step?.optional, element, stepIndex, setStepIndex ] );

    const finish = useCallback( () => {
        stop();
        onFinish();
    }, [ stop, onFinish ] );

    // A step index past the end of a tour that is still marked as running - reachable if a tour is
    // ever shortened while somebody is inside it.
    useEffect( () => {
        if ( ! isRunning || step ) {
            return;
        }

        finish();
    }, [ isRunning, step, finish ] );

    if ( ! isRunning || ! step ) {
        return null;
    }

    const handleNext = () => {
        if ( stepIndex + 1 >= tour.steps.length ) {
            finish();

            return;
        }

        setStepIndex( stepIndex + 1 );
    };

    return (
        <>
            <TourSpotlight rect={ rect } />

            <TourTooltip
                step={ step }
                stepNumber={ stepIndex + 1 }
                stepCount={ tour.steps.length }
                rect={ rect }
                canAdvance={ ! step.gate || isGateOpen }
                onNext={ handleNext }
                onBack={ () => setStepIndex( stepIndex - 1 ) }
                onSkip={ finish }
            />
        </>
    );
}
