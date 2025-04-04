import { useState, useCallback, useEffect } from "react";
import axios from "axios";

import { UIEFlowIntegrationPointType } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";

import { getConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/utils/flow-utils";

import { useFlowEditorStore } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import { FLOW_EDITOR } from "@vertix.gg/flow/src/features/flow-editor/config";

import type React from "react";

import type { Node, Edge } from "@xyflow/react";
import type { FlowData, VisualConnection, FlowIntegrationPoint } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

// Helper function to get the correct API base URL
const getApiBaseUrl = () => {
    if ( window.location.origin.includes( "localhost:5173" ) || window.location.origin.includes( "127.0.0.1:5173" ) ) {
        return "http://localhost:3000";
    }
    return window.location.origin;
};

export interface UseConnectedFlowsReturn {
    mainFlowData: FlowData | null;
    connectedFlowsData: FlowData[];
    combinedNodes: Node[];
    combinedEdges: Edge[];
    isLoadingConnectedFlows: boolean;
    handleMainFlowDataLoaded: ( flowData: FlowData ) => void;
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    loadConnectedFlows: ( connectedFlowNames: string[] ) => Promise<void>;
}

export const useConnectedFlows = (): UseConnectedFlowsReturn => {
    const [ mainFlowData, setMainFlowData ] = useState<FlowData | null>( null );
    const [ connectedFlowsData, setConnectedFlowsData ] = useState<FlowData[]>( [] );
    const [ combinedNodes, setCombinedNodes ] = useState<Node[]>( [] );
    const [ combinedEdges, setCombinedEdges ] = useState<Edge[]>( [] );
    const [ isLoadingConnectedFlows, setIsLoadingConnectedFlows ] = useState<boolean>( false );

    const { handleFlowDataLoaded: storeHandleFlowDataLoaded } = useFlowEditorStore();
    const { setError } = useFlowEditorStore();

    const loadConnectedFlows = async( connectedFlowNames: string[] ) => {
        try {
            setIsLoadingConnectedFlows( true );
            const apiBaseUrl = getApiBaseUrl();
            const loadedFlows: FlowData[] = [];
            const processedFlows = new Set<string>(); // Track processed flows to avoid cycles

            const loadFlow = async( flowName: string, parentFlow?: FlowData ) => {
                if ( processedFlows.has( flowName ) ) {
                    return; // Skip if already processed
                }
                processedFlows.add( flowName );

                const moduleNameParts = flowName.split( "/" );
                const moduleName = `${ moduleNameParts[ 0 ] }/${ moduleNameParts[ 1 ] }/Module`;

                try {
                    const response = await axios.get<FlowData>( `${ apiBaseUrl }/api/ui-flows`, {
                        params: {
                            moduleName,
                            flowName
                        }
                    } );

                    if ( response.data ) {
                        // Only add the flow if it's a target of a handoff point from the parent
                        const isTargetOfHandoff = !parentFlow || (
                            parentFlow.integrations?.handoffPoints?.some(
                                hp => hp.flowName === response.data.name
                            ) ?? false
                        );

                        if ( isTargetOfHandoff ) {
                            loadedFlows.push( response.data );

                            // Get nested connected flows that are targets of handoff points
                            const nestedFlows = response.data.integrations?.handoffPoints?.map(
                                hp => hp.flowName
                            ) ?? [];

                            // Load each nested flow, passing current flow as parent
                            for ( const nestedFlow of nestedFlows ) {
                                await loadFlow( nestedFlow, response.data );
                            }
                        }
                    }
                } catch ( error ) {
                    console.error( `Failed to load connected flow: ${ flowName }`, error );
                }
            };

            // Load all flows and their nested connections
            for ( const flowName of connectedFlowNames ) {
                await loadFlow( flowName, mainFlowData || undefined );
            }

            setConnectedFlowsData( loadedFlows );
        } catch ( error ) {
            console.error( "Error loading connected flows:", error );
            setError( "Failed to load connected flows" );
        } finally {
            setIsLoadingConnectedFlows( false );
        }
    };

    const combineFlowDiagrams = useCallback( ( mainNodes: Node[], connectedFlows: FlowData[] ) => {
        // Start with main flow nodes
        const allNodes: Node[] = [];
        const processedNodeIds = new Set<string>();

        // Add prefixed main flow nodes
        mainNodes.forEach( node => {
            const mainFlowName = mainFlowData?.name || "unknown";
            const nodePrefix = mainFlowName.replace( /\//g, "-" );
            const newNodeId = node.id === "flow-group" ? `${ nodePrefix }-node-flow-group` : `${ nodePrefix }-node-${ node.id }`;

            // Skip if we've already processed this node ID
            if ( processedNodeIds.has( newNodeId ) ) {
                return;
            }
            processedNodeIds.add( newNodeId );

            allNodes.push( {
                ...node,
                id: newNodeId,
                position: node.position || { x: 0, y: 0 },
                data: {
                    ...node.data,
                    isMainFlow: true,
                    flowName: mainFlowName
                }
            } );
        } );

        // Add connected flow nodes
        connectedFlows.forEach( ( flowData, index ) => {
            const { nodes: flowNodes } = generateFlowDiagram( flowData );
            const nodePrefix = flowData.name.replace( /\//g, "-" );

            flowNodes.forEach( node => {
                const newNodeId = `${ nodePrefix }-node-${ node.id }`;

                // Skip if we've already processed this node ID
                if ( processedNodeIds.has( newNodeId ) ) {
                    return;
                }
                processedNodeIds.add( newNodeId );

                allNodes.push( {
                    ...node,
                    id: newNodeId,
                    position: node.position || { x: 0, y: 0 },
                    data: {
                        ...node.data,
                        isConnectedFlow: true,
                        flowIndex: index,
                        flowName: flowData.name
                    }
                } );
            } );
        } );

        // Set the potentially overlapping nodes
        setCombinedNodes( allNodes );
        return allNodes;
    }, [ setCombinedNodes, mainFlowData ] );

    const createInterFlowEdges = useCallback( (
        mainFlow: FlowData | null,
        connectedFlows: FlowData[],
        allCombinedNodes: Node[]
    ): Edge[] => {
        const newEdges: Edge[] = [];

        // Helper function to create edges for a flow
        const createEdgesForFlow = ( flow: FlowData ) => {
            // Ensure integrations and handoffPoints exist
            if ( !flow?.integrations?.handoffPoints ) return;

            const flowPrefix = flow.name.replace( /\//g, "-" );

            flow.integrations.handoffPoints.forEach( ( handoff: FlowIntegrationPoint, index ) => { // Use imported type
                const targetFlowData = connectedFlows.find( cf => cf.name === handoff.flowName );
                if ( !targetFlowData ) {
                    console.warn( `[createInterFlowEdges] Target flow ${ handoff.flowName } not found in loaded connected flows.` );
                    return;
                }

                // Use default group node for source unless visual connection specifies otherwise
                let sourceNodeId = `${ flowPrefix }-node-flow-group`;
                let sourceHandle = "Flow-handle-source-bottom";

                // Check for visual connection definition
                const visualConnection = flow.visualConnections?.find(
                    ( vc: VisualConnection ) => vc.transitionName === handoff.transition
                );

                if ( visualConnection?.triggeringElementId ) {
                    // Use the specific element's handle if defined
                    sourceHandle = visualConnection.triggeringElementId;
                } else {
                    // console.log( `[createInterFlowEdges] No visual connection for ${ handoff.transition }, using default group node '${ sourceNodeId }' and handle '${ sourceHandle }'` );
                }

                const targetPrefix = targetFlowData.name.replace( /\//g, "-" );
                const targetNodeId = `${ targetPrefix }-node-flow-group`;
                const targetHandle = "Flow-handle-target-top";

                // Check existence of the actual SOURCE and TARGET NODES
                const sourceNodeExists = allCombinedNodes.some( n => n.id === sourceNodeId );
                const targetNodeExists = allCombinedNodes.some( n => n.id === targetNodeId );

                if ( sourceNodeExists && targetNodeExists ) {
                    const edgeId = `handoff-${ flowPrefix }-to-${ targetPrefix }-viaHandle-${ sourceHandle.replace( /\//g, "-" ) }-${ index }`;

                    // Base styles
                    let edgeStyle: React.CSSProperties = {
                        stroke: FLOW_EDITOR.theme.components.edge.interFlow.strokeColor,
                        strokeWidth: FLOW_EDITOR.theme.components.edge.interFlow.strokeWidth
                    };
                    const edgeLabelStyle: React.CSSProperties = {
                         fill: FLOW_EDITOR.theme.components.edge.interFlow.strokeColor
                    };

                    // Adjust style for specific types if needed
                    if ( handoff.type === UIEFlowIntegrationPointType.COMMAND || handoff.type === UIEFlowIntegrationPointType.EVENT ) {
                        edgeStyle.strokeDasharray = FLOW_EDITOR.theme.components.edge.command.strokeDasharray;
                    }

                    // Create the data object for the CustomEdge component
                    // Use the properties directly from the handoff object which now conforms to the updated FlowIntegrationPoint type
                    const edgeData: Partial<FlowIntegrationPoint> = {
                        type: handoff.type,
                        fullName: handoff.fullName,
                        // Include other relevant properties from handoff if CustomEdge needs them
                        flowName: handoff.flowName,
                        description: handoff.description,
                        transition: handoff.transition,
                    };

                    // Label is now handled by CustomEdge based on data, so set to empty string or remove
                    const edgeLabel = "";

                    // Construct the final edge object
                    const edge: Edge = {
                        id: edgeId,
                        source: sourceNodeId,
                        target: targetNodeId,
                        sourceHandle: sourceHandle,
                        targetHandle: targetHandle,
                        type: "custom", // Ensure type is set to 'custom'
                        animated: FLOW_EDITOR.theme.components.edge.interFlow.animated,
                        label: edgeLabel, // Label is empty, CustomEdge handles rendering
                        style: edgeStyle,
                        labelStyle: edgeLabelStyle,
                        zIndex: FLOW_EDITOR.theme.zIndex.edgeInterFlow,
                        data: edgeData // Pass the structured data object
                    };
                    newEdges.push( edge );
                } else {
                     console.warn( `[createInterFlowEdges] Could not create edge: Source Node (${ sourceNodeId }, exists: ${ sourceNodeExists }) or Target Node (${ targetNodeId }, exists: ${ targetNodeExists }) not found.` );
                 }
            } );
        };

        // Create edges for main flow
        if ( mainFlow ) {
            createEdgesForFlow( mainFlow );
        }

        // Create edges for connected flows, excluding the main flow
        connectedFlows.forEach( flow => {
            if ( flow.name !== mainFlow?.name ) {
                createEdgesForFlow( flow );
            }
        } );

        return newEdges;
    }, [] );

    const handleMainFlowDataLoaded = useCallback( ( flowData: FlowData ) => {
        setMainFlowData( flowData );

        const mainDiagram = generateFlowDiagram( flowData );
        setCombinedNodes( mainDiagram.nodes );
        setCombinedEdges( [] );

        storeHandleFlowDataLoaded( flowData );

        const connectedFlowNames = getConnectedFlows( flowData );
        if ( connectedFlowNames.length > 0 ) {
            loadConnectedFlows( connectedFlowNames );
        } else {
            setConnectedFlowsData( [] );
        }
    }, [ storeHandleFlowDataLoaded ] );

    useEffect( () => {
        if ( mainFlowData ) {
            const mainDiagram = generateFlowDiagram( mainFlowData );
            const combined = combineFlowDiagrams( mainDiagram.nodes, connectedFlowsData );

            // Note: Edges are created *after* combined nodes are calculated (important for positioning/layout later)
            const interFlowEdges = createInterFlowEdges( mainFlowData, connectedFlowsData, combined ); // <-- Called here
            setCombinedEdges( interFlowEdges ); // Set the created edges
        } else {
            setCombinedNodes( [] );
            setCombinedEdges( [] );
        }
        // Ensure dependencies cover all data used to generate nodes/edges
    }, [ mainFlowData, connectedFlowsData, combineFlowDiagrams, createInterFlowEdges ] ); // Dependency array

    return {
        mainFlowData,
        connectedFlowsData,
        combinedNodes,
        combinedEdges,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
        loadConnectedFlows,
    };
};
