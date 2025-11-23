import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import type { InteractionHandler } from "@vertix.gg/gui/src/runtime/interaction-handler-registry";
import type {
    AdapterDefinition,
    BindingDefinition,
    ComponentDefinition,
    ElementsGroupDefinition,
    ElementReference,
    EmbedsGroupDefinition,
    EmbedReference,
    ExecutionStepDefinition,
    FlowDefinition,
    FlowIntegrationPointDefinition,
    FlowRequiredDataDefinition,
    FlowStateDefinition,
    FlowTransitionDefinition,
    HookReference,
    JsonObject,
    FlowEdgeSourceMappingDefinition,
    FlowIntegrationPointType,
    FlowTriggerDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ExecutionAdapterClass } from "@vertix.gg/gui/src/runtime/data-driven-adapter-factory";
import type { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

export interface RuntimeClassRef {
    name: string;
    Class: RegisterableClass<object>;
}

export type RuntimeHandler =
    | {
        type: "class-method";
        classRef: RuntimeClassRef;
        method: string;
    }
    | {
        type: "function";
        name: string;
        handler: InteractionHandler;
    };

export interface RuntimeHook {
    definition: HookReference;
    callable: RuntimeHandler;
}

export interface RuntimeElement {
    definition: ElementReference;
    classRef: RuntimeClassRef;
}

export interface RuntimeElementsGroup {
    definition: ElementsGroupDefinition;
    rows: RuntimeElement[][];
}

export interface RuntimeEmbed {
    definition: EmbedReference;
    classRef: RuntimeClassRef;
}

export interface RuntimeEmbedsGroup {
    definition: EmbedsGroupDefinition;
    items: RuntimeEmbed[];
}

export interface RuntimeExecutionStep {
    definition: ExecutionStepDefinition;
    hooks: RuntimeHook[];
}

export interface RuntimeBinding {
    definition: BindingDefinition;
    callable: RuntimeHandler;
}

export interface HydratedComponent {
    definition: ComponentDefinition;
    elementsGroups: RuntimeElementsGroup[];
    embedsGroups: RuntimeEmbedsGroup[];
    modals: RuntimeClassRef[];
    hooks: RuntimeHook[];
    componentClass?: UIComponentTypeConstructor;
}

export interface HydratedAdapter {
    definition: AdapterDefinition;
    executionSteps: RuntimeExecutionStep[];
    bindings: RuntimeBinding[];
    hooks: RuntimeHook[];
    componentClass?: UIComponentTypeConstructor;
    adapterClass?: ExecutionAdapterClass;
}

export interface RuntimeFlowState {
    definition: FlowStateDefinition;
    componentRef?: RuntimeClassRef | null;
    hooks: RuntimeHook[];
}

export interface RuntimeFlowTrigger {
    definition: FlowTriggerDefinition;
    callable?: RuntimeHandler;
}

export interface RuntimeFlowTransition {
    definition: FlowTransitionDefinition;
    triggers: RuntimeFlowTrigger[];
}

export interface RuntimeFlowRequiredData {
    definition: FlowRequiredDataDefinition;
}

export interface RuntimeFlowIntegrationPoint {
    definition: FlowIntegrationPointDefinition;
    type: FlowIntegrationPointType;
}

export interface HydratedFlow {
    definition: FlowDefinition;
    states: RuntimeFlowState[];
    transitions: RuntimeFlowTransition[];
    requiredData: RuntimeFlowRequiredData[];
    entryPoints: RuntimeFlowIntegrationPoint[];
    handoffPoints: RuntimeFlowIntegrationPoint[];
    hooks: RuntimeHook[];
    externalReferences?: Record<string, string>;
    options?: JsonObject;
    requiredDataComponents?: string[];
    edgeSourceMappings?: FlowEdgeSourceMappingDefinition[];
    channelTypes?: string[];
    permissions?: string | number | null;
    initialData?: JsonObject;
    flowType?: string;
    flowClass?: FlowConstructor;
}

export type FlowConstructor = typeof UIFlowBase;


