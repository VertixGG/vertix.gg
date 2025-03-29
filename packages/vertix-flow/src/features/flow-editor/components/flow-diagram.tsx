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

import type {
    ReactFlowInstance
,
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
    const { getNodes } = useReactFlow();

    const onInit = useCallback( ( instance: ReactFlowInstance ) => {
        try {
            reactFlowInstanceRef.current = instance;
            setTimeout( () => {
                window.dispatchEvent( new Event( "resize" ) );
                if ( reactFlowInstanceRef.current ) {
                    reactFlowInstanceRef.current.setViewport( { x: 0, y: 0, zoom: 0.85 } );
                    if ( onZoomChange ) {
                        onZoomChange( 0.85 );
                    }
                }
            }, 100 );
        } catch  {
            // Optionally log error here
        }
    }, [ onZoomChange ] );

    const handleRefresh = useCallback( () => {
        try {
            window.location.reload();
        } catch  {
            // Optionally log error here
        }
    }, [] );

    const handleMove = useCallback( () => {
        if ( onZoomChange && reactFlowInstanceRef.current ) {
            onZoomChange( reactFlowInstanceRef.current.getZoom() );
        }
    }, [ onZoomChange ] );

    // --- Layout Effect ---
    useEffect( () => {
        // Only run if we have exactly two nodes (main + one connected)
        // And ensure getNodes function is available
        if ( nodes.length === 2 && getNodes ) {
            console.log( "[Layout Effect - Simplified Trigger] Detected 2 nodes. Scheduling layout check..." );
            // Use a timeout to give RF time to measure after nodes appear in state
            const timerId = setTimeout( () => {
                console.log( "[Layout Effect - Simplified Trigger] Running layout check after delay..." );
                const currentNodes = getNodes();
                const mainFlowGroupNode = currentNodes.find( node => node.id === "flow-group" );
                const connectedFlowGroupNode = currentNodes.find( node => node.data?.isConnectedFlow && node.id.endsWith( "-node-flow-group" ) );

                if ( mainFlowGroupNode?.measured?.height && connectedFlowGroupNode ) {
                    console.log( "[Layout Effect - Simplified Trigger] Nodes measured:", { mainY: mainFlowGroupNode.position.y, mainH: mainFlowGroupNode.measured.height, connectedY: connectedFlowGroupNode.position.y } );
                    const verticalGap = 150;
                    // Ensure calculations use numbers
                    const mainY = mainFlowGroupNode.position.y || 0;
                    const mainH = mainFlowGroupNode.measured.height || 0;
                    const connectedY = connectedFlowGroupNode.position.y || 0;

                    const newY = mainY + mainH + verticalGap;

                    // Only update if needed
                    if ( Math.abs( connectedY - newY ) > 1 ) {
                         console.log( `[Layout Effect - Simplified Trigger] Repositioning ${ connectedFlowGroupNode.id } to Y: ${ newY }` );
                         setCombinedNodes( ( nds ) =>
                            nds.map( ( node ) => {
                                if ( node.id === connectedFlowGroupNode.id ) {
                                    // Create a new position object
                                    const newPosition = { ...node.position, y: newY };
                                    // Return a new node object
                                    return { ...node, position: newPosition };
                                }
                                return node; // Return original node object if no change
                            } )
                         );
                         // Optional: Fit view after layout adjustment
                         // setTimeout(() => fitView({ duration: 200, padding: 0.2 }), 50);
                    } else {
                         console.log( "[Layout Effect - Simplified Trigger] Already positioned." );
                    }
                } else {
                    console.log( "[Layout Effect - Simplified Trigger] Measurement not ready after delay." );
                    // Log why measurement might be missing
                     if ( !mainFlowGroupNode ) console.log( "[Layout Effect] Main flow group node not found in getNodes()" );
                     else if ( !mainFlowGroupNode.measured?.height ) console.log( "[Layout Effect] Main flow group node height not measured" );
                     if ( !connectedFlowGroupNode ) console.log( "[Layout Effect] Connected flow group node not found in getNodes()" );
                }
            }, 150 ); // Increased delay slightly (try 100, 150, 200 if needed)

            return () => clearTimeout( timerId ); // Cleanup timeout
        }
    // Depend only on node count and function references
    }, [ nodes.length, setCombinedNodes, getNodes ] ); // Removed fitView dependency for now

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            maxZoom={1.5}
            minZoom={0.1}
            onInit={onInit}
            onMove={handleMove}
            nodesDraggable={true}
            proOptions={{ hideAttribution: true }}
            elementsSelectable={true}
            snapToGrid={true}
            snapGrid={[ 10, 10 ]}
            elevateEdgesOnSelect={true}
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
