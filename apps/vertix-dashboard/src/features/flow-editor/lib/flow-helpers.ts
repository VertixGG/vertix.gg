import { flowResolveChoices, flowStateShortName } from "@vertix.gg/flow";

import type { UIExportedFlow, UIExportedComponent } from "@vertix.gg/definitions/src/ui-export-definitions";

export interface ButtonModalConnection {
    buttonName: string;
    buttonLabel: string;
    modalName: string;
}

export interface ButtonFlowConnection {
    buttonName: string;
    targetFlowName: string;
    transition: string;
}

export interface FlowStateComponent {
    stateKey: string;
    stateName: string;
    component: UIExportedComponent;
    order: number;
    options?: Record<string, unknown>;
    transitions?: string[];
}

/**
 * Function findButtonFlowConnections() :: Which button carries you out of this flow, and into what.
 *
 * The join itself lives in `@vertix.gg/definitions`, where the website's demonstrations read it
 * from too - there is one answer to "what can be pressed here" and both surfaces should get it.
 */
export function findButtonFlowConnections( flow: UIExportedFlow ): ButtonFlowConnection[] {
    return flowResolveChoices( flow ).map( ( choice ) => ( {
        buttonName: choice.elementId,
        targetFlowName: choice.targetFlow,
        transition: choice.transition
    } ) );
}

/**
 * Function findButtonModalConnections() :: Which button on a screen opens which modal.
 *
 * `fromStateKey` is the screen being asked about, and only the moves leaving it are read. It used
 * to be handed the state's list of outgoing transition *names* and compare those against a
 * transition's `from`, which is a state *key* - two different things that never matched. So a
 * screen with moves of its own found nothing, and a screen with none fell through the emptiness
 * check to no filter at all and collected every modal in the flow. That is how a wizard's
 * "too many generators" and "something went wrong" screens came to offer a name editor.
 *
 * Left out, every move in the flow is read, which is for a caller that has no screen to ask about.
 */
export function findButtonModalConnections(
    flow: UIExportedFlow,
    componentModals: string[],
    fromStateKey?: string
): ButtonModalConnection[] {
    const connections: ButtonModalConnection[] = [];

    const filteredTransitions = fromStateKey
        ? flow.transitions?.filter( t => t.from === fromStateKey )
        : flow.transitions;

    filteredTransitions?.forEach( transition => {
        transition.triggeredBy?.forEach( trigger => {
            if ( trigger.handlerKind === "modal-button" && trigger.sourceEntity.includes( "::" ) ) {
                const [ buttonPart, modalPart ] = trigger.sourceEntity.split( "::" );
                const matchedModal = componentModals.find( m => m === modalPart || m.endsWith( "/" + modalPart.split( "/" ).pop() ) );

                if ( matchedModal ) {
                    const buttonShortName = buttonPart.split( "/" ).pop() ?? buttonPart;
                    connections.push( {
                        buttonName: buttonPart,
                        buttonLabel: buttonShortName.replace( /Button$/, "" ).replace( /([a-z])([A-Z])/g, "$1 $2" ),
                        modalName: matchedModal
                    } );
                }

                return;
            }

            if ( trigger.handlerKind === "button" ) {
                const transitionName = transition.from?.split( "/" ).pop() ?? "";

                if ( !transitionName.toLowerCase().includes( "modal" ) ) {
                    return;
                }

                const modalPattern = transitionName
                    .replace( /^Open/, "" )
                    .replace( /Modal$/, "" )
                    .toLowerCase();

                const matchedModal = componentModals.find( modal => {
                    const modalShort = modal.split( "/" ).pop()?.replace( /Modal$/, "" ).toLowerCase() ?? "";
                    return modalShort === modalPattern || modalShort.includes( modalPattern ) || modalPattern.includes( modalShort );
                } );

                if ( matchedModal ) {
                    const buttonShortName = trigger.sourceEntity.split( "/" ).pop() ?? trigger.sourceEntity;
                    connections.push( {
                        buttonName: trigger.sourceEntity,
                        buttonLabel: buttonShortName.replace( /Button$/, "" ).replace( /([a-z])([A-Z])/g, "$1 $2" ),
                        modalName: matchedModal
                    } );
                }
            }
        } );
    } );

    return connections;
}

export function getFlowStateComponents( flow: UIExportedFlow, allComponents: UIExportedComponent[] ): FlowStateComponent[] {
    const stateComponents: FlowStateComponent[] = [];

    flow.states.forEach( ( state, index ) => {
        const optionComponent = typeof state.options?.[ "component" ] === "string"
            ? state.options[ "component" ]
            : null;

        const resolvedComponentName = optionComponent ?? state.component;

        if ( !resolvedComponentName ) {
            return;
        }

        const component = allComponents.find( c => c.name === resolvedComponentName );
        if ( !component ) {
            return;
        }

        const stateName = flowStateShortName( state.key );

        stateComponents.push( {
            stateKey: state.key,
            stateName,
            component,
            order: index,
            options: state.options,
            transitions: state.transitions
        } );
    } );

    return stateComponents;
}

export function getInitialComponent( flow: UIExportedFlow, allComponents: UIExportedComponent[] ): UIExportedComponent | null {
    const stateComponents = getFlowStateComponents( flow, allComponents );

    if ( stateComponents.length > 0 ) {
        return stateComponents[ 0 ].component;
    }

    const initialState = flow.states.find( state => state.key === flow.initialState );

    const initialOptionComponent = typeof initialState?.options?.[ "component" ] === "string"
        ? initialState.options[ "component" ]
        : null;

    const resolvedInitialComponentName = initialOptionComponent ?? initialState?.component;

    if ( resolvedInitialComponentName ) {
        return allComponents.find( c => c.name === resolvedInitialComponentName ) ?? null;
    }

    const flowNameParts = flow.name.split( "/" );
    const flowShortName = flowNameParts[ flowNameParts.length - 1 ];
    const expectedComponentName = flowShortName.replace( "Flow", "Component" );

    const sameModuleMatch = allComponents.find( c => {
        const compParts = c.name.split( "/" );
        const compShortName = compParts[ compParts.length - 1 ];
        return compShortName === expectedComponentName;
    } );

    if ( sameModuleMatch ) {
        return sameModuleMatch;
    }

    return findHubComponents( flow, allComponents )[ 0 ] ?? null;
}

function componentElementNames( component: UIExportedComponent ): Set<string> {
    const names = new Set<string>();

    component.elementsGroups.forEach( group => {
        group.items.forEach( row => {
            row.forEach( item => {
                if ( item.element ) {
                    names.add( item.element );
                }
            } );
        } );
    } );

    return names;
}

/**
 * Function findHubComponents() :: The screens a router is pressed from.
 *
 * A router declares which control opens which flow and says nothing about where that control is
 * drawn, so the two halves of the dynamic channel - fifteen buttons on one side, fifteen
 * destinations on the other - were exported without ever being joined. The canvas drew the router
 * with no screen and the screen with no router, and the fifteen flows they lead to appeared to
 * start from nowhere.
 *
 * The join is the element itself. A component carrying every control the router routes from is a
 * screen that router is pressed from - not a guess about it, since the control ids are the same
 * strings on both sides. Carrying only some of them is a control reused elsewhere, which is why
 * this is `every` and not `some`: the clear-chat button also sits on the clear-chat screen, and
 * that screen is not a way into all fifteen.
 *
 * Several can qualify, and where they do all of them are true - the primary message in the channel
 * and the panel in the master channel put up the same grid and bind it to the same transitions.
 */
export function findHubComponents( flow: UIExportedFlow, allComponents: UIExportedComponent[] ): UIExportedComponent[] {
    const triggers = ( flow.edgeSourceMappings ?? [] )
        .filter( mapping => mapping.targetFlowName !== flow.name )
        .map( mapping => mapping.triggeringElementId );

    if ( ! triggers.length ) {
        return [];
    }

    const hubs = allComponents.filter( component => {
        const elements = componentElementNames( component );

        return triggers.every( trigger => elements.has( trigger ) );
    } );

    // The screen that owns the moves first, so the router's own screen is the one it opens on.
    return hubs.sort( ( left, right ) =>
        Number( true === left.routesDrawnElsewhere ) - Number( true === right.routesDrawnElsewhere )
    );
}
