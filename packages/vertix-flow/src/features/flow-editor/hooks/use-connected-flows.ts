import { useState, useCallback, useEffect } from "react";
import axios from "axios";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";
import { getConnectedFlows } from "@vertix.gg/flow/src/shared/lib/flow-utils";
import { useFlowDiagram, useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { Node, Edge } from "@xyflow/react";
import type { FlowData } from "@vertix.gg/flow/src/shared/types/flow";

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
    const [ connectedFlowsData, setConnectedFlowsData ] = useState<FlowData[]>( [] );
    const [ combinedNodes, setCombinedNodes ] = useState<Node[]>( [] );
    const [ combinedEdges, setCombinedEdges ] = useState<Edge[]>( [] );
    const [ isLoadingConnectedFlows, setIsLoadingConnectedFlows ] = useState<boolean>( false );

    const { nodes, edges, handleSchemaLoaded: handleFlowDataLoaded } = useFlowDiagram();
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

    const combineFlowDiagrams = useCallback( ( mainNodes: Node[], mainEdges: Edge[], connectedFlows: FlowData[] ) => {
        const allNodes = [ ...mainNodes ];
        const allEdges = [ ...mainEdges ];
        let offsetX = 800;

        connectedFlows.forEach( ( flowData, index ) => {
            const { nodes: flowNodes, edges: flowEdges } = generateFlowDiagram( flowData );

            const prefixedNodes = flowNodes.map( node => ( {
                ...node,
                id: `flow-${ index }-${ node.id }`,
                position: {
                    x: ( node.position?.x || 0 ) + offsetX,
                    y: ( node.position?.y || 0 )
                },
                data: {
                    ...node.data,
                    isConnectedFlow: true,
                    flowIndex: index,
                    flowName: flowData.name
                }
            } ) );

            const prefixedEdges = flowEdges.map( edge => ( {
                ...edge,
                id: `flow-${ index }-${ edge.id }`,
                source: `flow-${ index }-${ edge.source }`,
                target: `flow-${ index }-${ edge.target }`
            } ) );

            if ( index === 0 && mainNodes.length > 0 ) {
                const mainFlowGroupId = mainNodes.find( n => n.id === "flow-group" )?.id || mainNodes[ 0 ].id;
                const connectedFlowGroupId = prefixedNodes.find( n => n.type === "compound" )?.id || prefixedNodes[ 0 ].id;

                allEdges.push( {
                    id: `connection-to-flow-${ index }`,
                    source: mainFlowGroupId,
                    target: connectedFlowGroupId,
                    type: "smoothstep",
                    animated: true,
                    style: {
                        stroke: "hsl(var(--warning))",
                        strokeWidth: 2
                    },
                    label: "Connected Flow"
                } );
            }

            allNodes.push( ...prefixedNodes );
            allEdges.push( ...prefixedEdges );
            offsetX += 800;
        } );

        setCombinedNodes( allNodes );
        setCombinedEdges( allEdges );
    }, [] );

    const handleMainFlowDataLoaded = useCallback( ( flowData: FlowData ) => {
        const mainDiagram = generateFlowDiagram( flowData );
        setCombinedNodes( mainDiagram.nodes );
        setCombinedEdges( mainDiagram.edges );

        handleFlowDataLoaded( flowData );

        const connectedFlowNames = getConnectedFlows( flowData );
        if ( connectedFlowNames.length > 0 ) {
            loadConnectedFlows( connectedFlowNames );
        }
    }, [ handleFlowDataLoaded ] );

    useEffect( () => {
        if ( nodes.length > 0 && connectedFlowsData.length > 0 && !isLoadingConnectedFlows ) {
            combineFlowDiagrams( nodes, edges, connectedFlowsData );
        }
    }, [ nodes, edges, connectedFlowsData, isLoadingConnectedFlows, combineFlowDiagrams ] );

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
