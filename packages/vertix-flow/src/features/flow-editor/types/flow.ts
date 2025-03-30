import type { Node } from "@xyflow/react";

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

// Define the structure for visual connection hints
export interface VisualConnection {
    triggeringElementId: string; // ID of the source element (e.g., button name)
    transitionName: string;      // The transition this connection corresponds to
    targetFlowName: string;      // The target flow (redundant with handoffPoints but good for clarity)
}

export interface FlowData {
    name: string; // name of the flow eg `VertixBot/UI-General/WelcomeFlow`
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: FlowComponent[];
    type: string; // Added based on dump files (e.g., "ui")
    nextStates: Record<string, string>; // Added based on dump files
    integrations?: {
        entryPoints?: FlowIntegrationPoint[];
        handoffPoints?: FlowIntegrationPoint[];
        externalReferences?: Record<string, string>;
    };
    visualConnections?: VisualConnection[]; // Add the optional visual connections array
}

export interface NodeData {
    label: string;
    type: string;
    attributes?: Record<string, unknown>;
}

export interface FlowDiagram {
    nodes: Node[];
}
