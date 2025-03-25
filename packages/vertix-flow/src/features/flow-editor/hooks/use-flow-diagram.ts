import { useCallback } from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";

import type { NodeChange, EdgeChange, Connection, Node, Edge } from "@xyflow/react";

export interface UseFlowDiagramProps {
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setCombinedEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export interface UseFlowDiagramReturn {
    onNodesChange: ( changes: NodeChange[] ) => void;
    onEdgesChange: ( changes: EdgeChange[] ) => void;
    onConnect: ( params: Connection ) => void;
}

export const useFlowDiagram = ( {
    setCombinedNodes,
    setCombinedEdges,
}: UseFlowDiagramProps ): UseFlowDiagramReturn => {
    const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
        setCombinedNodes( ( nodes: Node[] ) => applyNodeChanges( changes, nodes ) );
    }, [ setCombinedNodes ] );

    const onEdgesChange = useCallback( ( changes: EdgeChange[] ) => {
        setCombinedEdges( ( edges: Edge[] ) => applyEdgeChanges( changes, edges ) );
    }, [ setCombinedEdges ] );

    const onConnect = useCallback( ( params: Connection ) => {
        setCombinedEdges( ( edges: Edge[] ) => addEdge( params, edges ) );
    }, [ setCombinedEdges ] );

    return {
        onNodesChange,
        onEdgesChange,
        onConnect,
    };
};
