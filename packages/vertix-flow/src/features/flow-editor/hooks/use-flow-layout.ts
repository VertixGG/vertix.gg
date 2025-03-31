import { useState, useCallback, useMemo } from "react";

import { getViewportDimensions } from "@vertix.gg/flow/src/features/flow-editor/utils/position-calculator";
import {
    applyDagreLayout,
    applyVerticalStackLayout
} from "@vertix.gg/flow/src/features/flow-editor/utils/graph-layout";

import type React from "react";

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
    onZoomChange?: ( zoom: number ) => void;
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
}: UseFlowLayoutProps ): UseFlowLayoutReturn {
    const [ isAutoLayout, setIsAutoLayout ] = useState( false );
    const { getNodes, fitView } = reactFlowInstance;
    const [ initialLayoutApplied, setInitialLayoutApplied ] = useState( false );

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

        // Mark initial layout as applied only after the first successful auto-layout
        if ( !initialLayoutApplied ) {
            setInitialLayoutApplied( true );
        }

        setIsAutoLayout( true );
    }, [ nodes, edges, setCombinedNodes, fitView, initialLayoutApplied ] );

    // Handle basic node positioning logic for simple cases (2 nodes)
    const handleNodePositioning = useCallback( () => {
        if ( !nodes.length ) {
            return;
        }

        const allNodes = getNodes();

        // Check if any node is missing measurements or has invalid measurements
        const nodesWithIssues = allNodes.filter( node =>
            !node.measured ||
            !Number.isFinite( node.measured.width ) ||
            !Number.isFinite( node.measured.height ) ||
            !node.position ||
            !Number.isFinite( node.position.x ) ||
            !Number.isFinite( node.position.y )
        );

        // Initialize nodes with default values if needed
        if ( nodesWithIssues.length > 0 ) {
            const defaultValues = {
                width: 200,
                height: 150,
                x: 100,
                y: 100
            };

            const updatedNodes = allNodes.map( node => {
                if ( nodesWithIssues.some( n => n.id === node.id ) ) {
                    return {
                        ...node,
                        measured: {
                            width: defaultValues.width,
                            height: defaultValues.height
                        },
                        position: {
                            x: defaultValues.x,
                            y: defaultValues.y
                        },
                        data: {
                            ...node.data,
                            width: defaultValues.width,
                            height: defaultValues.height
                        }
                    };
                }
                return node;
            } );

            // Apply the updates
            setCombinedNodes( updatedNodes );

            // Schedule a retry after measurements are set
            setTimeout( () => {
                handleNodePositioning();
            }, FLOW_CONFIG.LAYOUT_DELAY );
            return;
        }

        // Find main and connected nodes
        const mainFlowGroupNode = allNodes.find( ( n ) => n.id === "flow-group" );
        const connectedFlowGroupNodes = allNodes.filter( ( n ) => n.id !== "flow-group" && n.id.endsWith( "-node-flow-group" ) );

        if ( !mainFlowGroupNode || connectedFlowGroupNodes.length === 0 ) {
            return;
        }

        // Process connected nodes
        const updates = connectedFlowGroupNodes
            .map( ( connectedNode, index ) => {
                const newPosition = applyVerticalStackLayout(
                    mainFlowGroupNode,
                    connectedNode,
                    verticalGap * ( index + 1 )
                );

                if ( !Number.isFinite( newPosition.x ) || !Number.isFinite( newPosition.y ) ) {
                    return null;
                }

                const positionDiff = Math.abs( connectedNode.position.y - newPosition.y );
                if ( positionDiff <= FLOW_CONFIG.POSITION_THRESHOLD ) {
                    return null;
                }

                return {
                    id: connectedNode.id,
                    position: newPosition
                };
            } )
            .filter( Boolean );

        // Apply updates if any
        if ( updates.length > 0 ) {
            setCombinedNodes( nds => nds.map( node => {
                const update = updates.find( u => u?.id === node.id );
                if ( update && update.position ) {
                    return {
                        ...node,
                        position: update.position
                    };
                }
                return node;
            } ) );
        }
    }, [ nodes.length, getNodes, setCombinedNodes, verticalGap ] );

    return {
        isAutoLayout,
        verticalGap,
        config: FLOW_CONFIG,
        handleAutoLayout,
        handleNodePositioning,
    };
}
