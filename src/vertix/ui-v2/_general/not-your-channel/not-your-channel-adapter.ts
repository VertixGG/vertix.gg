import { VoiceChannel } from "discord.js";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";

import { NotYourChannelComponent } from "@vertix/ui-v2/_general/not-your-channel/not-your-channel-component";

export class NotYourChannelAdapter extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "Vertix/UI-V2/NotYourChannelAdapter";
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
