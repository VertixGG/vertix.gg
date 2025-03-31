import type { FlowClass } from "@vertix.gg/flow/src/features/flow-editor/components/flow-interaction";

// Interface for flow interaction control
export interface FlowInteractionController {
    getInitialState(): string;

    getAvailableTransitions( state: string ): string[];

    performTransition( transition: string ): void;

    getStateData(): Record<string, unknown>;

    getTargetFlowName?( transition: string ): string | undefined;
}

/**
 * Factory for creating flow interaction controllers
 */
class FlowFactory {
    /**
     * Create a flow interaction controller for a given flow class
     */
    public createFlowInteraction( FlowClass: FlowClass ): FlowInteractionController {
        const flowInstance = new FlowClass();

        return {
            getInitialState: () => flowInstance.getInitialState(),
            getAvailableTransitions: ( state: string ) => flowInstance.getAvailableTransitions( state ),
            performTransition: ( transition: string ) => flowInstance.transition?.( transition ),
            getStateData: () => flowInstance.getData() || {},
            getTargetFlowName: ( transition: string ) => flowInstance.getTargetFlowName?.( transition ),
        };
    }
}

export const flowFactory = new FlowFactory();
