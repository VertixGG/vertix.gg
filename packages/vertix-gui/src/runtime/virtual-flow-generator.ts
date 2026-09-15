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
            entryPoints: definition.entryPoints ?? [],
            handoffPoints: definition.handoffPoints ?? [],
            edgeSourceMappings: definition.edgeSourceMappings ?? [],
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
            if ( stateConfig.hidden ) {
                continue;
            }

            const outgoingTransitions: string[] = [];
            for ( const [ transitionName, transitionConfig ] of definition.transitions ) {
                const fromStates = Array.isArray( transitionConfig.from )
                    ? transitionConfig.from
                    : [ transitionConfig.from ];

                if ( fromStates.includes( stateKey ) ) {
                    outgoingTransitions.push( transitionName );
                }
            }

            let previewEmbedsGroup = stateConfig.previewEmbedsGroup;
            if ( !previewEmbedsGroup && stateConfig.embedsGroup ) {
                previewEmbedsGroup = stateConfig.embedsGroup;
            }
            if ( !previewEmbedsGroup && options.executionSteps && stateConfig.executionStep ) {
                const stepDef = options.executionSteps[ stateConfig.executionStep ];
                if ( stepDef && typeof stepDef === "object" && "embedsGroup" in stepDef ) {
                    previewEmbedsGroup = stepDef.embedsGroup as string;
                }
            }

            const previewElementsGroup = stateConfig.previewElementsGroup ?? stateConfig.elementsGroup;

            states.push( {
                key: stateKey,
                component: undefined,
                transitions: outgoingTransitions,
                hooks: [],
                options: {
                    executionStep: stateConfig.executionStep,
                    ...( options.componentName && { component: options.componentName } ),
                    ...( stateConfig.previewDefaultVars && { previewDefaultVars: stateConfig.previewDefaultVars } ),
                    ...( previewEmbedsGroup && { previewEmbedsGroup } ),
                    // The elements the state puts on screen, where it has any of its own. A state
                    // that carries them is somewhere you act from, not only something the bot said.
                    ...( previewElementsGroup && { previewElementsGroup } ),
                    // How the bot delivers this state - an ephemeral reply only the presser sees, or
                    // a message posted into the channel for everyone. A demonstration that always
                    // says "only you can see this" is wrong about half of them.
                    ...( stateConfig.navigationType && { navigationType: stateConfig.navigationType } )
                }
            } );
        }

        return states;
    }

    private static generateTransitions( definition: VirtualFlowDefinition ): FlowTransitionDefinition[] {
        const transitions: FlowTransitionDefinition[] = [];

        /** The transitions that made it into the picture, which is not all of them - see below. */
        const emittedTransitions = new Set<string>();

        const hiddenStates = new Set(
            [ ...definition.states.entries() ]
                .filter( ( [ , config ] ) => config.hidden )
                .map( ( [ key ] ) => key )
        );

        for ( const [ transitionName, transitionConfig ] of definition.transitions ) {
            const toState = transitionConfig.to as string;
            if ( hiddenStates.has( toState ) ) {
                continue;
            }

            const fromStates = ( Array.isArray( transitionConfig.from )
                ? transitionConfig.from
                : [ transitionConfig.from ] )
                .filter( state => !hiddenStates.has( state ) );

            if ( fromStates.length === 0 ) {
                continue;
            }

            emittedTransitions.add( transitionName );

            for ( const fromState of fromStates ) {
                transitions.push( {
                    name: transitionName,
                    from: fromState,
                    to: toState,
                    triggeredBy: VirtualFlowGenerator.generateTriggersForTransition(
                        definition,
                        transitionName
                    ),
                    // Declared on the transition, so a transition nothing triggers - one the handler
                    // fires itself once a service has answered - keeps them too.
                    mutations: transitionConfig.mutations?.map( ( mutation ) => ( {
                        type: mutation.type,
                        path: [ ...mutation.path ]
                    } ) ),
                    ...( transitionConfig.previewDeletesReply && { previewDeletesReply: true } ),
                    previewCondition: transitionConfig.previewCondition
                        ? { ...transitionConfig.previewCondition }
                        : undefined,
                    options: transitionConfig.requiredData?.length
                        ? { requiredData: transitionConfig.requiredData }
                        : undefined
                } );
            }
        }

        /*
         * The modal pairs that found no transition of their own, kept on the first state.
         *
         * Every pair that names a transition is now carried by it, which is the screen the button
         * is actually on. This is the remainder: a pair bound to a transition that was never
         * emitted, because the state it leads to is hidden from the picture.
         *
         * They were all put here once, whatever screen their button stood on - so a wizard's name
         * editor was drawn against the screen the wizard opens rather than the step that carries
         * it, and a templates panel's save box against the state that only routes into the panel.
         * Somewhere is better than nowhere for a pair with no transition left to sit on, but only
         * for those.
         */
        const unplacedPairs = ( definition.modalButtonBindings ?? [] ).filter( ( binding ) =>
            ! binding.transitionName || ! emittedTransitions.has( binding.transitionName )
        );

        if ( unplacedPairs.length ) {
            transitions.push( {
                from: definition.initialState,
                to: definition.initialState,
                triggeredBy: unplacedPairs.map( ( binding ) => ( {
                    handlerId: `${ definition.flowName }/Handlers/ModalButton/${ binding.buttonElement }`,
                    sourceEntity: `${ binding.buttonElement }::${ binding.modalName }`,
                    handlerKind: "modal-button" as const,
                    navigation: undefined,
                    mutations: undefined
                } ) ),
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
        const addedElements = new Set<string>();

        // First, add triggers from direct element bindings
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
                addedElements.add( elementId );
            }
        }

        /*
         * The modal a button opens, on the transition that button fires.
         *
         * A modal-button pair is one interaction told in two halves - press the button, submit the
         * modal - and the transition the pair is bound to is where both halves belong. The button
         * arrives above through its own binding; this is the other half, named as the pair so the
         * screen can say which button opens which modal.
         */
        for ( const binding of definition.modalButtonBindings ?? [] ) {
            if ( binding.transitionName !== transitionName ) {
                continue;
            }

            const pairEntity = `${ binding.buttonElement }::${ binding.modalName }`;

            if ( addedElements.has( pairEntity ) ) {
                continue;
            }

            triggers.push( {
                handlerId: `${ definition.flowName }/Handlers/ModalButton/${ binding.buttonElement }`,
                sourceEntity: pairEntity,
                handlerKind: "modal-button",
                navigation: undefined,
                mutations: undefined
            } );
            addedElements.add( pairEntity );
        }

        // An element the transition names itself, for one whose handling belongs to somebody else.
        const declared = definition.transitions.get( transitionName )?.triggeredByElement;

        if ( declared && !addedElements.has( declared ) ) {
            const transition = definition.transitions.get( transitionName );
            const targetState = transition?.to as string | undefined;
            const stateConfig = targetState ? definition.states.get( targetState ) : undefined;

            triggers.push( {
                handlerId: `${ definition.flowName }/Handlers/${ declared }`,
                sourceEntity: declared,
                handlerKind: VirtualFlowGenerator.inferHandlerKind( declared ),
                navigation: targetState
                    ? { targetState, executionStep: stateConfig?.executionStep }
                    : undefined,
                mutations: transition?.mutations
            } );
            addedElements.add( declared );
        }

        // Then, add triggers from edgeSourceMappings for this flow's internal transitions
        for ( const mapping of definition.edgeSourceMappings ) {
            // Only add if it targets this flow and matches the transition name
            if ( mapping.targetFlowName === definition.flowName && mapping.transitionName === transitionName ) {
                // Avoid duplicates if already added from element bindings
                if ( addedElements.has( mapping.triggeringElementId ) ) {
                    continue;
                }

                const transition = definition.transitions.get( transitionName );
                const targetState = transition?.to as string | undefined;
                const stateConfig = targetState ? definition.states.get( targetState ) : undefined;

                triggers.push( {
                    handlerId: `${ definition.flowName }/Handlers/${ mapping.triggeringElementId }`,
                    sourceEntity: mapping.triggeringElementId,
                    handlerKind: VirtualFlowGenerator.inferHandlerKind( mapping.triggeringElementId ),
                    navigation: targetState
                        ? {
                            targetState,
                            executionStep: stateConfig?.executionStep
                        }
                        : undefined,
                    mutations: transition?.mutations
                } );
                addedElements.add( mapping.triggeringElementId );
            }
        }

        return triggers.length > 0 ? triggers : undefined;
    }

    private static inferHandlerKind(
        elementId: string
    ): "button" | "modal" | "string-select" | "user-select" | "command" | "unknown" {
        const lowerElementId = elementId.toLowerCase();

        // Check for user select menus first (most specific patterns)
        if ( lowerElementId.includes( "usermenu" ) || lowerElementId.includes( "user-menu" ) || lowerElementId.includes( "userselect" ) ) {
            return "user-select";
        }
        // Check for string select menus BEFORE buttons (element names like "ChannelButtonsTemplateSelectMenu" contain both)
        if ( lowerElementId.includes( "selectmenu" ) || lowerElementId.includes( "select-menu" ) || lowerElementId.endsWith( "menu" ) ) {
            return "string-select";
        }
        if ( lowerElementId.includes( "modal" ) ) {
            return "modal";
        }
        if ( lowerElementId.includes( "button" ) ) {
            return "button";
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
