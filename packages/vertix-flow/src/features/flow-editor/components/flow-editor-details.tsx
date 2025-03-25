import React from "react";

import { Card } from "@vertix.gg/flow/src/shared/components/card";
import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";
import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";

import type { FlowData } from "@vertix.gg/flow/src/shared/types/flow";

export interface FlowEditorDetailsProps {
    modulePath: string | null;
    flowName: string | null;
    moduleName: string | null;
    onFlowDataLoaded: ( flowData: FlowData ) => void;
}

export const FlowEditorDetails: React.FC<FlowEditorDetailsProps> = ( {
    modulePath,
    flowName,
    moduleName,
    onFlowDataLoaded,
} ) => {
    return (
        <>
            <div className="p-4 border-b bg-primary/5">
                <h2 className="text-lg font-semibold text-primary">Flow Details</h2>
            </div>
            <ScrollArea className="h-full">
                <div className="p-4">
                    {modulePath && flowName && moduleName ? (
                        <FlowDataDisplay
                            moduleName={moduleName}
                            flowName={flowName}
                            onFlowDataLoaded={onFlowDataLoaded}
                        />
                    ) : (
                        <Card className="p-4">
                            <p className="text-sm text-muted-foreground">Select a flow to view details</p>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};
