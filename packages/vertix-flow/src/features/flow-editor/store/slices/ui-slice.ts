import { StateCreator } from 'zustand';

/**
 * UI state for the flow editor
 */
export interface UIState {
  isEditing: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions for the UI state
 */
export interface UIActions {
  setEditing: ( isEditing: boolean ) => void;
  setFullscreen: ( isFullscreen: boolean ) => void;
  setLoading: ( isLoading: boolean ) => void;
  setError: ( error: string | null ) => void;
  clearError: () => void;
}

/**
 * Combined UI slice type
 */
export type UISlice = UIState & UIActions;

/**
 * Initial state for the UI slice
 */
const initialUIState: UIState = {
  isEditing: false,
  isFullscreen: false,
  isLoading: false,
  error: null,
};

/**
 * Creates the UI slice
 */
export const createUISlice: StateCreator<
  UISlice,
  [],
  [],
  UISlice
> = ( set ) => ( {
  ...initialUIState,

  // Set editing mode
  setEditing: ( isEditing ) => set( { isEditing } ),

  // Set fullscreen mode
  setFullscreen: ( isFullscreen ) => set( { isFullscreen } ),

  // Set loading state
  setLoading: ( isLoading ) => set( { isLoading } ),

  // Set error message
  setError: ( error ) => set( { error } ),

  // Clear error
  clearError: () => set( { error: null } )
} );
