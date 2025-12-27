import type {
    UISerializationFlowComponent
} from "@vertix.gg/definitions/src/ui-serialization-definitions";

import type { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

export interface UIFlowVisualConnection {
    triggeringElementId: string;
    transitionName: string;
    targetFlowName: string;
}

export interface UIFlowInputRequirementOption {
    value: string;
    label: string;
    description?: string;
}

export interface UIFlowInputRequirement {
    key: string;
    label: string;
    description?: string;
    inputType: "text" | "select";
    optional?: boolean;
    dependsOn?: string[];
    options?: UIFlowInputRequirementOption[];
}

export interface UIFlowInputRequirementDefinition extends Omit<UIFlowInputRequirement, "options"> {
    optionsDataComponent?: string;
    optionsDataKey?: string;
    dependsOn?: string[];
    optional?: boolean;
}

export enum UIEFlowIntegrationPointType {
    GENERIC = "GENERIC",
    COMMAND = "COMMAND",
    EVENT = "EVENT",
}

export interface UIFlowIntegrationPoint {
    flowName: string;
    fullName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
    type: UIEFlowIntegrationPointType;
}

export interface UIFlowDataBlueprint {
    name: string;
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: UISerializationFlowComponent[];
    type: string;
    nextStates: Record<string, string>;
    inputRequirements?: UIFlowInputRequirement[];
    missingInputs?: string[];
    integrations?: {
        entryPoints?: UIFlowIntegrationPoint[];
        handoffPoints?: UIFlowIntegrationPoint[];
        externalReferences?: Record<string, string>;
    };
    edgeSourceMappings?: UIFlowVisualConnection[];
}

export type UIFlowState = string;
export type UIFlowTransition = string;

export interface UIFlowDataBase {
    originFlow?: string;
    originState?: string;
    originTransition?: string;
    interactionId?: string;
    [key: string]: unknown;
}

export type UIFlowClassType = typeof UIFlowBase<UIFlowState, UIFlowTransition, UIFlowDataBase>;

