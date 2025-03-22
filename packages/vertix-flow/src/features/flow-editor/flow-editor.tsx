import React, { useCallback } from "react";

import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges
} from "reactflow";

import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";
import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";
import useFlowEditorStore from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";

import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

import type {
    Connection,
    NodeChange,
    EdgeChange
} from "reactflow";

export const FlowEditor: React.FC = () => {
    // Get state and actions from flow editor store
    const {
        nodes,
        edges,
        setEdges,
        setNodes,
        handleSchemaLoaded
    } = useFlowEditorStore();

    // Get selected module and flow from module selector store
    const { selectedModule, selectedFlow } = useModuleSelectorStore();

    // Continue using React Flow's hooks for handling node changes
    const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
        setNodes( applyNodeChanges( changes, nodes ) );
    }, [ setNodes, nodes ] );

    const onEdgesChange = useCallback( ( changes: EdgeChange[] ) => {
        setEdges( applyEdgeChanges( changes, edges ) );
    }, [ setEdges, edges ] );

    const onConnect = useCallback( ( params: Connection ) => {
        setEdges( prevEdges => addEdge( params, prevEdges ) );
    }, [ setEdges ] );

    return (
        <div className="grid grid-cols-12 gap-4 p-4 h-screen">
            <div className="col-span-3 space-y-4 overflow-auto">
                <ModuleSelector />
                <FlowList />

                {selectedModule && selectedFlow && (
                    <FlowDataDisplay
                        modulePath={selectedModule.path}
                        flowName={selectedFlow}
                        onSchemaLoaded={handleSchemaLoaded}
                    />
                )}
            </div>

            <div className="col-span-9 bg-neutral-50 rounded-lg border h-full">
                {nodes.length > 0 ? (
                    <FlowDiagramDisplay
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-400">
                            {selectedFlow
                                ? "Loading flow diagram..."
                                : "Select a module and flow to display"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
