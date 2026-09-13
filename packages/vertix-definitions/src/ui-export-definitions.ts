
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
    /**
     * What an element that names itself at runtime fills its label from - v2's privacy buttons
     * label themselves `{displayText}`, and these say what that reads as with nothing set.
     */
    options?: Record<string, string>;
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

/**
 * Which element carries a person out of a flow, and into which flow.
 *
 * Lives here rather than beside the flow definitions because those reach into `@vertix.gg/gui` for
 * `UIFlowBase`, and everything that only wants to read an export - a website, a dashboard - would
 * drag the whole bot framework in behind it.
 */
export interface UIFlowVisualConnection {
    triggeringElementId: string;
    transitionName: string;
    targetFlowName: string;
}

export interface UIExportFlowStateOptions {
    executionStep?: string | null;
    /** The component this state draws. Lives under `options`, which is where the exporter puts it. */
    component?: string | null;
    previewEmbedsGroup?: string | null;
    /**
     * The elements this state puts on screen - the menus or buttons you act on while standing in it.
     *
     * A state that declares one is a surface in its own right, not just something the bot says: the
     * permissions panel is a reply you then work from. Absent, the state is an outcome and nothing
     * more.
     */
    previewElementsGroup?: string | null;
    previewDefaultVars?: Record<string, string>;
    /** How the bot delivers the state - `ephemeral`, `silent` and the like. */
    navigationType?: string | null;
}

export interface UIExportFlowStateDefinition {
    key: string;
    /**
     * @deprecated The exporter has never written this at the top level - it writes `options.component`.
     * Kept so nothing reading it stops compiling, but it is always absent from the payload.
     */
    component?: string | null;
    transitions: string[];
    hooks: string[];
    options?: UIExportFlowStateOptions & Record<string, unknown>;
}

/** One function the embed works something out with, written out as the code it is. */
export interface UIEmbedLogicSource {
    /** The body, ready to be called with an argument bag and the embed's vars. */
    source: string;
    /**
     * What the body reached for from around it, to be handed back under those names.
     *
     * Most of these bodies are written against the embed's vars - the object of `{token}` names
     * sitting beside them in the module - by closing over it rather than by taking the parameter
     * that holds it. Every name here is that same object, and every one of them was checked
     * against the original before being written down.
     */
    binds?: string[];
}

/**
 * An embed's own working out, shipped as the code it is.
 *
 * An embed decides things about its arguments before printing them - how many candidates there
 * are, which of its sentences applies, how long is left - and names each answer by a token its
 * options resolve to wording. The options are exported already. The deciding is a function, and a
 * function does not survive being written down as data, so it is written down as itself.
 *
 * Everything here was run before it was written down, so what is here is known to run.
 */
export interface UIEmbedLogic {
    /**
     * Every function behind this embed, in the order the bot lays their answers over each other.
     *
     * There is more than one because an embed inherits some of its working out - a countdown gets
     * its counting from the base every counting embed shares - and the bot runs all of it and
     * merges. That inherited part is a method wanting a `this` rather than a plain function, so it
     * is wrapped on the way out: by the time it is written down, everything here has the one shape
     * and is called the one way.
     */
    sources: UIEmbedLogicSource[];
    /**
     * Where this embed counts down to, for one that counts down - the handler, written out.
     *
     * `setEndTime()` takes a handler rather than the name of an argument, and what it does with the
     * arguments is its own business: one reads a moment straight off them, another adds a delay to
     * now. Neither can be guessed at from outside, so neither is - the handler comes too, and is
     * asked. Its presence is also how whoever draws the embed knows the answer goes stale and has
     * to be asked for again a second later.
     */
    endTime?: UIEmbedLogicSource;
}

/**
 * How a demonstration decides which branch a submission takes.
 *
 * `out-of-range` is the numeric one: it holds when the field is not a whole number, or falls
 * outside `min`..`max` - the same question a handler asks of anything typed into a number field.
 */
export type UIExportFlowPreviewOperator = "empty" | "not-empty" | "contains" | "equals" | "out-of-range";

export interface UIExportFlowPreviewCondition {
    field: string;
    operator: UIExportFlowPreviewOperator;
    value?: string;
    /** Bounds for `out-of-range`, inclusive. */
    min?: number;
    max?: number;
    /**
     * The elements this branch belongs to, where a state has several that lead different ways.
     *
     * Five menus leaving one state is five different questions, and a refusal that only one or two
     * of them can give has to say which. Absent, the rule is asked of whatever was just used.
     */
    elements?: string[];
}

export interface UIExportFlowTransitionDefinition {
    /** What the transition is called, e.g. `SubmitBadword`. */
    name?: string;
    from: string;
    to: string;
    /** What this transition writes into the context when it is taken. */
    mutations?: Array<{ type: string; path: string[] }>;
    /** How a demonstration decides this is the branch taken. Ignored by the bot. */
    previewCondition?: UIExportFlowPreviewCondition;
    /** Whether taking this transition takes the reply the flow was being shown in off the screen. */
    previewDeletesReply?: boolean;
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

