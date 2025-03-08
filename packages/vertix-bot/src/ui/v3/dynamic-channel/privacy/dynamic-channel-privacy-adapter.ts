import { DynamicChannelAdapterExuWithPermissionsBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-with-permissions-base";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { Message, VoiceChannel } from "discord.js";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

export class DynamicChannelPrivacyAdapter extends DynamicChannelAdapterExuWithPermissionsBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrivacyAdapter";
    }

    public static getComponent() {
        return DynamicChannelPrivacyComponent;
    }

    protected static getInitiatorElement() {
        return DynamicChannelPrivacyButton;
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs(interaction: UIDefaultButtonChannelVoiceInteraction) {
        return this.getArgs(interaction.channel);
    }

    protected async getEditMessageArgs(message?: Message<true>) {
        return message ? this.getArgs(message.channel as VoiceChannel) : {};
    }

    protected onEntityMap() {
        this.bindSelectMenu("Vertix/UI-V3/DynamicChannelPrivacyMenu", this.onPrivacyMenuSelected);
    }

    protected async onPrivacyMenuSelected(interaction: UIDefaultUserSelectMenuChannelVoiceInteraction) {
        const state = interaction.values[0];

        await this.dynamicChannelService.editChannelPrivacyState(
            interaction,
            interaction.channel,
            state as "public" | "private" | "hidden"
        );

        await this.editReply(interaction);
    }

    private async getArgs(channel: VoiceChannel) {
        const args: UIArgs = {};

        await this.assignUsersWithPermissions(channel, args);

        args.state = await this.dynamicChannelService.getChannelPrivacyState(channel);

        return args;
    }
}
