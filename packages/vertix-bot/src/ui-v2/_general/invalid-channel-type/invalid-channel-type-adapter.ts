import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import {
    InvalidChannelTypeComponent
} from "@vertix.gg/bot/src/ui-v2/_general/invalid-channel-type/invalid-channel-type-component";

import type { BaseGuildTextChannel } from "discord.js";

import type { UIArgs  } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

export class InvalidChannelTypeAdapter extends UIAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "Vertix/UI-V2/InvalidChannelTypeAdapter";
    }

    public static getComponent() {
        return InvalidChannelTypeComponent;
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ) {
        return {
            channelTypes: argsFromManager.channelTypes,
        };
    }

    protected shouldDisableMiddleware(): boolean {
        return true;
    }
}
