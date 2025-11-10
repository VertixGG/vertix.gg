// Function to generate flow diagram using factory - don't use hooks here
import { flowFactory } from "@vertix.gg/flow/src/features/flow-editor/utils/flow-factory";

import type { FlowData, FlowDiagram } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

export function generateFlowDiagram( flowData: FlowData ): FlowDiagram {
    // Use the factory singleton directly instead of the hook
    return flowFactory.createFlowDiagram( flowData );
}
