import { useCallback } from "react";
import { create } from "zustand";

import { AppMode, useModeStore } from "./use-mode-store";

interface EditModeState {
    editingFlowName: string | null;
    setEditingFlowName: ( flowName: string | null ) => void;
}

const useEditModeStore = create<EditModeState>( ( set ) => ( {
    editingFlowName: null,
    setEditingFlowName: ( flowName ) => set( { editingFlowName: flowName } ),
} ) );

interface UseEditModeReturn {
    isEditMode: boolean;
    editingFlowName: string | null;
    enterEditMode: ( flowName: string ) => void;
    exitEditMode: () => void;
    toggleEditMode: ( flowName?: string ) => void;
}

/**
 * Hook to manage edit mode for selected flows.
 * When a node is double-clicked, use this hook to put the flow into edit mode.
 */
export function useEditMode(): UseEditModeReturn {
    const modes = useModeStore( ( state ) => state.modes );
    const addMode = useModeStore( ( state ) => state.addMode );
    const removeMode = useModeStore( ( state ) => state.removeMode );

    const editingFlowName = useEditModeStore( ( state ) => state.editingFlowName );
    const setEditingFlowName = useEditModeStore( ( state ) => state.setEditingFlowName );

    const isEditMode = ( modes & AppMode.EDIT_NODE ) === AppMode.EDIT_NODE;

    const enterEditMode = useCallback( ( flowName: string ) => {
        setEditingFlowName( flowName );
        addMode( AppMode.EDIT_NODE );
    }, [ addMode, setEditingFlowName ] );

    const exitEditMode = useCallback( () => {
        setEditingFlowName( null );
        removeMode( AppMode.EDIT_NODE );
    }, [ removeMode, setEditingFlowName ] );

    const toggleEditMode = useCallback( ( flowName?: string ) => {
        if ( isEditMode ) {
            setEditingFlowName( null );
            removeMode( AppMode.EDIT_NODE );
        } else if ( flowName ) {
            setEditingFlowName( flowName );
            addMode( AppMode.EDIT_NODE );
        }
    }, [ isEditMode, addMode, removeMode, setEditingFlowName ] );

    return {
        isEditMode,
        editingFlowName,
        enterEditMode,
        exitEditMode,
        toggleEditMode,
    };
}
