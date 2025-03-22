import { StateCreator } from 'zustand';
import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

/**
 * Selection state for the flow editor
 */
export interface SelectionState {
  selectedModule: UIModuleFile | null;
  selectedFlow: string | null;
}

/**
 * Actions for the selection state
 */
export interface SelectionActions {
  setSelectedModule: ( module: UIModuleFile | null ) => void;
  setSelectedFlow: ( flowName: string | null ) => void;
  clearSelection: () => void;
}

/**
 * Combined selection slice type
 */
export type SelectionSlice = SelectionState & SelectionActions;

/**
 * Initial state for the selection slice
 */
const initialSelectionState: SelectionState = {
  selectedModule: null,
  selectedFlow: null,
};

/**
 * Creates the selection slice
 */
export const createSelectionSlice: StateCreator<
  SelectionSlice,
  [],
  [],
  SelectionSlice
> = ( set ) => ( {
  ...initialSelectionState,

  // Select a module, clear the flow selection
  setSelectedModule: ( module ) => set( {
    selectedModule: module,
    selectedFlow: null,
  } ),

  // Select a flow
  setSelectedFlow: ( flowName ) => set( {
    selectedFlow: flowName
  } ),

  // Clear all selections
  clearSelection: () => set( initialSelectionState ),
} );
