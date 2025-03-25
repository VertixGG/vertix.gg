import React from "react";

import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";
import { FlowLayoutTopBar, FlowLayoutEditor } from "@vertix.gg/flow/src/shared/components/flow-layout";

import type { Node, Edge, NodeChange, EdgeChange, Connection } from "@xyflow/react";

export interface FlowEditorMainProps {
    modulePath: string | null;
    flowName: string | null;
    moduleName: string | null;
    connectedFlowsData: any[];
    isLoadingConnectedFlows: boolean;
    combinedNodes: Node[];
    combinedEdges: Edge[];
    onNodesChange: ( changes: NodeChange[] ) => void;
    onEdgesChange: ( changes: EdgeChange[] ) => void;
    onConnect: ( params: Connection ) => void;
    onZoomChange: ( zoom: number ) => void;
}

export const FlowEditorMain: React.FC<FlowEditorMainProps> = ( {
    modulePath,
    flowName,
    moduleName,
    connectedFlowsData,
    isLoadingConnectedFlows,
    combinedNodes,
    combinedEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onZoomChange,
} ) => {
    if ( !modulePath || !flowName || !moduleName ) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Select a Flow</h2>
                    <p className="text-muted-foreground">
                        Please select a module and flow from the sidebar
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Top Bar */}
            <FlowLayoutTopBar>
                <div className="p-0.5">
                    <h2 className="text-xl font-bold">{flowName}</h2>
                    <p className="text-sm text-muted-foreground">{modulePath}</p>
                    {connectedFlowsData.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                            {isLoadingConnectedFlows && <span className="ml-2">(Loading...)</span>}
                        </div>
                    )}
                </div>
            </FlowLayoutTopBar>

            {/* Editor */}
            <FlowLayoutEditor>
                <FlowDiagramDisplay
                    nodes={combinedNodes}
                    edges={combinedEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onZoomChange={onZoomChange}
                />
            </FlowLayoutEditor>
        </div>
    );
};
