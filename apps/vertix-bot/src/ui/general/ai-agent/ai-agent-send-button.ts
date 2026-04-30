import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class AIAgentSendButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/AIAgentSendButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel(): Promise<string> {
        return "Send";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getEmoji(): Promise<string> {
        return "📨";
    }

    protected async isDisabled(): Promise<boolean> {
        const selectedChannelId = this.uiArgs?.selectedChannelId;

        return typeof selectedChannelId !== "string" || selectedChannelId.length === 0;
    }

    protected async isAvailable(): Promise<boolean> {
        const draftContent = this.uiArgs?.draftContent;

        return typeof draftContent !== "string" || draftContent.length === 0;
    }
}

