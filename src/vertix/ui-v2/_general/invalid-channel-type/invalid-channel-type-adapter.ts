import { BaseGuildTextChannel } from "discord.js";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";

import { UIArgs  } from "@vertix/ui-v2/_base/ui-definitions";
import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import {
    InvalidChannelTypeComponent
} from "@vertix/ui-v2/_general/invalid-channel-type/invalid-channel-type-component";

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
