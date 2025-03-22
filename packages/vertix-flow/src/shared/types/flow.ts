import type { Edge, Node } from "@xyflow/react";

export interface FlowComponent {
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
    name: string; // name of the flow eg `VertixBot/UI-General/WelcomeFlow`
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: FlowComponent[];
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
