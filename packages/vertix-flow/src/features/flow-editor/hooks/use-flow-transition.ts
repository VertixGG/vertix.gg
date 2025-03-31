import { useCallback } from "react";

import { useConnectedFlows } from "@vertix.gg/flow/src/features/flow-editor/hooks/use-connected-flows";
import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

import type { FlowInteractionController } from "@vertix.gg/flow/src/shared/lib/flow-factory";

interface UseFlowTransitionProps {
    controller: FlowInteractionController | null;
    setCurrentState: ( state: string | null ) => void;
    setAvailableTransitions: ( transitions: string[] ) => void;
    setFlowData: ( data: Record<string, unknown> ) => void;
}

/**
 * Hook to handle flow transitions with connected flow loading
 */
export const useFlowTransition = ( {
    controller,
    setCurrentState,
    setAvailableTransitions,
    setFlowData,
}: UseFlowTransitionProps ) => {
    const { setError, setLoading } = useFlowUI();
    const { loadConnectedFlows } = useConnectedFlows();

    const handleTransition = useCallback( async( transition: string ) => {
        if ( !controller ) return;

        try {
            setLoading( true );
            controller.performTransition( transition );

            // Update state after transition
            const newState = controller.getInitialState();
            const transitions = controller.getAvailableTransitions( newState );

            setCurrentState( newState );
            setAvailableTransitions( transitions );
            setFlowData( controller.getStateData() );

            // Get the target flow name from the transition
            const targetFlowName = controller.getTargetFlowName?.( transition );
            if ( targetFlowName ) {
                // Load connected flows for the target flow
                await loadConnectedFlows( [ targetFlowName ] );
            }
        } catch ( err ) {
            console.error( `Error during transition ${ transition }:`, err );
            setError( `Failed to perform transition: ${ transition }` );
        } finally {
            setLoading( false );
        }
    }, [ controller, setCurrentState, setAvailableTransitions, setFlowData, setError, setLoading, loadConnectedFlows ] );

    return { handleTransition };
};
