import "@xyflow/react/dist/style.css";

import React, { useCallback, useRef, useState, useEffect } from "react";

import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Panel,
    ReactFlowProvider
} from "@xyflow/react";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";
import { CustomNode } from "./node-types/custom-node";
import { GroupNode } from "./node-types/group-node";
import { CompoundNode } from "./node-types/compound-node";
import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { FlowComponent, FlowDiagram, FlowData } from "@vertix.gg/flow/src/shared/types/flow";
import type {
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge,
    ReactFlowInstance
} from "@xyflow/react";

// Mapping for custom node types
const nodeTypes = {
    custom: CustomNode,
    group: GroupNode,
    compound: CompoundNode
};

// Function to generate flow diagram using factory - don't use hooks here
export function generateFlowDiagram( flowData: FlowData ): FlowDiagram {
    // Use the factory singleton directly instead of the hook
    const result = flowFactory.createFlowDiagram( flowData );
    return result;
}

// Backward compatibility function for when only schema is available
export function generateFlowDiagramFromComponent( component: FlowComponent ): FlowDiagram {
    // Create a FlowData object with the component
    const flowData: FlowData = {
        name: component.name || "Unknown",
        components: [component],
        transactions: [],
        requiredData: {}
    };
    return generateFlowDiagram( flowData );
}

interface FlowDiagramDisplayProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: ( changes: NodeChange[] ) => void;
    onEdgesChange?: ( changes: EdgeChange[] ) => void;
    onConnect?: ( connection: Connection ) => void;
    onZoomChange?: ( zoom: number ) => void;
}

/**
 * Inner component that uses React Flow
 */
const FlowDiagramInner: React.FC<FlowDiagramDisplayProps> = ( {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onZoomChange
} ) => {
    const { setError } = useFlowUI();
    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>( null );

    const onInit = useCallback( ( instance: ReactFlowInstance ) => {
        // This gets called once when the flow is initialized
        // and ensures proper rendering of groups
        try {
            // Save the instance to our ref
            reactFlowInstanceRef.current = instance;

            setTimeout( () => {
                window.dispatchEvent( new Event( 'resize' ) );

                // Force the desired zoom level
                if ( reactFlowInstanceRef.current ) {
                    reactFlowInstanceRef.current.setViewport( { x: 0, y: 0, zoom: 0.85 } );

                    // Update the zoom level in the UI
                    if ( onZoomChange ) {
                        onZoomChange( 0.85 );
                    }
                }
            }, 100 );
        } catch ( err ) {
            setError( "Failed to initialize flow diagram" );
        }
    }, [ setError, onZoomChange ] );

    const handleRefresh = useCallback( () => {
        try {
            window.location.reload();
        } catch ( err ) {
            setError( "Failed to refresh flow diagram" );
        }
    }, [ setError ] );

    const handleMove = useCallback( () => {
        if ( onZoomChange && reactFlowInstanceRef.current ) {
            onZoomChange( reactFlowInstanceRef.current.getZoom() );
        }
    }, [ onZoomChange ] );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            maxZoom={1.5}
            minZoom={0.1}
            fitViewOptions={{
                maxZoom: 0.85,
                padding: 0.5
            }}
            nodesDraggable={true}
            proOptions={{ hideAttribution: true }}
            elementsSelectable={true}
            elevateEdgesOnSelect={true}
            snapToGrid={true}
            snapGrid={[ 10, 10 ]}
            onInit={onInit}
            onMove={handleMove}
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
    );
};

/**
 * Wrapper component that provides the ReactFlow context
 */
export const FlowDiagramDisplay: React.FC<FlowDiagramDisplayProps> = ( props ) => {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlowProvider>
                <FlowDiagramInner {...props} />
            </ReactFlowProvider>
        </div>
    );
};

export default FlowDiagramDisplay;
