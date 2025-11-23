import type { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { Node } from "@xyflow/react";

export type FlowAttributeValue =
    | string
    | number
    | boolean
    | null
    | FlowAttributeValue[]
    | { [ key: string ]: FlowAttributeValue };

export type FlowAttributes = Record<string, FlowAttributeValue>;

export interface FlowElement {
    name: string;
    type: string;
    attributes: FlowAttributes;
    isAvailable: boolean;
}

export interface FlowEmbed {
    name: string;
    type: string;
    attributes: FlowAttributes;
    isAvailable: boolean;
}

export interface FlowComponent {
    name: string;
    type: string;
    entities: {
        elements: Array<Array<FlowElement>>;
        embeds: Array<FlowEmbed>;
    };
    components: Array<FlowComponent>;
}

export interface UIModuleFile {
    shortName: string;
    name: string;
    path: string;
    adapters: string[];
    flows: string[];
    systemFlows?: string[];
}

export interface UIModulesResponse {
    uiModules: UIModuleFile[];
}

export interface FlowIntegrationPoint {
    flowName: string;
    fullName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
    type: UIEFlowIntegrationPointType;
}

export interface VisualConnection {
    triggeringElementId: string;
    transitionName: string;
    targetFlowName: string;
}

export interface FlowData {
    name: string;
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: FlowComponent[];
    type: string;
    nextStates: Record<string, string>;
    integrations?: {
        entryPoints?: FlowIntegrationPoint[];
        handoffPoints?: FlowIntegrationPoint[];
        externalReferences?: Record<string, string>;
    };
    edgeSourceMappings?: VisualConnection[];
}

export interface FlowDiagram {
    nodes: Node[];
}

export interface GuildResponseItem {
    guildId: string;
    name: string;
}

export type UIFlowResponse = FlowData;
