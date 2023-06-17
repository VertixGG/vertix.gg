import { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";

import { DynamicChannelMetaLimitComponent } from "./dynamic-channel-meta-limit-component";

import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { DynamicChannelAdapterExuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-definitions";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

export class DynamicChannelMetaLimitAdapter extends DynamicChannelAdapterExuBase<UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault> {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaLimitComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V2/DynamicChannelMetaLimitInvalidInput": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaLimitInvalidInputEmbedGroup",
            },
            "Vertix/UI-V2/DynamicChannelMetaLimitSuccess": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelMetaLimitSuccessEmbedGroup",
            },
            "Vertix/UI-V2/DynamicChannelMetaLimitError": {
                embedsGroup: "Vertix/UI-V2/SomethingWentWrongEmbedGroup",
            }
        };
    }

    protected onEntityMap() {
        this.bindModal<ModalSubmitInteractionDefault>( "Vertix/UI-V2/DynamicChannelMetaLimitModal", this.onModalSubmit );
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V2/DynamicChannelMetaLimitInvalidInput":
                args.minValue = DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH;
                args.maxValue = DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH;
                break;

            default:
                args.userLimit = interaction.channel.userLimit;
        }

        return args;
    }

    protected shouldDeletePreviousReply() {
        return true;
    }

    private async onModalSubmit( interaction: ModalSubmitInteractionDefault ) {
        const input = interaction.fields.getTextInputValue(
                "Vertix/UI-V2/DynamicChannelMetaLimitAdapter:Vertix/UI-V2/DynamicChannelMetaLimitInput"
            ),
            parsedInput = parseInt( input );

        if ( Number.isNaN( parsedInput ) || parsedInput < DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH || parsedInput > DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH ) {
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaLimitInvalidInput", {} );
        }

        if ( ! await DynamicChannelManager.$.editUserLimit( interaction.channel, parsedInput ) ) {
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaLimitError", {} );
        }

        return await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelMetaLimitSuccess", {} );
    }
}
