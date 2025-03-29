import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";

import type { StateCreator } from "zustand";

import type { Node } from "@xyflow/react";
import type { FlowData } from "@vertix.gg/flow/src/shared/types/flow";

/**
 * Diagram state for the flow editor
 */
export interface DiagramState {
  nodes: Node[];
}

/**
 * Actions for the diagram state
 */
export interface DiagramActions {
  setNodes: ( nodes: Node[] ) => void;
  updateNodePosition: ( nodeId: string, position: { x: number, y: number } ) => void;
  clearDiagram: () => void;
  handleFlowDataLoaded: ( flowData: FlowData ) => void;
}

/**
 * Combined diagram slice type
 */
export type DiagramSlice = DiagramState & DiagramActions;

/**
 * Initial state for the diagram slice
 */
const initialDiagramState: DiagramState = {
  nodes: [],
};

/**
 * Creates the diagram slice
 */
export const createDiagramSlice: StateCreator<
  DiagramSlice,
  [],
  [],
  DiagramSlice
> = ( set ) => ( {
  ...initialDiagramState,

  // Direct node updates
  setNodes: ( nodes ) => set( { nodes } ),

  // Update a node's position
  updateNodePosition: ( nodeId, position ) => set( ( state ) => ( {
    nodes: state.nodes.map( ( node ) =>
      node.id === nodeId ? { ...node, position } : node
    )
  } ) ),

  // Clear the diagram data
  clearDiagram: () => set( { nodes: [] } ),

  // Generate diagram from flow data
  handleFlowDataLoaded: ( flowData ) => {
    if ( !flowData ) return;

    const { nodes } = generateFlowDiagram( flowData );
    set( { nodes } );
  }
} );
