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

import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

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
    const { setError } = useFlowUI();
    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>( null );
    const { getNodes, fitView } = useReactFlow();

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

    useEffect( () => {
        if ( nodes.length < 2 ) return;
        console.log( "[Layout Effect] Running layout check..." );
        const currentNodes = getNodes();
        const mainFlowGroupNode = currentNodes.find( node => node.id === "flow-group" );
        const connectedFlowGroupNode = currentNodes.find( node => node.data?.isConnectedFlow && node.id.endsWith( "-node-flow-group" ) );

        if ( mainFlowGroupNode?.measured?.height && connectedFlowGroupNode ) {
            console.log( "[Layout Effect] Nodes found with measured height:", { mainY: mainFlowGroupNode.position.y, mainH: mainFlowGroupNode.measured.height, connectedY: connectedFlowGroupNode.position.y } );
            const verticalGap = 150;
            const newY = mainFlowGroupNode.position.y + mainFlowGroupNode.measured.height + verticalGap;

            if ( Math.abs( connectedFlowGroupNode.position.y - newY ) > 1 ) {
                console.log( `[Layout Effect] Repositioning connected node ${ connectedFlowGroupNode.id } to Y: ${ newY }` );
                setCombinedNodes( ( nds ) =>
                  nds.map( ( node ) => {
                    if ( node.id === connectedFlowGroupNode.id ) {
                      return { ...node, position: { ...node.position, y: newY } };
                    }
                    // TODO: Adjust child nodes relative to parent if needed
                    return node;
                  } )
                );
                // Optional: Fit view after layout adjustment
                // setTimeout(() => fitView({ duration: 200, padding: 0.2 }), 50);
            } else {
                 console.log( "[Layout Effect] Connected node already positioned correctly." );
            }
        } else {
             console.log( "[Layout Effect] Nodes or measured dimensions not ready yet." );
             if( mainFlowGroupNode && !mainFlowGroupNode.measured?.height ) {
                 console.log( "[Layout Effect] Main flow group node missing measured height." );
             }
        }
    }, [ JSON.stringify( nodes.map( n=>( { id: n.id, measured: n.measured } ) ) ), setCombinedNodes, getNodes, fitView ] );

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
