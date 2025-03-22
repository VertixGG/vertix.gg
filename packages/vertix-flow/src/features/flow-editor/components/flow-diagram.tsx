import "@xyflow/react/dist/style.css";

import React, { useCallback } from "react";

import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Panel
} from "@xyflow/react";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";
import { CustomNode } from "./node-types/custom-node";
import { GroupNode } from "./node-types/group-node";
import { CompoundNode } from "./node-types/compound-node";
import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";
import type {
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge
} from "@xyflow/react";

// Mapping for custom node types
const nodeTypes = {
    custom: CustomNode,
    group: GroupNode,
    compound: CompoundNode
};

// Function to generate flow diagram using factory - don't use hooks here
export function generateFlowDiagram( schema: FlowSchema ): FlowDiagram {
    // Use the factory singleton directly instead of the hook
    return flowFactory.createFlowDiagram( schema );
}

interface FlowDiagramDisplayProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: ( changes: NodeChange[] ) => void;
    onEdgesChange?: ( changes: EdgeChange[] ) => void;
    onConnect?: ( connection: Connection ) => void;
}

/**
 * Displays the React Flow diagram with the nodes and edges
 */
export const FlowDiagramDisplay: React.FC<FlowDiagramDisplayProps> = ( {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect
} ) => {
    const { setError } = useFlowUI();

    const onInit = useCallback( () => {
        // This gets called once when the flow is initialized
        // and ensures proper rendering of groups
        try {
            setTimeout( () => {
                window.dispatchEvent( new Event( 'resize' ) );
            }, 100 );
        } catch ( err ) {
            console.error( "Error initializing flow diagram:", err );
            setError( "Failed to initialize flow diagram" );
        }
    }, [ setError ] );

    const handleRefresh = useCallback( () => {
        try {
            window.location.reload();
        } catch ( err ) {
            console.error( "Error refreshing flow diagram:", err );
            setError( "Failed to refresh flow diagram" );
        }
    }, [ setError ] );

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 0.15 }}
                nodesDraggable={true}
                proOptions={{ hideAttribution: true }}
                elementsSelectable={true}
                elevateEdgesOnSelect={true}
                snapToGrid={true}
                snapGrid={[ 10, 10 ]}
                onInit={onInit}
            >
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <Panel position="top-right">
                    <button
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-2 py-1 rounded shadow"
                        onClick={handleRefresh}
                    >
                        Refresh
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default FlowDiagramDisplay;
