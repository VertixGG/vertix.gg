import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AIAgentEmbed } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-embed";
import { AIAgentChannelSelectMenu } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-channel-select-menu";
import { AIAgentSendButton } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-send-button";
import { AIAgentSendModal } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-send-modal";
import { AIAgentConfirmSendButton } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-confirm-send-button";
import { AIAgentCancelDraftButton } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-cancel-draft-button";

export class AIAgentComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/AIAgentComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ AIAgentChannelSelectMenu ],
            [ AIAgentSendButton, AIAgentConfirmSendButton, AIAgentCancelDraftButton ]
        ];
    }

    public static getEmbeds() {
        return [ AIAgentEmbed ];
    }

    public static getModals() {
        return [ AIAgentSendModal ];
    }
}

