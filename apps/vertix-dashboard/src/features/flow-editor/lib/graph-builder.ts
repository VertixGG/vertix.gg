import zCore from "@zenflux/core";

import { createModuleNode, createFlowNode, createComponentNode, createModalNode } from "@vertix.gg/dashboard/src/features/flow-editor/lib/node-builders";
import {
    createModuleToFlowEdge,
    createFlowToComponentEdge,
    createComponentToModalEdge,
    createComponentToFlowEdge,
    createComponentToFlowExitEdge,
    createComponentToComponentEdge,
    createComponentToStateFallbackEdge,
    createProgrammaticTransitionEdge,
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

import type { FlowStateComponent, ButtonModalConnection } from "@vertix.gg/dashboard/src/features/flow-editor/lib/flow-helpers";
import type { ElementData, ComponentPreview } from "@vertix.gg/dashboard/src/features/flow-editor/lib/component-helpers";
import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { UIExportedFlow, UIExportedComponent, UIExportEmbedDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";
import type { Node, Edge } from "@xyflow/react";
import type { ButtonModalTrigger, ButtonFlowTrigger, StateTransitionTrigger } from "@vertix.gg/dashboard/src/features/flow-editor/lib/node-builders";

interface WizardTransition {
    buttonName: string;
    targetStateKey: string;
    targetStateName: string;
    isBackTransition: boolean;
    isFinishTransition: boolean;
}

interface FlowContext {
    flow: UIExportedFlow;
    flowId: string;
    stateComponents: FlowStateComponent[];
    stateKeys: Set<string>;
    stateKeyToIndex: Map<string, number>;
    stateKeyToCompId: Map<string, string>;
    stateKeyToElementRows: Map<string, ElementData[][]>;
    initialStateKey: string;
    wizardConnectedTargets: Set<string>;
    flowIdMap: Map<string, string>;
}

type ModalConnection = { buttonName: string; modalName: string };
type ModalWithOptionalButton = { buttonName?: string; modalName: string };
type FlowConnection = { buttonName: string; targetFlowName: string };
type TransitionWithTrigger = { triggeredBy: NonNullable<UIExportedFlow[ "transitions" ][ number ][ "triggeredBy" ]>; to: string };

class WizardAnalyzer {
    private readonly context: FlowContext;

    public constructor( context: FlowContext ) {
        this.context = context;
    }

    public getTransitionsForState( stateKey: string, elementRows: ElementData[][] ): WizardTransition[] {
        const { BACK, NEXT, FINISH } = WIZARD_BUTTON_NAMES;
        const hasBack = this.hasButton( elementRows, BACK );
        const hasNext = this.hasButton( elementRows, NEXT );
        const hasFinish = this.hasButton( elementRows, FINISH );

        if ( !hasBack && !hasNext && !hasFinish ) {
            return [];
        }

        const currentIndex = this.context.stateKeyToIndex.get( stateKey );
        if ( currentIndex === undefined ) {
            return [];
        }

        const transitions = this.context.flow.transitions.filter( t =>
            t.from === stateKey && !t.triggeredBy?.length
        );

        return transitions.flatMap( transition => {
            const targetIndex = this.context.stateKeyToIndex.get( transition.to );
            if ( targetIndex === undefined ) {
                return [];
            }

            const targetStateName = transition.to.split( "/" ).pop() ?? transition.to;
            let buttonName: string | null = null;

            if ( targetIndex === currentIndex + 1 && hasNext ) {
                buttonName = NEXT;
            } else if ( targetIndex === currentIndex - 1 && hasBack ) {
                buttonName = BACK;
            } else if ( transition.to === this.context.initialStateKey && hasFinish ) {
                buttonName = FINISH;
            } else if ( transition.to === this.context.initialStateKey && hasBack && currentIndex === 1 ) {
                buttonName = BACK;
            }

            if ( !buttonName ) {
                return [];
            }

            const isBackward = buttonName === BACK || buttonName === FINISH;

            return [ {
                buttonName,
                targetStateKey: transition.to,
                targetStateName,
                isBackTransition: isBackward,
                isFinishTransition: buttonName === FINISH
            } ];
        } );
    }

    private hasButton( elementRows: ElementData[][], buttonName: string ): boolean {
        return elementRows.flat().some( el => el.name === buttonName );
    }
}

class PreviewResolver {
    public static resolve( component: UIExportedComponent, options?: FlowStateComponent[ "options" ], previewEmbedsGroup?: string ): ComponentPreview {
        const executionStep = typeof options?.[ "executionStep" ] === "string" ? options[ "executionStep" ] : undefined;
        const compPreview = extractComponentPreview( component, executionStep, previewEmbedsGroup );
        const defaultVars = this.getDefaultVars( options, compPreview.embedDefinition );

        if ( !compPreview.embed ) {
            return compPreview;
        }

        return {
            ...compPreview,
            embed: {
                ...compPreview.embed,
                defaultVars: { ...( compPreview.embed.defaultVars ?? {} ), ...defaultVars }
            }
        };
    }

    public static getPreviewEmbedsGroup( options?: FlowStateComponent[ "options" ] ): string | undefined {
        const group = options?.[ "previewEmbedsGroup" ];
        return typeof group === "string" && group.trim().length ? group.trim() : undefined;
    }

    private static getDefaultVars( options?: FlowStateComponent[ "options" ], embedDef?: UIExportEmbedDefinition ): Record<string, string> {
        if ( !options ) {
            return {};
        }

        const preview = options[ "previewDefaultVars" ];
        const previewVars = options[ "previewVars" ];

        const explicit = preview && typeof preview === "object" && !Array.isArray( preview )
            ? Object.fromEntries( Object.entries( preview ).filter( ( entry ): entry is [ string, string ] => typeof entry[ 1 ] === "string" ) )
            : {};

        const derived = this.deriveFromDefinition( previewVars, embedDef );

        return { ...derived, ...explicit };
    }

    private static deriveFromDefinition( previewVars: unknown, embedDef?: UIExportEmbedDefinition ): Record<string, string> {
        if ( !embedDef || !Array.isArray( previewVars ) ) {
            return {};
        }

        const { defaultVars = {}, options = {}, vars = {} } = embedDef;
        const result: Record<string, string> = {};

        previewVars.forEach( key => {
            if ( typeof key !== "string" || !key.length ) {
                return;
            }

            if ( typeof defaultVars[ key ] === "string" ) {
                result[ key ] = defaultVars[ key ];
                return;
            }

            const optionValue = this.pickOptionValue( options[ key ] );
            if ( optionValue ) {
                result[ key ] = optionValue;
                return;
            }

            if ( typeof vars[ key ] === "string" ) {
                result[ key ] = vars[ key ];
            }
        } );

        return result;
    }

    private static pickOptionValue( option: UIExportEmbedDefinition[ "options" ][ string ] | undefined ): string | undefined {
        if ( !option || typeof option !== "object" || Array.isArray( option ) ) {
            return undefined;
        }

        const entries = Object.entries( option ).filter( ( entry ): entry is [ string, string ] => typeof entry[ 1 ] === "string" );
        if ( !entries.length ) {
            return undefined;
        }

        const defaultEntry = entries.find( ( [ k ] ) => k.toLowerCase().includes( "default" ) );
        if ( defaultEntry ) {
            return defaultEntry[ 1 ];
        }

        const literalEntry = entries.find( ( [ , v ] ) => !/\{[a-zA-Z0-9_]+\}/.test( v ) );
        return literalEntry?.[ 1 ] ?? entries[ 0 ][ 1 ];
    }
}

class TriggerBuilder {
    public static build(
        buttonModalConnections: ModalConnection[],
        buttonFlowConnections: FlowConnection[],
        elementRows: ElementData[][]
    ): { buttonModalTriggers: ButtonModalTrigger[]; buttonFlowTriggers: ButtonFlowTrigger[] } {
        const totalRows = elementRows.length;

        return {
            buttonModalTriggers: buttonModalConnections.map( c => ( {
                buttonName: c.buttonName,
                modalName: c.modalName,
                handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
            } ) ),
            buttonFlowTriggers: buttonFlowConnections.map( c => ( {
                buttonName: c.buttonName,
                targetFlowName: c.targetFlowName,
                handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
            } ) )
        };
    }
}

const logger = zCore.modules.createLogger( "graph-builder" );

class EdgeBuilder {
    private readonly addEdge: ( edge: Edge ) => void;
    private readonly context: FlowContext;
    private readonly wizardAnalyzer: WizardAnalyzer;

    public constructor( addEdge: ( edge: Edge ) => void, context: FlowContext ) {
        this.addEdge = addEdge;
        this.context = context;
        this.wizardAnalyzer = new WizardAnalyzer( context );
    }

    public addButtonFlowEdges( compId: string, triggers: ButtonFlowTrigger[] ): void {
        triggers.forEach( trigger => {
            if ( trigger.targetFlowName === this.context.flow.name ) {
                return;
            }

            const targetFlowId = this.context.flowIdMap.get( trigger.targetFlowName );
            if ( targetFlowId ) {
                this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName ) );
            }
        } );
    }

    public addModalEdges( allNodes: Node[], compId: string, compPreview: ComponentPreview, buttonModalConnections: ModalConnection[], stateKey?: string ): void {
        let connections: ModalWithOptionalButton[] = [ ...buttonModalConnections ];

        // Also add modals found through state transitions that aren't already included
        if ( stateKey ) {
            const stateConnections = this.findModalConnectionsFromStateKey( stateKey, compPreview.modals );
            const existingModalNames = new Set( connections.map( c => c.modalName ) );

            stateConnections.forEach( sc => {
                if ( !existingModalNames.has( sc.modalName ) ) {
                    connections.push( sc );
                }
            } );
        }

        if ( connections.length === 0 && !stateKey ) {
            connections = compPreview.modals.map( modal => ( { modalName: modal } ) );
        }

        if ( connections.length === 0 ) {
            return;
        }

        const modalNames = connections.map( c => c.modalName );
        const connectionsForSort = connections.filter( ( c ): c is ModalConnection => !!c.buttonName );
        const sortedModals = sortModalsByButtonOrder( modalNames, connectionsForSort, compPreview.elementRows );

        sortedModals.forEach( ( modal, idx ) => {
            const modalId = `modal-${ compId }-${ idx }`;
            const modalDef = compPreview.modalDefinitions.find( m => m.name === modal );

            allNodes.push( createModalNode( modalId, modal, modalDef, this.context.flow.name ) );

            const connection = connections.find( c => c.modalName === modal );
            const sourceHandle = connection?.buttonName ? `btn-${ connection.buttonName }` : "bottom";

            logger.debug( this.addModalEdges, `modal: ${ modal }, id: ${ modalId }, sourceHandle: ${ sourceHandle }` );
            this.addEdge( createComponentToModalEdge( compId, modalId, sourceHandle ) );
        } );
    }

    private findModalConnectionsFromStateKey( stateKey: string, componentModals: string[] ): ModalWithOptionalButton[] {
        const connections: ModalWithOptionalButton[] = [];

        // Build a set of transition names that have edge source mappings for self-transitions
        const selfTransitionEsmModalNames = this.getSelfTransitionEsmModalNames( stateKey );

        this.context.flow.transitions?.forEach( t => {
            if ( t.from !== stateKey || !t.triggeredBy ) {
                return;
            }

            const modalTriggers = t.triggeredBy.filter( tr => tr.handlerKind === "modal" && tr.sourceEntity );
            const buttonTrigger = t.triggeredBy.find( tr => tr.handlerKind === "button" && tr.sourceEntity );

            modalTriggers.forEach( modalTrigger => {
                const modalName = modalTrigger.sourceEntity!;

                if ( !componentModals.includes( modalName ) ) {
                    return;
                }

                // Skip modals from self-transitions that have edge source mappings
                // (they will be handled by addSelfTransitionModalEdges)
                if ( selfTransitionEsmModalNames.has( modalName ) ) {
                    return;
                }

                connections.push( {
                    modalName,
                    buttonName: buttonTrigger?.sourceEntity
                } );
            } );
        } );

        return connections;
    }

    private getSelfTransitionEsmModalNames( stateKey: string ): Set<string> {
        const { flow } = this.context;
        const modalNames = new Set<string>();

        if ( !flow.edgeSourceMappings?.length ) {
            return modalNames;
        }

        // Build transition name to transition map
        const transitionNameToTransition = new Map<string, typeof flow.transitions[ number ]>();
        flow.states.forEach( state => {
            if ( !state.transitions?.length ) {
                return;
            }
            const stateTransitions = flow.transitions.filter( t => t.from === state.key );
            state.transitions.forEach( ( transitionName, index ) => {
                if ( index < stateTransitions.length ) {
                    transitionNameToTransition.set( transitionName, stateTransitions[ index ] );
                }
            } );
        } );

        flow.edgeSourceMappings.forEach( mapping => {
            if ( mapping.targetFlowName !== flow.name ) {
                return;
            }

            const transition = transitionNameToTransition.get( mapping.transitionName );
            if ( !transition || transition.from !== stateKey || transition.from !== transition.to ) {
                return;
            }

            ( transition.triggeredBy ?? [] ).forEach( tr => {
                if ( tr.handlerKind === "modal" && tr.sourceEntity ) {
                    modalNames.add( tr.sourceEntity );
                }
            } );
        } );

        return modalNames;
    }

    public addWizardEdges(): void {
        this.context.stateComponents.forEach( stateComp => {
            const sourceCompId = this.context.stateKeyToCompId.get( stateComp.stateKey );
            const elementRows = this.context.stateKeyToElementRows.get( stateComp.stateKey );

            if ( !sourceCompId || !elementRows ) {
                return;
            }

            const transitions = this.wizardAnalyzer.getTransitionsForState( stateComp.stateKey, elementRows );

            transitions.forEach( wt => {
                if ( wt.isFinishTransition ) {
                    this.addEdge( createComponentToFlowExitEdge(
                        sourceCompId,
                        this.context.flowId,
                        this.context.flow.name,
                        wt.buttonName
                    ) );
                    return;
                }

                const targetCompId = this.context.stateKeyToCompId.get( wt.targetStateKey );
                if ( !targetCompId ) {
                    return;
                }

                const isForward = !wt.isBackTransition;
                const targetHandle = wt.isBackTransition ? "left" : undefined;

                this.addEdge( createComponentToComponentEdge(
                    sourceCompId,
                    targetCompId,
                    this.context.flow.name,
                    wt.buttonName,
                    wt.targetStateName,
                    targetHandle,
                    wt.isBackTransition,
                    isForward ? 10 : 1
                ) );
            } );
        } );
    }

    public addIntermediateStateEdges(): void {
        const { flow, initialStateKey, stateKeys, stateKeyToCompId, stateKeyToElementRows, wizardConnectedTargets } = this.context;

        const stateDepth = this.computeStateDepths();

        const matchesElement = ( elementRows: ElementData[][], sourceEntity: string ): string | null => {
            const elementFullNames = new Set( elementRows.flat().map( el => el.name ) );
            return elementFullNames.has( sourceEntity ) ? sourceEntity : null;
        };

        flow.transitions.forEach( transition => {
            if ( transition.from === initialStateKey ) {
                return;
            }

            if ( !stateKeys.has( transition.from ) || !stateKeys.has( transition.to ) ) {
                return;
            }

            const sourceCompId = stateKeyToCompId.get( transition.from );
            const targetCompId = stateKeyToCompId.get( transition.to );

            if ( !sourceCompId || !targetCompId ) {
                return;
            }

            const label = transition.to.split( "/" ).pop() ?? transition.to;

            const trigger = ( transition.triggeredBy ?? [] ).find( t =>
                [ "string-select", "button", "user-select" ].includes( t.handlerKind )
            );

            const elementRows = stateKeyToElementRows.get( transition.from );
            if ( !elementRows ) {
                return;
            }

            // Skip self-transitions (same state to same state) - these create visual loops
            if ( transition.from === transition.to ) {
                return;
            }

            if ( wizardConnectedTargets.has( transition.to ) ) {
                return;
            }

            const fromDepth = stateDepth.get( transition.from ) ?? 0;
            const toDepth = stateDepth.get( transition.to ) ?? 0;

            if ( toDepth <= fromDepth ) {
                return;
            }

            if ( trigger?.sourceEntity ) {
                const matchedElement = matchesElement( elementRows, trigger.sourceEntity );
                if ( matchedElement ) {
                    logger.debug( this.addIntermediateStateEdges, `edge: ${ label }, sourceHandle: btn-${ matchedElement }, source: ${ trigger.sourceEntity }` );
                    this.addEdge( createComponentToComponentEdge( sourceCompId, targetCompId, flow.name, matchedElement, label ) );
                    return;
                }
            }

            logger.debug( this.addIntermediateStateEdges, `fallback-edge: ${ label }` );
            this.addEdge( createComponentToStateFallbackEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );
    }

    private computeStateDepths(): Map<string, number> {
        const { flow, initialStateKey, stateKeys } = this.context;
        const depths = new Map<string, number>();
        const queue: string[] = [ initialStateKey ];

        depths.set( initialStateKey, 0 );

        while ( queue.length > 0 ) {
            const current = queue.shift()!;
            const currentDepth = depths.get( current ) ?? 0;

            flow.transitions
                .filter( t => t.from === current && stateKeys.has( t.to ) )
                .forEach( t => {
                    if ( !depths.has( t.to ) ) {
                        depths.set( t.to, currentDepth + 1 );
                        queue.push( t.to );
                    }
                } );
        }

        return depths;
    }

    public addOrphanedStateEdges( connectedCompIds: Set<string> ): void {
        const { flow, stateKeys, stateKeyToCompId } = this.context;

        const orphanedStates = [ ...stateKeys ].filter( stateKey => {
            if ( stateKey === this.context.initialStateKey ) {
                return false;
            }

            const compId = stateKeyToCompId.get( stateKey );

            return compId && !connectedCompIds.has( compId );
        } );

        orphanedStates.forEach( orphanedState => {
            const transition = flow.transitions.find( t => t.to === orphanedState && stateKeys.has( t.from ) );

            if ( !transition ) {
                return;
            }

            const sourceCompId = stateKeyToCompId.get( transition.from );
            const targetCompId = stateKeyToCompId.get( orphanedState );

            if ( !sourceCompId || !targetCompId ) {
                return;
            }

            const label = orphanedState.split( "/" ).pop() ?? orphanedState;

            this.addEdge( createProgrammaticTransitionEdge( sourceCompId, targetCompId, flow.name, label ) );
        } );
    }

    public addSelectMenuEdges( initialCompId: string, initialElementRows: ElementData[][] ): void {
        const elementFullNames = new Set( initialElementRows.flat().map( el => el.name ) );

        const transitions = this.getSelectMenuTransitions( initialElementRows );
        const connectedTargets = new Set<string>();
        const greenConnectedTargets = new Set<string>();

        const matchesElement = ( sourceEntity: string ): string | null => {
            return elementFullNames.has( sourceEntity ) ? sourceEntity : null;
        };

        transitions.forEach( transition => {
            const trigger = ( transition.triggeredBy ?? [] ).find( t =>
                [ "string-select", "button", "user-select" ].includes( t.handlerKind )
            );

            if ( !trigger ) {
                return;
            }

            const targetCompId = this.context.stateKeyToCompId.get( transition.to );
            if ( !targetCompId ) {
                return;
            }

            const matchedElement = matchesElement( trigger.sourceEntity );
            if ( matchedElement ) {
                greenConnectedTargets.add( transition.to );
            }
        } );

        transitions.forEach( transition => {
            const trigger = ( transition.triggeredBy ?? [] ).find( t =>
                [ "string-select", "button", "user-select" ].includes( t.handlerKind )
            );

            if ( !trigger ) {
                return;
            }

            const targetCompId = this.context.stateKeyToCompId.get( transition.to );
            if ( !targetCompId ) {
                return;
            }

            const label = transition.to.split( "/" ).pop() ?? transition.to;
            const matchedElement = matchesElement( trigger.sourceEntity );
            const inGreenConnected = greenConnectedTargets.has( transition.to );
            const inWizardConnected = this.context.wizardConnectedTargets.has( transition.to );

            if ( matchedElement ) {
                logger.debug( this.addSelectMenuEdges, `edge: ${ label }, sourceHandle: btn-${ matchedElement }, source: ${ trigger.sourceEntity }` );
                this.addEdge( createComponentToComponentEdge( initialCompId, targetCompId, this.context.flow.name, matchedElement, label ) );
                connectedTargets.add( transition.to );
            } else if ( !inGreenConnected && !inWizardConnected ) {
                logger.debug( this.addSelectMenuEdges, `fallback-edge: ${ label }, source: ${ trigger.sourceEntity }` );
                this.addEdge( createComponentToStateFallbackEdge( initialCompId, targetCompId, this.context.flow.name, label ) );
                connectedTargets.add( transition.to );
            }
        } );
    }

    public addFanOutEdges( _initialCompId: string ): void {
    }

    public addFallbackEdgesForAllUnconnected( sourceCompId: string ): void {
        const directlyReachable = new Set(
            this.context.flow.transitions
                .filter( t => t.from === this.context.initialStateKey )
                .map( t => t.to )
        );

        this.context.stateComponents.slice( 1 ).forEach( stateComp => {
            if ( this.context.wizardConnectedTargets.has( stateComp.stateKey ) ) {
                return;
            }

            if ( !directlyReachable.has( stateComp.stateKey ) ) {
                return;
            }

            const targetCompId = this.context.stateKeyToCompId.get( stateComp.stateKey );
            if ( !targetCompId ) {
                return;
            }

            this.addEdge( createComponentToStateFallbackEdge( sourceCompId, targetCompId, this.context.flow.name, stateComp.stateName ) );
        } );
    }

    private getSelectMenuTransitions( elementRows: ElementData[][] ): TransitionWithTrigger[] {
        const { flow, stateKeys, initialStateKey } = this.context;
        const selectMenuTransitions = flow.transitions.filter( t =>
            t.from === initialStateKey &&
            t.to !== initialStateKey && // Skip self-transitions
            stateKeys.has( t.to ) &&
            t.triggeredBy?.some( tr => [ "string-select", "button", "user-select" ].includes( tr.handlerKind ) )
        );

        const edgeSourceTransitions = this.getEdgeSourceMappingTransitions( elementRows );
        const combined = [ ...selectMenuTransitions, ...edgeSourceTransitions ] as TransitionWithTrigger[];

        if ( combined.length === 0 ) {
            return [];
        }

        const seen = new Set<string>();
        const deduped: TransitionWithTrigger[] = [];

        combined.forEach( transition => {
            const trigger = ( transition.triggeredBy ?? [] ).find( tr =>
                [ "string-select", "button", "user-select" ].includes( tr.handlerKind )
            );
            const key = `${ transition.to }::${ trigger?.handlerKind ?? "none" }::${ trigger?.sourceEntity ?? "" }`;
            if ( seen.has( key ) ) {
                return;
            }
            seen.add( key );
            deduped.push( transition );
        } );

        return deduped;
    }

    private getEdgeSourceMappingTransitions( elementRows: ElementData[][] ): TransitionWithTrigger[] {
        const { flow, stateKeys } = this.context;
        if ( !flow.edgeSourceMappings?.length ) {
            return [];
        }

        // Build a map from transition name to the actual transition
        // A state's transitions array is ordered and matches the order of flow.transitions with the same `from`
        const transitionNameToTransition = new Map<string, typeof flow.transitions[ number ]>();
        flow.states.forEach( state => {
            if ( !state.transitions?.length ) {
                return;
            }

            // Get all flow.transitions from this state, in order
            const stateTransitions = flow.transitions.filter( t => t.from === state.key );

            // Map each transition name to its corresponding transition by index
            state.transitions.forEach( ( transitionName, index ) => {
                if ( index < stateTransitions.length ) {
                    transitionNameToTransition.set( transitionName, stateTransitions[ index ] );
                }
            } );
        } );

        const elementByName = new Map( elementRows.flat().map( el => [ el.name, el ] ) );

        return flow.edgeSourceMappings.flatMap( mapping => {
            if ( mapping.targetFlowName !== flow.name ) {
                return [];
            }

            const transition = transitionNameToTransition.get( mapping.transitionName );
            // Skip if transition not found, target not in stateKeys, or self-transition
            if ( !transition || !stateKeys.has( transition.to ) || transition.from === transition.to ) {
                return [];
            }

            const element = elementByName.get( mapping.triggeringElementId );
            const handlerKind = this.inferHandlerKind( element, mapping.triggeringElementId );

            return [ {
                to: transition.to,
                triggeredBy: [ {
                    handlerId: `flow-edge-${ flow.name }-${ mapping.transitionName }`,
                    sourceEntity: mapping.triggeringElementId,
                    handlerKind
                } ]
            } ];
        } );
    }

    public addSelfTransitionModalEdges( allNodes: Node[], stateKey: string, compId: string, compPreview: ComponentPreview ): void {
        const { flow, initialStateKey, stateKeyToCompId, stateKeyToElementRows } = this.context;

        if ( !flow.edgeSourceMappings?.length ) {
            return;
        }

        // Build transition name to transition map
        const transitionNameToTransition = new Map<string, typeof flow.transitions[ number ]>();
        flow.states.forEach( state => {
            if ( !state.transitions?.length ) {
                return;
            }
            const stateTransitions = flow.transitions.filter( t => t.from === state.key );
            state.transitions.forEach( ( transitionName, index ) => {
                if ( index < stateTransitions.length ) {
                    transitionNameToTransition.set( transitionName, stateTransitions[ index ] );
                }
            } );
        } );

        // Determine the initial component ID and its elements for ESM source resolution
        const initialCompId = stateKeyToCompId.get( initialStateKey );
        const initialElementNames = new Set(
            ( stateKeyToElementRows.get( initialStateKey ) ?? [] ).flat().map( el => el.name )
        );

        flow.edgeSourceMappings.forEach( mapping => {
            if ( mapping.targetFlowName !== flow.name ) {
                return;
            }

            const transition = transitionNameToTransition.get( mapping.transitionName );

            // Only handle self-transitions from the current state
            if ( !transition || transition.from !== stateKey || transition.from !== transition.to ) {
                return;
            }

            // Find modal triggers on this self-transition
            const modalTriggers = ( transition.triggeredBy ?? [] ).filter( tr => tr.handlerKind === "modal" && tr.sourceEntity );

            modalTriggers.forEach( ( modalTrigger, idx ) => {
                const modalName = modalTrigger.sourceEntity!;

                // Check if this modal is in the component's modals
                if ( !compPreview.modals.includes( modalName ) ) {
                    return;
                }

                // Use initial component as edge source when the triggering element exists on it
                // This ensures ESM modal edges visually originate from the same select menu
                // that has the green ESM edges (on the initial/Default component)
                const useInitialComp = initialCompId && initialCompId !== compId && initialElementNames.has( mapping.triggeringElementId );
                const edgeSourceCompId = useInitialComp ? initialCompId : compId;

                const modalId = `modal-${ edgeSourceCompId }-esm-${ idx }`;
                const modalDef = compPreview.modalDefinitions.find( m => m.name === modalName );

                allNodes.push( createModalNode( modalId, modalName, modalDef, flow.name ) );

                const sourceHandle = `btn-${ mapping.triggeringElementId }`;
                const edge = createComponentToModalEdge( edgeSourceCompId, modalId, sourceHandle );
                this.addEdge( edge );
            } );
        } );
    }

    private inferHandlerKind( element: ElementData | undefined, elementName: string ): "button" | "string-select" | "user-select" {
        const elementType = element?.definition?.elementType;

        if ( elementType === "user-select" ) {
            return "user-select";
        }
        if ( elementType?.includes( "select" ) ) {
            return "string-select";
        }
        if ( elementName.toLowerCase().includes( "select" ) ) {
            return "string-select";
        }
        return "button";
    }

    private addFallbackEdgesForUnconnected( sourceCompId: string, connectedTargets: Set<string> ): void {
        const directlyReachable = new Set(
            this.context.flow.transitions
                .filter( t => t.from === this.context.initialStateKey )
                .map( t => t.to )
        );

        this.context.stateComponents.slice( 1 ).forEach( stateComp => {
            if ( connectedTargets.has( stateComp.stateKey ) || this.context.wizardConnectedTargets.has( stateComp.stateKey ) || !directlyReachable.has( stateComp.stateKey ) ) {
                return;
            }

            const targetCompId = this.context.stateKeyToCompId.get( stateComp.stateKey );
            if ( targetCompId ) {
                this.addEdge( createComponentToStateFallbackEdge( sourceCompId, targetCompId, this.context.flow.name, stateComp.stateName ) );
            }
        } );
    }
}

class FlowPatternDetector {
    public static detectModalFirst( flow: UIExportedFlow, initialStateKey: string, initialStateOptions?: Record<string, unknown> ): { isModalFirst: boolean; modalName: string | null } {
        const executionStep = initialStateOptions?.[ "executionStep" ];
        if ( executionStep !== "default" ) {
            return { isModalFirst: false, modalName: null };
        }

        const modalTriggerFromInitial = flow.transitions.find( t =>
            t.from === initialStateKey && t.triggeredBy?.some( tr => tr.handlerKind === "modal" )
        )?.triggeredBy?.find( tr => tr.handlerKind === "modal" );

        return modalTriggerFromInitial
            ? { isModalFirst: true, modalName: modalTriggerFromInitial.sourceEntity }
            : { isModalFirst: false, modalName: null };
    }

    public static detectFanOut( flow: UIExportedFlow, stateKeys: Set<string>, initialStateKey: string ): { isFanOut: boolean; targetStateKeys: string[] } {
        if ( !flow.transitions?.length || !initialStateKey ) {
            return { isFanOut: false, targetStateKeys: [] };
        }

        const targets = flow.transitions
            .filter( t => t.from === initialStateKey && stateKeys.has( t.to ) && t.to !== initialStateKey && !t.triggeredBy?.length )
            .map( t => t.to );

        return { isFanOut: targets.length > 1, targetStateKeys: targets };
    }

    public static hasSelectMenuEdges( flow: UIExportedFlow, stateKeys: Set<string> ): boolean {
        const hasSelectMenuTransitions = flow.transitions.some( t =>
            stateKeys.has( t.to ) && t.triggeredBy?.some( tr => [ "string-select", "button", "user-select" ].includes( tr.handlerKind ) )
        );

        if ( hasSelectMenuTransitions ) {
            return true;
        }

        if ( !flow.edgeSourceMappings?.length ) {
            return false;
        }

        // Build transition name to transition map using state ordering
        const transitionNameToTransition = new Map<string, typeof flow.transitions[ number ]>();
        flow.states.forEach( state => {
            if ( !state.transitions?.length ) {
                return;
            }
            const stateTransitions = flow.transitions.filter( t => t.from === state.key );
            state.transitions.forEach( ( transitionName, index ) => {
                if ( index < stateTransitions.length ) {
                    transitionNameToTransition.set( transitionName, stateTransitions[ index ] );
                }
            } );
        } );

        return flow.edgeSourceMappings.some( mapping => {
            if ( mapping.targetFlowName !== flow.name ) {
                return false;
            }
            const transition = transitionNameToTransition.get( mapping.transitionName );
            return transition && stateKeys.has( transition.to );
        } );
    }
}

class MultiStateFlowBuilder {
    private readonly allNodes: Node[];
    private readonly addEdge: ( edge: Edge ) => void;
    private readonly context: FlowContext;
    private readonly edgeBuilder: EdgeBuilder;
    private readonly wizardAnalyzer: WizardAnalyzer;
    private readonly connectedCompIds: Set<string> = new Set();

    private initialCompId?: string;
    private initialElementRows?: ElementData[][];
    private readonly initialStateTransitionTriggers: StateTransitionTrigger[] = [];

    public constructor( allNodes: Node[], addEdge: ( edge: Edge ) => void, context: FlowContext ) {
        this.allNodes = allNodes;
        this.context = context;
        this.wizardAnalyzer = new WizardAnalyzer( context );

        const trackingAddEdge = ( edge: Edge ) => {
            this.connectedCompIds.add( edge.target );
            addEdge( edge );
        };

        this.addEdge = trackingAddEdge;
        this.edgeBuilder = new EdgeBuilder( trackingAddEdge, context );
    }

    public build(): void {
        const initialStateOptions = this.context.stateComponents[ 0 ]?.options as Record<string, unknown> | undefined;
        const modalFirst = FlowPatternDetector.detectModalFirst( this.context.flow, this.context.initialStateKey, initialStateOptions );
        const useSelectMenu = FlowPatternDetector.hasSelectMenuEdges( this.context.flow, this.context.stateKeys );
        const fanOut = FlowPatternDetector.detectFanOut( this.context.flow, this.context.stateKeys, this.context.initialStateKey );
        const useFanOut = !useSelectMenu && !modalFirst.isModalFirst && fanOut.isFanOut;

        logger.debug( this.build, `flow: ${ this.context.flow.name }, states: ${ this.context.stateComponents.length }, modalFirst: ${ modalFirst.isModalFirst }, selectMenu: ${ useSelectMenu }, fanOut: ${ useFanOut }` );

        this.precomputeElementRows();

        let modalFirstNodeId: string | undefined;
        if ( modalFirst.isModalFirst && modalFirst.modalName ) {
            modalFirstNodeId = this.createModalFirstEntry( modalFirst.modalName );
        }

        this.buildStateNodes( modalFirst.isModalFirst, modalFirstNodeId, useSelectMenu, useFanOut );

        this.computeWizardConnectedTargets();

        if ( useSelectMenu && this.initialCompId && this.initialElementRows ) {
            this.edgeBuilder.addSelectMenuEdges( this.initialCompId, this.initialElementRows );
        } else if ( useFanOut && this.initialCompId ) {
            this.edgeBuilder.addFanOutEdges( this.initialCompId );
        }

        this.edgeBuilder.addWizardEdges();
        this.edgeBuilder.addIntermediateStateEdges();
        this.edgeBuilder.addOrphanedStateEdges( this.connectedCompIds );
    }

    private precomputeElementRows(): void {
        this.context.stateComponents.forEach( stateComp => {
            const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateComp.options );
            const compPreview = PreviewResolver.resolve( stateComp.component, stateComp.options, previewEmbedsGroup );

            this.context.stateKeyToElementRows.set( stateComp.stateKey, compPreview.elementRows );
        } );
    }

    private computeWizardConnectedTargets(): void {
        this.context.stateComponents.forEach( stateComp => {
            const sourceCompId = this.context.stateKeyToCompId.get( stateComp.stateKey );
            if ( !sourceCompId ) {
                return;
            }

            const elementRows = this.context.stateKeyToElementRows.get( stateComp.stateKey );
            if ( !elementRows ) {
                return;
            }

            const transitions = this.wizardAnalyzer.getTransitionsForState( stateComp.stateKey, elementRows );
            transitions.forEach( wt => {
                const targetCompId = this.context.stateKeyToCompId.get( wt.targetStateKey );
                if ( targetCompId ) {
                    this.context.wizardConnectedTargets.add( wt.targetStateKey );
                }
            } );
        } );
    }

    private createModalFirstEntry( modalName: string ): string {
        const modalId = `modal-${ this.context.flow.name }-entry`;
        const initialComp = this.context.stateComponents[ 0 ]?.component;
        const modalDef = initialComp?.modals?.find( m => m.name === modalName );

        this.allNodes.push( createModalNode( modalId, modalName, modalDef, this.context.flow.name ) );
        this.addEdge( createFlowToComponentEdge( this.context.flowId, modalId, this.context.flow.name, modalName ) );

        return modalId;
    }

    private buildStateNodes( isModalFirst: boolean, modalFirstNodeId: string | undefined, useSelectMenu: boolean, useFanOut: boolean ): void {
        let prevCompId: string | null = null;

        this.context.stateComponents.forEach( ( stateComp, stepIndex ) => {
            if ( isModalFirst && stepIndex === 0 ) {
                return;
            }

            const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateComp.options );
            const compPreview = PreviewResolver.resolve( stateComp.component, stateComp.options, previewEmbedsGroup );
            const compId = `comp-${ this.context.flow.name }-${ stateComp.component.name }-${ stepIndex }`;

            this.context.stateKeyToCompId.set( stateComp.stateKey, compId );
            this.context.stateKeyToElementRows.set( stateComp.stateKey, compPreview.elementRows );

            const buttonModalConnections = this.getModalConnections( stateComp, compPreview );
            const buttonFlowConnections = findButtonFlowConnections( this.context.flow );
            const { buttonModalTriggers, buttonFlowTriggers } = TriggerBuilder.build( buttonModalConnections, buttonFlowConnections, compPreview.elementRows );

            const wizardTriggers = this.wizardAnalyzer.getTransitionsForState( stateComp.stateKey, compPreview.elementRows )
                .map( wt => ( {
                    elementName: wt.buttonName,
                    handlePosition: getButtonHandlePosition( wt.buttonName, compPreview.elementRows, compPreview.elementRows.length )
                } ) );

            const selectMenuTriggers = this.getSelectMenuTriggers( stateComp.stateKey, compPreview.elementRows );

            const stateTransitionTriggers = stepIndex === 0
                ? [ ...this.initialStateTransitionTriggers, ...wizardTriggers, ...selectMenuTriggers ]
                : [ ...wizardTriggers, ...selectMenuTriggers ];

            logger.debug( this.buildStateNodes, `state[${ stepIndex }]: ${ stateComp.stateName }, comp: ${ compId }, elements: ${ compPreview.elementRows.flat().map( el => el.name ).join( ", " ) }, modals: ${ compPreview.modals.join( ", " ) }, triggers: ${ stateTransitionTriggers.map( t => t.elementName ).join( ", " ) }` );

            this.allNodes.push( createComponentNode(
                compId,
                compPreview,
                buttonModalTriggers,
                buttonFlowTriggers,
                stateTransitionTriggers,
                `${ stateComp.stateName } - ${ compPreview.name }`,
                stateComp.stateKey,
                this.context.flow.name
            ) );

            this.addEdgesForState( stepIndex, compId, prevCompId, isModalFirst, modalFirstNodeId, useSelectMenu, useFanOut, stateComp );

            if ( !isModalFirst ) {
                this.edgeBuilder.addModalEdges( this.allNodes, compId, compPreview, buttonModalConnections, stateComp.stateKey );
            }
            this.edgeBuilder.addSelfTransitionModalEdges( this.allNodes, stateComp.stateKey, compId, compPreview );
            this.edgeBuilder.addButtonFlowEdges( compId, buttonFlowTriggers );

            prevCompId = compId;
        } );
    }

    private getModalConnections( stateComp: FlowStateComponent, compPreview: ComponentPreview ): ButtonModalConnection[] {
        const componentButtons = compPreview.elementRows.flat().map( el => el.name );
        let connections = findButtonModalConnections( this.context.flow, compPreview.modals, stateComp.transitions );

        if ( !connections.length && compPreview.modals.length > 0 ) {
            const stateConnections = this.findStateModalConnections( stateComp.stateKey, compPreview.modals );
            if ( stateConnections.length > 0 ) {
                connections = stateConnections;
            } else if ( !stateComp.transitions?.length ) {
                connections = inferButtonModalConnections( componentButtons, compPreview.modals );
            }
        }

        return connections;
    }

    private findStateModalConnections( stateKey: string, componentModals: string[] ): ButtonModalConnection[] {
        const connections: ButtonModalConnection[] = [];

        this.context.flow.transitions?.forEach( t => {
            if ( t.from !== stateKey || !t.triggeredBy ) {
                return;
            }

            const modalTriggers = t.triggeredBy.filter( tr => tr.handlerKind === "modal" && tr.sourceEntity );
            const buttonTrigger = t.triggeredBy.find( tr => tr.handlerKind === "button" && tr.sourceEntity );

            modalTriggers.forEach( modalTrigger => {
                const modalName = modalTrigger.sourceEntity!;

                if ( !componentModals.includes( modalName ) || !buttonTrigger?.sourceEntity ) {
                    return;
                }

                const buttonShortName = buttonTrigger.sourceEntity.split( "/" ).pop() ?? buttonTrigger.sourceEntity;
                connections.push( {
                    buttonName: buttonTrigger.sourceEntity,
                    buttonLabel: buttonShortName.replace( /Button$/, "" ).replace( /([a-z])([A-Z])/g, "$1 $2" ),
                    modalName
                } );
            } );
        } );

        return connections;
    }

    private getSelectMenuTriggers( stateKey: string, elementRows: ElementData[][] ): StateTransitionTrigger[] {
        const elementFullNames = new Set( elementRows.flat().map( el => el.name ) );
        const triggers: StateTransitionTrigger[] = [];

        const matchesElement = ( sourceEntity: string ): string | null => {
            return elementFullNames.has( sourceEntity ) ? sourceEntity : null;
        };

        this.context.flow.transitions?.forEach( t => {
            if ( t.from !== stateKey || !t.triggeredBy ) {
                return;
            }

            t.triggeredBy.forEach( trigger => {
                if ( ![ "string-select", "user-select", "button" ].includes( trigger.handlerKind ) ) {
                    return;
                }

                if ( !trigger.sourceEntity ) {
                    return;
                }

                const matchedElement = matchesElement( trigger.sourceEntity );
                if ( !matchedElement ) {
                    return;
                }

                if ( triggers.some( existing => existing.elementName === matchedElement ) ) {
                    return;
                }

                triggers.push( {
                    elementName: matchedElement,
                    handlePosition: getButtonHandlePosition( matchedElement, elementRows, elementRows.length )
                } );
            } );
        } );

        return triggers;
    }

    private addEdgesForState(
        stepIndex: number,
        compId: string,
        prevCompId: string | null,
        isModalFirst: boolean,
        modalFirstNodeId: string | undefined,
        useSelectMenu: boolean,
        useFanOut: boolean,
        stateComp: FlowStateComponent
    ): void {
        if ( isModalFirst && modalFirstNodeId ) {
            this.addEdge( createModalToComponentEdge( modalFirstNodeId, compId, this.context.flow.name, stateComp.stateName ) );
        } else if ( stepIndex === 0 ) {
            this.addEdge( createFlowToComponentEdge( this.context.flowId, compId, this.context.flow.name, stateComp.component.name ) );
            this.initialCompId = compId;
            this.initialElementRows = this.context.stateKeyToElementRows.get( stateComp.stateKey );
        } else if ( !useSelectMenu && !useFanOut && prevCompId ) {
            const sourceHandle = this.findTransitionHandle( stepIndex, stateComp.stateKey ) ?? "bottom";
            this.addEdge( createStepTransitionEdge( prevCompId, compId, this.context.flow.name, stepIndex, sourceHandle ) );
        }
    }

    private findTransitionHandle( stepIndex: number, _toStateKey: string ): string | null {
        const prevState = this.context.stateComponents[ stepIndex - 1 ];
        const prevOptions = prevState?.options as Record<string, unknown> | undefined;
        const prevTransitions = prevState?.transitions;

        if ( !prevTransitions?.length ) {
            return null;
        }

        const handles = prevOptions?.transitionHandles;
        if ( typeof handles === "object" && handles !== null ) {
            for ( const name of prevTransitions ) {
                const handle = ( handles as Record<string, string> )[ name ];
                if ( handle ) {
                    return `btn-${ handle }`;
                }
            }
        }

        const mapping = this.context.flow.edgeSourceMappings?.find( m =>
            prevTransitions.includes( m.transitionName ) && m.targetFlowName === this.context.flow.name
        );

        return mapping ? `btn-${ mapping.triggeringElementId }` : null;
    }
}

class SingleComponentFlowBuilder {
    private readonly allNodes: Node[];
    private readonly addEdge: ( edge: Edge ) => void;
    private readonly flow: UIExportedFlow;
    private readonly flowId: string;
    private readonly flowIdMap: Map<string, string>;

    public constructor( allNodes: Node[], addEdge: ( edge: Edge ) => void, flow: UIExportedFlow, flowId: string, flowIdMap: Map<string, string> ) {
        this.allNodes = allNodes;
        this.addEdge = addEdge;
        this.flow = flow;
        this.flowId = flowId;
        this.flowIdMap = flowIdMap;
    }

    public build( initialComp: UIExportedComponent, stateKey?: string, stateTransitions?: string[], stateOptions?: FlowStateComponent[ "options" ] ): void {
        const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateOptions );
        const compPreview = PreviewResolver.resolve( initialComp, stateOptions, previewEmbedsGroup );
        const compId = `comp-${ this.flow.name }-${ initialComp.name }`;

        const componentButtons = compPreview.elementRows.flat().map( el => el.name );
        let buttonModalConnections = findButtonModalConnections( this.flow, compPreview.modals, stateTransitions );

        if ( !buttonModalConnections.length && compPreview.modals.length > 0 && !stateTransitions?.length ) {
            buttonModalConnections = inferButtonModalConnections( componentButtons, compPreview.modals );
        }

        const buttonFlowConnections = findButtonFlowConnections( this.flow );
        const { buttonModalTriggers, buttonFlowTriggers } = TriggerBuilder.build( buttonModalConnections, buttonFlowConnections, compPreview.elementRows );

        this.allNodes.push( createComponentNode( compId, compPreview, buttonModalTriggers, buttonFlowTriggers, [], undefined, stateKey, this.flow.name ) );
        this.addEdge( createFlowToComponentEdge( this.flowId, compId, this.flow.name, initialComp.name ) );

        buttonFlowTriggers.forEach( trigger => {
            if ( trigger.targetFlowName === this.flow.name ) {
                return;
            }
            const targetFlowId = this.flowIdMap.get( trigger.targetFlowName );
            if ( targetFlowId ) {
                this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName ) );
            }
        } );

        const sortedModals = sortModalsByButtonOrder( compPreview.modals, buttonModalConnections, compPreview.elementRows );
        sortedModals.forEach( ( modal, idx ) => {
            const modalId = `modal-${ compId }-${ idx }`;
            const modalDef = compPreview.modalDefinitions.find( m => m.name === modal );

            this.allNodes.push( createModalNode( modalId, modal, modalDef, this.flow.name ) );

            const connection = buttonModalConnections.find( c => c.modalName === modal );
            const sourceHandle = connection ? `btn-${ connection.buttonName }` : "bottom";

            this.addEdge( createComponentToModalEdge( compId, modalId, sourceHandle ) );
        } );
    }
}

class FlowGraphBuilder {
    private readonly data: ModuleFlowsResponse;
    private readonly allNodes: Node[] = [];
    private readonly allEdges: Edge[] = [];
    private readonly edgeIds = new Set<string>();
    private readonly flowIdMap = new Map<string, string>();
    private readonly systemFlowCompIds = new Map<string, string>();
    private readonly reachableFlows = new Set<string>();

    public constructor( data: ModuleFlowsResponse ) {
        this.data = data;
    }

    public build(): { nodes: Node[]; edges: Edge[] } {
        this.computeReachableFlows();
        this.buildModuleNode();
        this.buildSystemFlowNodes();
        this.buildFlowNodes();
        this.buildSystemFlowComponents();
        this.buildFlowComponents();
        this.buildSystemFlowTransitions();

        return { nodes: this.allNodes, edges: this.allEdges };
    }

    private computeReachableFlows(): void {
        const flowNames = new Set( this.data.flows.map( f => f.name ) );

        this.data.systemFlows.forEach( systemFlow => {
            systemFlow.transitions?.forEach( t => {
                const targetFlowName = t.to?.split( "/States/" )[ 0 ];
                if ( targetFlowName && flowNames.has( targetFlowName ) ) {
                    this.reachableFlows.add( targetFlowName );
                }
            } );

            systemFlow.handoffPoints?.forEach( hp => {
                if ( hp.flowName && flowNames.has( hp.flowName ) ) {
                    this.reachableFlows.add( hp.flowName );
                }
            } );

            systemFlow.edgeSourceMappings?.forEach( esm => {
                if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) ) {
                    this.reachableFlows.add( esm.targetFlowName );
                }
            } );
        } );

        this.data.flows.forEach( flow => {
            flow.handoffPoints?.forEach( hp => {
                if ( hp.flowName && flowNames.has( hp.flowName ) ) {
                    if ( this.reachableFlows.has( flow.name ) ) {
                        this.reachableFlows.add( hp.flowName );
                    }
                }
            } );

            flow.edgeSourceMappings?.forEach( esm => {
                if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) ) {
                    if ( this.reachableFlows.has( flow.name ) ) {
                        this.reachableFlows.add( esm.targetFlowName );
                    }
                }
            } );
        } );

        let changed = true;
        while ( changed ) {
            changed = false;

            this.data.flows.forEach( flow => {
                if ( !this.reachableFlows.has( flow.name ) ) {
                    return;
                }

                flow.handoffPoints?.forEach( hp => {
                    if ( hp.flowName && flowNames.has( hp.flowName ) && !this.reachableFlows.has( hp.flowName ) ) {
                        this.reachableFlows.add( hp.flowName );
                        changed = true;
                    }
                } );

                flow.edgeSourceMappings?.forEach( esm => {
                    if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) && !this.reachableFlows.has( esm.targetFlowName ) ) {
                        this.reachableFlows.add( esm.targetFlowName );
                        changed = true;
                    }
                } );
            } );
        }
    }

    private addEdge( edge: Edge ): void {
        if ( this.edgeIds.has( edge.id ) ) {
            return;
        }
        this.edgeIds.add( edge.id );
        this.allEdges.push( edge );
    }

    private buildModuleNode(): void {
        const moduleNode = createModuleNode( this.data.module, this.data.module );
        this.allNodes.push( moduleNode );
    }

    private buildSystemFlowNodes(): void {
        const moduleNodeId = this.allNodes[ 0 ].id;

        this.data.systemFlows.forEach( flow => {
            const flowNode = createFlowNode( flow, true );
            this.flowIdMap.set( flow.name, flowNode.id );
            this.allNodes.push( flowNode );
            this.addEdge( createModuleToFlowEdge( moduleNodeId, flowNode.id, flow.name ) );
        } );
    }

    private buildFlowNodes(): void {
        const moduleNodeId = this.allNodes[ 0 ].id;

        this.data.flows.forEach( flow => {
            if ( this.reachableFlows.size > 0 && !this.reachableFlows.has( flow.name ) ) {
                return;
            }

            const flowNode = createFlowNode( flow, false );
            this.flowIdMap.set( flow.name, flowNode.id );
            this.allNodes.push( flowNode );
            this.addEdge( createModuleToFlowEdge( moduleNodeId, flowNode.id, flow.name ) );
        } );
    }

    private buildSystemFlowComponents(): void {
        this.data.systemFlows.forEach( flow => {
            const flowId = this.flowIdMap.get( flow.name )!;
            const initialComp = getInitialComponent( flow, this.data.components );

            if ( !initialComp ) {
                return;
            }

            const compPreview = extractComponentPreview( initialComp );
            const compId = `comp-sys-${ flow.name }-${ initialComp.name }`;
            this.systemFlowCompIds.set( flow.name, compId );

            const buttonModalConnections = findButtonModalConnections( flow, compPreview.modals );
            const buttonFlowConnections = findButtonFlowConnections( flow );
            const { buttonModalTriggers, buttonFlowTriggers } = TriggerBuilder.build( buttonModalConnections, buttonFlowConnections, compPreview.elementRows );

            this.allNodes.push( createComponentNode( compId, compPreview, buttonModalTriggers, buttonFlowTriggers, [], undefined, undefined, flow.name ) );
            this.addEdge( createFlowToComponentEdge( flowId, compId, flow.name, initialComp.name ) );

            buttonFlowTriggers.forEach( trigger => {
                if ( trigger.targetFlowName === flow.name ) {
                    return;
                }
                const targetFlowId = this.flowIdMap.get( trigger.targetFlowName );
                if ( targetFlowId ) {
                    this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName ) );
                }
            } );

            const sortedModals = sortModalsByButtonOrder( compPreview.modals, buttonModalConnections, compPreview.elementRows );
            sortedModals.forEach( ( modal, idx ) => {
                const modalId = `modal-${ compId }-${ idx }`;
                const modalDef = compPreview.modalDefinitions.find( m => m.name === modal );

                this.allNodes.push( createModalNode( modalId, modal, modalDef, flow.name ) );

                const connection = buttonModalConnections.find( c => c.modalName === modal );
                const sourceHandle = connection ? `btn-${ connection.buttonName }` : "bottom";

                this.addEdge( createComponentToModalEdge( compId, modalId, sourceHandle ) );
            } );
        } );
    }

    private buildFlowComponents(): void {
        this.data.flows.forEach( flow => {
            if ( this.reachableFlows.size > 0 && !this.reachableFlows.has( flow.name ) ) {
                return;
            }

            const flowId = this.flowIdMap.get( flow.name );
            if ( !flowId ) {
                return;
            }

            const stateComponents = getFlowStateComponents( flow, this.data.components );

            if ( stateComponents.length > 1 ) {
                this.buildMultiStateFlow( flow, flowId, stateComponents );
            } else {
                this.buildSingleComponentFlow( flow, flowId, stateComponents );
            }
        } );
    }

    private buildMultiStateFlow( flow: UIExportedFlow, flowId: string, stateComponents: FlowStateComponent[] ): void {
        const context: FlowContext = {
            flow,
            flowId,
            stateComponents,
            stateKeys: new Set( stateComponents.map( sc => sc.stateKey ) ),
            stateKeyToIndex: new Map( stateComponents.map( ( sc, i ) => [ sc.stateKey, i ] ) ),
            stateKeyToCompId: new Map(),
            stateKeyToElementRows: new Map(),
            initialStateKey: stateComponents[ 0 ]?.stateKey ?? "",
            wizardConnectedTargets: new Set(),
            flowIdMap: this.flowIdMap
        };

        new MultiStateFlowBuilder( this.allNodes, e => this.addEdge( e ), context ).build();
    }

    private buildSingleComponentFlow( flow: UIExportedFlow, flowId: string, stateComponents: FlowStateComponent[] ): void {
        const initialComp = getInitialComponent( flow, this.data.components );
        if ( !initialComp ) {
            return;
        }

        const stateKey = stateComponents[ 0 ]?.stateKey;
        const stateTransitions = stateComponents[ 0 ]?.transitions;
        const stateOptions = stateComponents[ 0 ]?.options;

        new SingleComponentFlowBuilder( this.allNodes, e => this.addEdge( e ), flow, flowId, this.flowIdMap )
            .build( initialComp, stateKey, stateTransitions, stateOptions );
    }

    private buildSystemFlowTransitions(): void {
        this.data.systemFlows.forEach( systemFlow => {
            const systemFlowId = this.flowIdMap.get( systemFlow.name );
            if ( !systemFlowId || systemFlow.edgeSourceMappings?.length ) {
                return;
            }

            const isCommandsFlow = systemFlow.name.includes( "CommandsFlow" );

            systemFlow.transitions?.forEach( transition => {
                const targetFlowName = transition.to?.split( "/States/" )[ 0 ];
                if ( !targetFlowName ) {
                    return;
                }

                const targetId = this.flowIdMap.get( targetFlowName );
                if ( !targetId ) {
                    return;
                }

                const label = transition.from?.split( "/" ).pop() ?? transition.from ?? "";
                this.addEdge( createSystemFlowTransitionEdge( systemFlowId, targetId, systemFlow.name, targetFlowName, label, isCommandsFlow ) );
            } );
        } );
    }
}

export function buildFlowGraph( moduleFlowsData: ModuleFlowsResponse ): { nodes: Node[]; edges: Edge[] } {
    return new FlowGraphBuilder( moduleFlowsData ).build();
}
