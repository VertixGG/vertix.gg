import React, { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";

import type { FlowInteractionController } from "@vertix.gg/flow/src/shared/lib/flow-factory";

interface FlowClass {
    getInitialState: () => string;
    getAvailableTransitions: ( state: string ) => string[];
    getData: () => Record<string, unknown> | null;
    transition?: ( transitionName: string ) => void;
}

interface FlowInteractionProps {
    flowName: string;
    FlowClass: FlowClass;
}

export function FlowInteraction( { flowName, FlowClass }: FlowInteractionProps ) {
    const [ currentState, setCurrentState ] = useState<string | null>( null );
    const [ availableTransitions, setAvailableTransitions ] = useState<string[]>( [] );
    const [ flowData, setFlowData ] = useState<Record<string, unknown>>( {} );
    const [ controller, setController ] = useState<FlowInteractionController | null>( null );
    const [ error, setError ] = useState<string | null>( null );

    // Initialize flow
    useEffect( () => {
        try {
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
        }
    }, [ FlowClass ] );

    const handleTransition = useCallback( ( transition: string ) => {
        if ( !controller ) return;

        try {
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
        }
    }, [ controller ] );

    // Show error state if there's an error
    if ( error ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    // Show loading state if we're still initializing
    if ( !currentState ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Flow...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
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
                    <div>
                        <h3 className="font-medium mb-2">Current State</h3>
                        <div className="p-2 bg-neutral-100 rounded">
                            {currentState}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Available Transitions</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTransitions.length > 0 ? (
                                availableTransitions.map( ( transition ) => (
                                    <Button
                                        key={transition}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTransition( transition )}
                                    >
                                        {transition}
                                    </Button>
                                ) )
                            ) : (
                                <p className="text-sm text-neutral-500">No transitions available</p>
                            )}
                        </div>
                    </div>

                    {Object.keys( flowData ).length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Flow Data</h3>
                            <div className="p-2 bg-neutral-100 rounded text-sm">
                                <pre>{JSON.stringify( flowData, null, 2 )}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
