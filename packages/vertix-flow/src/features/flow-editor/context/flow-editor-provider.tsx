import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGuilds } from "@vertix.gg/flow/src/features/guild-selector/hooks/use-guilds";
import { useUIModules } from "@vertix.gg/flow/src/features/module-selector/hooks/use-ui-modules";
import { useConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-connected-flows";

import { FlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import { useModuleFlowSelection } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-module-flow-selection";
import { useFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-diagram";

import useModuleSelectorStore from "@vertix.gg/flow/src/features/module-selector/store/module-selector-store";

import type { FlowEditorContextType } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import type { GuildResponseItem, UIModuleFile } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

// Import the zustand store hook

// Assuming useGuilds returns a resource-like object with a read() method and data structure
// Adjust this type based on the actual return type of useGuilds
interface GuildsResource {
    read: () => { data?: GuildResponseItem[] };
}

// Adjust this type based on the actual return type of useUIModules
interface UIModulesResource {
    read: () => { data?: { uiModules?: UIModuleFile[] } };
}

interface FlowEditorContextInitializerProps {
    children: React.ReactNode;
    guildIdParam?: string;
    modulePathParam?: string;
    flowNameParam?: string;
    guildsResource: GuildsResource; // Pass the resource object
    uiModulesResource: UIModulesResource; // Pass modules resource
}

// New Internal Component to handle initialization after data is ready
const FlowEditorContextInitializer: React.FC<FlowEditorContextInitializerProps> = ( {
    children,
    guildIdParam,
    modulePathParam,
    flowNameParam,
    guildsResource,
    uiModulesResource,
} ) => {
    const navigate = useNavigate();

    // --- Read Guild Data (Suspends here if not ready) ---
    // This read() call happens during render, allowing Suspense to catch it
    const guildsData = guildsResource.read();
    const guilds: GuildResponseItem[] = guildsData?.data || [];

    // --- Read Modules Data (Suspends here if not ready) ---
    // Reading modules data here ensures it's available for the hook below
    // This read() might suspend, caught by the <Suspense> in main.tsx
    const modulesData = uiModulesResource.read(); // Read modules data
    const modules: UIModuleFile[] = modulesData?.data?.uiModules || []; // Get modules list

    // --- Calculate Initial Guild State (based on param and *available* data) ---
    const initialGuild = useMemo( () => {
        if ( guildIdParam && guilds.length > 0 ) {
            const guildFromParam = guilds.find( g => g.guildId === guildIdParam );
            if ( !guildFromParam ) {
                 console.warn( `[ContextInitializer] Guild with ID ${ guildIdParam } not found.` );
            }
            return guildFromParam || null;
        }
        return null;
    }, [ guildIdParam, guilds ] ); // Recalculate only if param or guilds list change

    // --- Initialize State ---
    const [ selectedGuild, _setSelectedGuild ] = useState<GuildResponseItem | null>( initialGuild );

    // --- Effect to Sync State with Param Changes (After Initial Load/Mount) ---
    // This handles cases where the URL changes *after* the component is already mounted
    useEffect( () => {
        const currentGuildId = selectedGuild?.guildId;
        let targetGuild: GuildResponseItem | null = null;

        if ( guildIdParam ) {
            targetGuild = guilds.find( g => g.guildId === guildIdParam ) || null;
            if ( !targetGuild ) {
                console.warn( `[ContextInitializer Effect] Guild with ID ${ guildIdParam } not found during sync.` );
            }
        }

        // Update state only if the target guild is different from the current state
        if ( targetGuild?.guildId !== currentGuildId ) {
            _setSelectedGuild( targetGuild );
        }
    }, [ guildIdParam, guilds, selectedGuild ] ); // Rerun if param, guilds list, or current selection changes

    // --- Wrapped Guild Setter with Navigation ---
    const setSelectedGuild = useCallback( ( guild: GuildResponseItem | null ) => {
        _setSelectedGuild( guild ); // Update state first
        if ( guild ) {
            const newPath = `/flow/${ guild.guildId }`; // Reset path on guild change
            navigate( newPath );
        } else {
            navigate( "/flow" ); // Navigate back to base flow route
        }
    }, [ navigate ] ); // Dependency: navigate

    // --- Initialize Hooks that provide main state ---
    const {
        modulePath, // State derived from URL param
        flowName,   // State derived from URL param
        moduleName, // State derived from modulePath
        activeTab,
        zoomLevel,
        handleModuleClick, // Includes navigation
        handleFlowClick,   // Includes navigation
        handleZoomChange,
        setActiveTab,
    } = useModuleFlowSelection( {
        modulePathParam,
        flowNameParam,
        selectedGuild,
        uiModulesResource,
    } );

    const {
        connectedFlowsData,
        combinedNodes,
        combinedEdges,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
    } = useConnectedFlows();

    const { onNodesChange } = useFlowDiagram( { setCombinedNodes } );

    // --- State for Initial Layout ---
    const [ isInitialLayoutApplied, setIsInitialLayoutApplied ] = useState<boolean>( false );

    useEffect( () => {
        setIsInitialLayoutApplied( false );
    }, [ modulePath, flowName ] );

    const markInitialLayoutApplied = useCallback( () => {
        setIsInitialLayoutApplied( true );
    }, [] );

    // --- Get Sidebar Store Setters ---
    const {
        setSelectedModule: setSidebarSelectedModule,
        setSelectedFlow: setSidebarSelectedFlow,
    } = useModuleSelectorStore();

    // --- Effect to Sync Context State -> Sidebar Store ---
    useEffect( () => {
        let moduleToSelect: UIModuleFile | null = null;
        if ( modulePath && modules.length > 0 ) {
            moduleToSelect = modules.find( m => m.path === modulePath ) || null;
        }

        // Update sidebar module selection
        setSidebarSelectedModule( moduleToSelect );

        // Update sidebar flow selection
        const flowToSelect = flowName || null;
        setSidebarSelectedFlow( flowToSelect );

    }, [ modulePath, flowName, modules, setSidebarSelectedModule, setSidebarSelectedFlow ] ); // Dependencies

    // --- Create Context Value ---
    const contextValue = useMemo<FlowEditorContextType>( () => ( {
        selectedGuild,
        setSelectedGuild, // Use the wrapped setter
        modulePath,
        flowName,
        moduleName,
        activeTab,
        zoomLevel,
        handleModuleClick,
        handleFlowClick,
        handleZoomChange,
        setActiveTab,
        connectedFlowsData,
        combinedNodes,
        combinedEdges,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
        onNodesChange,
        isInitialLayoutApplied,
        markInitialLayoutApplied,
    } ), [
        selectedGuild, setSelectedGuild,
        modulePath, flowName, moduleName, activeTab, zoomLevel,
        handleModuleClick, handleFlowClick, handleZoomChange, setActiveTab,
        connectedFlowsData, combinedNodes, combinedEdges, isLoadingConnectedFlows,
        handleMainFlowDataLoaded, setCombinedNodes, onNodesChange,
        isInitialLayoutApplied, markInitialLayoutApplied,
    ] );

    // --- Provide Context ---
    return (
        <FlowEditorContext.Provider value={contextValue}>
            {children}
        </FlowEditorContext.Provider>
    );
};

// --- Original Provider Component (Now Simplified) ---
interface FlowEditorProviderProps {
  children: React.ReactNode;
  guildIdParam?: string;
  modulePathParam?: string;
  flowNameParam?: string;
}

export const FlowEditorProvider: React.FC<FlowEditorProviderProps> = ( props ) => {
    // 1. Get the resources from the hooks
    const guildsResource = useGuilds();
    const uiModulesResource = useUIModules();

    // 2. Render the initializer, passing the resources down.
    //    This initializer will suspend if either resource isn't ready.
    return <FlowEditorContextInitializer {...props}
               guildsResource={guildsResource}
               uiModulesResource={uiModulesResource} />;
};
