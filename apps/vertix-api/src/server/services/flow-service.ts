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

    const referencedComponentNames = new Set<string>();
    allFlows.forEach( flow => {
        flow.states.forEach( state => {
            if ( state.component ) {
                referencedComponentNames.add( state.component );
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
