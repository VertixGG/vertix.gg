import { create } from "zustand";

import type { UIModuleFile } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

interface ModuleSelectorState {
  // Selected module and flow data
  modules: UIModuleFile[];
  selectedModule: UIModuleFile | null;
  selectedFlow: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setModules: ( modules: UIModuleFile[] ) => void;
  setSelectedModule: ( module: UIModuleFile | null ) => void;
  setSelectedFlow: ( flowName: string | null ) => void;
  setLoading: ( loading: boolean ) => void;
  setError: ( error: string | null ) => void;
  reset: () => void;
}

const useModuleSelectorStore = create<ModuleSelectorState>( ( set ) => ( {
  // Initial state
  modules: [],
  selectedModule: null,
  selectedFlow: null,
  isLoading: false,
  error: null,

  // Actions
  setModules: ( modules ) => set( { modules } ),

  setSelectedModule: ( module ) => set( {
    selectedModule: module,
    selectedFlow: null // Reset selected flow when changing module
  } ),

  setSelectedFlow: ( flowName ) => set( { selectedFlow: flowName } ),

  setLoading: ( loading ) => set( { isLoading: loading } ),

  setError: ( error ) => set( { error } ),

  reset: () => set( {
    selectedModule: null,
    selectedFlow: null,
    error: null
  } ),
} ) );

export default useModuleSelectorStore;
