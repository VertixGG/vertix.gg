import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIRegenerateButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-GeneralUIRegenerateButton";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve("primary");
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve("Regenerate");
    }

    protected async getEmoji(): Promise<string> {
        return "⚡";
    }
}
