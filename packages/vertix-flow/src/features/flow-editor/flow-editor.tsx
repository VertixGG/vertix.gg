import React, { useCallback, useEffect, useState } from "react";

import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges
} from "@xyflow/react";

import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";
import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";
import useFlowEditorStore from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";

import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

import { getViewportDimensions } from "@vertix.gg/flow/src/shared/lib/position-calculator";

import type {
    Connection,
    NodeChange,
    EdgeChange
} from "@xyflow/react";

/**
 * FlowEditor component integrates all flow-related functionality
 * It acts as the main container for the flow editor feature
 */
export const FlowEditor: React.FC = () => {
    // Get viewport dimensions for responsive layout
    const [ viewport, setViewport ] = useState( getViewportDimensions() );

    // Listen for window resize events to update layout
    useEffect( () => {
        const handleResize = () => {
            setViewport( getViewportDimensions() );
        };

        window.addEventListener( 'resize', handleResize );
        return () => {
            window.removeEventListener( 'resize', handleResize );
        };
    }, [] );

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

    // Handle node changes
    const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
        setNodes( applyNodeChanges( changes, nodes ) );
    }, [ setNodes, nodes ] );

    // Handle edge changes
    const onEdgesChange = useCallback( ( changes: EdgeChange[] ) => {
        setEdges( applyEdgeChanges( changes, edges ) );
    }, [ setEdges, edges ] );

    // Handle new connections
    const onConnect = useCallback( ( params: Connection ) => {
        setEdges( prevEdges => addEdge( params, prevEdges ) );
    }, [ setEdges ] );

    // Calculate column widths based on viewport
    const sidebarWidth = viewport.width < 1200 ? 3 : 3; // Adjust based on screen size
    const diagramWidth = 12 - sidebarWidth;

    return (
        <div className={`grid grid-cols-12 gap-4 p-4 h-screen`}>
            <div className={`col-span-${ sidebarWidth } space-y-4 overflow-auto`}>
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

            <div className={`col-span-${ diagramWidth } bg-neutral-50 rounded-lg border h-full`}>
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
