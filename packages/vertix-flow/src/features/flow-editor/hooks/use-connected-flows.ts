import { useState, useCallback, useEffect } from "react";
import axios from "axios";

import { generateFlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/utils/diagram-generator";
import { getConnectedFlows } from "@vertix.gg/flow/src/shared/lib/flow-utils";
import { useFlowDiagram, useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { Node } from "@xyflow/react";
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
    isLoadingConnectedFlows: boolean;
    handleMainFlowDataLoaded: ( flowData: FlowData ) => void;
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export const useConnectedFlows = (): UseConnectedFlowsReturn => {
    const [ connectedFlowsData, setConnectedFlowsData ] = useState<FlowData[]>( [] );
    const [ combinedNodes, setCombinedNodes ] = useState<Node[]>( [] );
    const [ isLoadingConnectedFlows, setIsLoadingConnectedFlows ] = useState<boolean>( false );

    const { nodes, handleFlowDataLoaded } = useFlowDiagram();
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
        const allNodes = [ ...mainNodes ];
        let offsetX = 800;

        connectedFlows.forEach( ( flowData, index ) => {
            const { nodes: flowNodes } = generateFlowDiagram( flowData );

            const prefixedNodes = flowNodes.map( node => ( {
                ...node,
                id: `${ flowData.name }-node-${ node.id }`,
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

            allNodes.push( ...prefixedNodes );
            offsetX += 800;
        } );

        setCombinedNodes( allNodes );
    }, [] );

    const handleMainFlowDataLoaded = useCallback( ( flowData: FlowData ) => {
        const mainDiagram = generateFlowDiagram( flowData );
        setCombinedNodes( mainDiagram.nodes );

        handleFlowDataLoaded( flowData );

        const connectedFlowNames = getConnectedFlows( flowData );
        if ( connectedFlowNames.length > 0 ) {
            loadConnectedFlows( connectedFlowNames );
        }
    }, [ handleFlowDataLoaded ] );

    useEffect( () => {
        if ( nodes.length > 0 && connectedFlowsData.length > 0 && !isLoadingConnectedFlows ) {
            combineFlowDiagrams( nodes, connectedFlowsData );
        }
    }, [ nodes, connectedFlowsData, isLoadingConnectedFlows, combineFlowDiagrams ] );

    return {
        connectedFlowsData,
        combinedNodes,
        isLoadingConnectedFlows,
        handleMainFlowDataLoaded,
        setCombinedNodes,
    };
};
