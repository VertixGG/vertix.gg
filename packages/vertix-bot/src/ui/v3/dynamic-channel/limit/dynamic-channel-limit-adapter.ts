import { DynamicChannelLimitComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-component";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-definitions";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

export class DynamicChannelLimitAdapter extends DynamicChannelAdapterExuBase<
    UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault
> {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelLimitAdapter";
    }

    public static getComponent() {
        return DynamicChannelLimitComponent;
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V3/DynamicChannelLimitInvalidInput": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelLimitInvalidInputEmbedGroup"
            },
            "Vertix/UI-V3/DynamicChannelLimitSuccess": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelLimitSuccessEmbedGroup"
            },
            "Vertix/UI-V3/DynamicChannelLimitError": {
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            }
        };
    }

    protected onEntityMap() {
        this.bindModal<ModalSubmitInteractionDefault>("Vertix/UI-V3/DynamicChannelLimitModal", this.onModalSubmit);
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs(interaction: UIDefaultButtonChannelVoiceInteraction) {
        const args: UIArgs = {};

        switch (this.getCurrentExecutionStep()?.name) {
            case "Vertix/UI-V3/DynamicChannelLimitInvalidInput":
                args.minValue = DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH;
                args.maxValue = DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH;
                break;

            default:
                args.userLimit = interaction.channel.userLimit;
        }

        return args;
    }

    private async onModalSubmit(interaction: ModalSubmitInteractionDefault) {
        const input = interaction.fields.getTextInputValue(
                "Vertix/UI-V3/DynamicChannelLimitAdapter:Vertix/UI-V3/DynamicChannelLimitInput"
            ),
            parsedInput = parseInt(input);

        if (
            Number.isNaN(parsedInput) ||
            parsedInput < DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH ||
            parsedInput > DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH
        ) {
            return await this.ephemeralWithStep(interaction, "Vertix/UI-V3/DynamicChannelLimitInvalidInput", {});
        }

        if (!(await this.dynamicChannelService.editUserLimit(interaction, interaction.channel, parsedInput))) {
            return await this.ephemeralWithStep(interaction, "Vertix/UI-V3/DynamicChannelLimitError", {});
        }

        return await this.ephemeralWithStep(interaction, "Vertix/UI-V3/DynamicChannelLimitSuccess", {});
    }
}
