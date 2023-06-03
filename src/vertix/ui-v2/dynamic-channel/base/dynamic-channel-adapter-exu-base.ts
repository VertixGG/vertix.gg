import { ChannelType, PermissionsBitField, VoiceChannel } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix/ui-v2/_base/ui-adapter-execution-steps-base";

import { UIAdapterReplyContext, UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { dynamicChannelRequirements } from "@vertix/ui-v2/dynamic-channel/base/_dynamic-channel-requirements";

export abstract class DynamicChannelAdapterExuBase<TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction> extends UIAdapterExecutionStepsBase<VoiceChannel, TInteraction> {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelAdapterExuBase";
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
