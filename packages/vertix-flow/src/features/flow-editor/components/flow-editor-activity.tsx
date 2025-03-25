import React from "react";

export interface FlowEditorActivityProps {
    modulePath: string | null;
    flowName: string | null;
    moduleName: string | null;
    connectedFlowsCount: number;
}

export const FlowEditorActivity: React.FC<FlowEditorActivityProps> = ( {
    modulePath,
    flowName,
    moduleName,
    connectedFlowsCount,
} ) => {
    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                {modulePath && flowName
                    ? `Module: ${ moduleName } • Flow: ${ flowName }`
                    : "No flow selected"}
            </div>
            <div className="text-sm text-muted-foreground">
                {connectedFlowsCount > 0
                    ? `Connected flows: ${ connectedFlowsCount }`
                    : "No connected flows"}
            </div>
        </div>
    );
};
