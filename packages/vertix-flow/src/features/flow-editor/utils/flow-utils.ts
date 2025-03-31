import type { FlowData, FlowIntegrationPoint } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

/**
 * Get connected flows from a flow data object
 * @param flowData The flow data to extract connected flows from
 * @returns Array of connected flow names
 */
export const getConnectedFlows = ( flowData: FlowData ): string[] => {
    console.log( "getConnectedFlows called with flowData:", flowData );

    const connectedFlows = new Set<string>();

    // Only get flows from handoff points
    if ( flowData.integrations?.handoffPoints ) {
        console.log( "handoffPoints found:", flowData.integrations.handoffPoints );
        flowData.integrations.handoffPoints.forEach( ( handoffPoint: FlowIntegrationPoint ) => {
            connectedFlows.add( handoffPoint.flowName );
        } );
    }

    const result = Array.from( connectedFlows );
    console.log( "Final connectedFlows:", result );
    return result;
};

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
