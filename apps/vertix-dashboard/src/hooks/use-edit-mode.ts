import { useCallback } from "react";
import { create } from "zustand";

import zCore from "@zenflux/core";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { AppMode, useModeStore } from "./use-mode-store";
import { useLanguageStore } from "./use-language-store";

import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import { resolveCustomization } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

import type { ComponentCustomization, CustomizationTarget } from "@vertix.gg/definitions/src/ui-customization-definitions";

import type { CustomizationData } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

/**
 * Function pendingChangeKey() :: How an in-flight edit is filed while it waits to be saved.
 *
 * Local to the editor - it never reaches the api or the bot, so it is free to be a string.
 */
function pendingChangeKey( target: CustomizationTarget, language: string ): string {
    return [ target.component, target.state ?? "", language ].join( "\u0000" );
}

/**
 * Function parsePendingChangeKey() :: The target an in-flight edit was filed under.
 */
function parsePendingChangeKey( key: string ): { target: CustomizationTarget; language: string } {
    const [ component, state, language ] = key.split( "\u0000" );

    return {
        target: { component, state: state || null },
        language
    };
}

const logger = zCore.modules.createLogger( "use-edit-mode" );

// Re-export for convenience
export type { ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";
export type { CustomizationData } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

interface EditModeState {
    editingFlowName: string | null;
    setEditingFlowName: ( flowName: string | null ) => void;
    // Customization state
    guildId: string | null;
    setGuildId: ( guildId: string | null ) => void;
    customization: CustomizationData | null;
    setCustomization: ( customization: CustomizationData | null ) => void;
    isLoadingCustomization: boolean;
    setIsLoadingCustomization: ( loading: boolean ) => void;
    customizationError: string | null;
    setCustomizationError: ( error: string | null ) => void;
    // Pending changes (unsaved)
    pendingChanges: Record<string, ComponentCustomization>;
    setPendingChange: ( componentName: string, customization: ComponentCustomization ) => void;
    clearPendingChanges: () => void;
}

const useEditModeStore = create<EditModeState>( ( set ) => ( {
    editingFlowName: null,
    setEditingFlowName: ( flowName ) => set( { editingFlowName: flowName } ),
    // Customization state
    guildId: null,
    setGuildId: ( guildId ) => set( { guildId } ),
    customization: null,
    setCustomization: ( customization ) => set( { customization } ),
    isLoadingCustomization: false,
    setIsLoadingCustomization: ( loading ) => set( { isLoadingCustomization: loading } ),
    customizationError: null,
    setCustomizationError: ( error ) => set( { customizationError: error } ),
    // Pending changes
    pendingChanges: {},
    setPendingChange: ( componentName, customization ) => set( ( state ) => ( {
        pendingChanges: { ...state.pendingChanges, [ componentName ]: customization }
    } ) ),
    clearPendingChanges: () => set( { pendingChanges: {} } ),
} ) );

interface UseEditModeReturn {
    isEditMode: boolean;
    editingFlowName: string | null;
    enterEditMode: ( flowName: string, guildId: string ) => void;
    exitEditMode: () => void;
    toggleEditMode: ( flowName?: string, guildId?: string ) => void;
    // Customization
    customization: CustomizationData | null;
    isLoadingCustomization: boolean;
    customizationError: string | null;
    pendingChanges: Record<string, ComponentCustomization>;
    getComponentCustomization: ( target: CustomizationTarget ) => ComponentCustomization | undefined;
    setComponentChange: ( target: CustomizationTarget, customization: ComponentCustomization ) => void;
    saveComponentCustomization: ( target: CustomizationTarget ) => Promise<void>;
    saveAllChanges: () => Promise<void>;
    discardChanges: () => void;
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

    const guildId = useEditModeStore( ( state ) => state.guildId );
    const setGuildId = useEditModeStore( ( state ) => state.setGuildId );
    const customization = useEditModeStore( ( state ) => state.customization );
    const setCustomization = useEditModeStore( ( state ) => state.setCustomization );
    const isLoadingCustomization = useEditModeStore( ( state ) => state.isLoadingCustomization );
    const setIsLoadingCustomization = useEditModeStore( ( state ) => state.setIsLoadingCustomization );
    const customizationError = useEditModeStore( ( state ) => state.customizationError );
    const setCustomizationError = useEditModeStore( ( state ) => state.setCustomizationError );
    const pendingChanges = useEditModeStore( ( state ) => state.pendingChanges );
    const setPendingChange = useEditModeStore( ( state ) => state.setPendingChange );
    const clearPendingChanges = useEditModeStore( ( state ) => state.clearPendingChanges );

    const isEditMode = ( modes & AppMode.EDIT_NODE ) === AppMode.EDIT_NODE;

    const loadCustomization = useCallback( async( guildIdToLoad: string ) => {
        setIsLoadingCustomization( true );
        setCustomizationError( null );

        try {
            const queryModule = getQueryModule( CustomizationQuery );
            const isDefault = guildIdToLoad === DEFAULT_CUSTOMIZATION_GUILD_ID;
            const data = await queryModule.request<CustomizationData>(
                isDefault ? "Dashboard/Customization/GetDefault" : "Dashboard/Customization/GetGuild",
                isDefault ? {} : { guildId: guildIdToLoad }
            );
            setCustomization( data );
        } catch( error ) {
            setCustomizationError( error instanceof Error ? error.message : "Failed to load customization" );
            setCustomization( null );
        } finally {
            setIsLoadingCustomization( false );
        }
    }, [ setCustomization, setIsLoadingCustomization, setCustomizationError ] );

    const enterEditMode = useCallback( ( flowName: string, guildIdParam: string ) => {
        setEditingFlowName( flowName );
        setGuildId( guildIdParam );
        addMode( AppMode.EDIT_NODE );
        loadCustomization( guildIdParam );
    }, [ addMode, setEditingFlowName, setGuildId, loadCustomization ] );

    const exitEditMode = useCallback( () => {
        setEditingFlowName( null );
        setGuildId( null );
        setCustomization( null );
        clearPendingChanges();
        removeMode( AppMode.EDIT_NODE );
    }, [ removeMode, setEditingFlowName, setGuildId, setCustomization, clearPendingChanges ] );

    const toggleEditMode = useCallback( ( flowName?: string, guildIdParam?: string ) => {
        if ( isEditMode ) {
            setEditingFlowName( null );
            setGuildId( null );
            setCustomization( null );
            clearPendingChanges();
            removeMode( AppMode.EDIT_NODE );
        } else if ( flowName && guildIdParam ) {
            setEditingFlowName( flowName );
            setGuildId( guildIdParam );
            addMode( AppMode.EDIT_NODE );
            loadCustomization( guildIdParam );
        }
    }, [ isEditMode, addMode, removeMode, setEditingFlowName, setGuildId, setCustomization, clearPendingChanges, loadCustomization ] );

    const selectedLanguage = useLanguageStore( ( state ) => state.selectedLanguage );

    const getComponentCustomization = useCallback( ( target: CustomizationTarget ): ComponentCustomization | undefined => {
        // An edit in flight wins over what is stored; the key is local to this map, so it never
        // has to agree with anything outside the editor.
        const pending = pendingChanges[ pendingChangeKey( target, selectedLanguage ) ];

        if ( pending ) {
            return pending;
        }

        return resolveCustomization( customization, { ...target, language: selectedLanguage } ) ?? undefined;
    }, [ customization, pendingChanges, selectedLanguage ] );

    const setComponentChange = useCallback( ( target: CustomizationTarget, componentCustomization: ComponentCustomization ) => {
        setPendingChange( pendingChangeKey( target, selectedLanguage ), componentCustomization );
    }, [ setPendingChange, selectedLanguage ] );

    const saveComponentCustomization = useCallback( async function saveComponentCustomization( target: CustomizationTarget ) {
        const currentLanguage = useLanguageStore.getState().selectedLanguage;
        logger.debug( saveComponentCustomization, "Called", { ...target, guildId, languageCode: currentLanguage } );

        if ( !guildId ) {
            throw new Error( "No guild selected" );
        }

        const componentKey = pendingChangeKey( target, currentLanguage );
        const componentCustomization = pendingChanges[ componentKey ];

        if ( !componentCustomization ) {
            logger.debug( saveComponentCustomization, "No pending changes, skipping" );
            return;
        }

        try {
            logger.debug( saveComponentCustomization, "Saving via query module", { guildId, ...target, languageCode: currentLanguage } );
            const queryModule = getQueryModule( CustomizationQuery );
            const isDefault = guildId === DEFAULT_CUSTOMIZATION_GUILD_ID;
            const updated = await queryModule.request<CustomizationData>(
                isDefault ? "Dashboard/Customization/UpdateDefaultComponent" : "Dashboard/Customization/UpdateComponent",
                isDefault
                    ? {
                        component: target.component,
                        state: target.state ?? null,
                        language: currentLanguage,
                        customization: componentCustomization
                    }
                    : {
                        guildId,
                        component: target.component,
                        state: target.state ?? null,
                        language: currentLanguage,
                        customization: componentCustomization
                    }
            );
            logger.debug( saveComponentCustomization, "Save successful" );
            setCustomization( updated );
            // Clear pending change for this component
            const newPendingChanges = { ...pendingChanges };
            delete newPendingChanges[ componentKey ];
            clearPendingChanges();
            Object.entries( newPendingChanges ).forEach( ( [ name, change ] ) => {
                setPendingChange( name, change );
            } );
        } catch( error ) {
            logger.error( saveComponentCustomization, "Save failed", error );
            throw new Error( error instanceof Error ? error.message : "Failed to save customization" );
        }
    }, [ guildId, pendingChanges, setCustomization, clearPendingChanges, setPendingChange ] );

    const saveAllChanges = useCallback( async() => {
        for ( const key of Object.keys( pendingChanges ) ) {
            await saveComponentCustomization( parsePendingChangeKey( key ).target );
        }
    }, [ pendingChanges, saveComponentCustomization ] );

    const discardChanges = useCallback( () => {
        clearPendingChanges();
    }, [ clearPendingChanges ] );

    return {
        isEditMode,
        editingFlowName,
        enterEditMode,
        exitEditMode,
        toggleEditMode,
        // Customization
        customization,
        isLoadingCustomization,
        customizationError,
        pendingChanges,
        getComponentCustomization,
        setComponentChange,
        saveComponentCustomization,
        saveAllChanges,
        discardChanges,
    };
}
