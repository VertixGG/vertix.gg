import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class AIAgentCancelDraftButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/AIAgentCancelDraftButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel(): Promise<string> {
        return "Cancel";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getEmoji(): Promise<string> {
        return "✖️";
    }

    protected async isAvailable(): Promise<boolean> {
        const draftContent = this.uiArgs?.draftContent;

        return typeof draftContent === "string" && draftContent.trim().length > 0;
    }
}

