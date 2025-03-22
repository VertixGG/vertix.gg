import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  SelectionSlice, createSelectionSlice,
  DiagramSlice, createDiagramSlice,
  UISlice, createUISlice
} from "./slices";

/**
 * Combined state type for the entire flow editor
 */
export type FlowEditorState = SelectionSlice & DiagramSlice & UISlice;

/**
 * Create a store with all slices combined and devtools middleware
 */
const useFlowEditorStore = create<FlowEditorState>()(
  devtools(
    ( ...args ) => ( {
      ...createSelectionSlice( ...args ),
      ...createDiagramSlice( ...args ),
      ...createUISlice( ...args ),
    } ),
    {
      name: 'flow-editor-store',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);

export default useFlowEditorStore;

/**
 * Type-safe selector hooks
 */

/**
 * Selection selectors
 */
export const useFlowSelection = () => {
  return useFlowEditorStore( state => ( {
    selectedModule: state.selectedModule,
    selectedFlow: state.selectedFlow,
    setSelectedModule: state.setSelectedModule,
    setSelectedFlow: state.setSelectedFlow,
    clearSelection: state.clearSelection,
  } ) );
};

/**
 * Diagram selectors
 */
export const useFlowDiagram = () => {
  return useFlowEditorStore( state => ( {
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    updateNodePosition: state.updateNodePosition,
    clearDiagram: state.clearDiagram,
    handleSchemaLoaded: state.handleSchemaLoaded,
  } ) );
};

/**
 * UI state selectors
 */
export const useFlowUI = () => {
  return useFlowEditorStore( state => ( {
    isEditing: state.isEditing,
    isFullscreen: state.isFullscreen,
    isLoading: state.isLoading,
    error: state.error,
    setEditing: state.setEditing,
    setFullscreen: state.setFullscreen,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  } ) );
};
