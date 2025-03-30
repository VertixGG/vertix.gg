import { useState, useCallback, useEffect } from "react";
import axios from "axios";

import { Z_INDEXES } from "@vertix.gg/flow/src/features/flow-editor/flow-z-indexes";

import { getConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/utils/flow-utils";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";
import { useFlowDiagram, useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type React from "react";

import type { FlowData, VisualConnection } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

import type { Node, Edge } from "@xyflow/react";

// Assume the constant file will be created here:

// Helper function to get the correct API base URL
const getApiBaseUrl = () => {
    if ( window.location.origin.includes( "localhost:5173" ) || window.location.origin.includes( "127.0.0.1:5173" ) ) {
        return "http://localhost:3000";
    }
    return window.location.origin;
};

export interface UseConnectedFlowsReturn {
    connectedFlowsData: FlowData[];
    combinedNodes: Node[];
    combinedEdges: Edge[];
    isLoadingConnectedFlows: boolean;
    handleMainFlowDataLoaded: ( flowData: FlowData ) => void;
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setCombinedEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export const useConnectedFlows = (): UseConnectedFlowsReturn => {
    const [ mainFlowData, setMainFlowData ] = useState<FlowData | null>( null );
    const [ connectedFlowsData, setConnectedFlowsData ] = useState<FlowData[]>( [] );
    const [ combinedNodes, setCombinedNodes ] = useState<Node[]>( [] );
    const [ combinedEdges, setCombinedEdges ] = useState<Edge[]>( [] );
    const [ isLoadingConnectedFlows, setIsLoadingConnectedFlows ] = useState<boolean>( false );

    const { nodes, handleFlowDataLoaded: storeHandleFlowDataLoaded } = useFlowDiagram();
    const { setError } = useFlowUI();

    const loadConnectedFlows = async( connectedFlowNames: string[] ) => {
        try {
            setIsLoadingConnectedFlows( true );
            const apiBaseUrl = getApiBaseUrl();
            const loadedFlows: FlowData[] = [];

            for ( const connectedFlowName of connectedFlowNames ) {
                const moduleNameParts = connectedFlowName.split( "/" );
                const connectedModuleName = `${ moduleNameParts[ 0 ] }/${ moduleNameParts[ 1 ] }/Module`;
                 try {
                    const response = await axios.get<FlowData>( `${ apiBaseUrl }/api/ui-flows`, {
                        params: {
                            moduleName: connectedModuleName,
                            flowName: connectedFlowName
                        }
                    } );

                    if ( response.data ) {
                        loadedFlows.push( response.data );
                    }
                } catch ( error ) {
                    console.error( `Failed to load connected flow: ${ connectedFlowName }`, error );
                }
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
        const allNodes = [ ...mainNodes ];

        connectedFlows.forEach( ( flowData, index ) => {
            // Generate nodes for the connected flow
            const { nodes: flowNodes } = generateFlowDiagram( flowData );
            const nodePrefix = flowData.name.replace( /\//g, "-" );

            const prefixedNodes = flowNodes.map( ( node: { id: any; position: any; data: any; } ) => ( {
                ...node,
                id: `${ nodePrefix }-node-${ node.id }`,
                // --- Use position directly from generateFlowDiagram ---
                // Position will be relative to (0,0) or whatever generateFlowDiagram uses
                // They will likely overlap initially - layout happens later
                position: node.position || { x: 0, y: 0 }, // Ensure position exists
                data: {
                    ...node.data,
                    isConnectedFlow: true,
                    flowIndex: index,
                    flowName: flowData.name
                 }
            } ) );

            allNodes.push( ...prefixedNodes );
        } );

        // Set the potentially overlapping nodes
        setCombinedNodes( allNodes );
        console.log( "[combineFlowDiagrams] Combined nodes (no offset):", allNodes.map( n => ( { id: n.id, x: n.position.x, y: n.position.y } ) ) );
        return allNodes; // Return for potential immediate use
    }, [ setCombinedNodes ] ); // Added dependency

    const createInterFlowEdges = useCallback( (
        mainFlow: FlowData | null,
        connectedFlows: FlowData[],
        allCombinedNodes: Node[]
    ): Edge[] => {
        if ( !mainFlow?.integrations?.handoffPoints ) {
            return [];
        }

        const newEdges: Edge[] = [];
        const mainFlowPrefix = mainFlow.name.replace( /\//g, "-" );

        mainFlow.integrations.handoffPoints.forEach( ( handoff, index ) => {
            const targetFlowData = connectedFlows.find( cf => cf.name === handoff.flowName );
            if ( !targetFlowData ) {
                console.warn( `Target flow ${ handoff.flowName } not found in loaded connected flows.` );
                return;
            }

            const entryPoint = targetFlowData.integrations?.entryPoints?.find(
                ep => ep.flowName === mainFlow.name && ep.transition === handoff.transition
            );
            if ( !entryPoint ) {
                console.warn( `No matching entry point found in ${ targetFlowData.name } for transition ${ handoff.transition } from ${ mainFlow.name }.` );
                return;
            }

            if ( !targetFlowData || !entryPoint ) return; // Early exit if checks fail

            // Default source NODE is the main flow group node
            let sourceNodeId = "flow-group";
            // Default source HANDLE for group-to-group
            let sourceHandle = "Flow-handle-source-bottom";

            // Check for visual connection definition
            const visualConnection = mainFlow.visualConnections?.find(
                ( vc: VisualConnection ) => vc.transitionName === handoff.transition
            );

            if ( visualConnection?.triggeringElementId ) {
                // If visual connection exists:
                // SOURCE NODE remains the group containing the element
                sourceNodeId = "flow-group";
                // SOURCE HANDLE becomes the specific element's ID (name)
                sourceHandle = visualConnection.triggeringElementId;
                console.log( `[Edges] Using visual connection for ${ handoff.transition }: node '${ sourceNodeId }', handle '${ sourceHandle }'` );
            } else {
                console.log( `[Edges] No visual connection found for ${ handoff.transition }, using default group node '${ sourceNodeId }' and handle '${ sourceHandle }'` );
            }

            const targetPrefix = targetFlowData.name.replace( /\//g, "-" );
            const targetNodeId = `${ targetPrefix }-node-flow-group`;
            const targetHandle = "Flow-handle-target-top";

            // Check existence of the actual SOURCE and TARGET NODES
            const sourceNodeExists = allCombinedNodes.some( n => n.id === sourceNodeId ); // Should check for "flow-group"
            const targetNodeExists = allCombinedNodes.some( n => n.id === targetNodeId );

            if ( sourceNodeExists && targetNodeExists ) {
                 const edgeId = `handoff-${ mainFlowPrefix }-to-${ targetPrefix }-viaHandle-${ sourceHandle.replace( /\//g, "-" ) }-${ index }`;
                 const edge = {
                    id: edgeId,
                    source: sourceNodeId,       // The NODE containing the handle
                    target: targetNodeId,
                    sourceHandle: sourceHandle, // The specific handle ID (element name or default)
                    targetHandle: targetHandle,
                    type: "smoothstep",
                    animated: true,
                    label: `Handoff: ${ handoff.transition?.replace( /.*\//, "" ) }`,
                    style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
                    zIndex: Z_INDEXES.EDGE_INTER_FLOW,
                };
                newEdges.push( edge );
            } else {
                console.warn( `Could not create edge: Source Node (${ sourceNodeId }, exists: ${ sourceNodeExists }) or Target Node (${ targetNodeId }, exists: ${ targetNodeExists }) not found.` );
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
        if ( mainFlowData && connectedFlowsData.length > 0 && !isLoadingConnectedFlows ) {
            const allCombinedNodes = combineFlowDiagrams( nodes, connectedFlowsData );
            const interFlowEdges = createInterFlowEdges( mainFlowData, connectedFlowsData, allCombinedNodes );
            setCombinedEdges( interFlowEdges );
        } else if ( mainFlowData && connectedFlowsData.length === 0 && !isLoadingConnectedFlows ) {
            setCombinedEdges( [] );
        }
    }, [ mainFlowData, nodes, connectedFlowsData, isLoadingConnectedFlows, combineFlowDiagrams, createInterFlowEdges ] );

    return {
        connectedFlowsData,
        combinedNodes,
        combinedEdges,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
        setCombinedEdges,
    };
};
