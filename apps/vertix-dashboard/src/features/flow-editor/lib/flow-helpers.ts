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

    return allComponents.find( c => {
        const compParts = c.name.split( "/" );
        const compShortName = compParts[ compParts.length - 1 ];
        return compShortName.includes( flowShortName.replace( "Flow", "" ) );
    } ) ?? null;
}
