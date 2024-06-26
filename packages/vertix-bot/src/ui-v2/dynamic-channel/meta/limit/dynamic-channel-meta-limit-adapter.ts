
import { DynamicChannelMetaLimitComponent } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-component";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

export class DynamicChannelMetaLimitAdapter extends DynamicChannelAdapterExuBase<UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault> {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaLimitComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInputEmbedGroup",
            },
            "VertixBot/UI-V2/DynamicChannelMetaLimitSuccess": {
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaLimitSuccessEmbedGroup",
            },
            "VertixBot/UI-V2/DynamicChannelMetaLimitError": {
                embedsGroup: "VertixBot/UI-V2/SomethingWentWrongEmbedGroup",
            }
        };
    }

    protected onEntityMap() {
        this.bindModal<ModalSubmitInteractionDefault>( "VertixBot/UI-V2/DynamicChannelMetaLimitModal", this.onModalSubmit );
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep()?.name ) {
            case "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput":
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
                "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter:VertixBot/UI-V2/DynamicChannelMetaLimitInput"
            ),
            parsedInput = parseInt( input );

        if ( Number.isNaN( parsedInput ) || parsedInput < DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH || parsedInput > DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH ) {
            return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput", {} );
        }

        if ( ! await this.dynamicChannelService.editUserLimit( interaction, interaction.channel, parsedInput ) ) {
            return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaLimitError", {} );
        }

        return await this.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaLimitSuccess", {} );
    }
}
