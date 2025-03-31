import dagre from "dagre";

import type { Node, Edge } from "@xyflow/react";

// Layout configuration types
export interface LayoutConfig {
  nodeWidth?: number;
  nodeHeight?: number;
  rankdir?: "TB" | "BT" | "LR" | "RL"; // Direction: TB (top to bottom), BT (bottom to top), LR (left to right), RL (right to left)
  alignRank?: "UL" | "UR" | "DL" | "DR"; // Node alignment within a rank: UL, UR, DL, or DR
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

  // Add nodes to the graph with validated dimensions
  nodes.forEach( ( node ) => {
    // Get measured dimensions or defaults, ensuring they are valid numbers
    const width = node.measured?.width && Number.isFinite( node.measured.width ) && node.measured.width > 0
      ? node.measured.width
      : layoutConfig.nodeWidth || 200;

    const height = node.measured?.height && Number.isFinite( node.measured.height ) && node.measured.height > 0
      ? node.measured.height
      : layoutConfig.nodeHeight || 150;

    // Log node dimensions for debugging
    console.log( "[applyDagreLayout] Setting node dimensions:", {
      id: node.id,
      width,
      height,
      measured: node.measured,
      config: { nodeWidth: layoutConfig.nodeWidth, nodeHeight: layoutConfig.nodeHeight }
    } );

    g.setNode( node.id, { width, height } );
  } );

  // Add edges to the graph
  edges.forEach( ( edge ) => {
    if ( edge.source && edge.target ) {
      g.setEdge( edge.source, edge.target );
    }
  } );

  // Run the layout algorithm
  dagre.layout( g );

  // Get the positioned nodes with validation
  return nodes.map( ( node ) => {
    const dagreNode = g.node( node.id );

    // If the node was processed by dagre and has valid position
    if ( dagreNode && Number.isFinite( dagreNode.x ) && Number.isFinite( dagreNode.y ) ) {
      const width = dagreNode.width;
      const height = dagreNode.height;

      // Calculate node position (centered)
      const position = {
        x: Math.round( dagreNode.x - width / 2 ),
        y: Math.round( dagreNode.y - height / 2 )
      };

      // Log node position for debugging
      console.log( "[applyDagreLayout] Node positioned:", {
        id: node.id,
        dagreX: dagreNode.x,
        dagreY: dagreNode.y,
        finalX: position.x,
        finalY: position.y,
        width,
        height
      } );

      return {
        ...node,
        position,
        // Keep track of the original size used for layout
        data: {
          ...node.data,
          layoutWidth: width,
          layoutHeight: height
        }
      };
    }

    // If dagre failed to position the node, keep its original position or use a default
    console.warn( "[applyDagreLayout] Node not positioned by Dagre:", {
      id: node.id,
      originalPosition: node.position
    } );

    return {
      ...node,
      position: node.position || { x: 0, y: 0 }
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
