import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class PromptResetButton extends UIElementButtonBase {
    public static getName() {
        return "VertixAI/UI/PromptResetButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel(): Promise<string> {
        return "Reset to default";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "danger" );
    }

    protected async getEmoji(): Promise<string> {
        return "♻️";
    }

    /** Nothing to reset while the guild is still on the shipped default. */
    protected async isDisabled(): Promise<boolean> {
        return true !== this.uiArgs?.hasCustomPrompt;
    }
}
