import "@xyflow/react/dist/style.css";

import React, { useCallback, useRef } from "react";

import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Panel,
    ReactFlowProvider
} from "@xyflow/react";

import { CustomNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/custom-node";
import { GroupNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/group-node";
import { CompoundNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/compound-node";

import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

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
                window.dispatchEvent( new Event( "resize" ) );

                // Force the desired zoom level
                if ( reactFlowInstanceRef.current ) {
                    reactFlowInstanceRef.current.setViewport( { x: 0, y: 0, zoom: 0.85 } );

                    // Update the zoom level in the UI
                    if ( onZoomChange ) {
                        onZoomChange( 0.85 );
                    }
                }
            }, 100 );
        } catch  {
            setError( "Failed to initialize flow diagram" );
        }
    }, [ setError, onZoomChange ] );

    const handleRefresh = useCallback( () => {
        try {
            window.location.reload();
        } catch  {
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
                    className="bg-muted hover:bg-muted/80 text-foreground text-xs px-2 py-1 rounded shadow"
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
