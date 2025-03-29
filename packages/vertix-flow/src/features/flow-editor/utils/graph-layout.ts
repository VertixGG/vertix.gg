import dagre from "dagre";

import type { Node, Edge } from "@xyflow/react";

// Layout configuration
export interface LayoutConfig {
  nodeWidth?: number;
  nodeHeight?: number;
  rankdir?: "TB" | "BT" | "LR" | "RL"; // Direction: TB (top to bottom), BT (bottom to top), LR (left to right), RL (right to left)
  alignRank?: string; // Node alignment within a rank: UL, UR, DL, or DR
  ranksep?: number; // Distance between ranks
  nodesep?: number; // Distance between nodes in the same rank
  edgesep?: number; // Distance between edges
  marginx?: number; // Left/right margin
  marginy?: number; // Top/bottom margin
}

// Default layout configuration
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 200,
  nodeHeight: 150,
  rankdir: "TB",
  ranksep: 150,
  nodesep: 100,
  marginx: 20,
  marginy: 20,
};

/**
 * Apply dagre layout algorithm to position nodes
 * @param nodes - The nodes to position
 * @param edges - The edges connecting the nodes
 * @param config - Optional layout configuration
 * @returns A new array of nodes with updated positions
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  if ( !nodes.length ) return nodes;

  // Merge default config with provided config
  const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };

  // Create a new graph
  const g = new dagre.graphlib.Graph();

  // Set graph direction and other options
  g.setGraph( {
    rankdir: layoutConfig.rankdir,
    align: layoutConfig.alignRank,
    ranksep: layoutConfig.ranksep,
    nodesep: layoutConfig.nodesep,
    edgesep: layoutConfig.edgesep,
    marginx: layoutConfig.marginx,
    marginy: layoutConfig.marginy,
  } );

  // Default to assigning a new object as a label for each edge
  g.setDefaultEdgeLabel( () => ( {} ) );

  // Add nodes to the graph
  nodes.forEach( ( node ) => {
    // Use measured dimensions if available, otherwise use defaults
    const width = node.measured?.width || layoutConfig.nodeWidth || 200;
    const height = node.measured?.height || layoutConfig.nodeHeight || 150;

    g.setNode( node.id, { width, height } );
  } );

  // Add edges to the graph
  edges.forEach( ( edge ) => {
    g.setEdge( edge.source, edge.target );
  } );

  // Run the layout algorithm
  dagre.layout( g );

  // Get the positioned nodes
  return nodes.map( ( node ) => {
    const dagreNode = g.node( node.id );

    // If the node was processed by dagre
    if ( dagreNode ) {
      // Position the node at its center
      const position = {
        x: dagreNode.x - ( dagreNode.width / 2 ),
        y: dagreNode.y - ( dagreNode.height / 2 ),
      };

      return {
        ...node,
        position,
        // Keep track of the original size used for layout
        data: {
          ...node.data,
          layoutWidth: dagreNode.width,
          layoutHeight: dagreNode.height,
        },
      };
    }

    // Return the original node if not processed by dagre
    return node;
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
