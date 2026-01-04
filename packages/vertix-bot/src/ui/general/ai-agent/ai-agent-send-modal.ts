import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AIAgentMessageInput } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-message-input";

export class AIAgentSendModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/AIAgentSendModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle(): string {
        return "Send message";
    }

    public static getInputElements() {
        return [ [ AIAgentMessageInput ] ];
    }
}


