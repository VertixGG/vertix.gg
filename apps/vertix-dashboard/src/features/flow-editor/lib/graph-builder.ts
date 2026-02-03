import { createModuleNode, createFlowNode, createComponentNode, createModalNode } from "@vertix.gg/dashboard/src/features/flow-editor/lib/node-builders";
import {
    createModuleToFlowEdge,
    createFlowToComponentEdge,
    createComponentToModalEdge,
    createComponentToFlowEdge,
    createComponentToComponentEdge,
    createComponentToStateFallbackEdge,
    createModalToComponentEdge,
    createStepTransitionEdge,
    createSystemFlowTransitionEdge
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/edge-builders";
import {
    findButtonFlowConnections,
    findButtonModalConnections,
    inferButtonModalConnections,
    getFlowStateComponents,
    getInitialComponent
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/flow-helpers";
import {
    extractComponentPreview,
    getButtonHandlePosition,
    sortModalsByButtonOrder
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/component-helpers";

import { WIZARD_BUTTON_NAMES } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";

import type { FlowStateComponent } from "@vertix.gg/dashboard/src/features/flow-editor/lib/flow-helpers";
import type { ElementData, ComponentPreview } from "@vertix.gg/dashboard/src/features/flow-editor/lib/component-helpers";
import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { UIExportedFlow, UIExportedComponent, UIExportEmbedDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";
import type { Node, Edge } from "@xyflow/react";
import type { ButtonModalTrigger, ButtonFlowTrigger, StateTransitionTrigger } from "@vertix.gg/dashboard/src/features/flow-editor/lib/node-builders";

type SelectMenuTriggeredTransition = UIExportedFlow[ "transitions" ][ number ] & {
    triggeredBy: NonNullable<UIExportedFlow[ "transitions" ][ number ][ "triggeredBy" ]>;
};

type FlowEdgeMappingTrigger = {
    handlerId: string;
    sourceEntity: string;
    handlerKind: "button" | "string-select" | "user-select" | "modal" | "modal-button" | "command" | "unknown";
    navigation?: {
        targetState?: string;
        executionStep?: string;
    };
};

function inferHandlerKindFromElement( element: ElementData | undefined, elementName: string ): FlowEdgeMappingTrigger[ "handlerKind" ] {
    const elementType = element?.definition?.elementType;

    if ( elementType ) {
        if ( elementType === "user-select" ) {
            return "user-select";
        }
        if ( elementType.includes( "select" ) ) {
            return "string-select";
        }
        if ( elementType === "modal" ) {
            return "modal";
        }
        if ( elementType === "modal-button" ) {
            return "modal-button";
        }
        return "button";
    }

    const lower = elementName.toLowerCase();
    if ( lower.includes( "select" ) ) {
        return "string-select";
    }

    return "button";
}

function hasEdgeSourceMappingTransitions( flow: UIExportedFlow, stateKeys: Set<string> ): boolean {
    if ( !flow.edgeSourceMappings?.length ) {
        return false;
    }

    const transitionByName = new Map( flow.transitions.map( transition => [ transition.from, transition ] ) );

    return flow.edgeSourceMappings.some( mapping => {
        if ( mapping.targetFlowName !== flow.name ) {
            return false;
        }

        const transition = transitionByName.get( mapping.transitionName );
        if ( !transition ) {
            return false;
        }

        return stateKeys.has( transition.to );
    } );
}

function getEdgeSourceMappingTransitions(
    flow: UIExportedFlow,
    stateKeys: Set<string>,
    elementRows: ElementData[][]
): SelectMenuTriggeredTransition[] {
    if ( !flow.edgeSourceMappings?.length ) {
        return [];
    }

    const transitionByName = new Map( flow.transitions.map( transition => [ transition.from, transition ] ) );
    const elementByName = new Map( elementRows.flat().map( element => [ element.name, element ] ) );

    return flow.edgeSourceMappings.flatMap( mapping => {
        if ( mapping.targetFlowName !== flow.name ) {
            return [];
        }

        const transition = transitionByName.get( mapping.transitionName );
        if ( !transition || !stateKeys.has( transition.to ) ) {
            return [];
        }

        const element = elementByName.get( mapping.triggeringElementId );
        const handlerKind = inferHandlerKindFromElement( element, mapping.triggeringElementId );

        const trigger: FlowEdgeMappingTrigger = {
            handlerId: `flow-edge-${ flow.name }-${ mapping.transitionName }`,
            sourceEntity: mapping.triggeringElementId,
            handlerKind,
            navigation: {
                targetState: transition.to
            }
        };

        return [
            {
                ...transition,
                triggeredBy: [ trigger ]
            }
        ];
    } );
}

function findStateTransitionHandle(
    flow: UIExportedFlow,
    prevStateOptions: Record<string, unknown> | undefined,
    prevStateTransitions: string[] | undefined,
    _toStateKey: string
): string | null {
    if ( !prevStateTransitions?.length ) {
        return null;
    }

    const handles = prevStateOptions?.transitionHandles;

    if ( typeof handles === "object" && handles !== null ) {
        for ( const name of prevStateTransitions ) {
            const handle = ( handles as Record<string, string> )[ name ];
            if ( handle ) {
                return `btn-${ handle }`;
            }
        }
    }

    const mappingHandle = flow.edgeSourceMappings?.find( ( mapping ) => {
        return prevStateTransitions.includes( mapping.transitionName ) && mapping.targetFlowName === flow.name;
    } );

    if ( mappingHandle ) {
        return `btn-${ mappingHandle.triggeringElementId }`;
    }

    return null;
}

export function buildFlowGraph( moduleFlowsData: ModuleFlowsResponse ): { nodes: Node[]; edges: Edge[] } {
    // Build a unified graph for the dashboard viewer:
    // - Module node
    // - System flow nodes (+ their initial components)
    // - UI flow nodes (+ state components)
    // - Edges between nodes (module→flow, flow→component, component→modal, etc.)
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];
    const edgeIds = new Set<string>();

    const addEdge = ( edge: Edge ) => {
        if ( edgeIds.has( edge.id ) ) {
            return;
        }
        // Skip self-edges (edge from node to itself)
        if ( edge.source === edge.target ) {
            return;
        }
        edgeIds.add( edge.id );
        allEdges.push( edge );
    };
    const flowIdMap = new Map<string, string>();
    const systemFlowCompIds = new Map<string, string>();

    const moduleNode = createModuleNode( moduleFlowsData.module, moduleFlowsData.module );
    allNodes.push( moduleNode );
    const moduleNodeId = moduleNode.id;

    moduleFlowsData.systemFlows.forEach( ( flow ) => {
        const flowNode = createFlowNode( flow, true );
        const flowId = flowNode.id;
        flowIdMap.set( flow.name, flowId );
        allNodes.push( flowNode );
        addEdge( createModuleToFlowEdge( moduleNodeId, flowId, flow.name ) );
    } );

    moduleFlowsData.flows.forEach( ( flow ) => {
        const flowNode = createFlowNode( flow, false );
        const flowId = flowNode.id;
        flowIdMap.set( flow.name, flowId );
        allNodes.push( flowNode );
    } );

    moduleFlowsData.systemFlows.forEach( ( flow ) => {
        const flowId = flowIdMap.get( flow.name )!;
        const initialComp = getInitialComponent( flow, moduleFlowsData.components );

        if ( initialComp ) {
            const compPreview = extractComponentPreview( initialComp );
            const compId = `comp-sys-${ flow.name }-${ initialComp.name }`;
            systemFlowCompIds.set( flow.name, compId );

            const buttonModalConnections = findButtonModalConnections( flow, compPreview.modals );
            const buttonFlowConnections = findButtonFlowConnections( flow );

            const { buttonModalTriggers, buttonFlowTriggers } = buildButtonTriggers(
                buttonModalConnections,
                buttonFlowConnections,
                compPreview.elementRows
            );

            allNodes.push( createComponentNode( compId, compPreview, buttonModalTriggers, buttonFlowTriggers, [], undefined, undefined, flow.name ) );
            addEdge( createFlowToComponentEdge( flowId, compId, flow.name, initialComp.name ) );

            addButtonFlowEdges( addEdge, compId, buttonFlowTriggers, flowIdMap, flow.name );
            addModalNodesAndEdges( addEdge, allNodes, compId, compPreview, buttonModalConnections, undefined, flow.name );
        }
    } );

    moduleFlowsData.flows.forEach( ( flow ) => {
        const flowId = flowIdMap.get( flow.name )!;
        const stateComponents = getFlowStateComponents( flow, moduleFlowsData.components );

        if ( stateComponents.length > 1 ) {
            buildMultiStateFlow( allNodes, addEdge, flow, flowId, stateComponents, moduleFlowsData.components, flowIdMap );
            return;
        }

        const initialComp = getInitialComponent( flow, moduleFlowsData.components );
        const stateKey = stateComponents[ 0 ]?.stateKey;
        const stateTransitions = stateComponents[ 0 ]?.transitions;
        const stateOptions = stateComponents[ 0 ]?.options;
        const previewEmbedsGroup = getStatePreviewEmbedsGroup( stateOptions );

        if ( initialComp ) {
            buildSingleComponentFlow(
                allNodes,
                addEdge,
                flow,
                flowId,
                initialComp,
                stateKey,
                stateTransitions,
                previewEmbedsGroup,
                stateOptions,
                moduleFlowsData.components,
                flowIdMap
            );
        }
    } );

    moduleFlowsData.systemFlows.forEach( ( systemFlow ) => {
        const systemFlowId = flowIdMap.get( systemFlow.name );
        if ( !systemFlowId ) {
            return;
        }

        if ( systemFlow.edgeSourceMappings?.length ) {
            return;
        }

        const isCommandsFlow = systemFlow.name.includes( "CommandsFlow" );

        systemFlow.transitions?.forEach( ( transition ) => {
            const targetFlowName = transition.to?.split( "/States/" )[ 0 ];
            if ( !targetFlowName ) {
                return;
            }
            const targetId = flowIdMap.get( targetFlowName );
            if ( !targetId ) {
                return;
            }
            const label = transition.from?.split( "/" ).pop() ?? transition.from ?? "";
            addEdge( createSystemFlowTransitionEdge( systemFlowId, targetId, systemFlow.name, targetFlowName, label, isCommandsFlow ) );
        } );
    } );

    return { nodes: allNodes, edges: allEdges };
}

function isSelectMenuTriggeredTransition(
    transition: UIExportedFlow[ "transitions" ][ number ]
): transition is SelectMenuTriggeredTransition {
    return ( transition.triggeredBy ?? [] ).some( trigger => [ "string-select", "button", "user-select" ].includes( trigger.handlerKind ) );
}

function detectFanOutFromInitialState(
    flow: UIExportedFlow,
    stateKeys: Set<string>,
    initialStateKey: string
): { isFanOut: boolean; targetStateKeys: string[] } {
    // Detect fan-out pattern: all transitions originate from the initial state
    // and go to different target states (no UI triggers, programmatic transitions)
    if ( !flow.transitions?.length || !initialStateKey ) {
        return { isFanOut: false, targetStateKeys: [] };
    }

    const transitionsFromInitial = flow.transitions.filter( transition => {
        // The 'from' field is the source state key for programmatic transitions
        const isFromInitial = transition.from === initialStateKey;

        // Only include transitions to known states within this flow (excluding self-transitions)
        const isToKnownState = stateKeys.has( transition.to ) && transition.to !== initialStateKey;

        // Exclude transitions with UI triggers (those are handled separately)
        const hasNoUITrigger = !transition.triggeredBy?.length;

        return isFromInitial && isToKnownState && hasNoUITrigger;
    } );

    // It's a fan-out if we have multiple transitions from initial state
    const targetStateKeys = transitionsFromInitial.map( t => t.to );
    const isFanOut = targetStateKeys.length > 1;

    return { isFanOut, targetStateKeys };
}

function detectModalFirstFlow(
    flow: UIExportedFlow,
    initialStateOptions: Record<string, unknown> | undefined
): { isModalFirst: boolean; modalName: string | null } {
    // Detect "modal-first" pattern:
    // 1. Initial state has executionStep: "default" (shows modal immediately)
    // 2. At least one transition is triggered by a modal
    const executionStep = initialStateOptions?.[ "executionStep" ];
    const isDefaultStep = executionStep === "default";

    if ( !isDefaultStep ) {
        return { isModalFirst: false, modalName: null };
    }

    // Find modal trigger in transitions
    const modalTrigger = flow.transitions.find( transition =>
        transition.triggeredBy?.some( t => t.handlerKind === "modal" )
    )?.triggeredBy?.find( t => t.handlerKind === "modal" );

    if ( !modalTrigger ) {
        return { isModalFirst: false, modalName: null };
    }

    return { isModalFirst: true, modalName: modalTrigger.sourceEntity };
}

function findWizardButtonInElements(
    elementRows: ElementData[][],
    wizardButtonName: string
): string | null {
    for ( const row of elementRows ) {
        for ( const element of row ) {
            if ( element.name === wizardButtonName ) {
                return element.name;
            }
        }
    }

    return null;
}

type WizardTransition = {
    buttonName: string;
    targetStateKey: string;
    targetStateName: string;
    isBackTransition: boolean;
    isFinishTransition: boolean;
};

function getWizardTransitionsForState(
    flow: UIExportedFlow,
    currentStateKey: string,
    stateKeyToIndex: Map<string, number>,
    initialStateKey: string,
    elementRows: ElementData[][]
): WizardTransition[] {
    const { BACK, NEXT, FINISH } = WIZARD_BUTTON_NAMES;

    const hasBackButton = findWizardButtonInElements( elementRows, BACK ) !== null;
    const hasNextButton = findWizardButtonInElements( elementRows, NEXT ) !== null;
    const hasFinishButton = findWizardButtonInElements( elementRows, FINISH ) !== null;

    if ( !hasBackButton && !hasNextButton && !hasFinishButton ) {
        return [];
    }

    const currentIndex = stateKeyToIndex.get( currentStateKey );
    if ( currentIndex === undefined ) {
        return [];
    }

    const wizardTransitions: WizardTransition[] = [];

    const transitionsFromCurrentState = flow.transitions.filter( t =>
        t.from === currentStateKey && !t.triggeredBy?.length
    );

    for ( const transition of transitionsFromCurrentState ) {
        const targetIndex = stateKeyToIndex.get( transition.to );
        if ( targetIndex === undefined ) {
            continue;
        }

        const targetStateName = transition.to.split( "/" ).pop() ?? transition.to;
        let buttonName: string | null = null;

        if ( targetIndex === currentIndex + 1 && hasNextButton ) {
            buttonName = NEXT;
        } else if ( targetIndex === currentIndex - 1 && hasBackButton ) {
            buttonName = BACK;
        } else if ( transition.to === initialStateKey && hasFinishButton ) {
            buttonName = FINISH;
        } else if ( transition.to === initialStateKey && hasBackButton && currentIndex === 1 ) {
            buttonName = BACK;
        }

        if ( buttonName ) {
            const isBackwardNavigation = buttonName === BACK || buttonName === FINISH;

            wizardTransitions.push( {
                buttonName,
                targetStateKey: transition.to,
                targetStateName,
                isBackTransition: isBackwardNavigation,
                isFinishTransition: buttonName === FINISH
            } );
        }
    }

    return wizardTransitions;
}

function getSelectMenuTriggeredTransitionsToKnownStates(
    flow: UIExportedFlow,
    stateKeys: Set<string>
): SelectMenuTriggeredTransition[] {
    return flow.transitions.filter( transition => {
        if ( !stateKeys.has( transition.to ) ) {
            return false;
        }

        return isSelectMenuTriggeredTransition( transition );
    } );
}

function getStatePreviewDefaultVars(
    options: FlowStateComponent[ "options" ],
    embedDefinition?: UIExportEmbedDefinition
): Record<string, string> {
    if ( !options ) {
        return {};
    }

    const preview = options[ "previewDefaultVars" ];
    const previewVars = options[ "previewVars" ];

    if ( ( !preview || typeof preview !== "object" || Array.isArray( preview ) ) && !previewVars ) {
        return {};
    }

    const previewRecord = preview && typeof preview === "object" && !Array.isArray( preview )
        ? preview as Record<string, unknown>
        : {};
    const entries = Object.entries( previewRecord ).filter( ( entry ): entry is [ string, string ] => typeof entry[ 1 ] === "string" );
    const explicitDefaults = Object.fromEntries( entries );

    const derivedDefaults = derivePreviewVarsFromEmbedDefinition( previewVars, embedDefinition );

    return {
        ...derivedDefaults,
        ...explicitDefaults
    };
}

function getStatePreviewEmbedsGroup( options: FlowStateComponent[ "options" ] ): string | undefined {
    if ( !options ) {
        return undefined;
    }

    const previewEmbedsGroup = options[ "previewEmbedsGroup" ];

    if ( typeof previewEmbedsGroup !== "string" ) {
        return undefined;
    }

    const trimmed = previewEmbedsGroup.trim();
    return trimmed.length ? trimmed : undefined;
}

function derivePreviewVarsFromEmbedDefinition(
    previewVars: unknown,
    embedDefinition?: UIExportEmbedDefinition
): Record<string, string> {
    if ( !embedDefinition || !Array.isArray( previewVars ) ) {
        return {};
    }

    const defaults = embedDefinition.defaultVars ?? {};
    const options = embedDefinition.options ?? {};
    const vars = embedDefinition.vars ?? {};
    const result: Record<string, string> = {};

    previewVars.forEach( ( key ) => {
        if ( typeof key !== "string" || !key.length ) {
            return;
        }

        const directDefault = defaults[ key ];
        if ( typeof directDefault === "string" ) {
            result[ key ] = directDefault;
            return;
        }

        const optionValue = pickDefaultOptionValue( options[ key ] );
        if ( optionValue ) {
            result[ key ] = optionValue;
            return;
        }

        const varToken = vars[ key ];
        if ( typeof varToken === "string" ) {
            result[ key ] = varToken;
        }
    } );

    return result;
}

function pickDefaultOptionValue( option: UIExportEmbedDefinition[ "options" ][ string ] | undefined ): string | undefined {
    if ( !option || typeof option !== "object" || Array.isArray( option ) ) {
        return undefined;
    }

    const entries = Object.entries( option )
        .filter( ( entry ): entry is [ string, string ] => typeof entry[ 1 ] === "string" );

    if ( entries.length === 0 ) {
        return undefined;
    }

    const defaultEntry = entries.find( ( [ key ] ) => key.toLowerCase().includes( "default" ) );
    if ( defaultEntry ) {
        return defaultEntry[ 1 ];
    }

    const tokenPattern = /\{[a-zA-Z0-9_]+\}/;
    const literalEntry = entries.find( ( [ , value ] ) => !tokenPattern.test( value ) );
    if ( literalEntry ) {
        return literalEntry[ 1 ];
    }

    return entries[ 0 ][ 1 ];
}

function buildButtonTriggers(
    buttonModalConnections: Array<{ buttonName: string; modalName: string }>,
    buttonFlowConnections: Array<{ buttonName: string; targetFlowName: string }>,
    elementRows: ElementData[][]
): { buttonModalTriggers: ButtonModalTrigger[]; buttonFlowTriggers: ButtonFlowTrigger[] } {
    const totalRows = elementRows.length;

    const buttonModalTriggers: ButtonModalTrigger[] = buttonModalConnections.map( ( c ) => ( {
        buttonName: c.buttonName,
        modalName: c.modalName,
        handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
    } ) );

    const buttonFlowTriggers: ButtonFlowTrigger[] = buttonFlowConnections.map( ( c ) => ( {
        buttonName: c.buttonName,
        targetFlowName: c.targetFlowName,
        handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
    } ) );

    return { buttonModalTriggers, buttonFlowTriggers };
}

function addButtonFlowEdges(
    addEdge: ( edge: Edge ) => void,
    compId: string,
    buttonFlowTriggers: ButtonFlowTrigger[],
    flowIdMap: Map<string, string>,
    currentFlowName: string
): void {
    buttonFlowTriggers.forEach( ( trigger ) => {
        if ( trigger.targetFlowName === currentFlowName ) {
            return;
        }

        const targetFlowId = flowIdMap.get( trigger.targetFlowName );
        if ( !targetFlowId ) {
            return;
        }

        addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName ) );
    } );
}

function addModalNodesAndEdges(
    addEdge: ( edge: Edge ) => void,
    allNodes: Node[],
    compId: string,
    compPreview: ComponentPreview,
    buttonModalConnections: Array<{ buttonName: string; modalName: string }>,
    stateTransitions: string[] | undefined,
    flowName?: string
): void {
    const hasExplicitTransitions = !!stateTransitions?.length;
    const modalNames = buttonModalConnections.length > 0
        ? buttonModalConnections.map( c => c.modalName )
        : hasExplicitTransitions
            ? []
            : compPreview.modals;

    if ( modalNames.length === 0 ) {
        return;
    }

    const sortedModals = sortModalsByButtonOrder( modalNames, buttonModalConnections, compPreview.elementRows );

    sortedModals.forEach( ( modal, modalIndex ) => {
        const modalId = `modal-${ compId }-${ modalIndex }`;
        const modalDef = compPreview.modalDefinitions.find( m => m.name === modal );

        allNodes.push( createModalNode( modalId, modal, modalDef, flowName ) );

        const connection = buttonModalConnections.find( c => c.modalName === modal );
        const sourceHandle = connection ? `btn-${ connection.buttonName }` : "bottom";

        addEdge( createComponentToModalEdge( compId, modalId, sourceHandle ) );
    } );
}

function buildMultiStateFlow(
    allNodes: Node[],
    addEdge: ( edge: Edge ) => void,
    flow: UIExportedFlow,
    flowId: string,
    stateComponents: FlowStateComponent[],
    _allComponents: UIExportedComponent[],
    flowIdMap: Map<string, string>
): void {
    // Multi-state flows are rendered as multiple component nodes (one per state).
    //
    // Edge drawing strategies (in priority order):
    // 1. Modal-first: when flow starts with a modal, connect flow→modal→components
    // 2. Select menu edges: when state changes are driven by a select menu
    // 3. Fan-out edges: when all transitions originate from initial state (programmatic branching)
    // 4. Step edges (fallback): draw "Step X" edges between state components in order
    const stateKeys = new Set( stateComponents.map( stateComponent => stateComponent.stateKey ) );

    const stateKeyToIndex = new Map<string, number>();
    stateComponents.forEach( ( stateComponent, index ) => {
        stateKeyToIndex.set( stateComponent.stateKey, index );
    } );

    // Detect modal-first pattern
    const initialStateOptions = stateComponents[ 0 ]?.options as Record<string, unknown> | undefined;
    const modalFirstInfo = detectModalFirstFlow( flow, initialStateOptions );

    const selectMenuTransitions = getSelectMenuTriggeredTransitionsToKnownStates( flow, stateKeys );
    const shouldUseSelectMenuStateEdges = selectMenuTransitions.length > 0 || hasEdgeSourceMappingTransitions( flow, stateKeys );

    // Detect fan-out pattern: all transitions from initial state to different targets
    const initialStateKey = stateComponents[ 0 ]?.stateKey;
    const fanOutInfo = initialStateKey
        ? detectFanOutFromInitialState( flow, stateKeys, initialStateKey )
        : { isFanOut: false, targetStateKeys: [] };
    const shouldUseFanOutEdges = !shouldUseSelectMenuStateEdges && !modalFirstInfo.isModalFirst && fanOutInfo.isFanOut;

    const stateKeyToCompId = new Map<string, string>();
    const stateKeyToElementRows = new Map<string, ElementData[][]>();
    let prevCompId: string | null = null;
    let initialCompId: string | undefined;
    let initialElementRows: ElementData[][] | undefined;
    const initialStateTransitionTriggers: StateTransitionTrigger[] = [];

    // For modal-first flows, create modal node connected to flow
    let modalFirstNodeId: string | undefined;
    if ( modalFirstInfo.isModalFirst && modalFirstInfo.modalName ) {
        const modalId = `modal-${ flow.name }-entry`;
        const initialComp = stateComponents[ 0 ]?.component;
        const modalDef = initialComp?.modals?.find( m => m.name === modalFirstInfo.modalName );

        allNodes.push( createModalNode( modalId, modalFirstInfo.modalName, modalDef, flow.name ) );
        addEdge( createFlowToComponentEdge( flowId, modalId, flow.name, modalFirstInfo.modalName ) );
        modalFirstNodeId = modalId;
    }

    stateComponents.forEach( ( stateComp, stepIndex ) => {
        // For modal-first flows, skip the initial state (it just shows the modal)
        if ( modalFirstInfo.isModalFirst && stepIndex === 0 ) {
            return;
        }

        const executionStep = typeof stateComp.options?.[ "executionStep" ] === "string"
            ? stateComp.options[ "executionStep" ]
            : undefined;

        const previewEmbedsGroup = getStatePreviewEmbedsGroup( stateComp.options );
        const compPreview = extractComponentPreview( stateComp.component, executionStep, previewEmbedsGroup );
        const statePreviewDefaultVars = getStatePreviewDefaultVars( stateComp.options, compPreview.embedDefinition );
        const resolvedEmbed = compPreview.embed
            ? {
                ...compPreview.embed,
                defaultVars: {
                    ...( compPreview.embed.defaultVars ?? {} ),
                    ...statePreviewDefaultVars
                }
            }
            : undefined;
        const compPreviewWithStateDefaults: ComponentPreview = {
            ...compPreview,
            embed: resolvedEmbed
        };
        const compId = `comp-${ flow.name }-${ stateComp.component.name }-${ stepIndex }`;
        stateKeyToCompId.set( stateComp.stateKey, compId );
        stateKeyToElementRows.set( stateComp.stateKey, compPreviewWithStateDefaults.elementRows );

        const componentButtons = compPreviewWithStateDefaults.elementRows.flat().map( el => el.name );
        let buttonModalConnections = findButtonModalConnections( flow, compPreviewWithStateDefaults.modals, stateComp.transitions );

        if ( buttonModalConnections.length === 0 && compPreviewWithStateDefaults.modals.length > 0 && !stateComp.transitions?.length ) {
            buttonModalConnections = inferButtonModalConnections( componentButtons, compPreviewWithStateDefaults.modals );
        }

        const buttonFlowConnections = findButtonFlowConnections( flow );

        const { buttonModalTriggers, buttonFlowTriggers } = buildButtonTriggers(
            buttonModalConnections,
            buttonFlowConnections,
            compPreviewWithStateDefaults.elementRows
        );

        const wizardTransitionsForNode = getWizardTransitionsForState(
            flow,
            stateComp.stateKey,
            stateKeyToIndex,
            initialStateKey ?? "",
            compPreviewWithStateDefaults.elementRows
        );

        const wizardStateTransitionTriggers: StateTransitionTrigger[] = wizardTransitionsForNode.map( wt => ( {
            elementName: wt.buttonName,
            handlePosition: getButtonHandlePosition( wt.buttonName, compPreviewWithStateDefaults.elementRows, compPreviewWithStateDefaults.elementRows.length )
        } ) );

        const stateTransitionTriggersForNode = stepIndex === 0
            ? initialStateTransitionTriggers
            : wizardStateTransitionTriggers;

        allNodes.push(
            createComponentNode(
                compId,
                compPreviewWithStateDefaults,
                buttonModalTriggers,
                buttonFlowTriggers,
                stateTransitionTriggersForNode,
                `${ stateComp.stateName } - ${ compPreview.name }`,
                stateComp.stateKey,
                flow.name
            )
        );

        if ( modalFirstInfo.isModalFirst && modalFirstNodeId ) {
            // For modal-first flows, connect modal to result components
            const label = stateComp.stateName;
            addEdge( createModalToComponentEdge( modalFirstNodeId, compId, flow.name, label ) );
        } else if ( stepIndex === 0 ) {
            addEdge( createFlowToComponentEdge( flowId, compId, flow.name, stateComp.component.name ) );
            initialCompId = compId;
            initialElementRows = compPreviewWithStateDefaults.elementRows;
        } else if ( !shouldUseSelectMenuStateEdges && !shouldUseFanOutEdges && prevCompId ) {
            // Linear step edges (fallback when no special edge strategy applies)
            const sourceHandle = findStateTransitionHandle(
                flow,
                stateComponents[ stepIndex - 1 ].options as Record<string, unknown> | undefined,
                stateComponents[ stepIndex - 1 ].transitions,
                stateComp.stateKey
            ) ?? "bottom";

            addEdge( createStepTransitionEdge( prevCompId, compId, flow.name, stepIndex, sourceHandle ) );
        }

        prevCompId = compId;

        // Skip adding modals for modal-first flows (modal already created at flow level)
        if ( !modalFirstInfo.isModalFirst ) {
            addModalNodesAndEdges( addEdge, allNodes, compId, compPreviewWithStateDefaults, buttonModalConnections, stateComp.transitions, flow.name );
        }
        addButtonFlowEdges( addEdge, compId, buttonFlowTriggers, flowIdMap, flow.name );
    } );

    if ( shouldUseSelectMenuStateEdges && initialCompId && initialElementRows ) {
        const sourceCompId = initialCompId;
        const sourceElementRows = initialElementRows;

        const elementNames = new Set( sourceElementRows.flat().map( element => element.name ) );
        const totalRows = sourceElementRows.length;

        const transitionsToRender = selectMenuTransitions.length > 0
            ? selectMenuTransitions
            : getEdgeSourceMappingTransitions( flow, stateKeys, sourceElementRows );

        const uniqueTriggerElements = new Set<string>();
        const connectedTargetStates = new Set<string>();

        transitionsToRender.forEach( transition => {
            const trigger = ( transition.triggeredBy ?? [] ).find( t => [ "string-select", "button", "user-select" ].includes( t.handlerKind ) );
            if ( !trigger ) {
                return;
            }

            const targetCompId = stateKeyToCompId.get( transition.to );
            if ( !targetCompId ) {
                return;
            }

            const label = transition.to.split( "/" ).pop() ?? transition.to;
            connectedTargetStates.add( transition.to );

            if ( elementNames.has( trigger.sourceEntity ) ) {
                uniqueTriggerElements.add( trigger.sourceEntity );
                addEdge( createComponentToComponentEdge( sourceCompId, targetCompId, flow.name, trigger.sourceEntity, label ) );
                return;
            }

            addEdge( createComponentToStateFallbackEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );

        uniqueTriggerElements.forEach( elementName => {
            initialStateTransitionTriggers.push( {
                elementName,
                handlePosition: getButtonHandlePosition( elementName, sourceElementRows, totalRows )
            } );
        } );

        const wizardConnectedFromOtherStates = new Set<string>();

        stateComponents.forEach( stateComp => {
            const elemRows = stateKeyToElementRows.get( stateComp.stateKey );
            if ( !elemRows ) {
                return;
            }

            const wizardTrans = getWizardTransitionsForState(
                flow,
                stateComp.stateKey,
                stateKeyToIndex,
                initialStateKey ?? "",
                elemRows
            );

            wizardTrans.forEach( wt => {
                wizardConnectedFromOtherStates.add( wt.targetStateKey );
            } );
        } );

        stateComponents.slice( 1 ).forEach( ( stateComponent ) => {
            if ( connectedTargetStates.has( stateComponent.stateKey ) ) {
                return;
            }

            if ( wizardConnectedFromOtherStates.has( stateComponent.stateKey ) ) {
                return;
            }

            const targetCompId = stateKeyToCompId.get( stateComponent.stateKey );
            if ( !targetCompId ) {
                return;
            }

            const label = stateComponent.stateName;
            addEdge( createComponentToStateFallbackEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );
    }

    // Fan-out edges: programmatic transitions from initial state to multiple targets
    if ( shouldUseFanOutEdges && initialCompId ) {
        const fanOutSourceCompId = initialCompId;
        const wizardConnectedInFanOut = new Set<string>();

        stateComponents.forEach( stateComp => {
            const elemRows = stateKeyToElementRows.get( stateComp.stateKey );
            if ( !elemRows ) {
                return;
            }

            const wizardTrans = getWizardTransitionsForState(
                flow,
                stateComp.stateKey,
                stateKeyToIndex,
                initialStateKey ?? "",
                elemRows
            );

            wizardTrans.forEach( wt => {
                wizardConnectedInFanOut.add( wt.targetStateKey );
            } );
        } );

        stateComponents.slice( 1 ).forEach( ( stateComponent ) => {
            if ( wizardConnectedInFanOut.has( stateComponent.stateKey ) ) {
                return;
            }

            const targetCompId = stateKeyToCompId.get( stateComponent.stateKey );
            if ( !targetCompId ) {
                return;
            }

            const label = stateComponent.stateName;
            addEdge( createComponentToStateFallbackEdge( fanOutSourceCompId, targetCompId, flow.name, label ) );
        } );
    }

    stateComponents.forEach( ( stateComponent ) => {
        const sourceCompId = stateKeyToCompId.get( stateComponent.stateKey );
        const elementRows = stateKeyToElementRows.get( stateComponent.stateKey );

        if ( !sourceCompId || !elementRows ) {
            return;
        }

        const wizardTransitions = getWizardTransitionsForState(
            flow,
            stateComponent.stateKey,
            stateKeyToIndex,
            initialStateKey ?? "",
            elementRows
        );

        wizardTransitions.forEach( wizardTransition => {
            const targetCompId = stateKeyToCompId.get( wizardTransition.targetStateKey );
            if ( !targetCompId ) {
                return;
            }

            let targetHandle: string | undefined;

            if ( wizardTransition.isFinishTransition ) {
                targetHandle = "right";
            } else if ( wizardTransition.isBackTransition ) {
                targetHandle = "left";
            }

            addEdge( createComponentToComponentEdge(
                sourceCompId,
                targetCompId,
                flow.name,
                wizardTransition.buttonName,
                wizardTransition.targetStateName,
                targetHandle,
                wizardTransition.isBackTransition
            ) );
        } );
    } );
}

function buildSingleComponentFlow(
    allNodes: Node[],
    addEdge: ( edge: Edge ) => void,
    flow: UIExportedFlow,
    flowId: string,
    initialComp: UIExportedComponent,
    stateKey: string | undefined,
    stateTransitions: string[] | undefined,
    previewEmbedsGroup: string | undefined,
    stateOptions: FlowStateComponent[ "options" ] | undefined,
    _allComponents: UIExportedComponent[],
    flowIdMap: Map<string, string>
): void {
    const compPreview = extractComponentPreview( initialComp, undefined, previewEmbedsGroup );
    const statePreviewDefaultVars = getStatePreviewDefaultVars( stateOptions, compPreview.embedDefinition );
    const resolvedEmbed = compPreview.embed
        ? {
            ...compPreview.embed,
            defaultVars: {
                ...( compPreview.embed.defaultVars ?? {} ),
                ...statePreviewDefaultVars
            }
        }
        : undefined;
    const compPreviewWithStateDefaults: ComponentPreview = {
        ...compPreview,
        embed: resolvedEmbed
    };
    const compId = `comp-${ flow.name }-${ initialComp.name }`;

    const componentButtons = compPreviewWithStateDefaults.elementRows.flat().map( el => el.name );
    let buttonModalConnections = findButtonModalConnections( flow, compPreviewWithStateDefaults.modals, stateTransitions );

    if ( buttonModalConnections.length === 0 && compPreviewWithStateDefaults.modals.length > 0 && !stateTransitions?.length ) {
        buttonModalConnections = inferButtonModalConnections( componentButtons, compPreviewWithStateDefaults.modals );
    }

    const buttonFlowConnections = findButtonFlowConnections( flow );

    const { buttonModalTriggers, buttonFlowTriggers } = buildButtonTriggers(
        buttonModalConnections,
        buttonFlowConnections,
        compPreviewWithStateDefaults.elementRows
    );

    allNodes.push(
        createComponentNode(
            compId,
            compPreviewWithStateDefaults,
            buttonModalTriggers,
            buttonFlowTriggers,
            [],
            undefined,
            stateKey,
            flow.name
        )
    );
    addEdge( createFlowToComponentEdge( flowId, compId, flow.name, initialComp.name ) );

    addButtonFlowEdges( addEdge, compId, buttonFlowTriggers, flowIdMap, flow.name );
    addModalNodesAndEdges( addEdge, allNodes, compId, compPreviewWithStateDefaults, buttonModalConnections, stateTransitions, flow.name );
}
