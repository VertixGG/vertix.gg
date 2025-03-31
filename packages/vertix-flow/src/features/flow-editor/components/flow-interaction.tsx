import React, { useEffect, useState } from "react";

import { ErrorState, LoadingState } from "@vertix.gg/flow/src/features/flow-editor/components/display";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";
import {
  CurrentStateDisplay,
  TransitionsControls,
  FlowStateDataDisplay
} from "@vertix.gg/flow/src/features/flow-editor/components/interaction";

import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";
import { useFlowTransition } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-transition";

import type { FlowInteractionController } from "@vertix.gg/flow/src/shared/lib/flow-factory";

/**
 * Interface for flow classes that can be controlled
 */
export interface FlowClass {
    new(): {
        getInitialState: () => string;
        getAvailableTransitions: ( state: string ) => string[];
        getData: () => Record<string, unknown> | null;
        transition?: ( transitionName: string ) => void;
        getTargetFlowName?: ( transition: string ) => string | undefined;
    };
}

export interface FlowInteractionProps {
    flowName: string;
    FlowClass: FlowClass;
    className?: string;
}

/**
 * FlowInteraction component provides UI for interacting with flow state transitions
 */
export function FlowInteraction( {
    flowName,
    FlowClass,
    className
}: FlowInteractionProps ) {
    const [ currentState, setCurrentState ] = useState<string | null>( null );
    const [ availableTransitions, setAvailableTransitions ] = useState<string[]>( [] );
    const [ flowData, setFlowData ] = useState<Record<string, unknown>>( {} );
    const [ controller, setController ] = useState<FlowInteractionController | null>( null );
    const { error, setError, setLoading } = useFlowUI();

    // Initialize flow
    useEffect( () => {
        try {
            setLoading( true );
            // Use factory directly instead of the hook to avoid React hooks issues
            const interactionController = flowFactory.createFlowInteraction( FlowClass );
            setController( interactionController );

            const initialState = interactionController.getInitialState();
            const transitions = interactionController.getAvailableTransitions( initialState );

            setCurrentState( initialState );
            setAvailableTransitions( transitions );
            setFlowData( interactionController.getStateData() );
        } catch ( err ) {
            console.error( "Error initializing flow:", err );
            setError( "Failed to initialize flow" );
        } finally {
            setLoading( false );
        }
    }, [ FlowClass, setError, setLoading ] );

    // Use our new hook for handling transitions
    const { handleTransition } = useFlowTransition( {
        controller,
        setCurrentState,
        setAvailableTransitions,
        setFlowData,
    } );

    // Show error state if there's an error
    if ( error ) {
        return <ErrorState message={error} />;
    }

    // Show loading state if we're still initializing
    if ( !currentState ) {
        return <LoadingState title="Loading Flow..." showHeader={true} />;
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>
                    Flow: {flowName}
                    <Badge variant="outline" className="ml-2">
                        {currentState}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <CurrentStateDisplay currentState={currentState} />
                    <TransitionsControls
                        transitions={availableTransitions}
                        onTransition={handleTransition}
                    />
                    <FlowStateDataDisplay flowData={flowData} />
                </div>
            </CardContent>
        </Card>
    );
}
