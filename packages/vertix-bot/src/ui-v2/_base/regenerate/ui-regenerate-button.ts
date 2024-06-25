import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import type { UIButtonStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class UIRegenerateButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/UIRegenerateButton";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Regenerate" );
    }

    protected async getEmoji(): Promise<string> {
        return "⚡";
    }
}
