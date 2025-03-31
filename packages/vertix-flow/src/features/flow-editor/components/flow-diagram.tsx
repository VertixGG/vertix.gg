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
    useReactFlow,
    MarkerType
} from "@xyflow/react";

import { GroupNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/group-node";
import { CompoundNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/compound-node";
import { DiscordNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord-node";
import { useFlowLayout } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-layout";
import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";
import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config";

import type {
    ReactFlowInstance,
    Node,
    NodeChange,
    Connection,
    Edge
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
    const {
        isLoadingConnectedFlows,
        isInitialLayoutApplied,
        markInitialLayoutApplied,
    } = useFlowEditorContext();

    // Use our custom layout hook for positioning logic
    const {
        handleAutoLayout,
        handleNodePositioning
    } = useFlowLayout( {
        nodes,
        edges,
        reactFlowInstance: reactFlowApi,
        setCombinedNodes,
        onZoomChange
    } );

    const onInit = useCallback( ( instance: ReactFlowInstance ) => {
        try {
            reactFlowInstanceRef.current = instance;
            setTimeout( () => {
                window.dispatchEvent( new Event( "resize" ) );
                if ( reactFlowInstanceRef.current ) {
                    reactFlowInstanceRef.current.setViewport( { x: 0, y: 0, zoom: FLOW_EDITOR.config.viewport.defaultZoom } );
                    if ( onZoomChange ) {
                        onZoomChange( FLOW_EDITOR.config.viewport.defaultZoom );
                    }
                }
            }, FLOW_EDITOR.config.timing.initDelay );
        } catch {
            // Optionally log error here
        }
    }, [ onZoomChange ] );

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

    // Auto-layout effect that runs once when all flows are loaded
    useEffect( () => {
        // Only run if:
        // 1. We have nodes to layout
        // 2. We're not still loading connected flows
        // 3. Initial layout hasn't been applied *for this flow* (checked via context)
        if (
            nodes.length > 0 &&
            !isLoadingConnectedFlows &&
            !isInitialLayoutApplied
        ) {
            // Short delay to ensure all nodes are properly measured
            const timerId = setTimeout( () => {
                // Check context state again inside timeout to prevent race conditions
                // Note: This check might be redundant if the context state updates prevent the effect from re-running
                // but kept for safety. We need to re-fetch context state here if it could change between effect trigger and timeout.
                // For simplicity, assuming `isInitialLayoutApplied` read above is sufficient for this short delay.
                if ( !isInitialLayoutApplied ) {
                    console.log( "[Auto Layout] Applying initial layout to flows (via context)" );
                    handleAutoLayout();
                    markInitialLayoutApplied(); // Call context action
                } else {
                    console.log( "[Auto Layout] Layout already applied (checked in timeout), skipping." );
                }
            }, 500 );

            return () => clearTimeout( timerId );
        }

        // Dependency array includes the context state/action now
        // to ensure the effect re-evaluates when the layout status changes
    }, [ nodes.length, isLoadingConnectedFlows, handleAutoLayout, isInitialLayoutApplied, markInitialLayoutApplied ] );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: FLOW_EDITOR.config.viewport.defaultZoom }}
            maxZoom={FLOW_EDITOR.config.viewport.maxZoom}
            minZoom={FLOW_EDITOR.config.viewport.minZoom}
            onInit={onInit}
            onMove={handleMove}
            nodesDraggable={true}
            proOptions={{ hideAttribution: true }}
            elementsSelectable={true}
            snapToGrid={true}
            snapGrid={FLOW_EDITOR.config.viewport.snapGrid}
            elevateEdgesOnSelect={true}
            edgesFocusable={false}
            defaultEdgeOptions={{
                type: "smoothstep",
                style: {
                    strokeWidth: FLOW_EDITOR.theme.components.edge.default.strokeWidth,
                    stroke: FLOW_EDITOR.theme.components.edge.default.strokeColor
                },
                markerEnd: { type: MarkerType.Arrow }
            }}
            onConnect={( params: Connection ) => {
                console.log( "[Edge] New connection:", {
                    params,
                    hasValidSource: !!params.source,
                    hasValidTarget: !!params.target,
                    sourceHandle: params.sourceHandle,
                    targetHandle: params.targetHandle
                } );
            }}
        >
            <Controls />
            <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                // Only show MiniMap when all nodes have measurements
                style={{
                    display: nodes.some( node => !node.measured ) ? "none" : "block",
                    backgroundColor: FLOW_EDITOR.theme.components.minimap.backgroundColor
                }}
                nodeColor={_node => {
                    // Default color with fallback for invalid nodes
                    return FLOW_EDITOR.theme.components.minimap.nodeColor;
                }}
                nodeBorderRadius={0}
                // Custom node rendering to avoid NaN errors
                nodeComponent={props => {
                    // Skip rendering if dimensions are invalid
                    if ( !Number.isFinite( props.width ) || !Number.isFinite( props.height ) ||
                        !Number.isFinite( props.x ) || !Number.isFinite( props.y ) ) {
                        console.log( "[MiniMap] Skipping node render due to invalid dimensions:", {
                            id: props.id,
                            dimensions: { width: props.width, height: props.height },
                            position: { x: props.x, y: props.y }
                        } );
                        return null;
                    }

                    return (
                        <rect
                            x={props.x}
                            y={props.y}
                            rx={0}
                            ry={0}
                            width={props.width}
                            height={props.height}
                            fill={FLOW_EDITOR.theme.components.minimap.nodeColor}
                            stroke={FLOW_EDITOR.theme.components.minimap.maskColor}
                            strokeWidth={props.strokeWidth}
                        />
                    );
                }}
            />
            <Background
                variant={BackgroundVariant.Dots}
                gap={12}
                size={1}
                color={FLOW_EDITOR.theme.components.node.secondaryColor}
            />
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
