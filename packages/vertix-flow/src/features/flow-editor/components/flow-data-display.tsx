import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";

import { useFlowData } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-data";
import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";
import {
  ErrorState,
  LoadingState,
  TransactionsDisplay,
  RequiredDataDisplay
} from "./display";

import type { FlowData } from "@vertix.gg/flow/src/shared/types/flow";
import type { FlowDataLoaderProps } from "../types/flow-components";

export interface FlowDataDisplayProps extends Pick<FlowDataLoaderProps, 'modulePath' | 'flowName' | 'onSchemaLoaded'> {
  className?: string; // Additional prop to satisfy linter
}

/**
 * FlowDataDisplay component loads and displays flow data including transactions and required data
 */
export const FlowDataDisplay: React.FC<FlowDataDisplayProps> = ( {
    modulePath,
    flowName,
    onSchemaLoaded,
    className,
} ) => {
    const [ flowData, setFlowData ] = useState<FlowData | null>( null );
    const { error, setError, setLoading } = useFlowUI();

    const flowDataResource = useFlowData( modulePath, flowName );
    const data = flowDataResource.read?.().data;

    useEffect( () => {
        try {
            setLoading( true );
            setFlowData( data );

            // When we get the data, call the callback if provided
            if ( data && onSchemaLoaded ) {
                onSchemaLoaded( data.schema );
            }
        } catch ( err ) {
            console.error( "Error loading flow data:", err );
            setError( "Failed to load flow data" );
        } finally {
            setLoading( false );
        }
    }, [ data, onSchemaLoaded, setError, setLoading ] );

    // If we have an error, show it
    if ( error ) {
        return <ErrorState message={error} />;
    }

    // If we don't have data yet, show a loading state
    if ( !flowData ) {
        return <LoadingState message="Loading flow data..." />;
    }

    const { schema, transactions, requiredData } = flowData;

    return (
        <Card className={`overflow-auto max-h-[500px] ${ className || '' }`}>
            <CardHeader>
                <CardTitle>
                    Flow: {flowName}
                    <Badge variant="outline" className="ml-2">
                        {schema.type}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TransactionsDisplay transactions={transactions} />
                    <Separator />
                    <RequiredDataDisplay requiredData={requiredData} />
                </div>
            </CardContent>
        </Card>
    );
};
