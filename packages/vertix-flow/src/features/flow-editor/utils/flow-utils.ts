import type { FlowData, FlowIntegrationPoint } from "src/features/flow-editor/types/flow";

/**
 * Get connected flows from a flow data object
 * @param flowData The flow data to extract connected flows from
 * @returns Array of connected flow names
 */
export function getConnectedFlows( flowData: FlowData ): string[] {
    console.log( "getConnectedFlows called with flowData:", flowData );

    if ( ! flowData || ! flowData.integrations ) {
        console.log( "No integrations found in flowData" );
        return [];
    }

    const connectedFlows: string[] = [];

    // Check handoff points
    if ( flowData.integrations.handoffPoints ) {
        console.log( "handoffPoints found:", flowData.integrations.handoffPoints );
        flowData.integrations.handoffPoints.forEach( handoff => {
            if ( ! connectedFlows.includes( handoff.flowName ) ) {
                connectedFlows.push( handoff.flowName );
            }
        } );
    } else {
        console.log( "No handoffPoints found in flowData.integrations" );
    }

    // Check entry points
    if ( flowData.integrations.entryPoints ) {
        console.log( "entryPoints found:", flowData.integrations.entryPoints );
        flowData.integrations.entryPoints.forEach( entry => {
            if ( ! connectedFlows.includes( entry.flowName ) ) {
                connectedFlows.push( entry.flowName );
            }
        } );
    } else {
        console.log( "No entryPoints found in flowData.integrations" );
    }

    console.log( "Final connectedFlows:", connectedFlows );
    return connectedFlows;
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
