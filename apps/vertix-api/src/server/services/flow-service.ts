import { uiExportLoader } from "@vertix.gg/api/src/bootstrap";

import { extractComponentPreview } from "@vertix.gg/api/src/server/services/component-service";

import type { FlowResponse, ModuleFlowsResponse, ComponentPreview } from "@vertix.gg/api/src/server/types";

export async function getFlowData( moduleName: string, flowName?: string ): Promise<FlowResponse | ModuleFlowsResponse> {
    await uiExportLoader.loadExports();

    if ( flowName ) {
        return getSingleFlowData( flowName );
    }

    return getModuleFlowsData( moduleName );
}

function getSingleFlowData( flowName: string ): FlowResponse {
    const flow = uiExportLoader.getFlow( flowName );

    if ( !flow ) {
        throw new Error( `Flow "${ flowName }" not found` );
    }

    const componentNames = flow.states
        .map( state => state.component )
        .filter( ( c ): c is string => c !== null );

    const components: ComponentPreview[] = [];

    componentNames.forEach( compName => {
        const comp = uiExportLoader.getComponent( compName );
        if ( comp ) {
            components.push( extractComponentPreview( comp ) );
        }
    } );

    return {
        name: flow.name,
        module: flow.module,
        flowKind: flow.flowKind,
        initialState: flow.initialState,
        states: flow.states,
        transitions: flow.transitions,
        components
    };
}

function getModuleFlowsData( moduleName: string ): ModuleFlowsResponse {
    const allFlows = uiExportLoader.getFlowsForModule( moduleName );
    const moduleComponents = uiExportLoader.getComponentsForModule( moduleName );

    const flows = allFlows.filter( f => f.flowKind !== "system" );
    const systemFlows = allFlows.filter( f => f.flowKind === "system" );

    const referencedFlowNames = new Set<string>();
    const collectReferencedFlows = ( flowList: typeof allFlows ) => {
        flowList.forEach( flow => {
            flow.handoffPoints?.forEach( hp => {
                if ( hp.flowName ) {
                    referencedFlowNames.add( hp.flowName );
                }
            } );

            flow.edgeSourceMappings?.forEach( esm => {
                if ( esm.targetFlowName ) {
                    referencedFlowNames.add( esm.targetFlowName );
                }
            } );
        } );
    };

    collectReferencedFlows( flows );
    collectReferencedFlows( systemFlows );

    const moduleFlowNames = new Set( allFlows.map( f => f.name ) );
    referencedFlowNames.forEach( flowName => {
        if ( !moduleFlowNames.has( flowName ) ) {
            const crossModuleFlow = uiExportLoader.getFlow( flowName );
            if ( crossModuleFlow && crossModuleFlow.flowKind !== "system" ) {
                flows.push( crossModuleFlow );
            }
        }
    } );

    const referencedComponentNames = new Set<string>();
    [ ...flows, ...systemFlows ].forEach( flow => {
        flow.states.forEach( state => {
            const componentFromOptions = typeof state.options?.[ "component" ] === "string"
                ? state.options[ "component" ]
                : null;

            const componentName = componentFromOptions ?? state.component;

            if ( componentName ) {
                referencedComponentNames.add( componentName );
            }
        } );
    } );

    const components = [ ...moduleComponents ];
    const moduleComponentNames = new Set( moduleComponents.map( c => c.name ) );

    referencedComponentNames.forEach( compName => {
        if ( !moduleComponentNames.has( compName ) ) {
            const comp = uiExportLoader.getComponent( compName );
            if ( comp ) {
                components.push( comp );
            }
        }
    } );

    return {
        module: moduleName,
        flows,
        systemFlows,
        components
    };
}
