import type { UIFlowVisualConnection } from "@vertix.gg/definitions/src/ui-flow-definitions";

export interface UIExportEmbedDefinition {
    instanceType?: string;
    title?: string;
    description?: string;
    color?: number;
    image?: string;
    thumbnail?: string;
    footer?: string;
    options?: Record<string, Record<string, string>>;
    arrayOptions?: Record<string, unknown>;
    vars?: Record<string, string>;
    defaultVars?: Record<string, string>;
}

export interface UIExportEmbedItem {
    embed: string;
    definition?: UIExportEmbedDefinition;
}

export const SELECT_MENU_ELEMENT_TYPES = [ "select-menu", "user-select", "role-select", "channel-select", "mentionable-select" ] as const;

export const BUTTON_ELEMENT_TYPES = [ "button", "button-url" ] as const;

export interface SelectOptionDefinition {
    label?: string;
    value?: string;
    emoji?: string;
    description?: string;
}

export interface UIExportElementDefinition {
    name: string;
    elementType: "button" | "button-url" | "select-menu" | "user-select" | "role-select" | "channel-select" | "mentionable-select" | "text-input" | "unknown";
    instanceType?: string;
    label?: string;
    labelOmitted?: boolean;
    style?: "primary" | "secondary" | "success" | "danger" | "link";
    emoji?: string;
    url?: string;
    placeholder?: string;
    disabled?: boolean;
    selectOptions?: SelectOptionDefinition[];
}

export interface UIExportElementItem {
    element: string;
    definition?: UIExportElementDefinition;
}

export interface UIExportElementsGroup {
    name: string;
    items: UIExportElementItem[][];
}

export interface UIExportEmbedsGroup {
    name: string;
    items: UIExportEmbedItem[];
}

export interface UIExportModalInputDefinition {
    name: string;
    label?: string;
    placeholder?: string;
    style?: "short" | "paragraph";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface UIExportModalDefinition {
    name: string;
    title?: string;
    inputs: UIExportModalInputDefinition[];
}

export interface UIExportedComponent {
    name: string;
    type: string;
    instanceType: string;
    modules: string[];
    elementsGroups: UIExportElementsGroup[];
    embedsGroups: UIExportEmbedsGroup[];
    modals: string[];
    modalDefinitions?: UIExportModalDefinition[];
    defaultElementsGroup: string | null;
    defaultEmbedsGroup: string | null;
    defaultMarkdownsGroup: string | null;
    hooks: string[];
    options?: {
        embedAudit: {
            total: number;
            withDefinition: number;
            missingDefinition: number;
        };
    };
}

export interface UIExportFlowStateDefinition {
    key: string;
    component: string | null;
    transitions: string[];
    hooks: string[];
    options?: Record<string, unknown>;
}

export interface UIExportFlowTransitionDefinition {
    from: string;
    to: string;
    triggeredBy: Array<{
        handlerId: string;
        sourceEntity: string;
        handlerKind: string;
        navigation?: {
            targetState: string;
        };
        mutations?: unknown[];
    }>;
}

export interface UIExportFlowHandoffPoint {
    flowName: string;
    description?: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
}

export interface UIExportedFlow {
    name: string;
    module: string;
    flowKind: string;
    initialState: string;
    states: UIExportFlowStateDefinition[];
    transitions: UIExportFlowTransitionDefinition[];
    entryPoints?: unknown[];
    handoffPoints?: UIExportFlowHandoffPoint[];
    inputRequirements?: unknown[];
    requiredData?: unknown[];
    externalReferences?: unknown;
    edgeSourceMappings?: UIFlowVisualConnection[];
}

export interface UIExportedMeta {
    schemaVersion: string;
    exportedAt: string;
    counts: {
        components: number;
        adapters: number;
        flows: number;
    };
    modules: string[];
    moduleSummary: Array<{
        module: string;
        components: number;
        adapters: number;
        flows: number;
        embeds: {
            total: number;
            withDefinition: number;
            missingDefinition: number;
        };
        componentsWithEmbeds: number;
        componentsWithMissingEmbeds: number;
    }>;
    embedCoverage: {
        total: number;
        withDefinition: number;
        missingDefinition: number;
    };
}

export interface UIExportBindingFlowTriggerDefinition {
    handlerId: string;
    sourceEntity: string;
    handlerKind: string;
    flowName?: string;
    transition?: string;
    navigation?: {
        targetState: string;
    };
}

export interface UIExportAdapterBindingDefinition {
    entity: string;
    handler: string;
    kind: string;
    options?: Record<string, string>;
    flowTriggers?: UIExportBindingFlowTriggerDefinition[];
}

export interface UIExportedAdapter {
    name: string;
    adapterKind: string;
    component: string;
    module: string;
    bindings: UIExportAdapterBindingDefinition[];
}

export interface UIExportData {
    meta: UIExportedMeta;
    components: UIExportedComponent[];
    flows: UIExportedFlow[];
    adapters: UIExportedAdapter[];
}

