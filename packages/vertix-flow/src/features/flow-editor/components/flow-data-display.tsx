import React, { useEffect, useState } from "react";

import {
    ErrorState,
    LoadingState,
    TransactionsDisplay,
    RequiredDataDisplay
} from "@vertix.gg/flow/src/features/flow-editor/components/display";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";

import { useFlowData } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-data";
import { useFlowEditorStore } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { FlowDataLoaderProps } from "@vertix.gg/flow/src/features/flow-editor/types/flow-components";
import type { FlowData } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

export interface FlowDataDisplayProps extends Pick<FlowDataLoaderProps, "moduleName" | "flowName" | "onFlowDataLoaded"> {
    className?: string;
}

/**
 * FlowDataDisplay component loads and displays flow data including transactions and required data
 */
export const FlowDataDisplay: React.FC<FlowDataDisplayProps> = ( {
    moduleName,
    flowName,
    onFlowDataLoaded,
    className,
} ) => {
    const [ flowData, setFlowData ] = useState<FlowData | null>( null );
    const error = useFlowEditorStore( state => state.error );
    const setError = useFlowEditorStore( state => state.setError );
    const setLoading = useFlowEditorStore( state => state.setLoading );

    const flowDataResource = useFlowData( moduleName, flowName );
    const data = flowDataResource.read?.().data;

    useEffect( () => {
        try {
            setLoading( true );
            setFlowData( data );

            if( data && onFlowDataLoaded ) {
                onFlowDataLoaded( data );
            }
        } catch( err ) {
            console.error( "Error loading flow data:", err );
            setError( "Failed to load flow data" );
        } finally {
            setLoading( false );
        }
    }, [ data, onFlowDataLoaded, setError, setLoading ] );

    if( error ) {
        return <ErrorState message={ error }/>;
    }

    if( ! flowData ) {
        return <LoadingState message="Loading flow data..."/>;
    }

    const { components, transactions, requiredData } = flowData;
    const schemaType = components && components.length > 0 ? components[ 0 ].type : "unknown";

    return (
        <div className="space-y-4">
            <Card className={ `overflow-auto ${className || ""}` }>
                <CardHeader>
                    <CardTitle>
                        Flow: { flowName }
                        <Badge variant="outline" className="ml-2">
                            { schemaType }
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <TransactionsDisplay transactions={ transactions }/>
                        <Separator/>
                        <RequiredDataDisplay requiredData={ requiredData }/>
                    </div>

                    {/* Display flow integrations information */ }
                    { flowData.integrations && (
                        <div className="space-y-4">
                            <Separator/>
                            <h3 className="font-medium mb-2">Connected flows</h3>

                            {/* Entry Points */ }
                            { flowData.integrations.entryPoints && flowData.integrations.entryPoints.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Entry Points:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        { flowData.integrations.entryPoints.map( ( entryPoint, idx ) => (
                                            <li key={ `entry-${idx}` }>
                                                <span className="font-mono">{ entryPoint.flowName }</span>
                                                { entryPoint.description && ` - ${entryPoint.description}` }
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            ) }

                            {/* Handoff Points */ }
                            { flowData.integrations.handoffPoints && flowData.integrations.handoffPoints.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Handoff Points:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        { flowData.integrations.handoffPoints.map( ( handoffPoint, idx ) => (
                                            <li key={ `handoff-${idx}` }>
                                                <span className="font-mono">{ handoffPoint.flowName }</span>
                                                { handoffPoint.description && ` - ${handoffPoint.description}` }
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            ) }

                            {/* External References */ }
                            { flowData.integrations.externalReferences && Object.keys( flowData.integrations.externalReferences ).length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">External References:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        { Object.entries( flowData.integrations.externalReferences ).map( ( [ key, value ], idx ) => (
                                            <li key={ `ref-${idx}` }>
                                                <span className="font-medium">{ key }</span>: <span
                                                    className="font-mono">{ value }</span>
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            ) }
                        </div>
                    ) }
                </CardContent>
            </Card>

        </div>
    );
};
