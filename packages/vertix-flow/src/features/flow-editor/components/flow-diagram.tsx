import "reactflow/dist/style.css";

import React from "react";

import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    BackgroundVariant
} from "reactflow";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";

import type { NodeData, FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";
import type {
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge
} from "reactflow";

// Custom node component
const CustomNode = ( { data }: { data: NodeData } ) => {
    const { label, type, attributes } = data;

    return (
        <div className="p-2 border rounded-md shadow-sm bg-white">
            <div className="font-semibold">{label}</div>
            {type && <div className="text-xs text-gray-500">{type}</div>}
            {attributes && Object.keys( attributes ).length > 0 && (
                <div className="mt-2 text-xs">
                    {Object.entries( attributes ).map( ( [ key, value ] ) => (
                        <div key={key} className="flex justify-between gap-2">
                            <span className="font-medium">{key}:</span>
                            <span>{String( value )}</span>
                        </div>
                    ) )}
                </div>
            )}
        </div>
    );
};

// Mapping for custom node types
const nodeTypes = {
    custom: CustomNode,
};

// Function to generate flow diagram using factory - don't use hooks here
export function generateFlowDiagram( schema: FlowSchema ): FlowDiagram {
    // Use the factory singleton directly instead of the hook
    return flowFactory.createFlowDiagram( schema );
}

interface FlowDiagramDisplayProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: ( changes: NodeChange[] ) => void;
    onEdgesChange?: ( changes: EdgeChange[] ) => void;
    onConnect?: ( connection: Connection ) => void;
}

export const FlowDiagramDisplay: React.FC<FlowDiagramDisplayProps> = ( {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect
} ) => {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default FlowDiagramDisplay;
