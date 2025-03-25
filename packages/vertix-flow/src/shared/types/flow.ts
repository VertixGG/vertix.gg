import type { Edge, Node } from "@xyflow/react";

export interface FlowComponent {
    name: string;
    type: string;
    entities: {
        elements: Array<Array<FlowElement>>;
        embeds: Array<FlowEmbed>;
    };
    components: Array<FlowComponent>;
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
    shortName: string;
    name: string;
    path: string;
    adapters: string[];
    flows: string[];
}

export interface UIModulesResponse {
    uiModules: UIModuleFile[];
}

export interface FlowIntegrationPoint {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
}

export interface FlowData {
    name: string; // name of the flow eg `VertixBot/UI-General/WelcomeFlow`
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: FlowComponent[];
    integrations?: {
        entryPoints?: FlowIntegrationPoint[];
        handoffPoints?: FlowIntegrationPoint[];
        externalReferences?: Record<string, string>;
    };
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
