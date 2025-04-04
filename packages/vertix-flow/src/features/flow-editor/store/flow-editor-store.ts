import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createSelectionSlice, createDiagramSlice, createUISlice
} from "@vertix.gg/flow/src/features/flow-editor/store/slices";

import type {
  SelectionSlice,
  DiagramSlice,
  UISlice } from "@vertix.gg/flow/src/features/flow-editor/store/slices";

/**
 * Combined state type for the entire flow editor
 */
export type FlowEditorState = SelectionSlice & DiagramSlice & UISlice;

/**
 * Create a store with all slices combined and devtools middleware
 */
export const useFlowEditorStore = create<FlowEditorState>()(
  devtools(
    ( ...args ) => ( {
      ...createSelectionSlice( ...args ),
      ...createDiagramSlice( ...args ),
      ...createUISlice( ...args ),
    } ),
    {
      name: "flow-editor-store",
      enabled: process.env.NODE_ENV !== "production",
    }
  )
);

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
