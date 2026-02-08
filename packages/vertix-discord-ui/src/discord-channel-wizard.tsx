import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";

import "./styles/discord-channel-wizard.css";

import { DiscordChannelDisplay  } from "./discord-channel-display";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

import type { DiscordChannelDisplayProps } from "./discord-channel-display";

export interface WizardStep {
    title: string;
    description?: string;
    channelDisplayProps: DiscordChannelDisplayProps;
    titleClassName?: string;
}

export interface DiscordChannelWizardProps extends React.HTMLAttributes<HTMLDivElement> {
    steps: WizardStep[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showStepIndicators?: boolean;
    showNavigation?: boolean;
    pauseOnHover?: boolean;
}

export const DiscordChannelWizard: React.FC<DiscordChannelWizardProps> = ( {
    steps,
    autoPlay = true,
    autoPlayInterval = 3000,
    showStepIndicators = true,
    showNavigation = true,
    pauseOnHover = true,
    className,
    ...props
} ) => {
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const [ isPaused, setIsPaused ] = useState( false );
    const [ isTransitioning, setIsTransitioning ] = useState( false );
    const intervalRef = useRef<NodeJS.Timeout | null>( null );

    const goToStep = useCallback( ( step: number ) => {
        setIsTransitioning( true );
        setTimeout( () => {
            setCurrentStep( step );
            setIsTransitioning( false );
        }, 150 );
    }, [] );

    const nextStep = useCallback( () => {
        goToStep( ( currentStep + 1 ) % steps.length );
    }, [ currentStep, steps.length, goToStep ] );

    const prevStep = useCallback( () => {
        goToStep( ( currentStep - 1 + steps.length ) % steps.length );
    }, [ currentStep, steps.length, goToStep ] );

    useEffect( () => {
        if ( autoPlay && ! isPaused ) {
            intervalRef.current = setInterval( nextStep, autoPlayInterval );
        }

        return () => {
            if ( intervalRef.current ) {
                clearInterval( intervalRef.current );
            }
        };
    }, [ autoPlay, isPaused, autoPlayInterval, nextStep ] );

    const handleMouseEnter = () => {
        if ( pauseOnHover ) {
            setIsPaused( true );
        }
    };

    const handleMouseLeave = () => {
        if ( pauseOnHover ) {
            setIsPaused( false );
        }
    };

    const step = steps[ currentStep ];

    if ( ! step ) {
        return null;
    }

    return (
        <div
            className={ cn( "discord-channel-wizard", className ) }
            onMouseEnter={ handleMouseEnter }
            onMouseLeave={ handleMouseLeave }
            { ...props }
        >
            <div className="discord-channel-wizard-header">
                <div className={ cn( "discord-channel-wizard-title", step.titleClassName ) }>
                    <span className="discord-channel-wizard-step-number">Step { currentStep + 1 }:</span>
                    { " " }{ step.title }
                </div>
                { step.description && (
                    <p className="discord-channel-wizard-description">{ step.description }</p>
                ) }
            </div>

            <div className={ cn( "discord-channel-wizard-content", isTransitioning && "transitioning" ) }>
                <DiscordChannelDisplay { ...step.channelDisplayProps } />
            </div>

            { ( showStepIndicators || showNavigation ) && (
                <div className="discord-channel-wizard-footer">
                    { showNavigation && (
                        <button
                            className="discord-channel-wizard-nav-btn"
                            onClick={ prevStep }
                            aria-label="Previous step"
                        >
                            ‹
                        </button>
                    ) }

                    { showStepIndicators && (
                        <div className="discord-channel-wizard-indicators">
                            { steps.map( ( _, index ) => (
                                <button
                                    key={ index }
                                    className={ cn(
                                        "discord-channel-wizard-indicator",
                                        index === currentStep && "active"
                                    ) }
                                    onClick={ () => goToStep( index ) }
                                    aria-label={ `Go to step ${ index + 1 }` }
                                />
                            ) ) }
                        </div>
                    ) }

                    { showNavigation && (
                        <button
                            className="discord-channel-wizard-nav-btn"
                            onClick={ nextStep }
                            aria-label="Next step"
                        >
                            ›
                        </button>
                    ) }
                </div>
            ) }

            { autoPlay && (
                <div className="discord-channel-wizard-progress">
                    <div
                        className={ cn( "discord-channel-wizard-progress-bar", isPaused && "paused" ) }
                        style={ { animationDuration: `${ autoPlayInterval }ms` } }
                        key={ currentStep }
                    />
                </div>
            ) }
        </div>
    );
};

export default DiscordChannelWizard;
