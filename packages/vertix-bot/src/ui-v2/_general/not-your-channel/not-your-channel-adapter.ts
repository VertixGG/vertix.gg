import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import { NotYourChannelComponent } from "@vertix.gg/bot/src/ui-v2/_general/not-your-channel/not-your-channel-component";

import type { VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

export class NotYourChannelAdapter extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "VertixBot/UI-V2/NotYourChannelAdapter";
    }

    public static getComponent() {
        return NotYourChannelComponent;
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        return {
            masterChannelId: argsFromManager?.masterChannelId,
        };
    }

    protected shouldDisableMiddleware() {
        return true;
    }
}
