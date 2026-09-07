import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class PromptDownloadButton extends UIElementButtonBase {
    public static getName() {
        return "VertixAI/UI/PromptDownloadButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel(): Promise<string> {
        return "Download";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getEmoji(): Promise<string> {
        return "📥";
    }
}
