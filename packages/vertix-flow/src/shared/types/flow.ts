import type { Edge, Node } from "@xyflow/react";

export interface FlowItem {
    name: string;
    FlowClass?: unknown; // Changed from any to unknown for better type safety
    modulePath?: string; // Module path for fetching flow data
}

export interface FlowSchema {
    name: string;
    type: string;
    entities: {
        elements: Array<Array<FlowElement>>;
        embeds: Array<FlowEmbed>;
    };
}

export interface FlowElement {
    name: string;
    type: string;
    attributes: Record<string, unknown>;
    isAvailable: boolean;
}

export interface FlowEmbed {
    name: string;
    type: string;
    attributes: Record<string, unknown>;
    isAvailable: boolean;
}

export interface UIModuleFile {
    name: string;
    path: string;
    moduleInfo?: {
        name: string;
        adapters: string[];
        flows: string[];
    };
    content?: string;
}

export interface UIModulesResponse {
    files: UIModuleFile[];
}

export interface FlowData {
    transactions: string[];
    requiredData: Record<string, string[]>;
    schema: FlowSchema;
}

export interface NodeData {
    label: string;
    type: string;
    attributes?: Record<string, unknown>;
}

export interface FlowDiagram {
    nodes: Node[];
    edges: Edge[];
}
