import "reactflow/dist/style.css";

import React from "react";

import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    BackgroundVariant
} from "reactflow";

import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";

import type { FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";
import type {
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge
} from "reactflow";

interface DiscordEmbed {
    title?: string;
    description?: string;
    thumbnail?: { url: string };
    image?: { url: string };
    [key: string]: unknown;
}

// Extend NodeData to include elements
interface ExtendedNodeData {
    label: string;
    type: string;
    attributes?: Record<string, unknown>;
    elements?: Array<Array<{
        attributes: {
            type: number;
            style: number;
            label: string;
            emoji?: { name: string };
        };
    }>>;
}

// Custom node component
const CustomNode = ( { data }: { data: ExtendedNodeData } ) => {
    const { label, type, attributes, elements } = data;

    // Root component node
    if ( type === "component" ) {
        return (
            <div className="p-4 bg-[#2f3136] rounded-lg shadow-lg text-white">
                <div className="font-semibold text-lg">{label}</div>
                <div className="text-[#b9bbbe] text-xs mt-1">{type}</div>
            </div>
        );
    }

    // Discord message with embed
    if ( type === "embed" ) {
        const embedAttributes = attributes as DiscordEmbed;
        const buttons = elements?.flat() || []; // Get all buttons if they exist

        return (
            <div className="min-w-[400px] max-w-[600px] bg-[#36393f] rounded-lg overflow-hidden">
                {/* Main embed content */}
                <div className="p-4 border-l-4 border-[#5865f2]">
                    {/* Embed Header */}
                    <div className="text-white font-medium text-lg mb-2">{embedAttributes?.title}</div>

                    {/* Embed Description */}
                    {embedAttributes?.description && (
                        <div className="text-[#dcddde] text-sm whitespace-pre-wrap mb-3">
                            {embedAttributes.description}
                        </div>
                    )}

                    {/* Embed Thumbnail */}
                    {embedAttributes?.thumbnail?.url && (
                        <div className="float-right ml-4 mb-2">
                            <img src={embedAttributes.thumbnail.url} alt="Thumbnail" className="max-w-[80px] rounded" />
                        </div>
                    )}

                    {/* Embed Image */}
                    {embedAttributes?.image?.url && (
                        <div className="mt-3">
                            <img src={embedAttributes.image.url} alt="Embed" className="max-w-full rounded" />
                        </div>
                    )}

                    {/* Buttons row */}
                    {buttons.length > 0 && (
                        <div className="flex gap-2 mt-4">
                            {buttons.map( ( button: any, index: number ) => {
                                const buttonStyle = button.attributes.style === 5
                                    ? "bg-[#5865f2] hover:bg-[#4752c4]" // Link button style
                                    : "bg-[#4f545c] hover:bg-[#686d73]"; // Regular button style

                                return (
                                    <button
                                        key={index}
                                        className={`px-4 py-2 rounded text-white font-medium ${ buttonStyle } flex items-center justify-center gap-2 min-w-[120px]`}
                                    >
                                        {button.attributes.emoji && (
                                            <span>{button.attributes.emoji.name}</span>
                                        )}
                                        {button.attributes.label}
                                    </button>
                                );
                            } )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Fallback for any other node type
    return (
        <div className="p-4 bg-[#2f3136] rounded-lg shadow-lg text-white">
            <div className="font-semibold">{label}</div>
            {type && <div className="text-[#b9bbbe] text-xs mt-1">{type}</div>}
        </div>
    );
};

// Custom group node component
const GroupNode = ( { data }: { data: { label: string } } ) => {
    return (
        <div className="p-2 rounded-md bg-neutral-800/10 border border-dashed border-neutral-400">
            <div className="text-xs text-neutral-600 font-medium mb-1 text-center">{data.label}</div>
        </div>
    );
};

// Mapping for custom node types
const nodeTypes = {
    custom: CustomNode,
    group: GroupNode,
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
                nodesDraggable={true}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default FlowDiagramDisplay;
