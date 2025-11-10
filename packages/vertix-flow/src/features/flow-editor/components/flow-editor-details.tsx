import React from "react";

import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import { Card } from "@vertix.gg/flow/src/shared/components/card";
import { ScrollArea } from "@vertix.gg/flow/src/shared/components/scroll-area";
import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";

export const FlowEditorDetails: React.FC = () => {
    const {
        modulePath,
        flowName,
        moduleName,
        handleMainFlowDataLoaded,
    } = useFlowEditorContext();

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
                            onFlowDataLoaded={handleMainFlowDataLoaded}
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
