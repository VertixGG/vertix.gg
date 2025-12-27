import { createModuleNode, createFlowNode, createComponentNode, createModalNode } from "@vertix.gg/dashboard/src/lib/node-builders";
import {
    createModuleToFlowEdge,
    createFlowToComponentEdge,
    createComponentToModalEdge,
    createComponentToFlowEdge,
    createComponentToComponentEdge,
    createComponentToStateFallbackEdge,
    createStepTransitionEdge,
    createSystemFlowTransitionEdge
} from "@vertix.gg/dashboard/src/lib/edge-builders";
import {
    findButtonFlowConnections,
    findButtonModalConnections,
    inferButtonModalConnections,
    getFlowStateComponents,
    getInitialComponent
} from "@vertix.gg/dashboard/src/lib/flow-helpers";
import {
    extractComponentPreview,
    getButtonHandlePosition,
    sortModalsByButtonOrder

} from "@vertix.gg/dashboard/src/lib/component-helpers";

import type { FlowStateComponent } from "@vertix.gg/dashboard/src/lib/flow-helpers";
import type { ElementData, ComponentPreview } from "@vertix.gg/dashboard/src/lib/component-helpers";
import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { UIExportedFlow, UIExportedComponent, UIExportEmbedDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";
import type { Node, Edge } from "@xyflow/react";
import type { ButtonModalTrigger, ButtonFlowTrigger, StateTransitionTrigger } from "@vertix.gg/dashboard/src/lib/node-builders";

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
        allEdges.push( createModuleToFlowEdge( moduleNodeId, flowId, flow.name ) );
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

            allNodes.push( createComponentNode( compId, compPreview, buttonModalTriggers, buttonFlowTriggers, [] ) );
            allEdges.push( createFlowToComponentEdge( flowId, compId, flow.name, initialComp.name ) );

            addButtonFlowEdges( allEdges, compId, buttonFlowTriggers, flowIdMap, flow.name );
            addModalNodesAndEdges( allEdges, allNodes, compId, compPreview, buttonModalConnections, undefined );
        }
    } );

    moduleFlowsData.flows.forEach( ( flow ) => {
        const flowId = flowIdMap.get( flow.name )!;
        const stateComponents = getFlowStateComponents( flow, moduleFlowsData.components );

        if ( stateComponents.length > 1 ) {
            buildMultiStateFlow( allNodes, allEdges, flow, flowId, stateComponents, moduleFlowsData.components, flowIdMap );
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
                allEdges,
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
            allEdges.push( createSystemFlowTransitionEdge( systemFlowId, targetId, systemFlow.name, targetFlowName, label, isCommandsFlow ) );
        } );
    } );

    return { nodes: allNodes, edges: allEdges };
}

function isSelectMenuTriggeredTransition(
    transition: UIExportedFlow[ "transitions" ][ number ]
): transition is SelectMenuTriggeredTransition {
    return ( transition.triggeredBy ?? [] ).some( trigger => [ "string-select", "button", "user-select" ].includes( trigger.handlerKind ) );
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
    allEdges: Edge[],
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

        allEdges.push( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName ) );
    } );
}

function addModalNodesAndEdges(
    allEdges: Edge[],
    allNodes: Node[],
    compId: string,
    compPreview: ComponentPreview,
    buttonModalConnections: Array<{ buttonName: string; modalName: string }>,
    stateTransitions: string[] | undefined
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

        allNodes.push( createModalNode( modalId, modal, modalDef ) );

        const connection = buttonModalConnections.find( c => c.modalName === modal );
        const sourceHandle = connection ? `btn-${ connection.buttonName }` : "bottom";

        allEdges.push( createComponentToModalEdge( compId, modalId, sourceHandle ) );
    } );
}

function buildMultiStateFlow(
    allNodes: Node[],
    allEdges: Edge[],
    flow: UIExportedFlow,
    flowId: string,
    stateComponents: FlowStateComponent[],
    _allComponents: UIExportedComponent[],
    flowIdMap: Map<string, string>
): void {
    // Multi-state flows are rendered as multiple component nodes (one per state).
    //
    // Default behavior (fallback): draw "Step X" edges between state components in order.
    // Special case: when state changes are driven by a select menu, draw edges from the
    // select menu handle on the initial component to each target state component instead.
    const stateKeys = new Set( stateComponents.map( stateComponent => stateComponent.stateKey ) );

    const selectMenuTransitions = getSelectMenuTriggeredTransitionsToKnownStates( flow, stateKeys );
    const shouldUseSelectMenuStateEdges = selectMenuTransitions.length > 0 || hasEdgeSourceMappingTransitions( flow, stateKeys );

    const stateKeyToCompId = new Map<string, string>();
    let prevCompId: string | null = null;
    let initialCompId: string | undefined;
    let initialElementRows: ElementData[][] | undefined;
    const initialStateTransitionTriggers: StateTransitionTrigger[] = [];

    stateComponents.forEach( ( stateComp, stepIndex ) => {
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

        allNodes.push(
            createComponentNode(
                compId,
                compPreviewWithStateDefaults,
                buttonModalTriggers,
                buttonFlowTriggers,
                stepIndex === 0 ? initialStateTransitionTriggers : [],
                `${ stateComp.stateName } - ${ compPreview.name }`,
                stateComp.stateKey
            )
        );

        if ( stepIndex === 0 ) {
            allEdges.push( createFlowToComponentEdge( flowId, compId, flow.name, stateComp.component.name ) );
            initialCompId = compId;
            initialElementRows = compPreviewWithStateDefaults.elementRows;
        } else if ( !shouldUseSelectMenuStateEdges && prevCompId ) {
            const sourceHandle = findStateTransitionHandle(
                flow,
                stateComponents[ stepIndex - 1 ].options as Record<string, unknown> | undefined,
                stateComponents[ stepIndex - 1 ].transitions,
                stateComp.stateKey
            ) ?? "bottom";

            allEdges.push( createStepTransitionEdge( prevCompId, compId, flow.name, stepIndex, sourceHandle ) );
        }

        prevCompId = compId;

        addModalNodesAndEdges( allEdges, allNodes, compId, compPreviewWithStateDefaults, buttonModalConnections, stateComp.transitions );
        addButtonFlowEdges( allEdges, compId, buttonFlowTriggers, flowIdMap, flow.name );
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
                allEdges.push( createComponentToComponentEdge( sourceCompId, targetCompId, flow.name, trigger.sourceEntity, label ) );
                return;
            }

            allEdges.push( createComponentToStateFallbackEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );

        uniqueTriggerElements.forEach( elementName => {
            initialStateTransitionTriggers.push( {
                elementName,
                handlePosition: getButtonHandlePosition( elementName, sourceElementRows, totalRows )
            } );
        } );

        stateComponents.slice( 1 ).forEach( ( stateComponent ) => {
            if ( connectedTargetStates.has( stateComponent.stateKey ) ) {
                return;
            }

            const targetCompId = stateKeyToCompId.get( stateComponent.stateKey );
            if ( !targetCompId ) {
                return;
            }

            const label = stateComponent.stateName;
            allEdges.push( createComponentToStateFallbackEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );
    }
}

function buildSingleComponentFlow(
    allNodes: Node[],
    allEdges: Edge[],
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
            stateKey
        )
    );
    allEdges.push( createFlowToComponentEdge( flowId, compId, flow.name, initialComp.name ) );

    addButtonFlowEdges( allEdges, compId, buttonFlowTriggers, flowIdMap, flow.name );
    addModalNodesAndEdges( allEdges, allNodes, compId, compPreviewWithStateDefaults, buttonModalConnections, stateTransitions );
}
