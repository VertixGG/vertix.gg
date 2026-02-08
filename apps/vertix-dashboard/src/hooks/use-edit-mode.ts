import { useCallback } from "react";
import { create } from "zustand";

import zCore from "@zenflux/core";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { AppMode, useModeStore } from "./use-mode-store";
import { useLanguageStore } from "./use-language-store";

import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import type { ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

const logger = zCore.modules.createLogger( "use-edit-mode" );

// Re-export for convenience
export type { ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

interface EditModeState {
    editingFlowName: string | null;
    setEditingFlowName: ( flowName: string | null ) => void;
    // Customization state
    guildId: string | null;
    setGuildId: ( guildId: string | null ) => void;
    customization: GuildCustomizationData | null;
    setCustomization: ( customization: GuildCustomizationData | null ) => void;
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
    customization: GuildCustomizationData | null;
    isLoadingCustomization: boolean;
    customizationError: string | null;
    pendingChanges: Record<string, ComponentCustomization>;
    getComponentCustomization: ( componentName: string ) => ComponentCustomization | undefined;
    setComponentChange: ( componentName: string, customization: ComponentCustomization ) => void;
    saveComponentCustomization: ( componentName: string ) => Promise<void>;
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
            const isDefault = guildIdToLoad === "__default__";
            const data = await queryModule.request<GuildCustomizationData>(
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

    const getComponentCustomization = useCallback( ( componentName: string ): ComponentCustomization | undefined => {
        // Language-qualified key: "componentName::languageCode"
        const langKey = `${ componentName }::${ selectedLanguage }`;

        // First check pending changes (language-qualified, then plain), then saved customization
        if ( pendingChanges[ langKey ] ) {
            return pendingChanges[ langKey ];
        }
        if ( pendingChanges[ componentName ] ) {
            return pendingChanges[ componentName ];
        }
        return customization?.components?.[ langKey ] ?? customization?.components?.[ componentName ];
    }, [ customization, pendingChanges, selectedLanguage ] );

    const setComponentChange = useCallback( ( componentName: string, componentCustomization: ComponentCustomization ) => {
        setPendingChange( componentName, componentCustomization );
    }, [ setPendingChange ] );

    const saveComponentCustomization = useCallback( async function saveComponentCustomization( componentName: string ) {
        const currentLanguage = useLanguageStore.getState().selectedLanguage;
        logger.debug( saveComponentCustomization, "Called", { componentName, guildId, languageCode: currentLanguage } );

        if ( !guildId ) {
            throw new Error( "No guild selected" );
        }

        const componentCustomization = pendingChanges[ componentName ];

        if ( !componentCustomization ) {
            logger.debug( saveComponentCustomization, "No pending changes, skipping" );
            return;
        }

        try {
            logger.debug( saveComponentCustomization, "Saving via query module", { guildId, componentName, languageCode: currentLanguage } );
            const queryModule = getQueryModule( CustomizationQuery );
            const isDefault = guildId === "__default__";
            const updated = await queryModule.request<GuildCustomizationData>(
                isDefault ? "Dashboard/Customization/UpdateDefaultComponent" : "Dashboard/Customization/UpdateComponent",
                isDefault
                    ? { customizationKey: componentName, customization: componentCustomization, languageCode: currentLanguage }
                    : { guildId, customizationKey: componentName, customization: componentCustomization, languageCode: currentLanguage }
            );
            logger.debug( saveComponentCustomization, "Save successful" );
            setCustomization( updated );
            // Clear pending change for this component
            const newPendingChanges = { ...pendingChanges };
            delete newPendingChanges[ componentName ];
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
        const componentNames = Object.keys( pendingChanges );
        for ( const componentName of componentNames ) {
            await saveComponentCustomization( componentName );
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
