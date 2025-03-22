import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/components/ui/card";
import { Button } from "@vertix.gg/flow/src/components/ui/button";
import { Badge } from "@vertix.gg/flow/src/components/ui/badge";

interface FlowInteractionProps {
    flowName: string;
    FlowClass: any; // The actual flow class
}

export function FlowInteraction( { flowName, FlowClass }: FlowInteractionProps ) {
    const [ currentState, setCurrentState ] = useState<string | null>( null );
    const [ availableTransitions, setAvailableTransitions ] = useState<string[]>( [] );
    const [ flowData, setFlowData ] = useState<Record<string, unknown>>( {} );

    // Initialize flow
    useEffect( () => {
        const initializeFlow = () => {
            try {
                // Initialize the flow with the provided class
                const flow = new FlowClass();
                const initialState = flow.getInitialState();
                const transitions = flow.getAvailableTransitions( initialState );

                setCurrentState( initialState );
                setAvailableTransitions( transitions );
                setFlowData( flow.getData() || {} );
            } catch ( error ) {
                console.error( "Error initializing flow:", error );
            }
        };

        initializeFlow();
    }, [ FlowClass ] );

    const handleTransition = useCallback( ( transition: string ) => {
        // TODO: Handle flow transition
        console.log( `Transitioning with: ${ transition }` );
    }, [] );

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
                <CardTitle>{flowName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium mb-2">Current State</h3>
                    <Badge variant="outline" className="text-base">
                        {currentState}
                    </Badge>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">Available Transitions</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableTransitions.map( ( transition ) => (
                            <Button
                                key={transition}
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTransition( transition )}
                            >
                                {transition}
                            </Button>
                        ) )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">Flow Data</h3>
                    <pre className="bg-muted p-2 rounded-md text-sm overflow-auto max-h-[200px]">
                        {JSON.stringify( flowData, null, 2 )}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
