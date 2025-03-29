import { useCallback } from "react";
import { applyNodeChanges } from "@xyflow/react";

import type { NodeChange, Node } from "@xyflow/react";

export interface UseFlowDiagramProps {
    setCombinedNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export interface UseFlowDiagramReturn {
    onNodesChange: ( changes: NodeChange[] ) => void;
}

export const useFlowDiagram = ( {
    setCombinedNodes,
}: UseFlowDiagramProps ): UseFlowDiagramReturn => {
    const onNodesChange = useCallback( ( changes: NodeChange[] ) => {
        setCombinedNodes( ( nodes: Node[] ) => applyNodeChanges( changes, nodes ) );
    }, [ setCombinedNodes ] );

    return {
        onNodesChange,
    };
};
