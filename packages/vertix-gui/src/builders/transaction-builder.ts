import type {
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import type {
    BindingFlowTriggerConfig
} from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    FlowContextMutationDefinition,
    FlowIntegrationPointDefinition,
    FlowEdgeSourceMappingDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";

export type HandlerKind = "button" | "modal" | "modalWithButton" | "selectMenu" | "userSelectMenu";

/**
 * Type-erased handler binding used for storage and cross-context transfer.
 *
 * The handler uses a bivariant method signature (`{ handler(...): ... }` style)
 * so that it can be safely stored regardless of the original `TContext`.
 * The bind* methods on TransactionBuilder provide full type-safety at
 * registration time, and consumers cast to the appropriate context type
 * when invoking at runtime.
 */
export interface ElementHandlerBinding {
    elementId: string;
    handlerKind: HandlerKind;
    handler( context: unknown, interaction: unknown ): Promise<void>;
    /** For modalWithButton bindings */
    modalName?: string;
}

export type NavigationType = "editReply" | "ephemeral" | "silent";

export interface StateConfig {
    /**
     * The execution step name for this state.
     * Can be "default" for the default step, or a custom step name.
     */
    executionStep: string;
    /**
     * The embeds group to use for this state's UI.
     * If not specified, uses the component's default embeds group.
     */
    embedsGroup?: string | null;
    /**
     * The elements group to use for this state's UI.
     * If not specified, uses the component's default elements group.
     */
    elementsGroup?: string | null;
    /**
     * The markdown group to use for this state's UI.
     * If not specified, uses the component's default markdown group.
     */
    markdownGroup?: string | null;
    /**
     * How to navigate to this state.
     * - "editReply": Update the existing message (default)
     * - "ephemeral": Send ephemeral reply
     * - "silent": No UI update (for intermediate states)
     */
    navigationType?: NavigationType;
    /**
     * Whether to delete previous reply when navigating to this state.
     * Only applicable for ephemeral navigation.
     */
    deletePreviousReply?: boolean;
    /**
     * Default variable values for dashboard preview.
     * Maps embed variable names to their preview values.
     * Example: { state: "Public", stateMessage: "Channel is public" }
     */
    previewDefaultVars?: Record<string, string>;
    /**
     * Which embeds group to use for preview (if different from default).
     */
    previewEmbedsGroup?: string;
    /**
     * If true, this state is hidden from flow visualization.
     * Use for ephemeral error states or intermediate states that don't represent UI.
     */
    hidden?: boolean;
}

export interface TransitionConfig {
    from: string | string[];
    to: string;
    requiredData?: string[];
    mutations?: FlowContextMutationDefinition[];
}

/**
 * Resolved transition info for runtime execution.
 */
export interface ResolvedTransition {
    transitionName: string;
    targetState: string;
    executionStep: string;
    navigationType: NavigationType;
    deletePreviousReply?: boolean;
    mutations?: FlowContextMutationDefinition[];
}

export interface ModalButtonBinding {
    buttonElement: string;
    modalName: string;
    transitionName?: string;
}

export interface VirtualFlowDefinition {
    flowName: string;
    initialState: string;
    states: Map<string, StateConfig>;
    transitions: Map<string, TransitionConfig>;
    elementBindings: Map<string, string>;
    modalButtonBindings: ModalButtonBinding[];
    /**
     * Handler bindings for elements - used at runtime for element-to-function mappings.
     */
    handlerBindings: ElementHandlerBinding[];
    /**
     * If true, this flow is hidden from visualization export.
     * Use when a system flow already provides visualization for this adapter.
     */
    hidden?: boolean;
    /**
     * Entry points - how other flows can enter this flow.
     */
    entryPoints: FlowIntegrationPointDefinition[];
    /**
     * Handoff points - how this flow can hand off to other flows.
     */
    handoffPoints: FlowIntegrationPointDefinition[];
    /**
     * Edge source mappings - visual connections from elements to other flows.
     */
    edgeSourceMappings: FlowEdgeSourceMappingDefinition[];
}

export class TransactionBuilder<TContext = unknown> {
    private flowName: string;
    private initialState: string = "";
    private states = new Map<string, StateConfig>();
    private transitions = new Map<string, TransitionConfig>();
    private elementBindings = new Map<string, string>();
    private modalButtonBindings: ModalButtonBinding[] = [];
    private handlerBindings: ElementHandlerBinding[] = [];
    private isHidden: boolean = false;
    private entryPointsList: FlowIntegrationPointDefinition[] = [];
    private handoffPointsList: FlowIntegrationPointDefinition[] = [];
    private edgeSourceMappingsList: FlowEdgeSourceMappingDefinition[] = [];

    public constructor( flowName: string ) {
        this.flowName = flowName;
    }

    /**
     * Mark this flow as hidden from visualization export.
     * Use when a system flow already provides visualization for this adapter.
     * The transactions will still work at runtime for triggerTransition().
     */
    public setHidden( hidden: boolean = true ): this {
        this.isHidden = hidden;
        return this;
    }

    public getFlowName(): string {
        return this.flowName;
    }

    public setInitialState( state: string ): this {
        this.initialState = this.fullStateName( state );
        return this;
    }

    public addState( name: string, config: StateConfig ): this {
        this.states.set( this.fullStateName( name ), config );
        return this;
    }

    public addTransition( name: string, config: TransitionConfig ): this {
        const fullName = this.fullTransitionName( name );
        const fromStates = Array.isArray( config.from )
            ? config.from.map( ( s ) => this.fullStateName( s ) )
            : [ this.fullStateName( config.from ) ];

        this.transitions.set( fullName, {
            ...config,
            from: fromStates,
            to: this.fullStateName( config.to )
        } );
        return this;
    }

    /**
     * Get modal-button bindings.
     */
    public getModalButtonBindings(): ModalButtonBinding[] {
        return [ ...this.modalButtonBindings ];
    }

    /**
     * Bind a button element to a transition and handler function.
     * Combines element-to-transition binding with handler registration.
     */
    public bindButton<T extends ButtonInteraction<"cached">>(
        elementId: string,
        transitionName: string,
        handler: ( context: TContext, interaction: T ) => Promise<void>
    ): this {
        // Bind element to transition
        this.elementBindings.set( elementId, this.fullTransitionName( transitionName ) );
        // Add handler binding (cast to type-erased form for storage)
        this.handlerBindings.push( {
            elementId,
            handlerKind: "button",
            handler: handler as ElementHandlerBinding[ "handler" ]
        } );
        return this;
    }

    /**
     * Bind a modal element to a transition and handler function.
     */
    public bindModal<T extends ModalSubmitInteraction<"cached">>(
        elementId: string,
        transitionName: string,
        handler: ( context: TContext, interaction: T ) => Promise<void>
    ): this {
        // Bind element to transition
        this.elementBindings.set( elementId, this.fullTransitionName( transitionName ) );
        // Add handler binding (cast to type-erased form for storage)
        this.handlerBindings.push( {
            elementId,
            handlerKind: "modal",
            handler: handler as ElementHandlerBinding[ "handler" ]
        } );
        return this;
    }

    /**
     * Bind a button that opens a modal and handle the modal submission.
     * Combines modal-button visualization binding with handler registration.
     */
    public bindModalWithButton<T extends ModalSubmitInteraction<"cached">>(
        buttonElement: string,
        modalName: string,
        transitionName: string,
        handler: ( context: TContext, interaction: T ) => Promise<void>
    ): this {
        // Add to modalButtonBindings for visualization
        this.modalButtonBindings.push( {
            buttonElement,
            modalName,
            transitionName: this.fullTransitionName( transitionName )
        } );
        // Add handler binding (cast to type-erased form for storage)
        this.handlerBindings.push( {
            elementId: buttonElement,
            handlerKind: "modalWithButton",
            modalName,
            handler: handler as ElementHandlerBinding[ "handler" ]
        } );
        return this;
    }

    /**
     * Bind a select menu element to a transition and handler function.
     */
    public bindSelectMenu<T extends StringSelectMenuInteraction<"cached">>(
        elementId: string,
        transitionName: string,
        handler: ( context: TContext, interaction: T ) => Promise<void>
    ): this {
        // Bind element to transition
        this.elementBindings.set( elementId, this.fullTransitionName( transitionName ) );
        // Add handler binding (cast to type-erased form for storage)
        this.handlerBindings.push( {
            elementId,
            handlerKind: "selectMenu",
            handler: handler as ElementHandlerBinding[ "handler" ]
        } );
        return this;
    }

    /**
     * Bind a user select menu element to a transition and handler function.
     */
    public bindUserSelectMenu<T extends UserSelectMenuInteraction<"cached">>(
        elementId: string,
        transitionName: string,
        handler: ( context: TContext, interaction: T ) => Promise<void>
    ): this {
        // Bind element to transition
        this.elementBindings.set( elementId, this.fullTransitionName( transitionName ) );
        // Add handler binding (cast to type-erased form for storage)
        this.handlerBindings.push( {
            elementId,
            handlerKind: "userSelectMenu",
            handler: handler as ElementHandlerBinding[ "handler" ]
        } );
        return this;
    }

    /**
     * Get all handler bindings.
     */
    public getHandlerBindings(): ElementHandlerBinding[] {
        return [ ...this.handlerBindings ];
    }

    /**
     * Generate BindingFlowTriggerConfig for an element (used by runtime).
     */
    public getFlowTrigger( elementId: string ): BindingFlowTriggerConfig | undefined {
        const transitionName = this.elementBindings.get( elementId );
        if ( !transitionName ) {
            return undefined;
        }

        const transition = this.transitions.get( transitionName );
        if ( !transition ) {
            return undefined;
        }

        const targetState = transition.to as string;
        const stateConfig = this.states.get( targetState );

        return {
            flowName: this.flowName,
            transition: transitionName,
            navigation: {
                targetState,
                executionStep: stateConfig?.executionStep
            },
            mutations: transition.mutations
        };
    }

    /**
     * Get all flow triggers for all bound elements.
     */
    public getAllFlowTriggers(): Map<string, BindingFlowTriggerConfig> {
        const triggers = new Map<string, BindingFlowTriggerConfig>();
        for ( const [ elementId ] of this.elementBindings ) {
            const trigger = this.getFlowTrigger( elementId );
            if ( trigger ) {
                triggers.set( elementId, trigger );
            }
        }
        return triggers;
    }

    /**
     * Get states map.
     */
    public getStates(): Map<string, StateConfig> {
        return new Map( this.states );
    }

    /**
     * Get transitions map.
     */
    public getTransitions(): Map<string, TransitionConfig> {
        return new Map( this.transitions );
    }

    /**
     * Derive UIExecutionSteps from the transaction states.
     * This allows defineTransactions() to replace setExecutionSteps().
     *
     * Returns a map of execution step names to their configuration,
     * derived from the state configs.
     */
    public getExecutionSteps(): Record<string, { embedsGroup?: string | null; elementsGroup?: string | null; markdownGroup?: string | null }> {
        const steps: Record<string, { embedsGroup?: string | null; elementsGroup?: string | null; markdownGroup?: string | null }> = {};

        for ( const [ , stateConfig ] of this.states ) {
            const stepName = stateConfig.executionStep;

            // Skip if we already have this step (first definition wins)
            if ( steps[ stepName ] ) {
                continue;
            }

            // Only add if there's at least one group defined
            if ( stateConfig.embedsGroup !== undefined ||
                 stateConfig.elementsGroup !== undefined ||
                 stateConfig.markdownGroup !== undefined ) {
                steps[ stepName ] = {
                    ...( stateConfig.embedsGroup !== undefined && { embedsGroup: stateConfig.embedsGroup } ),
                    ...( stateConfig.elementsGroup !== undefined && { elementsGroup: stateConfig.elementsGroup } ),
                    ...( stateConfig.markdownGroup !== undefined && { markdownGroup: stateConfig.markdownGroup } )
                };
            } else {
                // Add empty config for the step (allows step to exist with defaults)
                steps[ stepName ] = {};
            }
        }

        return steps;
    }

    /**
     * Get element bindings map.
     */
    public getElementBindings(): Map<string, string> {
        return new Map( this.elementBindings );
    }

    /**
     * Get initial state.
     */
    public getInitialState(): string {
        return this.initialState;
    }

    /**
     * Resolve a transition by name - returns all info needed for runtime navigation.
     * Accepts both short name ("SetPublic") and full name ("FlowName/Transitions/SetPublic").
     */
    public resolveTransition( transitionName: string ): ResolvedTransition | undefined {
        const fullName = transitionName.includes( "/" )
            ? transitionName
            : this.fullTransitionName( transitionName );

        const transition = this.transitions.get( fullName );
        if ( !transition ) {
            return undefined;
        }

        const targetState = transition.to as string;
        const stateConfig = this.states.get( targetState );

        if ( !stateConfig ) {
            return undefined;
        }

        return {
            transitionName: fullName,
            targetState,
            executionStep: stateConfig.executionStep,
            navigationType: stateConfig.navigationType ?? "editReply",
            deletePreviousReply: stateConfig.deletePreviousReply,
            mutations: transition.mutations
        };
    }

    /**
     * Get state config by name (short or full).
     */
    public getState( stateName: string ): StateConfig | undefined {
        const fullName = stateName.includes( "/" )
            ? stateName
            : this.fullStateName( stateName );

        return this.states.get( fullName );
    }

    /**
     * Check if this flow is hidden from visualization.
     */
    public getHidden(): boolean {
        return this.isHidden;
    }

    /**
     * Add an entry point - defines how another flow can enter this flow.
     */
    public addEntryPoint( options: {
        flowName: string;
        transition: string;
        targetState?: string;
        description?: string;
        integrationType?: "GENERIC" | "COMMAND" | "EVENT";
    } ): this {
        this.entryPointsList.push( {
            flowName: options.flowName,
            description: options.description ?? `Entry from ${ options.flowName }`,
            targetState: options.targetState ?? this.initialState,
            transition: options.transition,
            integrationType: options.integrationType ?? "GENERIC"
        } );
        return this;
    }

    /**
     * Add a handoff point - defines how this flow can hand off to another flow.
     */
    public addHandoffPoint( options: {
        flowName: string;
        sourceState?: string;
        targetState?: string;
        transition?: string;
        description?: string;
        requiredData?: string[];
        integrationType?: "GENERIC" | "COMMAND" | "EVENT";
    } ): this {
        this.handoffPointsList.push( {
            flowName: options.flowName,
            description: options.description ?? `Handoff to ${ options.flowName }`,
            sourceState: options.sourceState,
            targetState: options.targetState,
            transition: options.transition,
            requiredData: options.requiredData,
            integrationType: options.integrationType ?? "GENERIC"
        } );
        return this;
    }

    /**
     * Add an edge source mapping - defines visual connection from an element to another flow.
     */
    public addEdgeSourceMapping( options: {
        triggeringElementId: string;
        transitionName: string;
        targetFlowName: string;
    } ): this {
        this.edgeSourceMappingsList.push( {
            triggeringElementId: options.triggeringElementId,
            transitionName: options.transitionName.includes( "/" )
                ? options.transitionName
                : this.fullTransitionName( options.transitionName ),
            targetFlowName: options.targetFlowName
        } );
        return this;
    }

    /**
     * Get entry points.
     */
    public getEntryPoints(): FlowIntegrationPointDefinition[] {
        return [ ...this.entryPointsList ];
    }

    /**
     * Get handoff points.
     */
    public getHandoffPoints(): FlowIntegrationPointDefinition[] {
        return [ ...this.handoffPointsList ];
    }

    /**
     * Get edge source mappings.
     */
    public getEdgeSourceMappings(): FlowEdgeSourceMappingDefinition[] {
        return [ ...this.edgeSourceMappingsList ];
    }

    /**
     * Build definition for export/visualization.
     */
    public build(): VirtualFlowDefinition {
        return {
            flowName: this.flowName,
            initialState: this.initialState,
            states: new Map( this.states ),
            transitions: new Map( this.transitions ),
            elementBindings: new Map( this.elementBindings ),
            modalButtonBindings: [ ...this.modalButtonBindings ],
            handlerBindings: [ ...this.handlerBindings ],
            hidden: this.isHidden,
            entryPoints: [ ...this.entryPointsList ],
            handoffPoints: [ ...this.handoffPointsList ],
            edgeSourceMappings: [ ...this.edgeSourceMappingsList ]
        };
    }

    private fullStateName( name: string ): string {
        if ( name.includes( "/" ) ) {
            return name;
        }
        return `${ this.flowName }/States/${ name }`;
    }

    private fullTransitionName( name: string ): string {
        if ( name.includes( "/" ) ) {
            return name;
        }
        return `${ this.flowName }/Transitions/${ name }`;
    }
}
