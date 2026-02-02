import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelMetaLimitComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH,
    DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction, UIDefaultModalChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ModalMessageModalSubmitInteraction, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

const LIMIT_STEPS = {
    default: {},
    "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInputEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelMetaLimitSuccess": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaLimitSuccessEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelMetaLimitError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

const DynamicChannelMetaLimitAdapter = new DynamicExecutionAdapterBuilder<
    UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault
>( "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter" )
    .setComponent( DynamicChannelMetaLimitComponent )
    .setExecutionSteps( LIMIT_STEPS )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { userLimit: "10" }
            } )
            .addState( "InvalidInput", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput",
                navigationType: "ephemeral",
                previewDefaultVars: { minValue: "0", maxValue: "99" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaLimitSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { userLimit: "10" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaLimitError",
                navigationType: "ephemeral"
            } )
            .addTransition( "SubmitInvalid", {
                from: "Default",
                to: "InvalidInput",
                mutations: [
                    { type: "set", path: [ "minValue" ] },
                    { type: "set", path: [ "maxValue" ] }
                ]
            } )
            .addTransition( "SubmitSuccess", {
                from: "Default",
                to: "Success",
                mutations: [ { type: "set", path: [ "userLimit" ] } ]
            } )
            .addTransition( "SubmitError", { from: "Default", to: "Error" } )
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelMetaLimitModal",
                "SubmitSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as ModalSubmitInteractionDefault;
                    const limitButtonId = context.customIdStrategy.generateId(
                        "VertixBot/UI-V2/DynamicChannelMetaLimitAdapter:VertixBot/UI-V2/DynamicChannelMetaLimitInput"
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
                            "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput",
                            {}
                        );
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    if ( !( await dynamicChannelService.editUserLimit( voiceInteraction, voiceInteraction.channel, parsedInput ) ) ) {
                        return await context.ephemeralWithStep(
                            voiceInteraction,
                            "VertixBot/UI-V2/DynamicChannelMetaLimitError",
                            {}
                        );
                    }

                    context.setArgs( voiceInteraction, {
                        userLimit: parsedInput
                    } );

                    return await context.ephemeralWithStep(
                        voiceInteraction,
                        "VertixBot/UI-V2/DynamicChannelMetaLimitSuccess",
                        {}
                    );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => {
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/DynamicChannelMetaLimitInvalidInput":
                args.minValue = DYNAMIC_CHANNEL_META_LIMIT_MIN_INPUT_LENGTH;
                args.maxValue = DYNAMIC_CHANNEL_META_LIMIT_MAX_INPUT_LENGTH;
                break;

            default:
                args.userLimit = interaction.channel.userLimit;
        }

        return args;
    } )
    .build();

export { DynamicChannelMetaLimitAdapter };
