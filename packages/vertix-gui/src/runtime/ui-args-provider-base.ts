import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Base class for UI args providers. Concrete providers should implement
 * adapter-specific logic for building the arguments passed to adapters.
 */
export abstract class UIArgsProviderBase extends UIBase {

    public abstract getArgs(
        context: unknown,
        argsFromManager?: Record<string, unknown>
    ): Promise<UIArgs> | UIArgs;
}
