import { create } from "zustand";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";

import type { Node, Edge } from "reactflow";

import type { UIModuleFile, FlowSchema } from "@vertix.gg/flow/src/shared/types/flow";

interface FlowEditorState {
  // Selected module and flow
  selectedModule: UIModuleFile | null;
  selectedFlow: string | null;

  // Flow diagram data
  nodes: Node[];
  edges: Edge[];

  // Actions
  setSelectedModule: ( module: UIModuleFile | null ) => void;
  setSelectedFlow: ( flowName: string | null ) => void;
  setNodes: ( nodes: Node[] ) => void;
  setEdges: ( edgesOrFn: Edge[] | ( ( prev: Edge[] ) => Edge[] ) ) => void;
  updateNodePosition: ( nodeId: string, position: { x: number, y: number } ) => void;
  clearFlowData: () => void;

  // Schema handling
  handleSchemaLoaded: ( schema: FlowSchema ) => void;
}

const useFlowEditorStore = create<FlowEditorState>( ( set ) => ( {
  // Initial state
  selectedModule: null,
  selectedFlow: null,
  nodes: [],
  edges: [],

  // Actions
  setSelectedModule: ( module ) => set( {
    selectedModule: module,
    selectedFlow: null,
    nodes: [],
    edges: []
  } ),

  setSelectedFlow: ( flowName ) => set( { selectedFlow: flowName } ),

  setNodes: ( nodes ) => set( { nodes } ),

  setEdges: ( edgesOrFn ) => set( ( state ) => ( {
    edges: typeof edgesOrFn === "function" ? edgesOrFn( state.edges ) : edgesOrFn
  } ) ),

  updateNodePosition: ( nodeId, position ) => set( ( state ) => ( {
    nodes: state.nodes.map( ( node ) =>
      node.id === nodeId ? { ...node, position } : node
    )
  } ) ),

  clearFlowData: () => set( { nodes: [], edges: [] } ),

  handleSchemaLoaded: ( schema ) => {
    if ( !schema ) return;

    const { nodes, edges } = generateFlowDiagram( schema );
    set( { nodes, edges } );
  }
} ) );

export default useFlowEditorStore;
