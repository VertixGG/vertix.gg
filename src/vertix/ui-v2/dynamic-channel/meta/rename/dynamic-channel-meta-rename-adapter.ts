import { VoiceChannel } from "discord.js";

import { ChannelModel } from "@vertix-base/models/channel-model";

import { DynamicChannelMetaRenameComponent } from "./dynamic-channel-meta-rename-component";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";

import { DynamicChannelAdapterExuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

export class DynamicChannelMetaRenameAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaRenameComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V2/DynamicChannelMetaRenameBadword": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameBadwordEmbedGroup",
            },
            "Vertix/UI-V2/DynamicChannelMetaRenameSuccess": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameSuccessEmbedGroup",
            },
            "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaRenameLimitedEmbedGroup",
            },
        };
    }

    protected async getStartArgs( channel: VoiceChannel ) {
        return {};
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        // noinspection FallThroughInSwitchStatementJS
        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V2/DynamicChannelMetaRenameBadword":
                args.badword = argsFromManager.badword;
                break;

            case "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited":
                args.masterChannelId = argsFromManager.masterChannelId;
                args.retryAfter = argsFromManager.retryAfter;
                break;

            default:
                args.defaultChannelName = await DynamicChannelManager.$.getAssembledChannelNameTemplate(
                    interaction.channel,
                    interaction.user.id,
                    true
                );

            case "Vertix/UI-V2/DynamicChannelMetaRenameSuccess":
                args.channelName = interaction.channel.name;
                break;
        }

        return args;
    }

    protected onEntityMap() {
        this.bindModal<UIDefaultModalChannelVoiceInteraction>( "Vertix/UI-V2/DynamicChannelMetaRenameModal", this.onModalSubmit );
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onModalSubmit( interaction: UIDefaultModalChannelVoiceInteraction ) {
        let newChannelName = interaction.fields.getTextInputValue(
                "Vertix/UI-V2/DynamicChannelMetaRenameAdapter:Vertix/UI-V2/DynamicChannelMetaRenameInput"
            ),
            masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( interaction.channel.id );

        if ( ! newChannelName ) {
            newChannelName = await DynamicChannelManager.$.getAssembledChannelNameTemplate(
                interaction.channel,
                interaction.user.id,
                true
            ) || interaction.channel.name;
        }

        const result = await DynamicChannelManager.$.editChannelName( interaction,interaction.channel, newChannelName );

        switch ( result.code ) {
            case "success":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameSuccess", {} );
                break;

            case "badword":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameBadword", {
                    badword: result.badword,
                } );
                break;

            case "rate-limit":
                await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaRenameRateLimited", {
                    retryAfter: result.retryAfter,
                    masterChannelId: masterChannelDB?.channelId, // No worries embed handles this situation.
                } );
                break;
        }
    }
}
