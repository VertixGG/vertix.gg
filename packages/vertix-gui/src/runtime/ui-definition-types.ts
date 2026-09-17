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
    header?: string;
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

/**
 * What a member does to cause a move.
 *
 * The select kinds are not decoration: a string select offers the options the bot declared, while
 * the other four open discord's own picker over the whole guild. Collapsed into one kind, a screen
 * that says "choose any member" reads as "choose from this list", which is a different product.
 *
 * `modal` and `modal-button` describe the interaction rather than the control - a form submitted on
 * its own, and the pairing where one declaration names both the button and the form it opens - so
 * neither is derivable from an element's type and neither is overwritten by it.
 */
export type FlowTriggerHandlerKind =
    | "button"
    | "modal"
    | "modal-button"
    | "string-select"
    | "user-select"
    | "role-select"
    | "channel-select"
    | "mentionable-select"
    | "command"
    | "unknown";

export interface FlowContextMutationDefinition {
    type: "set" | "delete";
    path: string[];
}

/**
 * A rule a preview can evaluate to decide which transition a submission takes.
 *
 * The bot decides this by running the handler - a service call against the guild's data, and a
 * result code. A demonstration has neither, so a transition can declare the shape of that decision
 * in terms something outside the bot can evaluate against what a person typed. It is what the
 * branch looks like, not what performs it: the bot ignores this entirely.
 */
export interface FlowPreviewConditionDefinition {
    /** Which submitted value is being judged. */
    field: string;
    /** `out-of-range` holds for anything that is not a whole number within `min`..`max`. */
    operator: "empty" | "not-empty" | "contains" | "equals" | "out-of-range";
    value?: string;
    /** Bounds for `out-of-range`, inclusive. */
    min?: number;
    max?: number;
    /** The elements this branch belongs to, where a state has several that lead different ways. */
    elements?: string[];
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
    /**
     * Whether the screen is drawn as one container rather than as an embed with its rows beneath.
     *
     * Exported because it is a layout the reader can see: a container keeps each row's heading with
     * the row it names, which an embed cannot, so a page drawing this component from the export has
     * to know which of the two it is looking at or it draws the arrangement the bot replaced.
     */
    renderAsContainer?: boolean;
    /**
     * Whether the moves leaving this screen are drawn from another screen that makes the same ones.
     *
     * Set from the adapter's `setHidden`, which a variant uses to say a screen it duplicates is
     * already accounted for - the channel's own message and the master channel's panel put up one
     * grid of buttons between them and lead to the same fifteen places. The flag stops at the
     * exporter otherwise, so anything reading the export sees two screens it cannot tell apart and
     * draws the fifteen twice.
     *
     * The screen is still a screen, and still worth drawing. It is the lines out of it that would
     * be the second copy.
     */
    routesDrawnElsewhere?: boolean;
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

export interface ModalTriggerDefinition {
    buttonElement: string;
    modalName: string;
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
    modalTriggers?: ModalTriggerDefinition[];
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
    /**
     * What the transition is called - `SubmitBadword` and the like.
     *
     * Carried in its own field because `from` means two different things depending on which path
     * emitted the transition, and neither of them reliably leaves the name anywhere.
     */
    name?: string;
    from: string;
    to: string;
    triggeredBy?: FlowTriggerDefinition[];
    /** What the transition writes into the flow context, declared on the transition itself. */
    mutations?: FlowContextMutationDefinition[];
    previewCondition?: FlowPreviewConditionDefinition;
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

