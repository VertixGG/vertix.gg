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

import { UIModuleSelector } from "./ui-module-selector";
import { AdaptersDisplay } from "@vertix.gg/flow/src/components/adapters-display";
// import { parseUIModule } from "@vertix.gg/flow/src/components/module-parser";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/components/ui/card";

import type { Connection, Edge, Node } from "reactflow";

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

interface Adapter {
    name: string;
    path: string;
    fullPath: string;
}

export const FlowEditor: React.FC = () => {
    const [nodes, _, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [moduleName, setModuleName] = useState<string>("");
    const [adapters, setAdapters] = useState<Adapter[]>([]);

    // Handle new connections between nodes
    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Handle UI module file selection
    const handleFileSelected = useCallback((filePath: string, content: string) => {
        // Parse the UI module file to extract adapter information
        // const parsedModule = parseUIModule( filePath, content );
        // Update state with the parsed information
        // setModuleName( parsedModule.moduleName );
        // setAdapters( parsedModule.adapters );
    }, []);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Top section with file selector and adapter display */}
            <div className="flex-none bg-background">
                <Card className="m-4 border">
                    <CardHeader className="pb-2">
                        <CardTitle>UI Module Viewer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UIModuleSelector onModuleSelected={handleFileSelected} />
                        <AdaptersDisplay moduleName={moduleName} adapters={adapters} />
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
