import type { UIFlowInputRequirement } from "@vertix.gg/definitions/src/ui-flow-definitions";

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

export interface SelectOptionDefinition {
    label?: string;
    value?: string;
    emoji?: string;
    description?: string;
}

export interface ElementDefinition {
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
    options?: JsonObject;
    selectOptions?: SelectOptionDefinition[];
}

export interface ElementReference {
    element: string;
    definition?: ElementDefinition;
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
    definition?: EmbedContentDefinition;
}

export interface EmbedContentDefinition {
    instanceType?: string | null;
    title?: string;
    description?: string;
    color?: JsonValue;
    image?: string;
    thumbnail?: string;
    footer?: string;
    options?: JsonObject;
    arrayOptions?: JsonObject;
    logic?: JsonObject;
    vars?: JsonValue;
    defaultVars?: JsonObject;
}

export type FlowTriggerHandlerKind =
    | "button"
    | "modal"
    | "modal-button"
    | "string-select"
    | "user-select"
    | "command"
    | "unknown";

export interface FlowContextMutationDefinition {
    type: "set" | "delete";
    path: string[];
}

export interface FlowNavigationDefinition {
    targetState?: string;
    executionStep?: string;
}

export interface FlowTriggerDefinition {
    handlerId: string;
    sourceEntity: string;
    handlerKind: FlowTriggerHandlerKind;
    mutations?: FlowContextMutationDefinition[];
    navigation?: FlowNavigationDefinition;
}

export interface BindingFlowTriggerDefinition extends FlowTriggerDefinition {
    flowName: string;
    transition: string;
}

export interface EmbedsGroupDefinition {
    name?: string;
    resolver?: string;
    items: EmbedReference[];
    options?: JsonObject;
}

export interface ModalInputDefinition {
    name: string;
    label?: string;
    placeholder?: string;
    style?: "short" | "paragraph";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface ModalDefinition {
    name: string;
    title?: string;
    inputs: ModalInputDefinition[];
}

export interface ComponentDefinition {
    name: string;
    type: string;
    instanceType: string;
    modules?: string[];
    elementsGroups: ElementsGroupDefinition[];
    embedsGroups: EmbedsGroupDefinition[];
    modals: string[];
    modalDefinitions?: ModalDefinition[];
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
    flowTriggers?: BindingFlowTriggerDefinition[];
}

export interface AdapterDefinition {
    name: string;
    adapterKind: string;
    component: string;
    module?: string;
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
    triggeredBy?: FlowTriggerDefinition[];
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
    module?: string;
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
    inputRequirements?: UIFlowInputRequirement[];
    hooks: HookReference[];
    options?: JsonObject;
}

