import { createContext, useContext } from "react";

import type { Node, Edge, NodeChange } from "@xyflow/react";
import type { FlowData, UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

// Define the shape of the context state and actions
export interface FlowEditorContextType {
  // State from useModuleFlowSelection
  modulePath: string | null;
  flowName: string | null;
  moduleName: string | null;
  activeTab: string;
  zoomLevel: number;
  // Handlers from useModuleFlowSelection
  handleModuleClick: ( module: UIModuleFile ) => void;
  handleFlowClick: ( name: string ) => void;
  handleZoomChange: ( zoom: number ) => void;
  setActiveTab: ( tab: string ) => void;

  // State from useConnectedFlows
  connectedFlowsData: FlowData[];
  combinedNodes: Node[];
  combinedEdges: Edge[];
  isLoadingConnectedFlows: boolean;
  // Handlers from useConnectedFlows
  handleMainFlowDataLoaded: ( flowData: FlowData ) => void;
  setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  // setCombinedEdges: React.Dispatch<React.SetStateAction<Edge[]>>; // setCombinedEdges is internal to useConnectedFlows now

  // Handlers from useFlowDiagram
  onNodesChange: ( changes: NodeChange[] ) => void;

  // Potentially add UI state if needed later (isLoading, error, etc.)
}

// Create the context with a default value (or null)
// Using null requires checks in consumers, but avoids needing dummy default functions
export const FlowEditorContext = createContext<FlowEditorContextType | null>( null );

// Custom hook for easy context consumption
export const useFlowEditorContext = () => {
  const context = useContext( FlowEditorContext );
  if ( !context ) {
    throw new Error( "useFlowEditorContext must be used within a FlowEditorProvider" );
  }
  return context;
};
