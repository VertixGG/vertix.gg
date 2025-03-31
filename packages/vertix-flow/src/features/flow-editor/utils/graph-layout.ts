import dagre from "dagre";

import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config";

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
 * Apply Dagre layout to nodes and edges
 */
export function applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    config: LayoutConfig = {}
): Node[] {
    if ( !nodes.length ) return nodes;

    const g = new dagre.graphlib.Graph();

    // Set graph direction and other settings
    g.setGraph( {
        rankdir: config.rankdir || "TB",
        align: config.alignRank || "UL",
        nodesep: config.nodesep || 100,
        ranksep: config.ranksep || 100,
        marginx: config.marginx || 50,
        marginy: config.marginy || 50
    } );

    g.setDefaultEdgeLabel( () => ( {} ) );

    // Add nodes to the graph with their dimensions
    nodes.forEach( node => {
        let width = config.nodeWidth || FLOW_EDITOR.config.node.defaultSize.width;
        let height = config.nodeHeight || FLOW_EDITOR.config.node.defaultSize.height;

        // Use measured dimensions if available
        if ( node.measured ) {
            width = node.measured.width || width;
            height = node.measured.height || height;
        }

        g.setNode( node.id, { width, height } );
    } );

    // Add edges to the graph
    edges.forEach( edge => {
        if ( edge.source && edge.target ) {
            g.setEdge( edge.source, edge.target );
        }
    } );

    // Run the layout algorithm
    dagre.layout( g );

    // Get the positioned nodes
    return nodes.map( node => {
        const nodeWithPosition = g.node( node.id );
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2
            }
        };
    } );
}

/**
 * Apply vertical stack layout for two nodes
 */
export function applyVerticalStackLayout(
    mainNode: Node,
    connectedNode: Node,
    verticalGap: number
): { x: number; y: number } {
    // Get main node dimensions
    const mainWidth = mainNode.measured?.width || FLOW_EDITOR.config.node.defaultSize.width;
    const mainHeight = mainNode.measured?.height || FLOW_EDITOR.config.node.defaultSize.height;

    // Get connected node dimensions
    const connectedWidth = connectedNode.measured?.width || FLOW_EDITOR.config.node.defaultSize.width;

    // Calculate center alignment
    const x = mainNode.position.x + ( mainWidth - connectedWidth ) / 2;
    const y = mainNode.position.y + mainHeight + verticalGap;

    return { x, y };
}
