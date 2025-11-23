import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";
import { fetchUIModules } from "@vertix.gg/flow/src/lib/api/ui-flow-client";

import type { UIModulesResponse } from "@vertix.gg/flow/src/shared/types/flow-data";

export function useUIModules() {
    return useAsyncResource<UIModulesResponse>(
        () => fetchUIModules(),
        [ "ui-modules" ]
    );
}
