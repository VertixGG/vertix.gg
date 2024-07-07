import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/_dynamic-channel-requirements";

import type { UIAdapterReplyContext, UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

export abstract class DynamicChannelAdapterExuBase<TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction> extends UIAdapterExecutionStepsBase<VoiceChannel, TInteraction> {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelAdapterExuBase";
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
        ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ) {
        return await dynamicChannelRequirements( interaction );
    }
}
