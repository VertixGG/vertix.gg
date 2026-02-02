import type {
    BindingFlowTriggerConfig
} from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    FlowContextMutationDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";

export type NavigationType = "editReply" | "ephemeral" | "silent";

export interface StateConfig {
    executionStep: string;
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
     * If true, this flow is hidden from visualization export.
     * Use when a system flow already provides visualization for this adapter.
     */
    hidden?: boolean;
}

export class TransactionBuilder {
    private flowName: string;
    private initialState: string = "";
    private states = new Map<string, StateConfig>();
    private transitions = new Map<string, TransitionConfig>();
    private elementBindings = new Map<string, string>(); // elementId -> transitionName
    private modalButtonBindings: ModalButtonBinding[] = [];
    private isHidden: boolean = false;

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
     * Bind element to transition - generates flowTrigger for runtime.
     */
    public bindElement( elementId: string, transitionName: string ): this {
        this.elementBindings.set( elementId, this.fullTransitionName( transitionName ) );
        return this;
    }

    /**
     * Bind a button that triggers a modal. This captures the button-to-modal relationship
     * for visualization purposes (edge from button to modal in the flow diagram).
     */
    public bindModalWithButton( buttonElement: string, modalName: string, transitionName?: string ): this {
        this.modalButtonBindings.push( {
            buttonElement,
            modalName,
            transitionName: transitionName ? this.fullTransitionName( transitionName ) : undefined
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
            hidden: this.isHidden
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
