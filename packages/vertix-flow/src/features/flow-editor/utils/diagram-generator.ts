import { flowFactory } from "@vertix.gg/flow/src/shared/lib/flow-factory";

import type { FlowDiagram, FlowData } from "@vertix.gg/flow/src/shared/types/flow";

// Function to generate flow diagram using factory - don't use hooks here
export function generateFlowDiagram( flowData: FlowData ): FlowDiagram {
    // Use the factory singleton directly instead of the hook
    return flowFactory.createFlowDiagram( flowData );
}
