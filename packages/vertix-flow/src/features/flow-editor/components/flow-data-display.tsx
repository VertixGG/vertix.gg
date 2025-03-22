import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/shared/components/card";
import { Badge } from "@vertix.gg/flow/src/shared/components/badge";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";
import { useFlowData } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-data";

import type { FlowSchema, FlowData } from "@vertix.gg/flow/src/shared/types/flow";

interface FlowDataDisplayProps {
    modulePath: string;
    flowName: string;
    onSchemaLoaded?: ( schema: FlowSchema ) => void;
}

export const FlowDataDisplay: React.FC<FlowDataDisplayProps> = ( {
    modulePath,
    flowName,
    onSchemaLoaded,
} ) => {
    const [ flowData, setFlowData ] = useState<FlowData | null>( null );
    const [ error, setError ] = useState<string | null>( null );

    const flowDataResource = useFlowData( modulePath, flowName );

    const data = flowDataResource.read?.().data;

    useEffect( () => {
        try {
            setFlowData( data );

            // When we get the data, call the callback if provided
            if ( data && onSchemaLoaded ) {
                onSchemaLoaded( data.schema );
            }
        } catch ( err ) {
            console.error( "Error loading flow data:", err );
            setError( "Failed to load flow data" );
        }
    }, [ flowDataResource, onSchemaLoaded ] );

    // If we have an error, show it
    if ( error ) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <CardContent>
                    <div className="text-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If we don't have data yet, show a loading state
    if ( !flowData ) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <CardContent>
                    <div className="text-center">
                        <p>Loading flow data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { schema, transactions, requiredData } = flowData;

    return (
        <Card className="overflow-auto max-h-[500px]">
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
                    <div>
                        <h3 className="font-medium mb-2">Transactions</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {transactions.length > 0 ? (
                                transactions.map( ( txn: string, idx: number ) => (
                                    <div
                                        key={idx}
                                        className="p-2 bg-neutral-100 rounded text-sm"
                                    >
                                        {txn}
                                    </div>
                                ) )
                            ) : (
                                <p className="text-sm text-neutral-500">No transactions defined</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-medium mb-2">Required Data</h3>
                        {Object.keys( requiredData ).length > 0 ? (
                            Object.entries( requiredData ).map( ( [ key, values ] ) => (
                                <div key={key} className="mb-2">
                                    <h4 className="text-sm font-medium">{key}</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {( values as string[] ).map( ( value: string, idx: number ) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {value}
                                            </Badge>
                                        ) )}
                                    </div>
                                </div>
                            ) )
                        ) : (
                            <p className="text-sm text-neutral-500">No required data</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
