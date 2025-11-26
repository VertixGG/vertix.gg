import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelLimitComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-component";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-definitions";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction, UIDefaultModalChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

const LIMIT_STEPS = {
    default: {},
    "VertixBot/UI-V3/DynamicChannelLimitInvalidInput": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelLimitInvalidInputEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelLimitSuccess": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelLimitSuccessEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelLimitError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

const DynamicChannelLimitAdapter = new DynamicExecutionAdapterBuilder<
        UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault
>( "VertixBot/UI-V3/DynamicChannelLimitAdapter" )
    .setComponent( DynamicChannelLimitComponent )
    .setExecutionSteps( LIMIT_STEPS )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => {
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelLimitInvalidInput":
                args.minValue = DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH;
                args.maxValue = DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH;
                break;

            default:
                args.userLimit = interaction.channel.userLimit;
        }

        return args;
    } )
    .onEntityMap( async( { bindModal } ) => {
        bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-V3/DynamicChannelLimitModal",
            async( context, interaction ) => {
                const voiceInteraction = interaction as unknown as ModalSubmitInteractionDefault;
                const limitButtonId = context.customIdStrategy.generateId(
                    "VertixBot/UI-V3/DynamicChannelLimitAdapter:VertixBot/UI-V3/DynamicChannelLimitInput"
                );

                const input = voiceInteraction.fields.getTextInputValue( limitButtonId ),
                    parsedInput = parseInt( input );

                if (
                    Number.isNaN( parsedInput ) ||
                    parsedInput < DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH ||
                    parsedInput > DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH
                ) {
                    context.setArgs( voiceInteraction, {
                        minValue: DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH,
                        maxValue: DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH
                    } );

                    return await context.ephemeralWithStep(
                        voiceInteraction,
                        "VertixBot/UI-V3/DynamicChannelLimitInvalidInput",
                        {}
                    );
                }

                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                if ( !( await dynamicChannelService.editUserLimit( voiceInteraction, voiceInteraction.channel, parsedInput ) ) ) {
                    return await context.ephemeralWithStep(
                        voiceInteraction,
                        "VertixBot/UI-V3/DynamicChannelLimitError",
                        {}
                    );
                }

                context.setArgs( voiceInteraction, {
                    userLimit: parsedInput
                } );

                return await context.ephemeralWithStep(
                    voiceInteraction,
                    "VertixBot/UI-V3/DynamicChannelLimitSuccess",
                    {}
                );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelLimitFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitInvalid",
                        mutations: [
                            { type: "set", path: [ "minValue" ] },
                            { type: "set", path: [ "maxValue" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelLimitFlow/States/InvalidInput",
                            executionStep: "VertixBot/UI-V3/DynamicChannelLimitInvalidInput"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelLimitFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess",
                        mutations: [
                            { type: "set", path: [ "userLimit" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Success",
                            executionStep: "VertixBot/UI-V3/DynamicChannelLimitSuccess"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelLimitFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitError",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Error",
                            executionStep: "VertixBot/UI-V3/DynamicChannelLimitError"
                        }
                    }
                ]
            }
        );
    } )
    .build();

export { DynamicChannelLimitAdapter };
