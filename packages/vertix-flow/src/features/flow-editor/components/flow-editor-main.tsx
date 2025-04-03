import React from "react";

import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";

import "@vertix.gg/flow/src/features/flow-editor/components/index.css";
import { FlowLayoutTopBar, FlowLayoutEditor } from "@vertix.gg/flow/src/features/flow-editor/flow-layout";

export const FlowEditorMain: React.FC = () => {
    const {
        modulePath,
        flowName,
        moduleName,
        connectedFlowsData,
        isLoadingConnectedFlows,
        combinedNodes,
        combinedEdges,
        setCombinedNodes,
        onNodesChange,
        handleZoomChange,
    } = useFlowEditorContext();

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
                    setCombinedNodes={setCombinedNodes}
                    onNodesChange={onNodesChange}
                    onZoomChange={handleZoomChange}
                />
            </FlowLayoutEditor>
        </div>
    );
};
