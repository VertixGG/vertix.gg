
import { DynamicChannelMetaLimitComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/meta/limit/dynamic-channel-meta-limit-component";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/meta/limit/dynamic-channel-meta-limit-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

export class DynamicChannelMetaLimitAdapter extends DynamicChannelAdapterExuBase<UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault> {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelMetaLimitAdapter";
    }

    public static getComponent() {
        return DynamicChannelMetaLimitComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V3/DynamicChannelMetaLimitInvalidInput": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelMetaLimitInvalidInputEmbedGroup",
            },
            "Vertix/UI-V3/DynamicChannelMetaLimitSuccess": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelMetaLimitSuccessEmbedGroup",
            },
            "Vertix/UI-V3/DynamicChannelMetaLimitError": {
                embedsGroup: "Vertix/UI-V3/SomethingWentWrongEmbedGroup",
            }
        };
    }

    protected onEntityMap() {
        this.bindModal<ModalSubmitInteractionDefault>( "Vertix/UI-V3/DynamicChannelMetaLimitModal", this.onModalSubmit );
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V3/DynamicChannelMetaLimitInvalidInput":
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
                "Vertix/UI-V3/DynamicChannelMetaLimitAdapter:Vertix/UI-V3/DynamicChannelMetaLimitInput"
            ),
            parsedInput = parseInt( input );

        if ( Number.isNaN( parsedInput ) || parsedInput < DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH || parsedInput > DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH ) {
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelMetaLimitInvalidInput", {} );
        }

        if ( ! await this.dynamicChannelService.editUserLimit( interaction, interaction.channel, parsedInput ) ) {
            return await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelMetaLimitError", {} );
        }

        return await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelMetaLimitSuccess", {} );
    }
}
