import { useState, useCallback, useMemo } from "react";

import { getViewportDimensions } from "@vertix.gg/flow/src/features/flow-editor/utils/position-calculator";
import {
    applyDagreLayout,
    applyVerticalStackLayout
} from "@vertix.gg/flow/src/features/flow-editor/utils/graph-layout";

import type { Node, Edge, NodeChange } from "@xyflow/react";

// Flow diagram configuration
export const FLOW_CONFIG = {
    DEFAULT_ZOOM: 0.85,
    MAX_ZOOM: 1.5,
    MIN_ZOOM: 0.1,
    INIT_DELAY: 100,
    LAYOUT_DELAY: 150,
    POSITION_THRESHOLD: 1,
    SNAP_GRID: [ 10, 10 ] as [number, number]
};

interface UseFlowLayoutProps {
    nodes: Node[];
    edges: Edge[];
    reactFlowInstance: {
        getNodes: () => Node[];
        fitView: ( options?: { duration?: number; padding?: number } ) => void;
    };
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    onNodesChange?: ( changes: NodeChange[] ) => void;
    _onZoomChange?: ( zoom: number ) => void;
}

interface UseFlowLayoutReturn {
    isAutoLayout: boolean;
    verticalGap: number;
    config: typeof FLOW_CONFIG;
    handleAutoLayout: () => void;
    handleNodePositioning: () => void;
}

/**
 * Hook to manage flow layout, node positioning, and automatic layouts
 */
export function useFlowLayout( {
    nodes,
    edges,
    reactFlowInstance,
    setCombinedNodes,
    _onZoomChange
}: UseFlowLayoutProps ): UseFlowLayoutReturn {
    const [ isAutoLayout, setIsAutoLayout ] = useState( false );
    const { getNodes, fitView } = reactFlowInstance;

    // Calculate appropriate vertical gap based on viewport dimensions
    const verticalGap = useMemo( () => {
        const { height } = getViewportDimensions();
        // Use a percentage of viewport height instead of fixed pixels
        return Math.max( height * 0.15, 100 ); // Min 100px, default ~15% of viewport height
    }, [] );

    // Apply Dagre automatic layout to the nodes
    const handleAutoLayout = useCallback( () => {
        if ( nodes.length === 0 ) return;

        // Get viewport dimensions to adjust layout
        const { width, height } = getViewportDimensions();

        // Calculate layout parameters based on viewport
        const nodeSpacing = Math.max( width * 0.05, 80 ); // Min 80px, default 5% of viewport width
        const rankSpacing = Math.max( height * 0.15, 120 ); // Min 120px, default 15% of viewport height

        // Apply dagre layout with dynamic parameters
        const layoutedNodes = applyDagreLayout( nodes, edges, {
            nodeWidth: 200,  // Default node width
            nodeHeight: 150, // Default node height
            rankdir: "TB",   // Top to bottom layout
            ranksep: rankSpacing,
            nodesep: nodeSpacing,
            marginx: 50,
            marginy: 50,
        } );

        // Update the nodes with new positions
        setCombinedNodes( layoutedNodes );

        // Fit view after layout
        setTimeout( () => {
            fitView( { duration: 500, padding: 0.2 } );
        }, 50 );

        setIsAutoLayout( true );
    }, [ nodes, edges, setCombinedNodes, fitView ] );

    // Handle basic node positioning logic for simple cases (2 nodes)
    const handleNodePositioning = useCallback( () => {
        // Only run if we have exactly two nodes (main + one connected)
        // And ensure getNodes function is available
        if ( nodes.length === 2 && getNodes && !isAutoLayout ) {
            console.log( "[Layout Effect - Simplified Trigger] Detected 2 nodes. Scheduling layout check..." );
            // Use a timeout to give RF time to measure after nodes appear in state
            const timerId = setTimeout( () => {
                console.log( "[Layout Effect - Simplified Trigger] Running layout check after delay..." );
                const currentNodes = getNodes();
                const mainFlowGroupNode = currentNodes.find( node => node.id === "flow-group" );
                const connectedFlowGroupNode = currentNodes.find( node => node.data?.isConnectedFlow && node.id.endsWith( "-node-flow-group" ) );

                if ( mainFlowGroupNode?.measured?.height && connectedFlowGroupNode ) {
                    console.log( "[Layout Effect - Simplified Trigger] Nodes measured:", { mainY: mainFlowGroupNode.position.y, mainH: mainFlowGroupNode.measured.height, connectedY: connectedFlowGroupNode.position.y } );

                    // Use the specialized vertical stack layout utility
                    const newPosition = applyVerticalStackLayout(
                        mainFlowGroupNode,
                        connectedFlowGroupNode,
                        verticalGap
                    );

                    // Only update if needed
                    if ( Math.abs( connectedFlowGroupNode.position.y - newPosition.y ) > FLOW_CONFIG.POSITION_THRESHOLD ) {
                        console.log( `[Layout Effect - Simplified Trigger] Repositioning ${ connectedFlowGroupNode.id } to:`, newPosition );
                        setCombinedNodes( ( nds ) =>
                            nds.map( ( node: Node ) => {
                                if ( node.id === connectedFlowGroupNode.id ) {
                                    // Return a new node object with updated position
                                    return { ...node, position: newPosition };
                                }
                                return node; // Return original node object if no change
                            } )
                        );
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
            }, FLOW_CONFIG.LAYOUT_DELAY );

            return () => clearTimeout( timerId ); // Cleanup timeout
        }
    }, [ nodes.length, getNodes, isAutoLayout, setCombinedNodes, verticalGap ] );

    return {
        isAutoLayout,
        verticalGap,
        config: FLOW_CONFIG,
        handleAutoLayout,
        handleNodePositioning,
    };
}
