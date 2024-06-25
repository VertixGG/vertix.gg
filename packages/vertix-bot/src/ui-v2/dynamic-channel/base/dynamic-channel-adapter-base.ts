import { ChannelType, PermissionsBitField } from "discord.js";

import  { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/_dynamic-channel-requirements";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

export abstract class DynamicChannelAdapterBase extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    protected static logger = new Logger( this.getName() );

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
