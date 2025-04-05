import React, { useMemo, useState, useCallback, useEffect } from "react";

import { useConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-connected-flows";

import { FlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import { useModuleFlowSelection } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-module-flow-selection";
import { useFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-flow-diagram";

import type { FlowEditorContextType } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";

import type { FlowEditorProps } from "@vertix.gg/flow/src/features/flow-editor/flow-editor";

interface FlowEditorProviderProps extends FlowEditorProps {
  children: React.ReactNode;
}

export const FlowEditorProvider: React.FC<FlowEditorProviderProps> = ( {
  children,
  initialModulePath,
  initialFlowName,
} ) => {
  const [ selectedGuildId, setSelectedGuildId ] = useState<string | null>( null );

  // --- Initialize Hooks ---
  const {
    modulePath,
    flowName,
    moduleName,
    activeTab,
    zoomLevel,
    handleModuleClick,
    handleFlowClick,
    handleZoomChange,
    setActiveTab,
  } = useModuleFlowSelection( { initialModulePath, initialFlowName } );

  const {
    connectedFlowsData,
    combinedNodes,
    combinedEdges,
    isLoadingConnectedFlows,
    handleMainFlowDataLoaded,
    setCombinedNodes, // Need this for useFlowDiagram
  } = useConnectedFlows(); // Removed setCombinedEdges as it's not used externally

  const { onNodesChange } = useFlowDiagram( { setCombinedNodes } );

  // --- State for Initial Layout ---
  const [ isInitialLayoutApplied, setIsInitialLayoutApplied ] = useState<boolean>( false );

  // --- Effect to Reset Layout Flag on Flow Change ---
  useEffect( () => {
    // Reset the flag whenever the selected module or flow changes
    console.log( "[Context] Flow changed, resetting initial layout flag.", { modulePath, flowName } );
    setIsInitialLayoutApplied( false );
  }, [ modulePath, flowName ] );

  // --- Action to Mark Layout as Applied ---
  const markInitialLayoutApplied = useCallback( () => {
    console.log( "[Context] Marking initial layout as applied." );
    setIsInitialLayoutApplied( true );
  }, [] );

  // --- Create Context Value ---
  // Use useMemo to prevent unnecessary re-renders of consumers
  // when the provider itself re-renders but the value hasn't changed.
  const contextValue = useMemo<FlowEditorContextType>( () => ( {
    // Guild selection
    selectedGuildId,
    setSelectedGuildId,
    // Selection state & handlers
    modulePath,
    flowName,
    moduleName,
    activeTab,
    zoomLevel,
    handleModuleClick,
    handleFlowClick,
    handleZoomChange,
    setActiveTab,
    // Connected flows state & handlers
    connectedFlowsData,
    combinedNodes,
    combinedEdges,
    isLoadingConnectedFlows,
    handleMainFlowDataLoaded,
    setCombinedNodes,
    // Diagram handlers
    onNodesChange,
    // Initial layout state & action
    isInitialLayoutApplied,
    markInitialLayoutApplied,
  } ), [
    selectedGuildId, setSelectedGuildId,
    modulePath, flowName, moduleName, activeTab, zoomLevel,
    handleModuleClick, handleFlowClick, handleZoomChange, setActiveTab,
    connectedFlowsData, combinedNodes, combinedEdges, isLoadingConnectedFlows,
    handleMainFlowDataLoaded, setCombinedNodes, onNodesChange,
    isInitialLayoutApplied, markInitialLayoutApplied
  ] );

  // --- Provide Context ---
  return (
    <FlowEditorContext.Provider value={contextValue}>
      {children}
    </FlowEditorContext.Provider>
  );
};
