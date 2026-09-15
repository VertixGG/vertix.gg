import { useLayoutEffect, useRef, useState } from "react";

import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

import { TOOLTIP_CONFIG } from "@vertix.gg/dashboard/src/features/onboarding/lib/constants";
import { resolveTooltipPosition } from "@vertix.gg/dashboard/src/features/onboarding/lib/tooltip-position";
import { useViewportSize } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-viewport-size";

import type { TourRect, TourStep } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourTooltipProps {
    step: TourStep;
    stepNumber: number;
    stepCount: number;
    rect: TourRect | null;
    canAdvance: boolean;
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
}

const BUTTON_CLASS_NAME = "inline-flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 transition-colors";

/**
 * Function TourTooltip() :: What the step has to say, beside what it is about.
 *
 * Measures itself rather than being told how tall it is: how much room a step needs is a matter of
 * how much it has to explain, and the side it can be placed on follows from that.
 */
export function TourTooltip( {
    step,
    stepNumber,
    stepCount,
    rect,
    canAdvance,
    onNext,
    onBack,
    onSkip
}: TourTooltipProps ) {
    const cardRef = useRef<HTMLDivElement | null>( null );

    const [ height, setHeight ] = useState( 0 );

    const viewport = useViewportSize();

    useLayoutEffect( () => {
        const card = cardRef.current;

        if ( ! card ) {
            return;
        }

        const observer = new ResizeObserver( () => setHeight( card.offsetHeight ) );

        observer.observe( card );
        setHeight( card.offsetHeight );

        return () => observer.disconnect();
    }, [] );

    const position = resolveTooltipPosition( rect, step.placement ?? "right", height, viewport ),
        isFirstStep = 1 === stepNumber,
        isLastStep = stepNumber === stepCount;

    return (
        <div
            ref={ cardRef }
            className="fixed z-50 bg-surface border border-border-accent rounded-lg shadow-xl"
            style={ { top: position.top, left: position.left, width: TOOLTIP_CONFIG.WIDTH_PX } }
        >
            <div className="p-4">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h2 className="text-base font-semibold text-text-primary mb-0">{ step.title }</h2>
                    <span className="text-xs text-text-muted tabular-nums shrink-0">
                        { stepNumber } / { stepCount }
                    </span>
                </div>

                <p className="text-sm text-text-secondary mb-0">{ step.body }</p>

                { step.gate && ! canAdvance && (
                    <p className="text-xs text-text-accent mt-3 mb-0">
                        Go ahead and try it — the tour waits for you.
                    </p>
                ) }
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border">
                <button
                    onClick={ onSkip }
                    className={ `${ BUTTON_CLASS_NAME } text-text-muted hover:text-text-primary` }
                >
                    <X className="w-3.5 h-3.5" />
                    Skip
                </button>

                <div className="flex items-center gap-2">
                    { ! isFirstStep && (
                        <button
                            onClick={ onBack }
                            className={ `${ BUTTON_CLASS_NAME } bg-surface-elevated hover:bg-surface-hover
                                text-text-secondary border border-border` }
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    ) }

                    <button
                        onClick={ onNext }
                        disabled={ ! canAdvance }
                        className={ `${ BUTTON_CLASS_NAME } bg-accent-muted hover:bg-accent-hover text-text-primary
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-muted` }
                    >
                        { isLastStep ? <Check className="w-3.5 h-3.5" /> : null }
                        { isLastStep ? "Done" : "Next" }
                        { isLastStep ? null : <ArrowRight className="w-3.5 h-3.5" /> }
                    </button>
                </div>
            </div>
        </div>
    );
}
