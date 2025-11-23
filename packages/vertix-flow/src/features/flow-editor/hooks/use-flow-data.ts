import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";
import { fetchUIFlow } from "@vertix.gg/flow/src/lib/api/ui-flow-client";

import type { FlowData } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

export function useFlowData( moduleName: string, flowName: string ) {
    return useAsyncResource<FlowData>(
        () => fetchUIFlow( { moduleName, flowName } ),
        [ moduleName, flowName ]
    );
}
