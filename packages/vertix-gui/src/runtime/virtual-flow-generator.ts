import type {
    FlowDefinition,
    FlowStateDefinition,
    FlowTransitionDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { TransactionBuilder, VirtualFlowDefinition } from "@vertix.gg/gui/src/builders/transaction-builder";
import type { UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";

export interface VirtualFlowGeneratorOptions {
    moduleName?: string;
    componentName?: string;
    /**
     * Execution steps from the adapter, used to resolve embedsGroup for preview.
     */
    executionSteps?: UIExecutionSteps;
}

/**
 * VirtualFlowGenerator creates FlowDefinition objects from TransactionBuilder
 * instances. This allows flows to be generated from adapter transactions
 * rather than being manually defined as separate flow classes.
 */
export class VirtualFlowGenerator {
    /**
     * Generate a FlowDefinition from a TransactionBuilder.
     */
    public static generate(
        transactions: TransactionBuilder,
        options: VirtualFlowGeneratorOptions = {}
    ): FlowDefinition {
        const definition = transactions.build();
        return VirtualFlowGenerator.fromDefinition( definition, options );
    }

    /**
     * Generate a FlowDefinition from a VirtualFlowDefinition.
     */
    public static fromDefinition(
        definition: VirtualFlowDefinition,
        options: VirtualFlowGeneratorOptions = {}
    ): FlowDefinition {
        const states = VirtualFlowGenerator.generateStates( definition, options );
        const transitions = VirtualFlowGenerator.generateTransitions( definition );

        return {
            name: definition.flowName,
            module: options.moduleName,
            flowKind: "virtual",
            initialState: definition.initialState,
            states,
            transitions,
            requiredData: [],
            entryPoints: [],
            handoffPoints: [],
            hooks: [],
            options: {
                generatedFrom: "TransactionBuilder",
                isVirtual: true
            }
        };
    }

    private static generateStates(
        definition: VirtualFlowDefinition,
        options: VirtualFlowGeneratorOptions = {}
    ): FlowStateDefinition[] {
        const states: FlowStateDefinition[] = [];

        for ( const [ stateKey, stateConfig ] of definition.states ) {
            // Find transitions that originate from this state
            const outgoingTransitions: string[] = [];
            for ( const [ transitionName, transitionConfig ] of definition.transitions ) {
                const fromStates = Array.isArray( transitionConfig.from )
                    ? transitionConfig.from
                    : [ transitionConfig.from ];

                if ( fromStates.includes( stateKey ) ) {
                    outgoingTransitions.push( transitionName );
                }
            }

            // Resolve previewEmbedsGroup from executionSteps if not explicitly set
            let previewEmbedsGroup = stateConfig.previewEmbedsGroup;
            if ( !previewEmbedsGroup && options.executionSteps && stateConfig.executionStep ) {
                const stepDef = options.executionSteps[ stateConfig.executionStep ];
                if ( stepDef && typeof stepDef === "object" && "embedsGroup" in stepDef ) {
                    previewEmbedsGroup = stepDef.embedsGroup as string;
                }
            }

            states.push( {
                key: stateKey,
                component: undefined,
                transitions: outgoingTransitions,
                hooks: [],
                options: {
                    executionStep: stateConfig.executionStep,
                    // Include component name so dashboard can build multi-state flows
                    component: options.componentName,
                    // Include preview configuration for dashboard visualization
                    ...( stateConfig.previewDefaultVars && { previewDefaultVars: stateConfig.previewDefaultVars } ),
                    ...( previewEmbedsGroup && { previewEmbedsGroup } )
                }
            } );
        }

        return states;
    }

    private static generateTransitions( definition: VirtualFlowDefinition ): FlowTransitionDefinition[] {
        const transitions: FlowTransitionDefinition[] = [];

        for ( const [ transitionName, transitionConfig ] of definition.transitions ) {
            const fromStates = Array.isArray( transitionConfig.from )
                ? transitionConfig.from
                : [ transitionConfig.from ];

            // Create a transition entry for each source state
            for ( const fromState of fromStates ) {
                transitions.push( {
                    from: fromState,
                    to: transitionConfig.to as string,
                    triggeredBy: VirtualFlowGenerator.generateTriggersForTransition(
                        definition,
                        transitionName
                    ),
                    options: transitionConfig.requiredData?.length
                        ? { requiredData: transitionConfig.requiredData }
                        : undefined
                } );
            }
        }

        // Add modal-button bindings as triggers for visualization
        // These show up as transitions from initial state so the dashboard can find them
        if ( definition.modalButtonBindings?.length ) {
            const modalTriggers = definition.modalButtonBindings.map( binding => ( {
                handlerId: `${ definition.flowName }/Handlers/ModalButton/${ binding.buttonElement }`,
                sourceEntity: `${ binding.buttonElement }::${ binding.modalName }`,
                handlerKind: "modal-button" as const,
                navigation: undefined,
                mutations: undefined
            } ) );

            // Add a synthetic transition for modal triggers so dashboard can discover them
            transitions.push( {
                from: definition.initialState,
                to: definition.initialState,
                triggeredBy: modalTriggers,
                options: { isModalTrigger: true }
            } );
        }

        return transitions;
    }

    private static generateTriggersForTransition(
        definition: VirtualFlowDefinition,
        transitionName: string
    ): FlowTransitionDefinition[ "triggeredBy" ] {
        const triggers: NonNullable<FlowTransitionDefinition[ "triggeredBy" ]> = [];

        for ( const [ elementId, boundTransition ] of definition.elementBindings ) {
            if ( boundTransition === transitionName ) {
                const transition = definition.transitions.get( transitionName );
                const targetState = transition?.to as string | undefined;
                const stateConfig = targetState ? definition.states.get( targetState ) : undefined;

                triggers.push( {
                    handlerId: `${ definition.flowName }/Handlers/${ elementId }`,
                    sourceEntity: elementId,
                    handlerKind: VirtualFlowGenerator.inferHandlerKind( elementId ),
                    navigation: targetState
                        ? {
                            targetState,
                            executionStep: stateConfig?.executionStep
                        }
                        : undefined,
                    mutations: transition?.mutations
                } );
            }
        }

        return triggers.length > 0 ? triggers : undefined;
    }

    private static inferHandlerKind(
        elementId: string
    ): "button" | "modal" | "string-select" | "user-select" | "command" | "unknown" {
        const lowerElementId = elementId.toLowerCase();

        if ( lowerElementId.includes( "button" ) ) {
            return "button";
        }
        if ( lowerElementId.includes( "modal" ) ) {
            return "modal";
        }
        // Check for user select menus first (more specific patterns)
        if ( lowerElementId.includes( "usermenu" ) || lowerElementId.includes( "user-menu" ) || lowerElementId.includes( "userselect" ) ) {
            return "user-select";
        }
        // Check for string select menus (including patterns like "GrantMenu", "DenyMenu", etc.)
        if ( lowerElementId.includes( "selectmenu" ) || lowerElementId.includes( "select-menu" ) || lowerElementId.endsWith( "menu" ) ) {
            return "string-select";
        }
        if ( lowerElementId.includes( "command" ) ) {
            return "command";
        }

        return "unknown";
    }
}

/**
 * Generate virtual flows from multiple TransactionBuilder instances.
 */
export function generateVirtualFlows(
    transactionBuilders: TransactionBuilder[],
    options: VirtualFlowGeneratorOptions = {}
): FlowDefinition[] {
    return transactionBuilders.map( ( tx ) => VirtualFlowGenerator.generate( tx, options ) );
}
