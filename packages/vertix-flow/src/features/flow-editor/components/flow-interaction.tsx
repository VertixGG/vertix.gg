import React, { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";
import { ErrorState, LoadingState } from "./display";
import {
  CurrentStateDisplay,
  TransitionsControls,
  FlowStateDataDisplay
} from "./interaction";
import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { FlowInteractionController } from "@vertix.gg/flow/src/shared/lib/flow-factory";

/**
 * Interface for flow classes that can be controlled
 */
export interface FlowClass {
    getInitialState: () => string;
    getAvailableTransitions: ( state: string ) => string[];
    getData: () => Record<string, unknown> | null;
    transition?: ( transitionName: string ) => void;
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

    const handleTransition = useCallback( ( transition: string ) => {
        if ( !controller ) return;

        try {
            setLoading( true );
            controller.performTransition( transition );

            // Update state after transition
            const newState = controller.getInitialState();
            const transitions = controller.getAvailableTransitions( newState );

            setCurrentState( newState );
            setAvailableTransitions( transitions );
            setFlowData( controller.getStateData() );
        } catch ( err ) {
            console.error( `Error during transition ${ transition }:`, err );
            setError( `Failed to perform transition: ${ transition }` );
        } finally {
            setLoading( false );
        }
    }, [ controller, setError, setLoading ] );

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
