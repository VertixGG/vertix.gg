import type {
    UIExportFlowPreviewCondition,
    UIExportFlowTransitionDefinition,
    UIExportedFlow
} from "@vertix.gg/definitions/src/ui-export-definitions";

/**
 * Reading a flow the way anything without a bot behind it has to.
 *
 * The bot walks a flow by running handlers. A dashboard drawing the flow, or a website
 * demonstrating it, has only what was exported - so the rules for getting from that export to
 * "what can be pressed here", "which branch did this take" and "what did it write down" live here,
 * once, and both of them ask the same question of the same answer.
 */

/** The last segment of a key - `Success` out of `…/States/Success`. */
export function flowStateShortName( stateKey: string ): string {
    return stateKey.slice( stateKey.lastIndexOf( "/" ) + 1 );
}

/** Whether what somebody submitted satisfies a transition's declared rule. */
export function flowMatchesPreviewCondition(
    condition: UIExportFlowPreviewCondition,
    submitted: Readonly<Record<string, string>>
): boolean {
    const field = ( submitted[ condition.field ] ?? "" ).trim();

    switch ( condition.operator ) {
        case "empty":
            return !field.length;

        case "not-empty":
            return field.length > 0;

        case "contains":
            return undefined !== condition.value && field.toLowerCase().includes( condition.value.toLowerCase() );

        case "equals":
            return field.toLowerCase() === ( condition.value ?? "" ).toLowerCase();

        case "out-of-range": {
            // Anything that is not a whole number is out of every range, which is how a handler
            // reading a number field treats a word typed into it.
            if ( !/^-?\d+$/.test( field ) ) {
                return true;
            }

            const parsed = parseInt( field, 10 );

            return ( undefined !== condition.min && parsed < condition.min )
                || ( undefined !== condition.max && parsed > condition.max );
        }

        default:
            return false;
    }
}

/** Whether a transition is one the given element can fire, per what the export says triggers it. */
function transitionIsTriggeredBy( transition: UIExportFlowTransitionDefinition, elementId: string ): boolean {
    return ( transition.triggeredBy ?? [] ).some( ( trigger ) => trigger.sourceEntity === elementId );
}

/**
 * Function flowResolveSubmittedTransition() :: Which transition out of a state a submission takes.
 *
 * Read in the order the adapter declared them, first match wins; one with no condition is the
 * fallback, which is why it is declared last. This is the fork the bot's handler makes after asking
 * a service - restated on the transitions so something with no service to ask follows the same one.
 *
 * `elementId` says which of a state's elements was used, for a state that has several leading
 * different ways - five menus out of one permissions panel. Given, a conditional branch only
 * applies if it named that element (or named none), and the fallback has to be a transition that
 * element actually fires, so the other four menus' outcomes stay out of it. Left out, a state with
 * one way out resolves exactly as it always did.
 */
export function flowResolveSubmittedTransition(
    flow: UIExportedFlow,
    fromStateKey: string,
    submitted: Readonly<Record<string, string>>,
    elementId?: string
): UIExportFlowTransitionDefinition | null {
    let fallback: UIExportFlowTransitionDefinition | null = null;

    for ( const transition of flow.transitions ) {
        if ( transition.from !== fromStateKey ) {
            continue;
        }

        const condition = transition.previewCondition;

        if ( !condition ) {
            if ( undefined !== elementId && !transitionIsTriggeredBy( transition, elementId ) ) {
                continue;
            }

            fallback = fallback ?? transition;
            continue;
        }

        // A rule written for particular elements has nothing to say about the others.
        if ( condition.elements?.length && ( undefined === elementId || !condition.elements.includes( elementId ) ) ) {
            continue;
        }

        if ( flowMatchesPreviewCondition( condition, submitted ) ) {
            return transition;
        }
    }

    return fallback;
}

/**
 * Function flowApplyPreviewMutations() :: What a transition writes into the context when taken.
 *
 * A `set` takes the submitted value of the same name where there is one.
 *
 * Failing that, a `contains` rule lends its value: that operator says the value was found inside
 * what somebody submitted, so it is content, and it is how a refusal comes to name the word it
 * refused without anything outside the bot holding a list of them. The other operators only tell
 * the branches apart - "the third attempt", "the public one" - and their value is no more the thing
 * to write down than the question is the answer.
 *
 * With nothing to write, nothing is written: a mutation with no value is not a reason to blank out
 * what the state it arrives at declared for itself.
 */
export function flowApplyPreviewMutations(
    transition: UIExportFlowTransitionDefinition,
    submitted: Readonly<Record<string, string>>
): Readonly<Record<string, string>> {
    const written: Record<string, string> = {};

    for ( const mutation of transition.mutations ?? [] ) {
        if ( "set" !== mutation.type ) {
            continue;
        }

        const key = mutation.path[ mutation.path.length - 1 ];

        if ( !key ) {
            continue;
        }

        const condition = transition.previewCondition;

        const value = submitted[ key ]
            ?? ( "contains" === condition?.operator ? condition.value : undefined );

        if ( undefined === value ) {
            continue;
        }

        written[ key ] = value;
    }

    return written;
}

/** One thing that can be pressed from a state, and where pressing it lands. */
export interface UIFlowChoice {
    elementId: string;
    transition: string;
    targetFlow: string;
    targetState: string | null;
}

/**
 * Function flowResolveChoices() :: What can be pressed in a flow, and where each press goes.
 *
 * Joins the halves the export keeps apart - the element that fires a transition, the flow that
 * transition hands off to, and the state it arrives at there.
 *
 * Most flows say which element outright in `edgeSourceMappings`. The ones that do not have to be
 * read the long way round, by finding the button among a transition's triggers, which is why both
 * routes are here: whoever asks gets the same answer either way.
 *
 * `stateKey` narrows the result to what can be pressed from one particular state. Left out, the
 * whole flow's worth comes back - which is what drawing a diagram of it wants.
 */
export function flowResolveChoices( flow: UIExportedFlow, stateKey?: string ): ReadonlyArray<UIFlowChoice> {
    const choices: Array<UIFlowChoice> = [];

    const handoffPoints = flow.handoffPoints ?? [];

    for ( const edge of flow.edgeSourceMappings ?? [] ) {
        const handoff = handoffPoints.find(
            ( point ) => point.transition === edge.transitionName
                && ( undefined === stateKey || point.sourceState === stateKey )
        );

        // An edge whose handoff starts elsewhere belongs to a different state of this flow.
        if ( undefined !== stateKey && !handoff
            && handoffPoints.some( ( point ) => point.transition === edge.transitionName ) ) {
            continue;
        }

        choices.push( {
            elementId: edge.triggeringElementId,
            transition: edge.transitionName,
            targetFlow: edge.targetFlowName,
            targetState: handoff?.targetState ?? null
        } );
    }

    if ( choices.length ) {
        return choices;
    }

    // Nothing declared the element, so it is looked for among the triggers of the transition each
    // handoff names.
    for ( const handoff of handoffPoints ) {
        if ( !handoff.transition ) {
            continue;
        }

        for ( const transition of flow.transitions ) {
            if ( transition.from !== handoff.transition ) {
                continue;
            }

            for ( const trigger of transition.triggeredBy ?? [] ) {
                if ( "button" !== trigger.handlerKind ) {
                    continue;
                }

                choices.push( {
                    elementId: trigger.sourceEntity,
                    transition: handoff.transition,
                    targetFlow: handoff.flowName,
                    targetState: handoff.targetState ?? null
                } );
            }
        }
    }

    return choices;
}
