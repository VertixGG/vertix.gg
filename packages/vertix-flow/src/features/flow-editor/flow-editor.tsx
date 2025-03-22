import React, { useCallback, useEffect, useState } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@vertix.gg/flow/src/shared/components/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vertix.gg/flow/src/shared/components/tabs";
import { Separator } from "@vertix.gg/flow/src/shared/components/separator";
import { Card } from "@vertix.gg/flow/src/shared/components/card";

import { FlowDataDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-data-display";
import { FlowDiagramDisplay } from "@vertix.gg/flow/src/features/flow-editor/components/flow-diagram";
import { useFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";

import { FlowList } from "@vertix.gg/flow/src/features/flow-list/components/flow-list";

import { ModuleSelector } from "@vertix.gg/flow/src/features/module-selector/components/module-selector";

import { getViewportDimensions } from "@vertix.gg/flow/src/shared/lib/position-calculator";

import type { NodeChange, EdgeChange, Connection } from "@xyflow/react";
import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

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

    // Get diagram state and actions from store
    const { nodes, edges, setNodes, setEdges, handleSchemaLoaded } = useFlowDiagram();

    // Calculate layout based on viewport dimensions
    const { width } = getViewportDimensions();
    const isWide = width > 1200;
    const sidebarWidth = isWide ? 18 : 25;
    const diagramWidth = 100 - sidebarWidth;

    // Handle node changes
    const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
        setNodes( applyNodeChanges( changes, nodes ) );
    }, [ nodes, setNodes ] );

    // Handle edge changes
    const onEdgesChange = useCallback( ( changes: EdgeChange[] ) => {
        setEdges( edgs => applyEdgeChanges( changes, edgs ) );
    }, [ setEdges ] );

    // Handle new connections
    const onConnect = useCallback( ( params: Connection ) => {
        setEdges( edgs => addEdge( params, edgs ) );
    }, [ setEdges ] );

    // Module selection handler
    const handleModuleClick = useCallback( ( module: UIModuleFile ) => {
        setModulePath( module.path );
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
        }
    }, [ modulePath ] );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <LoadingIndicator />

            <ResizablePanelGroup
                direction="horizontal"
                className="min-h-screen"
            >
                {/* Sidebar */}
                <ResizablePanel defaultSize={sidebarWidth} minSize={20}>
                    <div className="flex flex-col h-full">
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
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Main content area */}
                <ResizablePanel defaultSize={diagramWidth} minSize={30}>
                    <div className="flex flex-col h-full">
                        {modulePath && flowName ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4">
                                    <h2 className="text-xl font-bold">{flowName}</h2>
                                    <p className="text-sm text-muted-foreground">{modulePath}</p>
                                </div>
                                <Separator />
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="md:w-2/3 h-[400px] md:h-full p-4">
                                        <FlowDiagramDisplay
                                            nodes={nodes}
                                            edges={edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            onConnect={onConnect}
                                        />
                                    </div>
                                    <div className="md:w-1/3 p-4 overflow-y-auto">
                                        <FlowDataDisplay
                                            modulePath={modulePath}
                                            flowName={flowName}
                                            onSchemaLoaded={handleSchemaLoaded}
                                        />
                                    </div>
                                </div>
                            </div>
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
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
