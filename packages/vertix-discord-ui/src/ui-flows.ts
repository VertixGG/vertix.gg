import { asString, isObject } from "./ui-definitions";

import type { JsonObject, JsonValue } from "./ui-definitions";

import type {
    UIExportFlowPreviewOperator,
    UIExportFlowStateDefinition,
    UIExportFlowTransitionDefinition,
    UIExportedFlow,
    UIFlowVisualConnection
} from "@vertix.gg/definitions/src/ui-export-definitions";

/**
 * Reading the bot's exported flows in a browser.
 *
 * Only the fetching and the parsing live here. What a flow *means* - which branch a submission
 * takes, what that transition writes, what can be pressed from a state - is the same question
 * wherever it is asked, so it is answered once in `@vertix.gg/flow`
 * and re-exported below rather than being worked out again on this side.
 */

export type {
    UIExportedFlow as UIFlow,
    UIExportFlowStateDefinition as UIFlowState,
    UIExportFlowTransitionDefinition as UIFlowTransition
} from "@vertix.gg/definitions/src/ui-export-definitions";

export {
    flowApplyPreviewMutations as applyPreviewMutations,
    flowResolveChoices as resolveFlowChoices,
    flowResolveSubmittedTransition as resolveSubmittedTransition,
    flowStateShortName as stateShortName
} from "@vertix.gg/flow";

export type { UIFlowChoice } from "@vertix.gg/flow";

const UI_FLOWS_URL = "/exports/ui/flows.json";

let cachedUIFlowsPromise: Promise<ReadonlyArray<UIExportedFlow>> | null = null;

export async function fetchUIFlows(): Promise<ReadonlyArray<UIExportedFlow>> {
    if ( cachedUIFlowsPromise ) {
        return await cachedUIFlowsPromise;
    }

    cachedUIFlowsPromise = ( async() => {
        const response = await fetch( UI_FLOWS_URL );

        return parseUIFlows( JSON.parse( await response.text() ) as JsonValue );
    } )();

    return await cachedUIFlowsPromise;
}

export async function getUIFlowByName( flowName: string ): Promise<UIExportedFlow | null> {
    for ( const flow of await fetchUIFlows() ) {
        if ( flow.name === flowName ) {
            return flow;
        }
    }

    return null;
}

function parseUIFlows( value: JsonValue ): ReadonlyArray<UIExportedFlow> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const flows: Array<UIExportedFlow> = [];

    for ( const item of value ) {
        const flow = parseUIFlow( item );

        if ( flow ) {
            flows.push( flow );
        }
    }

    return flows;
}

function parseUIFlow( value: JsonValue ): UIExportedFlow | null {
    if ( !isObject( value ) ) {
        return null;
    }

    const name = asString( value[ "name" ] ),
        initialState = asString( value[ "initialState" ] );

    if ( !name || !initialState ) {
        return null;
    }

    return {
        name,
        module: asString( value[ "module" ] ) ?? "",
        flowKind: asString( value[ "flowKind" ] ) ?? "",
        initialState,
        states: parseStates( value[ "states" ] ),
        transitions: parseTransitions( value[ "transitions" ] ),
        edgeSourceMappings: parseEdgeSources( value[ "edgeSourceMappings" ] ),
        handoffPoints: parseHandoffPoints( value[ "handoffPoints" ] )
    };
}

function parseStates( value: JsonValue ): UIExportFlowStateDefinition[] {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const states: Array<UIExportFlowStateDefinition> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const key = asString( item[ "key" ] );

        if ( !key ) {
            continue;
        }

        const options = isObject( item[ "options" ] ) ? item[ "options" ] : {};

        states.push( {
            key,
            transitions: [ ...parseStringArray( item[ "transitions" ] ) ],
            hooks: [ ...parseStringArray( item[ "hooks" ] ) ],
            options: {
                executionStep: asString( options[ "executionStep" ] ),
                component: asString( options[ "component" ] ),
                previewEmbedsGroup: asString( options[ "previewEmbedsGroup" ] ),
                previewElementsGroup: asString( options[ "previewElementsGroup" ] ),
                previewDefaultVars: parseStringRecord( options[ "previewDefaultVars" ] ),
                navigationType: asString( options[ "navigationType" ] )
            }
        } );
    }

    return states;
}

function parseTransitions( value: JsonValue ): UIExportFlowTransitionDefinition[] {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const transitions: Array<UIExportFlowTransitionDefinition> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const from = asString( item[ "from" ] ),
            to = asString( item[ "to" ] );

        if ( !from || !to ) {
            continue;
        }

        const condition = isObject( item[ "previewCondition" ] ) ? item[ "previewCondition" ] : null;

        const operator = condition ? asString( condition[ "operator" ] ) : null,
            field = condition ? asString( condition[ "field" ] ) : null;

        transitions.push( {
            name: asString( item[ "name" ] ) ?? undefined,
            from,
            to,
            triggeredBy: parseTriggers( item[ "triggeredBy" ] ),
            mutations: parseMutations( item[ "mutations" ] ),
            previewDeletesReply: true === item[ "previewDeletesReply" ],
            previewCondition: field && isPreviewOperator( operator )
                ? {
                    field,
                    operator,
                    value: asString( condition![ "value" ] ) ?? undefined,
                    min: asNumber( condition![ "min" ] ) ?? undefined,
                    max: asNumber( condition![ "max" ] ) ?? undefined,
                    elements: asStringArray( condition![ "elements" ] )
                }
                : undefined
        } );
    }

    return transitions;
}

function asStringArray( value: JsonValue | undefined ): string[] | undefined {
    if ( !Array.isArray( value ) ) {
        return undefined;
    }

    const items = value.filter( ( item ): item is string => "string" === typeof item );

    return items.length ? items : undefined;
}

function asNumber( value: JsonValue | undefined ): number | null {
    return "number" === typeof value && Number.isFinite( value ) ? value : null;
}

function isPreviewOperator( operator: string | null ): operator is UIExportFlowPreviewOperator {
    return "empty" === operator || "not-empty" === operator || "contains" === operator
        || "equals" === operator || "out-of-range" === operator;
}

function parseMutations( value: JsonValue ): Array<{ type: string; path: string[] }> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const mutations: Array<{ type: string; path: string[] }> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const type = asString( item[ "type" ] );

        if ( !type ) {
            continue;
        }

        mutations.push( { type, path: [ ...parseStringArray( item[ "path" ] ) ] } );
    }

    return mutations;
}

function parseTriggers( value: JsonValue ): UIExportFlowTransitionDefinition[ "triggeredBy" ] {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const triggers: UIExportFlowTransitionDefinition[ "triggeredBy" ] = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const navigation = isObject( item[ "navigation" ] ) ? item[ "navigation" ] : null;

        const targetState = navigation ? asString( navigation[ "targetState" ] ) : null;

        triggers.push( {
            handlerId: asString( item[ "handlerId" ] ) ?? "",
            sourceEntity: asString( item[ "sourceEntity" ] ) ?? "",
            handlerKind: asString( item[ "handlerKind" ] ) ?? "",
            navigation: targetState ? { targetState } : undefined
        } );
    }

    return triggers;
}

function parseEdgeSources( value: JsonValue ): UIFlowVisualConnection[] {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const edges: Array<UIFlowVisualConnection> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const triggeringElementId = asString( item[ "triggeringElementId" ] ),
            transitionName = asString( item[ "transitionName" ] ),
            targetFlowName = asString( item[ "targetFlowName" ] );

        if ( !triggeringElementId || !transitionName || !targetFlowName ) {
            continue;
        }

        edges.push( { triggeringElementId, transitionName, targetFlowName } );
    }

    return edges;
}

function parseHandoffPoints( value: JsonValue ): UIExportedFlow[ "handoffPoints" ] {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const points: NonNullable<UIExportedFlow[ "handoffPoints" ]> = [];

    for ( const item of value ) {
        if ( !isObject( item ) ) {
            continue;
        }

        const flowName = asString( item[ "flowName" ] );

        if ( !flowName ) {
            continue;
        }

        points.push( {
            flowName,
            sourceState: asString( item[ "sourceState" ] ) ?? undefined,
            targetState: asString( item[ "targetState" ] ) ?? undefined,
            transition: asString( item[ "transition" ] ) ?? undefined
        } );
    }

    return points;
}

function parseStringArray( value: JsonValue ): ReadonlyArray<string> {
    if ( !Array.isArray( value ) ) {
        return [];
    }

    const items: Array<string> = [];

    for ( const item of value ) {
        const text = asString( item );

        if ( text ) {
            items.push( text );
        }
    }

    return items;
}

function parseStringRecord( value: JsonValue ): Record<string, string> {
    if ( !isObject( value ) ) {
        return {};
    }

    const record: Record<string, string> = {};

    for ( const [ key, item ] of Object.entries( value as JsonObject ) ) {
        const text = asString( item );

        if ( null !== text ) {
            record[ key ] = text;
        }
    }

    return record;
}
