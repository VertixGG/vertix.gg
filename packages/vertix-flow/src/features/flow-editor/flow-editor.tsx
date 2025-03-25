import React, { useCallback, useEffect, useState } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import axios from "axios";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vertix.gg/flow/src/shared/components/tabs";
import { Card } from "@vertix.gg/flow/src/shared/components/card";
import { ResizableHandle } from "@vertix.gg/flow/src/shared/components/resizable";

import {
  FlowLayout,
  FlowLayoutContent,
  FlowLayoutLeftSidebar,
  FlowLayoutRightSidebar,
  FlowLayoutMainContent,
  FlowLayoutTopBar,
  FlowLayoutEditor,
  FlowLayoutActivityBar
} from "@vertix.gg/flow/src/shared/components/flow-layout";

import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";
import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";
import { useFlowDiagram, useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";

import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";
import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

import { getConnectedFlows } from "@vertix.gg/flow/src/shared/lib/flow-utils";

import type { NodeChange, EdgeChange, Connection, Node, Edge } from "@xyflow/react";
import type { UIModuleFile, FlowData } from "@vertix.gg/flow/src/shared/types/flow";

// Helper function to get the correct API base URL
const getApiBaseUrl = () => {
  // For development environment running on Vite's default port
  if ( window.location.origin.includes( "localhost:5173" ) || window.location.origin.includes( "127.0.0.1:5173" ) ) {
    return "http://localhost:3000";
  }

  // Default to current origin
  return window.location.origin;
};

export interface FlowEditorProps {
  // Optionally specify initial module path and flow name, if not specified, user must select
  initialModulePath?: string;
  initialFlowName?: string;
}

/**
 * FlowEditor is the main component for the flow editor
 * It handles module and flow selection, and displays the selected flow
 */
export const FlowEditor: React.FC<FlowEditorProps> = ( {
  initialModulePath,
  initialFlowName,
} ) => {
  // State for the module path and flow name
  const [ modulePath, setModulePath ] = useState<string | null>( initialModulePath || null );
  const [ flowName, setFlowName ] = useState<string | null>( initialFlowName || null );
  const [ activeTab, setActiveTab ] = useState<string>( "modules" );
  const [ zoomLevel, setZoomLevel ] = useState<number>( 0.15 );
  const [ moduleName, setModuleName ] = useState<string | null>( null );

  // State for connected flows
  const [ connectedFlowsData, setConnectedFlowsData ] = useState<FlowData[]>( [] );
  const [ combinedNodes, setCombinedNodes ] = useState<Node[]>( [] );
  const [ combinedEdges, setCombinedEdges ] = useState<Edge[]>( [] );
  const [ isLoadingConnectedFlows, setIsLoadingConnectedFlows ] = useState<boolean>( false );

  // Get diagram state and actions from store
  const { nodes, edges, handleSchemaLoaded: handleFlowDataLoaded } = useFlowDiagram();
  const { setError } = useFlowUI();

  // Handle node changes
  const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
    setCombinedNodes( prev => applyNodeChanges( changes, prev ) );
  }, [] );

  // Handle edge changes
  const onEdgesChange = useCallback( ( changes: EdgeChange[] ) => {
    setCombinedEdges( edgs => applyEdgeChanges( changes, edgs ) );
  }, [] );

  // Handle new connections
  const onConnect = useCallback( ( params: Connection ) => {
    setCombinedEdges( edgs => addEdge( params, edgs ) );
  }, [] );

  // Module selection handler
  const handleModuleClick = useCallback( ( module: UIModuleFile ) => {
    setModulePath( module.path );
    setModuleName( module.shortName );
    // Switch to flows tab after selecting a module
    setActiveTab( "flows" );
  }, [] );

  // Flow selection handler
  const handleFlowClick = useCallback( ( newFlowName: string ) => {
    setFlowName( newFlowName );
  }, [] );

  // Reset flow when module path changes
  useEffect( () => {
    if ( modulePath ) {
      setFlowName( null );
      setConnectedFlowsData( [] );
      setCombinedNodes( [] );
      setCombinedEdges( [] );
    }
  }, [ modulePath ] );

  // Add a callback to listen for zoom changes
  const handleZoomChange = useCallback( ( zoom: number ) => {
    setZoomLevel( Number( zoom.toFixed( 2 ) ) );
  }, [] );

  // Main flow data handler
  const handleMainFlowDataLoaded = useCallback( ( flowData: FlowData ) => {
    // Generate the main flow diagram first
    const mainDiagram = generateFlowDiagram( flowData );
    setCombinedNodes( mainDiagram.nodes );
    setCombinedEdges( mainDiagram.edges );

    // Call the original handler
    handleFlowDataLoaded( flowData );

    // Now load connected flows
    const connectedFlowNames = getConnectedFlows( flowData );
    if ( connectedFlowNames.length > 0 ) {
        loadConnectedFlows( connectedFlowNames );
    }
  }, [ handleFlowDataLoaded ] );

  // Function to load connected flows
  const loadConnectedFlows = async( connectedFlowNames: string[] ) => {
    try {
        setIsLoadingConnectedFlows( true );
        const apiBaseUrl = getApiBaseUrl();
        const loadedFlows: FlowData[] = [];

        for ( const connectedFlowName of connectedFlowNames ) {
            // Extract module name from flow name (e.g., "Vertix/UI-V3/SetupNewWizardFlow" -> "Vertix/UI-V3/Module")
            const moduleNameParts = connectedFlowName.split( "/" );
            const connectedModuleName = `${ moduleNameParts[ 0 ] }/${ moduleNameParts[ 1 ] }/Module`;

            try {
                const response = await axios.get<FlowData>( `${ apiBaseUrl }/api/ui-flows`, {
                    params: {
                        moduleName: connectedModuleName,
                        flowName: connectedFlowName
                    }
                } );

                if ( response.data ) {
                    loadedFlows.push( response.data );
                }
            } catch ( error ) {
                console.error( `Failed to load connected flow: ${ connectedFlowName }`, error );
            }
        }

        setConnectedFlowsData( loadedFlows );
    } catch ( error ) {
        console.error( "Error loading connected flows:", error );
        setError( "Failed to load connected flows" );
    } finally {
        setIsLoadingConnectedFlows( false );
    }
  };

  // Function to combine flow diagrams
  const combineFlowDiagrams = ( mainNodes: Node[], mainEdges: Edge[], connectedFlows: FlowData[] ) => {
    // Start with the main flow nodes and edges
    const allNodes = [ ...mainNodes ];
    const allEdges = [ ...mainEdges ];

    // Position offset for each connected flow
    let offsetX = 800; // Horizontal space between flows

    // Add each connected flow with an offset
    connectedFlows.forEach( ( flowData, index ) => {
        // Generate diagram for this flow
        const { nodes: flowNodes, edges: flowEdges } = generateFlowDiagram( flowData );

        // Add prefix to node IDs to avoid conflicts
        const prefixedNodes = flowNodes.map( node => ( {
            ...node,
            id: `flow-${ index }-${ node.id }`,
            // Apply offset to position
            position: {
                x: ( node.position?.x || 0 ) + offsetX,
                y: ( node.position?.y || 0 )
            },
            // Add visual indication that this is a connected flow
            data: {
                ...node.data,
                isConnectedFlow: true,
                flowIndex: index,
                flowName: flowData.name
            }
        } ) );

        // Update edge source and target IDs with the prefix
        const prefixedEdges = flowEdges.map( edge => ( {
            ...edge,
            id: `flow-${ index }-${ edge.id }`,
            source: `flow-${ index }-${ edge.source }`,
            target: `flow-${ index }-${ edge.target }`
        } ) );

        // Add connection edges between main flow and this connected flow
        if ( index === 0 && mainNodes.length > 0 ) {
            // Find a good node to connect from main flow to this flow
            const mainFlowGroupId = mainNodes.find( n => n.id === "flow-group" )?.id || mainNodes[ 0 ].id;
            const connectedFlowGroupId = prefixedNodes.find( n => n.type === "compound" )?.id || prefixedNodes[ 0 ].id;

            // Add a connection edge
            allEdges.push( {
                id: `connection-to-flow-${ index }`,
                source: mainFlowGroupId,
                target: connectedFlowGroupId,
                type: "smoothstep",
                animated: true,
                style: {
                    stroke: "#ff9900",
                    strokeWidth: 2
                },
                label: "Connected Flow"
            } );
        }

        // Add to the combined collection
        allNodes.push( ...prefixedNodes );
        allEdges.push( ...prefixedEdges );

        // Increase offset for next flow
        offsetX += 800;
    } );

    // Update state with combined nodes and edges
    setCombinedNodes( allNodes );
    setCombinedEdges( allEdges );
};

  // Update combined nodes/edges when connected flows change
  useEffect( () => {
    if ( nodes.length > 0 && connectedFlowsData.length > 0 && !isLoadingConnectedFlows ) {
        // Combine main flow with connected flows
        combineFlowDiagrams( nodes, edges, connectedFlowsData );
    }
  }, [ nodes, edges, connectedFlowsData, isLoadingConnectedFlows ] );

  return (
    <FlowLayout>
      <LoadingIndicator />

      <FlowLayoutContent>
        {/* Left Sidebar */}
        <FlowLayoutLeftSidebar defaultSize={20} minSize={15} maxSize={25}>
          <div className="p-4 border-b bg-primary/5">
            <h1 className="text-xl font-bold text-center text-primary">Vertix Flow Panel</h1>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="flows">Flows</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="modules" className="p-4 h-full overflow-y-auto">
              <ModuleSelector
                onSelectModule={handleModuleClick}
              />
            </TabsContent>

            <TabsContent value="flows" className="p-4 h-full overflow-y-auto">
              {modulePath ? (
                <FlowList
                  onSelectFlow={handleFlowClick}
                />
              ) : (
                <Card className="p-4">
                  <p>Please select a module first</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Zoom level indicator */}
          <div className="p-2 border-t text-center text-xs text-muted-foreground bg-muted/30">
            Zoom: {Math.round( zoomLevel * 100 )}%
          </div>
        </FlowLayoutLeftSidebar>

        <ResizableHandle />

        {/* Main content (Editor with TopBar) */}
        <FlowLayoutMainContent>
          {modulePath && flowName && moduleName ? (
            <>
              {/* Top Bar */}
              <FlowLayoutTopBar>
                <h2 className="text-xl font-bold">{flowName}</h2>
                <p className="text-sm text-muted-foreground">{modulePath}</p>
                {connectedFlowsData.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Showing with {connectedFlowsData.length} connected flows
                    {isLoadingConnectedFlows && <span className="ml-2">(Loading...)</span>}
                  </div>
                )}
              </FlowLayoutTopBar>

              {/* Editor */}
              <FlowLayoutEditor>
                <div className="h-full w-full">
                  <FlowDiagramDisplay
                    nodes={combinedNodes}
                    edges={combinedEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onZoomChange={handleZoomChange}
                  />
                </div>
              </FlowLayoutEditor>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-bold">Select a Flow</h2>
                <p className="text-muted-foreground">
                  Please select a module and flow from the sidebar
                </p>
              </div>
            </div>
          )}
        </FlowLayoutMainContent>

        <ResizableHandle />

        {/* Right Sidebar */}
        <FlowLayoutRightSidebar defaultSize={25} minSize={15} maxSize={40}>
          <div className="p-4 border-b bg-muted/5">
            <h2 className="text-lg font-semibold">Flow Details</h2>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            {modulePath && flowName && moduleName ? (
              <FlowDataDisplay
                moduleName={moduleName}
                flowName={flowName}
                onFlowDataLoaded={handleMainFlowDataLoaded}
              />
            ) : (
              <Card className="p-4">
                <p>Select a flow to view details</p>
              </Card>
            )}
          </div>
        </FlowLayoutRightSidebar>
      </FlowLayoutContent>

      {/* Activity Bar */}
      <FlowLayoutActivityBar>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {modulePath && flowName
              ? `Module: ${ moduleName } • Flow: ${ flowName }`
              : "No flow selected"}
          </div>
          <div className="text-sm text-muted-foreground">
            {connectedFlowsData.length > 0
              ? `Connected flows: ${ connectedFlowsData.length }`
              : "No connected flows"}
          </div>
        </div>
      </FlowLayoutActivityBar>
    </FlowLayout>
  );
};
