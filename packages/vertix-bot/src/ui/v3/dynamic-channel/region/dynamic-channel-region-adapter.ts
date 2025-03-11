import { VoiceChannel } from "discord.js";

import { DynamicChannelAdapterExuWithInitiatorElementBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-with-initiator-element-base";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import { DynamicChannelRegionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-component";

import type { Message } from "discord.js";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

export class DynamicChannelRegionAdapter extends DynamicChannelAdapterExuWithInitiatorElementBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRegionAdapter";
    }

    public static getComponent() {
        return DynamicChannelRegionComponent;
    }

    protected static getInitiatorElement() {
        return DynamicChannelRegionButton;
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        return await this.getArgs( interaction.channel );
    }

    protected async getEditMessageArgs( message?: Message<true> ) {
        return message?.channel && message.channel instanceof VoiceChannel ? await this.getArgs( message.channel ) : {};
    }

    protected onEntityMap() {
        this.bindSelectMenu( "Vertix/UI-V3/DynamicChannelRegionSelectMenu", this.onRegionSelected );
    }

    private async onRegionSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const newRegion = interaction.values[ 0 ];

        await this.dynamicChannelService.editChannelRegion( interaction, interaction.channel, newRegion );

        await this.editReply( interaction );
    }

    private async getArgs( channel: VoiceChannel ) {
        return {
            region: channel.rtcRegion
        };
    }
}
