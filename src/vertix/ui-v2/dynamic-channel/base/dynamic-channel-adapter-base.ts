import { ChannelType, PermissionsBitField, VoiceChannel } from "discord.js";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { dynamicChannelRequirements } from "@vertix/ui-v2/dynamic-channel/base/_dynamic-channel-requirements";

import Logger from "@internal/modules/logger";

export abstract class DynamicChannelAdapterBase extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    protected static logger = new Logger( this );

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelAdapterBase";
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
        ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        return await dynamicChannelRequirements( interaction );
    }
}
