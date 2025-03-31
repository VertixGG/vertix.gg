import dagre from "dagre";

import type { Node, Edge } from "@xyflow/react";

// Layout configuration types
export interface LayoutConfig {
  rankdir?: "TB" | "BT" | "LR" | "RL"; // Direction: TB (top to bottom), BT (bottom to top), LR (left to right), RL (right to left)
  alignRank?: "UL" | "UR" | "DL" | "DR"; // Node alignment within a rank: UL, UR, DL, or DR
  nodesep?: number; // Distance between nodes in the same rank
  ranksep?: number; // Distance between ranks
  marginx?: number; // Left/right margin
  marginy?: number; // Top/bottom margin
  nodeWidth?: number;
  nodeHeight?: number;
}

/**
 * Apply Dagre layout algorithm to position nodes in a structured way
 */
export function applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    config: LayoutConfig
): Node[] {
    if ( !nodes.length ) return nodes;

    const g = new dagre.graphlib.Graph();

    // Set graph properties
    g.setGraph( {
        rankdir: config.rankdir || "TB",
        align: config.alignRank || "UL",
        nodesep: config.nodesep || 100,
        ranksep: config.ranksep || 100,
        marginx: config.marginx || 50,
        marginy: config.marginy || 50
    } );

    // Default to assigning both left-to-right and top-to-bottom ranks
    g.setDefaultEdgeLabel( () => ( {} ) );

    // Helper to get node dimensions
    const getNodeDimensions = ( node: Node ) => {
        let width = config.nodeWidth || 200;
        let height = config.nodeHeight || 150;

        // Use measured dimensions if available
        if ( node.measured?.width && node.measured?.height ) {
            width = node.measured.width;
            height = node.measured.height;
        }
        // Fallback to data dimensions
        else if ( node.data?.width && node.data?.height ) {
            width = Number( node.data.width ) || width;
            height = Number( node.data.height ) || height;
        }

        return { width, height };
    };

    // Add nodes to the graph with their dimensions
    nodes.forEach( node => {
        const { width, height } = getNodeDimensions( node );
        console.log( "[applyDagreLayout] Setting node dimensions:", {
            id: node.id,
            width,
            height,
            measured: node.measured,
            config: node.data
        } );
        g.setNode( node.id, { width, height } );
    } );

    // Add edges to the graph
    edges.forEach( edge => {
        g.setEdge( edge.source, edge.target );
    } );

    // Identify main flow and its direct connections
    const mainFlowNode = nodes.find( n => n.id === "flow-group" );
    const directConnections = nodes.filter( n =>
        edges.some( e =>
            ( e.source === "flow-group" && e.target === n.id ) ||
            ( e.target === "flow-group" && e.source === n.id )
        )
    );

    // Set constraints for better layout
    if ( mainFlowNode ) {
        // Center the main flow
        g.setNode( mainFlowNode.id, {
            ...g.node( mainFlowNode.id ),
            rank: 0
        } );

        // Arrange direct connections horizontally
        directConnections.forEach( ( node, index ) => {
            g.setNode( node.id, {
                ...g.node( node.id ),
                rank: 1,
                order: index - Math.floor( directConnections.length / 2 )
            } );
        } );

        // Set nested flows to appear below their parents
        nodes.forEach( node => {
            if ( !directConnections.includes( node ) && node.id !== mainFlowNode.id ) {
                const parentEdge = edges.find( e => e.target === node.id );
                if ( parentEdge ) {
                    g.setNode( node.id, {
                        ...g.node( node.id ),
                        rank: 2
                    } );
                }
            }
        } );
    }

    // Run the layout
    dagre.layout( g );

    // Apply the layout positions to the nodes
    return nodes.map( node => {
        const nodeWithPosition = g.node( node.id );
        if ( !nodeWithPosition ) {
            console.warn( `[applyDagreLayout] No position found for node ${ node.id }` );
            return node;
        }

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - ( nodeWithPosition.width / 2 ),
                y: nodeWithPosition.y - ( nodeWithPosition.height / 2 )
            }
        };
    } );
}

/**
 * Apply vertical stacking layout for a connected flow (simplified layout for basic cases)
 * @param mainNode - The main flow node
 * @param connectedNode - The connected flow node
 * @param verticalGap - The gap between the nodes (default: 150px)
 * @returns A new position for the connected node
 */
export function applyVerticalStackLayout(
  mainNode: Node,
  connectedNode: Node,
  verticalGap: number = 150
): { x: number; y: number } {
  // Get the main node dimensions and position
  const mainY = mainNode.position.y || 0;
  const mainHeight = mainNode.measured?.height || 150;

  // Calculate X position to align centers
  const mainX = mainNode.position.x || 0;
  const mainWidth = mainNode.measured?.width || 200;
  const connectedWidth = connectedNode.measured?.width || 200;

  const newX = mainX + ( mainWidth / 2 ) - ( connectedWidth / 2 );
  const newY = mainY + mainHeight + verticalGap;

  return { x: newX, y: newY };
}
