import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class UIRuntimeFlags extends InitializeBase {
    public static override getName() {
        return "VertixGUI/Runtime/UIRuntimeFlags";
    }

    public static isExportRuntime(): boolean {
        try {
            const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService", { silent: true } );
            return uiService?.isUsingExports?.() ?? false;
        } catch {
            return false;
        }
    }

    public static isCodeRuntime(): boolean {
        return !this.isExportRuntime();
    }
}

export const UI_RUNTIME_FLAGS_NAME = UIRuntimeFlags.getName();

export function isExportRuntime(): boolean {
    return UIRuntimeFlags.isExportRuntime();
}

export function isCodeRuntime(): boolean {
    return UIRuntimeFlags.isCodeRuntime();
}
