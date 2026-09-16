import zCore from "@zenflux/core";

import { createModuleNode, createFlowNode, createComponentNode, createModalNode } from "@vertix.gg/dashboard/src/features/flow-editor/lib/node-builders";
import { isForeignTo } from "@vertix.gg/dashboard/src/features/flow-editor/lib/module-scope";
import {
    createModuleToFlowEdge,
    createFlowToComponentEdge,
    createComponentToModalEdge,
    createComponentToFlowEdge,
    createHubToFlowEdge,
    createComponentToFlowExitEdge,
    createComponentToComponentEdge,
    createComponentToStateFallbackEdge,
    createModalToComponentEdge,
    createDeclaredTransitionEdge,
    createSystemFlowTransitionEdge
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/edge-builders";
import {
    findButtonFlowConnections,
    findButtonModalConnections,
    findHubComponents,
    getFlowStateComponents,
    getInitialComponent
} from "@vertix.gg/dashboard/src/features/flow-editor/lib/flow-helpers";
import {
    buildElementLabelIndex,
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
    public static resolve(
        component: UIExportedComponent,
        options?: FlowStateComponent[ "options" ],
        previewEmbedsGroup?: string,
        /** True only for the screen the flow opens on; see `extractComponentPreview`. */
        drawsComponentDefaults = true
    ): ComponentPreview {
        const executionStep = typeof options?.[ "executionStep" ] === "string" ? options[ "executionStep" ] : undefined;
        const compPreview = extractComponentPreview(
            component,
            executionStep,
            previewEmbedsGroup,
            this.getPreviewElementsGroup( options ),
            drawsComponentDefaults
        );
        const defaultVars = this.getDefaultVars( options, compPreview.embedDefinition );

        const ephemeral = "ephemeral" === options?.[ "navigationType" ];

        if ( !compPreview.embed ) {
            return {
                ...compPreview,
                ephemeral,
                previewVars: Object.keys( defaultVars ).length > 0 ? defaultVars : undefined
            };
        }

        return {
            ...compPreview,
            ephemeral,
            previewVars: Object.keys( defaultVars ).length > 0 ? defaultVars : undefined,
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

    /** The controls this state draws, where it names a group of its own. */
    public static getPreviewElementsGroup( options?: FlowStateComponent[ "options" ] ): string | undefined {
        const group = options?.[ "previewElementsGroup" ];
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

    private static pickOptionValue( option: NonNullable<UIExportEmbedDefinition[ "options" ]>[ string ] | undefined ): string | undefined {
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

        /*
         * Whether this component draws the button at all.
         *
         * A flow's connections belong to the flow, and a flow with several states draws its
         * component once per state - so every copy was handed every connection, including for
         * buttons only some other state puts on screen. An edge leaving a button the component does
         * not draw has no handle to leave from and is dropped where it is drawn, so the ones that
         * survived were whichever copies happened to carry the button.
         */
        const drawsButton = ( buttonName: string ) =>
            elementRows.some( ( row ) => row.some( ( element ) => element.name === buttonName ) );

        return {
            buttonModalTriggers: buttonModalConnections.map( c => ( {
                buttonName: c.buttonName,
                modalName: c.modalName,
                handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
            } ) ),
            buttonFlowTriggers: buttonFlowConnections
                .filter( ( c ) => drawsButton( c.buttonName ) )
                .map( c => ( {
                    buttonName: c.buttonName,
                    targetFlowName: c.targetFlowName,
                    handlePosition: getButtonHandlePosition( c.buttonName, elementRows, totalRows )
                } ) )
        };
    }
}

const logger = zCore.modules.createLogger( "graph-builder" );

/**
 * Whether a trigger puts a modal up.
 *
 * Two kinds do. A plain `modal` is the form submitted on its own; a `modal-button` is the pairing
 * `bindModalWithButton()` records, where one declaration says both which button opens the form and
 * which form it opens. Nineteen of the bot's pairings are the second kind, and testing only for the
 * first drew every one of them as nothing at all.
 */
function isModalTrigger( trigger: { handlerKind?: string; sourceEntity?: string } ): boolean {
    return ( "modal" === trigger.handlerKind || "modal-button" === trigger.handlerKind )
        && Boolean( trigger.sourceEntity );
}

/**
 * The modal a trigger puts up.
 *
 * A pairing names the control first and the form second, `Button::Modal`, so the whole string names
 * neither - matched against a component's modals it finds none.
 */
function modalNameOf( trigger: { handlerKind?: string; sourceEntity?: string } ): string {
    const entity = trigger.sourceEntity ?? "";

    if ( "modal-button" !== trigger.handlerKind ) {
        return entity;
    }

    return entity.split( "::" )[ 1 ] ?? entity;
}

/**
 * The kinds that are a control on a screen - something a member presses or picks.
 *
 * Listed once. Written out at each use the list was three kinds long, and a picker over the guild's
 * own roles or channels was not among them - so teaching the export to say which picker it is would
 * have dropped those moves off the canvas rather than drawing them correctly.
 */
const CONTROL_HANDLER_KINDS: ReadonlyArray<string> = [
    "button",
    "string-select",
    "user-select",
    "role-select",
    "channel-select",
    "mentionable-select"
];

function isControlKind( handlerKind: string | undefined ): boolean {
    return CONTROL_HANDLER_KINDS.includes( handlerKind ?? "" );
}

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
                this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName, this.context.flow.name ) );
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

            allNodes.push( createModalNode( modalId, modal, modalDef, this.context.flow.name, stateKey ) );

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

            const modalTriggers = t.triggeredBy.filter( isModalTrigger );
            const buttonTrigger = t.triggeredBy.find( tr => tr.handlerKind === "button" && tr.sourceEntity );

            modalTriggers.forEach( modalTrigger => {
                const modalName = modalNameOf( modalTrigger );

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
                if ( isModalTrigger( tr ) ) {
                    modalNames.add( modalNameOf( tr ) );
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
                isControlKind( t.handlerKind )
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
                isControlKind( t.handlerKind )
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
            t.triggeredBy?.some( tr => isControlKind( tr.handlerKind ) )
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
                isControlKind( tr.handlerKind )
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
            const handlerKind = this.controlKindOf( element, mapping.triggeringElementId );

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
            const modalTriggers = ( transition.triggeredBy ?? [] ).filter( isModalTrigger );

            modalTriggers.forEach( ( modalTrigger, idx ) => {
                const modalName = modalNameOf( modalTrigger );

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

                allNodes.push( createModalNode( modalId, modalName, modalDef, flow.name, stateKey ) );

                const sourceHandle = `btn-${ mapping.triggeringElementId }`;
                const edge = createComponentToModalEdge( edgeSourceCompId, modalId, sourceHandle );
                this.addEdge( edge );
            } );
        } );
    }

    /**
     * What kind of control this is, as the control itself declares it.
     *
     * The name is not the fact. Read off the name, a picker over the guild's roles came out as a
     * list the bot wrote, because both end in "Menu" - and the element had said which it was all
     * along. The name answers only where no element is to hand.
     */
    private controlKindOf( element: ElementData | undefined, elementName: string ): string {
        const elementType = element?.definition?.elementType;

        if ( elementType && "unknown" !== elementType ) {
            return "select-menu" === elementType
                ? "string-select"
                : elementType.startsWith( "button" ) ? "button" : elementType;
        }

        return elementName.toLowerCase().includes( "select" ) ? "string-select" : "button";
    }

}

class FlowPatternDetector {
    public static detectModalFirst(
        flow: UIExportedFlow,
        initialStateKey: string,
        initialStateOptions?: Record<string, unknown>
    ): { isModalFirst: boolean; modalName: string | null; targetStateKey: string | null } {
        const executionStep = initialStateOptions?.[ "executionStep" ];
        if ( executionStep !== "default" ) {
            return { isModalFirst: false, modalName: null, targetStateKey: null };
        }

        const fromInitial = flow.transitions.filter( ( transition ) => transition.from === initialStateKey );

        /*
         * Anything else on the first screen that somebody presses and gets somewhere.
         *
         * A flow opens on a modal when its first state is nothing but the way to that modal - the
         * state is never drawn, because there is nothing on it to draw. So a move out of that state
         * attributed to something which is not a modal is proof the state has a screen of its own,
         * and the modal is one of the things standing on it rather than the thing standing in for
         * it.
         *
         * A move with nothing attributed is not evidence either way: those are the outcome branches
         * a submission lands on - a rename's Badword, a status's Cleared - which is exactly the
         * shape a modal-first flow has.
         *
         * Setup is the flow this was wrong about. Its first screen carries two menus, a language
         * button, a server-options button and a bad-words button, and because one of the things it
         * can open is a modal the whole screen was being left undrawn and the modal put in its
         * place - so `/setup` appeared to open a bad words box, and the five things that screen
         * leads to appeared to leave one.
         */
        const hasOtherWayOut = fromInitial.some( ( transition ) =>
            transition.triggeredBy?.length
            && ! transition.triggeredBy.some( ( trigger ) => trigger.handlerKind === "modal" )
        );

        if ( hasOtherWayOut ) {
            return { isModalFirst: false, modalName: null, targetStateKey: null };
        }

        const transitionFromInitial = fromInitial.find( ( transition ) =>
            transition.triggeredBy?.some( ( trigger ) => trigger.handlerKind === "modal" )
        );

        const modalTriggerFromInitial = transitionFromInitial?.triggeredBy?.find( tr => tr.handlerKind === "modal" );

        // Where that modal leads, kept alongside it. Without it the entry was drawn reaching every
        // state in the flow - the modal opens one of them, and saying it opens all of them is not a
        // busier picture of the same thing but a different and untrue one.
        return modalTriggerFromInitial
            ? {
                isModalFirst: true,
                modalName: modalTriggerFromInitial.sourceEntity,
                targetStateKey: transitionFromInitial?.to ?? null
            }
            : { isModalFirst: false, modalName: null, targetStateKey: null };
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
            stateKeys.has( t.to ) && t.triggeredBy?.some( tr => isControlKind( tr.handlerKind ) )
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
    /** Every node either end of an edge of this flow's has landed on. */
    private readonly wiredNodeIds: Set<string> = new Set();

    /** How many moves from the flow's first screen each screen is, at the fewest. */
    private readonly stateDepths: Map<string, number>;

    /** Per screen, the chrome it carries whose line is drawn from somewhere else. */
    private readonly sharedControls: Map<string, string[]> = new Map();

    /** The moves bundled onto a screen instead of drawn, keyed from, to and trigger. */
    private readonly bundledMoves: Set<string> = new Set();

    private readonly initialStateTransitionTriggers: StateTransitionTrigger[] = [];

    public constructor( allNodes: Node[], addEdge: ( edge: Edge ) => void, context: FlowContext ) {
        this.allNodes = allNodes;
        this.context = context;
        this.wizardAnalyzer = new WizardAnalyzer( context );

        const trackingAddEdge = ( edge: Edge ) => {
            this.wiredNodeIds.add( edge.source );
            this.wiredNodeIds.add( edge.target );
            addEdge( edge );
        };

        this.addEdge = trackingAddEdge;
        this.edgeBuilder = new EdgeBuilder( trackingAddEdge, context );

        this.stateDepths = MultiStateFlowBuilder.computeStateDepths( context );

        this.bundleSharedControls();
    }

    /**
     * How far each screen is from the one the flow opens at.
     *
     * Breadth first, so a screen's depth is the fewest moves that reach it. Used to tell a move
     * that goes on through the flow from one that returns to somewhere it has already been, which
     * is what decides both whether the layout should rank by it and, of several screens carrying
     * the same control, which one the line gets drawn from.
     */
    private static computeStateDepths( context: FlowContext ): Map<string, number> {
        const depths = new Map<string, number>( [ [ context.initialStateKey, 0 ] ] ),
            queue: string[] = [ context.initialStateKey ];

        while ( queue.length > 0 ) {
            const current = queue.shift()!,
                currentDepth = depths.get( current ) ?? 0;

            ( context.flow.transitions ?? [] )
                .filter( ( transition ) => transition.from === current && context.stateKeys.has( transition.to ) )
                .forEach( ( transition ) => {
                    if ( depths.has( transition.to ) ) {
                        return;
                    }

                    depths.set( transition.to, currentDepth + 1 );
                    queue.push( transition.to );
                } );
        }

        return depths;
    }

    /**
     * The flow's chrome, drawn once instead of from every screen that carries it.
     *
     * A control on four or more of a flow's screens that leads to the same one place from each of
     * them is not a step in the flow, it is the frame around it. The templates panel has four of
     * these - Apply, Manage, Capture and Back - on every screen it owns, which was twenty lines
     * saying four things, each drawn the height of the canvas.
     *
     * Four rather than three, because at three a flow is often the state machine itself rather than
     * chrome around one: the privacy menu's public, private and hidden all reach each other, and
     * those lines are the whole shape of the thing. By four screens a control is plainly the frame.
     *
     * The line is kept from the screen nearest the way in, where it reads as going somewhere rather
     * than coming back. Every other screen carrying it says so on the screen itself.
     */
    private bundleSharedControls(): void {
        const SHARED_CONTROL_SCREENS = 4;

        const sources = new Map<string, { trigger: string; to: string; from: string[] }>();

        ( this.context.flow.transitions ?? [] ).forEach( ( transition ) => {
            const { from, to } = transition;

            if ( ! from || ! to || from === to || ! this.context.stateKeys.has( to ) ) {
                return;
            }

            const trigger = transition.triggeredBy?.[ 0 ]?.sourceEntity;

            if ( ! trigger ) {
                return;
            }

            const key = `${ trigger }|${ to }`,
                existing = sources.get( key ) ?? { trigger, to, from: [] };

            if ( ! existing.from.includes( from ) ) {
                existing.from.push( from );
            }

            sources.set( key, existing );
        } );

        sources.forEach( ( { trigger, to, from } ) => {
            if ( from.length < SHARED_CONTROL_SCREENS ) {
                return;
            }

            const nearest = [ ...from ].sort( ( a, b ) =>
                ( this.stateDepths.get( a ) ?? Number.MAX_SAFE_INTEGER ) - ( this.stateDepths.get( b ) ?? Number.MAX_SAFE_INTEGER )
            )[ 0 ];

            const shortTrigger = trigger.split( "/" ).pop() ?? trigger,
                shortTarget = to.split( "/" ).pop() ?? to;

            from.filter( ( stateKey ) => stateKey !== nearest ).forEach( ( stateKey ) => {
                this.bundledMoves.add( `${ stateKey }|${ to }|${ trigger }` );

                const carried = this.sharedControls.get( stateKey ) ?? [];

                carried.push( `${ shortTrigger } → ${ shortTarget }` );
                this.sharedControls.set( stateKey, carried );
            } );
        } );
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

        this.buildStateNodes( modalFirst.isModalFirst, modalFirstNodeId, modalFirst.targetStateKey );

        this.computeWizardConnectedTargets();

        this.addDeclaredTransitionEdges( modalFirstNodeId );

        this.addEdgesToStrandedScreens();
    }

    /**
     * The flow leads to the screens nothing at all leads to.
     *
     * Run last, once every other edge is in, and only for a screen with no line on it in either
     * direction - a box drawn on the canvas and then left beside the flow it belongs to. A screen
     * that has somewhere to go is not stranded even if nothing declares the way in, and is left as
     * it is rather than given a line that says less than the ones it already has.
     *
     * The stranded ones are commands that work out which screen applies before they open anything.
     * `/voice clear-chat` says how many it cleared, or that there was nothing to clear, or that it
     * went wrong - three answers to the one question, none of them reached from either of the
     * others, and each an end in itself. `/voice invite` opens at the channel picker or at "you own
     * no channel". Nine of these across v2 and v3, floating, because the only rule for hanging a
     * screen off its flow was being the first one listed.
     *
     * That the flow leads there is the whole of what is known. Which of the answers applies is
     * decided inside the command and written down nowhere the canvas can read, so a line from the
     * flow is as much as can be said without inventing the reason.
     */
    private addEdgesToStrandedScreens(): void {
        this.context.stateComponents.forEach( ( stateComp ) => {
            const compId = this.context.stateKeyToCompId.get( stateComp.stateKey );

            if ( ! compId || this.wiredNodeIds.has( compId ) ) {
                return;
            }

            this.addEdge( createFlowToComponentEdge( this.context.flowId, compId, this.context.flow.name ) );
        } );
    }

    /**
     * Every move the flow says it makes, drawn as the flow writes it.
     *
     * This replaces working the moves out from the shape of the screens - which menus a state has,
     * which buttons look like a wizard's, which state nothing else reached. That guessing is what
     * had the canvas asserting things the bot never said: one modal opening nine screens, buttons
     * leaving components that do not draw them, six facts drawn thirty-five times.
     *
     * A transition with nothing bound to it is still drawn, faintly and saying so. Nearly half of
     * them are like that, and the gap is worth seeing - it is where the flow definitions have not
     * said what causes the move, and no amount of looking at the screens will tell anybody.
     *
     * Self transitions are left out here. They are the commonest interaction of all and an arrow
     * leaving a box for itself shows none of them; they belong on the screen they act upon.
     */
    /**
     * The moves this state makes to itself, named by what causes them.
     *
     * Deduplicated: the same control can be declared more than once against a state, and the screen
     * only needs telling about it once.
     */
    private getSelfTransitionsFor( stateKey: string ): string[] {
        const names = ( this.context.flow.transitions ?? [] )
            .filter( ( transition ) => transition.from === stateKey && transition.to === stateKey )
            .map( ( transition ) => transition.triggeredBy?.[ 0 ]?.sourceEntity?.split( "/" ).pop() ?? "not attributed" );

        return [ ...new Set( names ) ];
    }

    private elementLabels: Map<string, string> | undefined;

    /**
     * What the control says on it, for an arrow that control causes.
     *
     * Falls back to the control's own name where it says nothing a member reads - a menu with
     * neither a label nor a placeholder, or an element this flow's components do not draw.
     */
    private controlLabelFor( sourceEntity: string | undefined ): string | undefined {
        if ( ! sourceEntity ) {
            return undefined;
        }

        if ( ! this.elementLabels ) {
            this.elementLabels = buildElementLabelIndex(
                this.context.stateComponents.map( ( stateComp ) => stateComp.component )
            );
        }

        // `Button::Modal`, as a modal opened by a button is recorded. The control is the button;
        // the modal is what it puts up.
        const element = sourceEntity.split( "::" )[ 0 ] ?? sourceEntity;

        return this.elementLabels.get( element ) ?? element.split( "/" ).pop();
    }

    private addDeclaredTransitionEdges( modalFirstNodeId?: string ): void {
        ( this.context.flow.transitions ?? [] ).forEach( ( transition ) => {
            const { from, to } = transition;

            if ( ! from || ! to || from === to ) {
                return;
            }

            if ( ! this.context.stateKeys.has( from ) || ! this.context.stateKeys.has( to ) ) {
                return;
            }

            /*
             * A flow that opens on a modal has no component for its first state - the modal stands
             * in for it, and the state is never drawn. Moves out of that state are still moves, so
             * they leave from the thing that is standing there.
             *
             * Without this they left from nothing and were dropped, which stranded every screen the
             * first state is the only route to: a rename's Badword and RateLimited, a status's
             * Cleared, an lfm's Cooldown. Twenty-three of them across v2 and v3, floating.
             */
            const sourceId = this.context.stateKeyToCompId.get( from )
                    ?? ( from === this.context.initialStateKey ? modalFirstNodeId : undefined ),
                targetId = this.context.stateKeyToCompId.get( to );

            if ( ! sourceId || ! targetId ) {
                return;
            }

            const trigger = transition.triggeredBy?.[ 0 ]?.sourceEntity;

            // Chrome this screen carries but does not get the line for - it is listed on the screen
            // instead, and drawn once from the screen nearest the way in.
            if ( trigger && this.bundledMoves.has( `${ from }|${ to }|${ trigger }` ) ) {
                return;
            }

            // Where the move goes back to somewhere the flow has already been, so the layout can
            // stop ranking by it. Equal depth counts: two screens a control moves between sideways
            // rank each other in a circle, which a ranking cannot satisfy either.
            const isBackEdge = ( this.stateDepths.get( to ) ?? 0 ) <= ( this.stateDepths.get( from ) ?? 0 );

            const triggerName = this.controlLabelFor( trigger );

            // What the bot looked at to take this branch, where nobody pressed anything. Declared
            // beside the transition, so a branch reads as its condition rather than as an omission.
            const condition = transition.previewCondition,
                outcomeCondition = condition
                    ? `${ condition.field } = ${ condition.value ?? condition.operator }`
                    : undefined;

            /*
             * Left from the control that fires it, where that control is drawn on this screen.
             *
             * Where it is not - a move the bot makes on its own, or a control belonging to a screen
             * this one only stands in for - the screen's own handle at the bottom, rather than
             * leaving react flow to pick one of the buttons and point the line at the wrong thing.
             *
             * Only for a screen. A modal standing in for one has no button handles to choose badly
             * between, and naming one it does not have would draw nothing at all.
             */
            const leavesAScreen = Boolean( this.context.stateKeyToCompId.get( from ) ),
                firesFromElement = trigger
                    && ( this.context.stateKeyToElementRows.get( from ) ?? [] ).flat()
                        .some( ( element ) => element.name === trigger ),
                sourceHandle = leavesAScreen
                    ? ( firesFromElement ? `btn-${ trigger }` : "bottom" )
                    : undefined;

            this.addEdge( createDeclaredTransitionEdge( sourceId, targetId, from, to, triggerName, outcomeCondition, isBackEdge, sourceHandle ) );
        } );
    }

    private precomputeElementRows(): void {
        this.context.stateComponents.forEach( stateComp => {
            const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateComp.options );
            const compPreview = PreviewResolver.resolve(
                stateComp.component,
                stateComp.options,
                previewEmbedsGroup,
                stateComp.stateKey === this.context.initialStateKey
            );

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
        const modalDef = initialComp?.modalDefinitions?.find( m => m.name === modalName );

        this.allNodes.push( createModalNode( modalId, modalName, modalDef, this.context.flow.name, this.context.initialStateKey ) );
        this.addEdge( createFlowToComponentEdge( this.context.flowId, modalId, this.context.flow.name ) );

        return modalId;
    }

    private buildStateNodes(
        isModalFirst: boolean,
        modalFirstNodeId: string | undefined,
        modalFirstTargetStateKey: string | null
    ): void {
        this.context.stateComponents.forEach( ( stateComp, stepIndex ) => {
            if ( isModalFirst && stepIndex === 0 ) {
                return;
            }

            const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateComp.options );
            const compPreview = PreviewResolver.resolve(
                stateComp.component,
                stateComp.options,
                previewEmbedsGroup,
                stateComp.stateKey === this.context.initialStateKey
            );
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
                `${ stateComp.stateName }\n${ stateComp.component.name }`,
                stateComp.stateKey,
                this.context.flow.name,
                this.getSelfTransitionsFor( stateComp.stateKey ),
                this.sharedControls.get( stateComp.stateKey ) ?? []
            ) );

            this.addEdgesForState( stepIndex, compId, isModalFirst, modalFirstNodeId, stateComp, modalFirstTargetStateKey );

            if ( !isModalFirst ) {
                this.edgeBuilder.addModalEdges( this.allNodes, compId, compPreview, buttonModalConnections, stateComp.stateKey );
            }
            this.edgeBuilder.addSelfTransitionModalEdges( this.allNodes, stateComp.stateKey, compId, compPreview );
            this.edgeBuilder.addButtonFlowEdges( compId, buttonFlowTriggers );

        } );
    }

    private getModalConnections( stateComp: FlowStateComponent, compPreview: ComponentPreview ): ButtonModalConnection[] {
        const connections = findButtonModalConnections( this.context.flow, compPreview.modals, stateComp.stateKey );

        if ( connections.length || ! compPreview.modals.length ) {
            return connections;
        }

        /*
         * Nothing declared says this screen opens a modal, so the moves out of it are read again
         * for a button and a modal fired together.
         *
         * What used to follow this was a guess: a screen with no moves of its own had its
         * component's modals matched against its buttons by name, and whatever the names had in
         * common was drawn as though the flow had said it. A wizard's "too many generators" and
         * "something went wrong" screens both came out offering to edit a channel name template,
         * which neither of them does and nothing ever claimed they did.
         *
         * Taken away it costs nothing: every screen that truly offers a modal is named by a
         * declaration, and those two stop saying otherwise.
         */
        return this.findStateModalConnections( stateComp.stateKey, compPreview.modals );
    }

    private findStateModalConnections( stateKey: string, componentModals: string[] ): ButtonModalConnection[] {
        const connections: ButtonModalConnection[] = [];

        this.context.flow.transitions?.forEach( t => {
            if ( t.from !== stateKey || !t.triggeredBy ) {
                return;
            }

            const modalTriggers = t.triggeredBy.filter( isModalTrigger );
            const buttonTrigger = t.triggeredBy.find( tr => tr.handlerKind === "button" && tr.sourceEntity );

            modalTriggers.forEach( modalTrigger => {
                const modalName = modalNameOf( modalTrigger );

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
                if ( ! isControlKind( trigger.handlerKind ) ) {
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
        isModalFirst: boolean,
        modalFirstNodeId: string | undefined,
        stateComp: FlowStateComponent,
        modalFirstTargetStateKey: string | null
    ): void {
        // Only the state the modal actually transitions to. The flow being modal first says nothing
        // about any of the others, and drawing it at each of them had one entry claiming to open
        // every screen in the flow.
        if ( isModalFirst && modalFirstNodeId && stateComp.stateKey === modalFirstTargetStateKey ) {
            this.addEdge( createModalToComponentEdge( modalFirstNodeId, compId, this.context.flow.name, stateComp.stateName ) );
        } else if ( stepIndex === 0 ) {
            this.addEdge( createFlowToComponentEdge( this.context.flowId, compId, this.context.flow.name ) );
        }
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

    public build( initialComp: UIExportedComponent, stateKey?: string, stateOptions?: FlowStateComponent[ "options" ] ): void {
        const previewEmbedsGroup = PreviewResolver.getPreviewEmbedsGroup( stateOptions );
        const compPreview = PreviewResolver.resolve( initialComp, stateOptions, previewEmbedsGroup );
        const compId = `comp-${ this.flow.name }-${ initialComp.name }`;

        const buttonModalConnections = findButtonModalConnections( this.flow, compPreview.modals, stateKey );

        const buttonFlowConnections = findButtonFlowConnections( this.flow );
        const { buttonModalTriggers, buttonFlowTriggers } = TriggerBuilder.build( buttonModalConnections, buttonFlowConnections, compPreview.elementRows );

        this.allNodes.push( createComponentNode( compId, compPreview, buttonModalTriggers, buttonFlowTriggers, [], undefined, stateKey, this.flow.name ) );
        this.addEdge( createFlowToComponentEdge( this.flowId, compId, this.flow.name ) );

        buttonFlowTriggers.forEach( trigger => {
            if ( trigger.targetFlowName === this.flow.name ) {
                return;
            }
            const targetFlowId = this.flowIdMap.get( trigger.targetFlowName );
            if ( targetFlowId ) {
                this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName, this.flow.name ) );
            }
        } );

        const sortedModals = sortModalsByButtonOrder( compPreview.modals, buttonModalConnections, compPreview.elementRows );
        sortedModals.forEach( ( modal, idx ) => {
            const modalId = `modal-${ compId }-${ idx }`;
            const modalDef = compPreview.modalDefinitions.find( m => m.name === modal );

            this.allNodes.push( createModalNode( modalId, modal, modalDef, this.flow.name, stateKey ) );

            const connection = buttonModalConnections.find( c => c.modalName === modal );
            const sourceHandle = connection ? `btn-${ connection.buttonName }` : "bottom";

            this.addEdge( createComponentToModalEdge( compId, modalId, sourceHandle ) );
        } );
    }
}

class FlowGraphBuilder {
    private readonly data: ModuleFlowsResponse;
    private readonly includesExtraModules: boolean;
    private readonly hiddenSystemFlows: Set<string>;
    private readonly allNodes: Node[] = [];
    private readonly allEdges: Edge[] = [];
    private readonly edgeIds = new Set<string>();
    private readonly flowIdMap = new Map<string, string>();
    private readonly systemFlowCompIds = new Map<string, string>();
    private readonly reachableFlows = new Set<string>();
    private readonly routedFlows = new Set<string>();

    public constructor( data: ModuleFlowsResponse, options?: FlowGraphOptions ) {
        this.data = data;
        this.includesExtraModules = options?.includesExtraModules ?? false;
        this.hiddenSystemFlows = new Set( options?.hiddenSystemFlows ?? [] );
    }

    /**
     * Whether a flow is somebody else's and the reader has not asked to see those.
     *
     * A module's canvas pulls in whatever it hands off to, and that belongs to another module. It
     * is worth drawing when somebody is following the path across and worth leaving out when they
     * are reading this module, so it is a question rather than a rule.
     */
    private isHiddenExtraModule( flowName: string ): boolean {
        return ! this.includesExtraModules && isForeignTo( flowName, this.data.module );
    }

    public build(): { nodes: Node[]; edges: Edge[] } {
        this.computeReachableFlows();
        this.computeRoutedFlows();
        this.buildModuleNode();
        this.buildSystemFlowNodes();
        this.buildFlowNodes();
        this.buildSystemFlowComponents();
        this.buildFlowComponents();
        this.buildOrphanComponents();
        this.buildSystemFlowTransitions();
        this.markModuleEdgesRoutedElsewhere();

        return { nodes: this.allNodes, edges: this.allEdges };
    }

    private computeReachableFlows(): void {
        const result = computeReachableFlows( this.data );

        result.forEach( name => this.reachableFlows.add( name ) );
    }

    private isSystemFlowDrawn( flowName: string ): boolean {
        return ! this.hiddenSystemFlows.has( flowName );
    }

    /**
     * The module's line to a flow something else already reaches, taken away.
     *
     * A flow is arrived at by a router, or by a button on some other flow's screen. Either way
     * something on the canvas already shows how it is reached, and the module's own line is the
     * same arrival said twice. What is left is the flows nothing else reaches - which is the only
     * case where the module is the thing that explains them.
     *
     * Read off the edges actually drawn rather than worked out beforehand: a button's route is only
     * known once the components have been built, and a router that has been put away must not go on
     * suppressing the line its flows now depend on.
     */
    private markModuleEdgesRoutedElsewhere(): void {
        const reached = new Set<string>();

        this.allEdges.forEach( ( edge ) => {
            if ( edge.id.startsWith( "edge-btn-flow-" ) ) {
                reached.add( edge.target );
            }
        } );

        this.routedFlows.forEach( ( flowName ) => {
            const flowId = this.flowIdMap.get( flowName );

            if ( flowId ) {
                reached.add( flowId );
            }
        } );

        /*
         * A router is the module's own, whoever else reaches it.
         *
         * One router routing to another - a command opening the control panel - would otherwise
         * take away the module's line to it, and a module standing apart from the routers it
         * declares is not a truer picture, it is a wrong one. The module is where they come from.
         */
        const systemFlowIds = new Set(
            this.data.systemFlows
                .map( ( flow ) => this.flowIdMap.get( flow.name ) )
                .filter( ( id ): id is string => Boolean( id ) )
        );

        this.allEdges.forEach( ( edge ) => {
            if ( edge.id.startsWith( "edge-module-" ) && reached.has( edge.target ) && ! systemFlowIds.has( edge.target ) ) {
                edge.hidden = true;
            }
        } );
    }

    /**
     * The flows the routers reach.
     *
     * Counted from the routers actually drawn, so putting one away hands its flows back to the
     * module rather than leaving them floating with nothing attached.
     */
    private computeRoutedFlows(): void {
        this.data.systemFlows
            .filter( ( flow ) => this.isSystemFlowDrawn( flow.name ) )
            .forEach( ( flow ) => {
                flow.transitions?.forEach( ( transition ) => {
                    const target = transition.to?.split( "/States/" )[ 0 ];

                    if ( target ) {
                        this.routedFlows.add( target );
                    }
                } );

                flow.handoffPoints?.forEach( ( handoff ) => {
                    if ( handoff.flowName ) {
                        this.routedFlows.add( handoff.flowName );
                    }
                } );

                flow.edgeSourceMappings?.forEach( ( mapping ) => {
                    if ( mapping.targetFlowName ) {
                        this.routedFlows.add( mapping.targetFlowName );
                    }
                } );
            } );
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

        this.data.systemFlows.filter( ( flow ) => this.isSystemFlowDrawn( flow.name ) ).forEach( flow => {
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

            if ( this.isHiddenExtraModule( flow.name ) ) {
                return;
            }

            const flowNode = createFlowNode( flow, false );
            this.flowIdMap.set( flow.name, flowNode.id );
            this.allNodes.push( flowNode );

            // Drawn for every flow, and taken away again below wherever something else already
            // shows how the flow is reached.
            this.addEdge( createModuleToFlowEdge( moduleNodeId, flowNode.id, flow.name ) );
        } );
    }

    private buildSystemFlowComponents(): void {
        this.data.systemFlows.filter( ( flow ) => this.isSystemFlowDrawn( flow.name ) ).forEach( flow => {
            const flowId = this.flowIdMap.get( flow.name )!;
            const hubComponents = findHubComponents( flow, this.data.components );

            if ( hubComponents.length ) {
                this.buildHubComponents( flow, flowId, hubComponents );
                return;
            }

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
            this.addEdge( createFlowToComponentEdge( flowId, compId, flow.name ) );

            buttonFlowTriggers.forEach( trigger => {
                if ( trigger.targetFlowName === flow.name ) {
                    return;
                }
                const targetFlowId = this.flowIdMap.get( trigger.targetFlowName );
                if ( targetFlowId ) {
                    this.addEdge( createComponentToFlowEdge( compId, targetFlowId, trigger.buttonName, trigger.targetFlowName, flow.name ) );
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

    /**
     * A router drawn with the screens it is pressed from, and the lines those presses make.
     *
     * The mappings say which control opens which flow; the screen carrying those controls is found
     * by the control ids themselves. Both halves were exported all along and nothing joined them,
     * so the router drew a screen picked for having "DynamicChannel" somewhere in its name - which
     * landed on the notice telling a member they have no channel - while the fifteen-button message
     * the buttons are actually on sat apart from the canvas with nothing attached to it.
     *
     * Each mapping is drawn from the screen that carries its control rather than from the router,
     * so what the canvas shows is the press: this button, on this screen, opens that flow.
     */
    private buildHubComponents( flow: UIExportedFlow, flowId: string, hubComponents: UIExportedComponent[] ): void {
        hubComponents.forEach( ( hubComponent, index ) => {
            const compPreview = extractComponentPreview( hubComponent );
            const compId = `comp-sys-${ flow.name }-${ hubComponent.name }`;

            if ( 0 === index ) {
                this.systemFlowCompIds.set( flow.name, compId );
            }

            const buttonModalConnections = findButtonModalConnections( flow, compPreview.modals );
            const buttonFlowConnections = findButtonFlowConnections( flow );
            const { buttonModalTriggers, buttonFlowTriggers } = TriggerBuilder.build( buttonModalConnections, buttonFlowConnections, compPreview.elementRows );

            this.allNodes.push( createComponentNode(
                compId,
                compPreview,
                buttonModalTriggers,
                buttonFlowTriggers,
                [],
                undefined,
                undefined,
                flow.name
            ) );
            this.addEdge( createFlowToComponentEdge( flowId, compId, flow.name ) );

            /*
             * A variant's own lines left out, the variant itself kept.
             *
             * The panel shown in the master channel carries the same grid as the channel's own
             * message and its adapter says so, which is why the bot generates no second flow for
             * it. Drawing its fifteen as well would put back exactly the duplicate that
             * declaration exists to prevent - so it keeps the one line saying the router opens it,
             * and the moves are read off the screen that owns them.
             */
            if ( true === hubComponent.routesDrawnElsewhere ) {
                return;
            }

            const elementNames = new Set( compPreview.elementRows.flat().map( element => element.name ) );

            flow.edgeSourceMappings?.forEach( mapping => {
                if ( mapping.targetFlowName === flow.name || ! elementNames.has( mapping.triggeringElementId ) ) {
                    return;
                }

                const targetFlowId = this.flowIdMap.get( mapping.targetFlowName );

                if ( targetFlowId ) {
                    this.addEdge( createHubToFlowEdge( compId, targetFlowId, mapping.triggeringElementId, mapping.targetFlowName ) );
                }
            } );
        } );
    }

    /**
     * The screens no flow names, drawn anyway.
     *
     * A third of the components are in this state. Twelve are the product's refusals - the screen a
     * member gets for acting on a channel that is not theirs, or for a command in the wrong place,
     * or the one that names the three permissions the bot is missing. They ship, they have real
     * embeds, and no flow declares which failed check leads to them, so nothing put them on the
     * canvas. The rest are screens the bot draws constantly - the channel control panel among them -
     * which say more about the export than about the screens.
     *
     * Either way the sidebar lists them, and clicking one found no node and did nothing at all. A
     * dead click reads as a broken editor, and a screen nobody can reach is exactly the sort of
     * thing a person opens this editor to find.
     *
     * Drawn from the component's own defaults, because an orphan has no state to say otherwise -
     * which is the one case where the component's usual controls genuinely are what it puts up.
     */
    private buildOrphanComponents(): void {
        const drawn = new Set<string>();

        this.data.flows.forEach( ( flow ) => {
            flow.states?.forEach( ( state ) => {
                const component = state.options?.[ "component" ];

                if ( "string" === typeof component ) {
                    drawn.add( component );
                }

                /*
                 * A wizard step is its step component, whatever the state calls its host.
                 *
                 * Each of the six setup steps is one state of the wizard, and the state names the
                 * wizard as its component and the step as its execution step - the step is where
                 * its buttons and its wording come from. Read for the component alone, all six
                 * looked like screens no flow draws, and each was given a second node beside the
                 * step it already is.
                 */
                const executionStep = state.options?.[ "executionStep" ];

                if ( "string" === typeof executionStep ) {
                    drawn.add( executionStep );
                }
            } );
        } );

        this.data.systemFlows.forEach( ( flow ) => {
            findHubComponents( flow, this.data.components ).forEach( ( component ) => {
                drawn.add( component.name );
            } );
        } );

        this.data.components.forEach( ( component ) => {
            if ( drawn.has( component.name ) || this.isHiddenExtraModule( component.name ) ) {
                return;
            }

            const compPreview = PreviewResolver.resolve( component, undefined, undefined, true );

            this.allNodes.push( createComponentNode(
                `comp-orphan-${ component.name }`,
                compPreview,
                [],
                [],
                [],
                component.name.split( "/" ).pop() ?? component.name
            ) );
        } );
    }

    private buildFlowComponents(): void {
        this.data.flows.forEach( flow => {
            if ( this.reachableFlows.size > 0 && !this.reachableFlows.has( flow.name ) ) {
                return;
            }

            if ( this.isHiddenExtraModule( flow.name ) ) {
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
            /*
             * The state the flow says it opens on, not the first one it happens to list.
             *
             * Every flow declares `initialState`, and eight of the fifty-six open on a state that
             * is not first in the list - the permissions, transfer, invite, knock and templates
             * flows among them. Taken from the order, those eight have their opening screen, their
             * wizard step numbering and their whole layout worked out from the wrong node.
             */
            initialStateKey: ( "string" === typeof flow.initialState && flow.initialState )
                || stateComponents[ 0 ]?.stateKey
                || "",
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
        const stateOptions = stateComponents[ 0 ]?.options;

        new SingleComponentFlowBuilder( this.allNodes, e => this.addEdge( e ), flow, flowId, this.flowIdMap )
            .build( initialComp, stateKey, stateOptions );
    }

    private buildSystemFlowTransitions(): void {
        this.data.systemFlows.filter( ( flow ) => this.isSystemFlowDrawn( flow.name ) ).forEach( systemFlow => {
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

export function computeReachableFlows( data: Pick<ModuleFlowsResponse, "flows" | "systemFlows"> ): Set<string> {
    const reachableFlows = new Set<string>();
    const flowNames = new Set( data.flows.map( f => f.name ) );

    data.systemFlows.forEach( systemFlow => {
        systemFlow.transitions?.forEach( t => {
            const targetFlowName = t.to?.split( "/States/" )[ 0 ];
            if ( targetFlowName && flowNames.has( targetFlowName ) ) {
                reachableFlows.add( targetFlowName );
            }
        } );

        systemFlow.handoffPoints?.forEach( hp => {
            if ( hp.flowName && flowNames.has( hp.flowName ) ) {
                reachableFlows.add( hp.flowName );
            }
        } );

        systemFlow.edgeSourceMappings?.forEach( esm => {
            if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) ) {
                reachableFlows.add( esm.targetFlowName );
            }
        } );
    } );

    data.flows.forEach( flow => {
        flow.handoffPoints?.forEach( hp => {
            if ( hp.flowName && flowNames.has( hp.flowName ) ) {
                if ( reachableFlows.has( flow.name ) ) {
                    reachableFlows.add( hp.flowName );
                }
            }
        } );

        flow.edgeSourceMappings?.forEach( esm => {
            if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) ) {
                if ( reachableFlows.has( flow.name ) ) {
                    reachableFlows.add( esm.targetFlowName );
                }
            }
        } );
    } );

    let changed = true;
    while ( changed ) {
        changed = false;

        data.flows.forEach( flow => {
            if ( !reachableFlows.has( flow.name ) ) {
                return;
            }

            flow.handoffPoints?.forEach( hp => {
                if ( hp.flowName && flowNames.has( hp.flowName ) && !reachableFlows.has( hp.flowName ) ) {
                    reachableFlows.add( hp.flowName );
                    changed = true;
                }
            } );

            flow.edgeSourceMappings?.forEach( esm => {
                if ( esm.targetFlowName && flowNames.has( esm.targetFlowName ) && !reachableFlows.has( esm.targetFlowName ) ) {
                    reachableFlows.add( esm.targetFlowName );
                    changed = true;
                }
            } );
        } );
    }

    return reachableFlows;
}

export interface FlowGraphOptions {
    /** Whether to draw the flows this module hands off to, which other modules own. */
    includesExtraModules?: boolean;

    /**
     * The routers to leave out, by name.
     *
     * A system flow is the way in from outside the interface - a slash command, a guild event, the
     * control panel. Each reaches many flows by its nature, so each is a screen's worth of noise on
     * its own, and they are put away one at a time rather than all together.
     */
    hiddenSystemFlows?: string[];
}

export function buildFlowGraph(
    moduleFlowsData: ModuleFlowsResponse,
    options?: FlowGraphOptions
): { nodes: Node[]; edges: Edge[] } {
    return new FlowGraphBuilder( moduleFlowsData, options ).build();
}
