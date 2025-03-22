import React, { useCallback, useState } from "react";
import "reactflow/dist/style.css";

import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from "reactflow";

import { UIModuleSelector } from "@vertix.gg/flow/src/components/ui-module-selector";
import { FlowListDisplay } from "@vertix.gg/flow/src/components/flow-list-display";
import { FlowInteraction } from "@vertix.gg/flow/src/components/flow-interaction";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/components/ui/card";

import type { Connection, Edge, Node } from "reactflow";
import type { UIModuleFile } from "@vertix.gg/flow/src/hooks/use-ui-modules";

// Initial nodes setup
const initialNodes: Node[] = [
    {
        id: "1",
        type: "input",
        data: { label: "Input Node" },
        position: { x: 250, y: 25 },
    },
    {
        id: "2",
        data: { label: "Default Node" },
        position: { x: 100, y: 125 },
    },
    {
        id: "3",
        type: "output",
        data: { label: "Output Node" },
        position: { x: 250, y: 250 },
    },
];

// Initial edges setup
const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
];

interface FlowItem {
    name: string;
    FlowClass?: any; // The actual flow class (optional now)
}

export const FlowEditor: React.FC = () => {
    const [ nodes, , onNodesChange ] = useNodesState( initialNodes );
    const [ edges, setEdges, onEdgesChange ] = useEdgesState( initialEdges );
    const [ moduleName, setModuleName ] = useState<string>( "" );
    const [ flows, setFlows ] = useState<FlowItem[]>( [] );
    const [ selectedFlow, setSelectedFlow ] = useState<FlowItem | null>( null );

    // Handle new connections between nodes
    const onConnect = useCallback( ( params: Connection ) => setEdges( ( eds ) => addEdge( params, eds ) ), [ setEdges ] );

    // Handle UI module selection
    const handleModuleSelected = useCallback( ( module: UIModuleFile ) => {
        // Update state with the module information
        setModuleName( module.moduleInfo?.name || "" );

        if ( module.moduleInfo?.flows ) {
            // Use the flows data from moduleInfo directly
            const flowItems = module.moduleInfo.flows.map( flowName => ( {
                name: flowName
            } ) );
            setFlows( flowItems );
        } else {
            setFlows( [] );
        }

        // Reset selected flow when module changes
        setSelectedFlow( null );
    }, [] );

    // Handle flow selection
    const handleFlowSelect = useCallback( ( flow: FlowItem ) => {
        setSelectedFlow( flow );
    }, [] );

    return (
        <div className="w-full h-full flex flex-col">
            {/* Top section with file selector and flow list display */}
            <div className="flex-none bg-background">
                <Card className="m-4 border">
                    <CardHeader className="pb-2">
                        <CardTitle>Flow Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <UIModuleSelector onModuleSelected={handleModuleSelected} />
                            {moduleName && (
                                <FlowListDisplay
                                    moduleName={moduleName}
                                    flows={flows}
                                    onFlowSelect={handleFlowSelect}
                                />
                            )}
                            {selectedFlow && selectedFlow.FlowClass && (
                                <FlowInteraction
                                    flowName={selectedFlow.name}
                                    FlowClass={selectedFlow.FlowClass}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Flow editor canvas */}
            <div className="flex-1 min-h-0">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};
