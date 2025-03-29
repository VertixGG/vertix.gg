import "@xyflow/react/dist/style.css";

import React, { useCallback, useRef, useEffect } from "react";

import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Panel,
    ReactFlowProvider,
    useReactFlow
} from "@xyflow/react";

import { GroupNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/group-node";
import { CompoundNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/compound-node";
import { DiscordNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord-node";
import { useFlowLayout } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-layout";

import type {
    ReactFlowInstance,
    Node,
    Edge,
    NodeChange
} from "@xyflow/react";

// Mapping for custom node types
const nodeTypes = {
    discord: DiscordNode,
    group: GroupNode,
    compound: CompoundNode
};

interface FlowDiagramDisplayProps {
    nodes: Node[];
    edges: Edge[];
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    onNodesChange?: ( changes: NodeChange[] ) => void;
    onZoomChange?: ( zoom: number ) => void;
}

/**
 * Inner component that uses React Flow
 */
const FlowDiagramInner: React.FC<FlowDiagramDisplayProps> = ( {
    nodes,
    edges,
    setCombinedNodes,
    onNodesChange,
    onZoomChange
} ) => {
    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>( null );
    const reactFlowApi = useReactFlow();

    // Use our custom layout hook for positioning logic
    const {
        config,
        handleAutoLayout,
        handleNodePositioning
    } = useFlowLayout( {
        nodes,
        edges,
        reactFlowInstance: reactFlowApi,
        setCombinedNodes,
        _onZoomChange: onZoomChange
    } );

    const onInit = useCallback( ( instance: ReactFlowInstance ) => {
        try {
            reactFlowInstanceRef.current = instance;
            setTimeout( () => {
                window.dispatchEvent( new Event( "resize" ) );
                if ( reactFlowInstanceRef.current ) {
                    reactFlowInstanceRef.current.setViewport( { x: 0, y: 0, zoom: config.DEFAULT_ZOOM } );
                    if ( onZoomChange ) {
                        onZoomChange( config.DEFAULT_ZOOM );
                    }
                }
            }, config.INIT_DELAY );
        } catch {
            // Optionally log error here
        }
    }, [ onZoomChange, config ] );

    const handleRefresh = useCallback( () => {
        try {
            window.location.reload();
        } catch {
            // Optionally log error here
        }
    }, [] );

    const handleMove = useCallback( () => {
        if ( onZoomChange && reactFlowInstanceRef.current ) {
            onZoomChange( reactFlowInstanceRef.current.getZoom() );
        }
    }, [ onZoomChange ] );

    // Run the node positioning effect
    useEffect( () => {
        return handleNodePositioning();
    }, [ handleNodePositioning ] );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: config.DEFAULT_ZOOM }}
            maxZoom={config.MAX_ZOOM}
            minZoom={config.MIN_ZOOM}
            onInit={onInit}
            onMove={handleMove}
            nodesDraggable={true}
            proOptions={{ hideAttribution: true }}
            elementsSelectable={true}
            snapToGrid={true}
            snapGrid={config.SNAP_GRID}
            elevateEdgesOnSelect={true}
        >
            <Controls />
            <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Panel position="top-right" className="flex flex-col gap-2">
                <button
                    className="bg-muted hover:bg-muted/80 text-foreground text-xs px-2 py-1 rounded shadow"
                    onClick={handleRefresh}
                >
                    Refresh
                </button>
                <button
                    className="bg-primary hover:bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded shadow"
                    onClick={handleAutoLayout}
                >
                    Auto Layout
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
