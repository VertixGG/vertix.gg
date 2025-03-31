import { useState, useCallback, useMemo } from "react";

import { getViewportDimensions } from "@vertix.gg/flow/src/features/flow-editor/utils/position-calculator";
import {
    applyDagreLayout,
    applyVerticalStackLayout
} from "@vertix.gg/flow/src/features/flow-editor/utils/graph-layout";
import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config";

import type React from "react";

import type { Node, Edge, NodeChange } from "@xyflow/react";

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
    config: typeof FLOW_EDITOR;
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
        return Math.max( height * 0.15, FLOW_EDITOR.config.position.defaultSpacing * 2 );
    }, [] );

    // Apply Dagre automatic layout to the nodes
    const handleAutoLayout = useCallback( () => {
        if ( nodes.length === 0 ) return;

        // Get viewport dimensions to adjust layout
        const { width, height } = getViewportDimensions();

        // Calculate layout parameters based on viewport
        const nodeSpacing = Math.max( width * 0.05, FLOW_EDITOR.config.layout.nodesep ?? 80 ); // Default to 80px if undefined
        const rankSpacing = Math.max( height * 0.15, FLOW_EDITOR.config.layout.ranksep ?? 120 ); // Default to 120px if undefined

        // Apply dagre layout with dynamic parameters
        const layoutedNodes = applyDagreLayout( nodes, edges, {
            nodeWidth: FLOW_EDITOR.config.node.defaultSize.width,
            nodeHeight: FLOW_EDITOR.config.node.defaultSize.height,
            rankdir: FLOW_EDITOR.config.layout.rankdir,
            ranksep: rankSpacing,
            nodesep: nodeSpacing,
            marginx: FLOW_EDITOR.config.layout.marginx,
            marginy: FLOW_EDITOR.config.layout.marginy,
        } );

        // Update the nodes with new positions
        setCombinedNodes( layoutedNodes );

        // Fit view after layout
        setTimeout( () => {
            fitView( { duration: 500, padding: 0.2 } );
        }, FLOW_EDITOR.config.timing.initDelay );

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
                width: FLOW_EDITOR.config.node.defaultSize.width,
                height: FLOW_EDITOR.config.node.defaultSize.height,
                x: FLOW_EDITOR.config.position.margins.x,
                y: FLOW_EDITOR.config.position.margins.y
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
            }, FLOW_EDITOR.config.timing.layoutDelay );
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
                if ( positionDiff <= FLOW_EDITOR.config.position.threshold ) {
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
        config: FLOW_EDITOR,
        handleAutoLayout,
        handleNodePositioning,
    };
}
