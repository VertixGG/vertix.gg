import type { FlowData, FlowIntegrationPoint } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

/**
 * Extracts a unique list of connected flow names from a flow's handoff points AND visual connections.
 */
export function getConnectedFlows( flowData: FlowData ): string[] {
    console.log( "getConnectedFlows called with flowData:", flowData );

    const connectedFlows = new Set<string>();

    // Extract from handoff points
    const handoffPoints = flowData.integrations?.handoffPoints;
    if ( handoffPoints ) {
        console.log( "handoffPoints found:", handoffPoints );
        handoffPoints.forEach( ( point ) => {
            if ( point.flowName ) {
                connectedFlows.add( point.flowName );
            }
        } );
    }

    // Extract from visual connections
    const edgeSourceMappings = flowData.edgeSourceMappings;
    if ( edgeSourceMappings ) {
        edgeSourceMappings.forEach( ( connection ) => {
            if ( connection.targetFlowName ) {
                connectedFlows.add( connection.targetFlowName );
            }
        } );
    }

    const finalFlows = Array.from( connectedFlows );
    console.log( "Final connectedFlows:", finalFlows );
    return finalFlows;
}

/**
 * Get connection details between flows
 * @param flowData The flow data to extract connection details from
 * @returns Array of connection points
 */
export function getFlowConnections( flowData: FlowData ): FlowIntegrationPoint[] {
    if ( ! flowData || ! flowData.integrations ) {
        return [];
    }

    const connections: FlowIntegrationPoint[] = [];

    // Add handoff points
    if ( flowData.integrations.handoffPoints ) {
        connections.push( ... flowData.integrations.handoffPoints );
    }

    // Add entry points
    if ( flowData.integrations.entryPoints ) {
        connections.push( ... flowData.integrations.entryPoints );
    }

    return connections;
}
