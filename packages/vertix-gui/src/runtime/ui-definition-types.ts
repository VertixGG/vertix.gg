export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
    [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

export interface HookReference {
    hook: string;
    handler: string;
    options?: JsonObject;
}

export interface ElementReference {
    element: string;
    options?: JsonObject;
}

export interface ElementsGroupDefinition {
    name?: string;
    resolver?: string;
    items: ElementReference[][];
    options?: JsonObject;
}

export interface EmbedReference {
    embed: string;
    options?: JsonObject;
}

export interface EmbedsGroupDefinition {
    name?: string;
    resolver?: string;
    items: EmbedReference[];
    options?: JsonObject;
}

export interface ComponentDefinition {
    name: string;
    type: string;
    instanceType: string;
    elementsGroups: ElementsGroupDefinition[];
    embedsGroups: EmbedsGroupDefinition[];
    modals: string[];
    defaultElementsGroup?: string | null;
    defaultEmbedsGroup?: string | null;
    defaultMarkdownsGroup?: string | null;
    hooks: HookReference[];
    options?: JsonObject;
}

export interface ExecutionStepDefinition {
    key: string;
    elementsGroup?: string | null;
    embedsGroup?: string | null;
    markdownGroup?: string | null;
    hooks?: HookReference[];
    options?: JsonObject;
}

export interface BindingDefinition {
    entity: string;
    handler: string;
    kind?: string;
    options?: JsonObject;
}

export interface AdapterDefinition {
    name: string;
    adapterKind: string;
    component: string;
    instanceType?: string;
    channelTypes?: string[];
    permissions?: string | number | null;
    middlewares?: string[];
    executionSteps: ExecutionStepDefinition[];
    bindings: BindingDefinition[];
    hooks: HookReference[];
    options?: JsonObject;
}

export interface FlowStateDefinition {
    key: string;
    component?: string | null;
    transitions: string[];
    hooks?: HookReference[];
    options?: JsonObject;
}

export interface FlowTransitionDefinition {
    from: string;
    to: string;
    options?: JsonObject;
}

export interface FlowRequiredDataDefinition {
    transition: string;
    fields: string[];
    options?: JsonObject;
}

export type FlowIntegrationPointType = "GENERIC" | "COMMAND" | "EVENT";

export interface FlowIntegrationPointDefinition {
    flowName: string;
    description: string;
    sourceState?: string;
    targetState?: string;
    transition?: string;
    requiredData?: string[];
    integrationType?: FlowIntegrationPointType;
    options?: JsonObject;
}

export interface FlowEdgeSourceMappingDefinition {
    triggeringElementId: string;
    transitionName: string;
    targetFlowName: string;
    options?: JsonObject;
}

export interface FlowDefinition {
    name: string;
    flowKind: string;
    initialState: string;
    states: FlowStateDefinition[];
    transitions: FlowTransitionDefinition[];
    requiredData: FlowRequiredDataDefinition[];
    entryPoints: FlowIntegrationPointDefinition[];
    handoffPoints?: FlowIntegrationPointDefinition[];
    externalReferences?: Record<string, string>;
    edgeSourceMappings?: FlowEdgeSourceMappingDefinition[];
    requiredDataComponents?: string[];
    channelTypes?: string[];
    permissions?: string | number | null;
    initialData?: JsonObject;
    stepStates?: string[];
    stepComponents?: string[];
    flowType?: string;
    hooks: HookReference[];
    options?: JsonObject;
}

