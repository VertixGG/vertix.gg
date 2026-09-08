import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelStatusComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/status/dynamic-channel-status-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelSetStatusResultCode } from "@vertix.gg/bot/src/definitions/dynamic-channel-status";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { DynamicChannelStatusService } from "@vertix.gg/bot/src/services/dynamic-channel-status-service";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

const DynamicChannelStatusAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelStatusAdapter"
)
    .setComponent( DynamicChannelStatusComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { defaultChannelStatus: "Valorant · 3/5" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelStatusSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { channelStatus: "Ranked grind, need two" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelStatusSuccessEmbedGroup"
            } )
            .addState( "Cleared", {
                executionStep: "VertixBot/UI-V3/DynamicChannelStatusCleared",
                navigationType: "ephemeral",
                previewDefaultVars: { channelStatus: "Valorant · 3/5" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelStatusClearedEmbedGroup"
            } )
            .addState( "Badword", {
                executionStep: "VertixBot/UI-V3/DynamicChannelStatusBadword",
                navigationType: "ephemeral",
                previewDefaultVars: { badword: "example" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelStatusBadwordEmbedGroup"
            } )
            .addTransition( "SubmitSuccess", { from: "Default", to: "Success" } )
            .addTransition( "SubmitCleared", { from: "Default", to: "Cleared" } )
            .addTransition( "SubmitBadword", {
                from: "Default",
                to: "Badword",
                mutations: [ { type: "set", path: [ "badword" ] } ]
            } )
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelStatusModal",
                "SubmitSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultModalChannelVoiceInteraction;

                    const statusInputId = context.customIdStrategy.generateId(
                        "VertixBot/UI-V3/DynamicChannelStatusAdapter:VertixBot/UI-V3/DynamicChannelStatusInput"
                    );

                    const dynamicChannelStatusService = ServiceLocator.$.get<DynamicChannelStatusService>(
                        "VertixBot/Services/DynamicChannelStatus"
                    );

                    const newStatus = voiceInteraction.fields.getTextInputValue( statusInputId );

                    const result = await dynamicChannelStatusService.setCustomStatus(
                        voiceInteraction.channel,
                        newStatus
                    );

                    switch ( result.code ) {
                        case DynamicChannelSetStatusResultCode.Success:
                            await context.triggerTransition( "SubmitSuccess", voiceInteraction, {
                                channelStatus: result.status
                            } );
                            break;

                        case DynamicChannelSetStatusResultCode.Cleared:
                            await context.triggerTransition( "SubmitCleared", voiceInteraction, {
                                channelStatus: await dynamicChannelStatusService.getComposedStatus(
                                    voiceInteraction.channel
                                )
                            } );
                            break;

                        case DynamicChannelSetStatusResultCode.Badword:
                            await context.triggerTransition( "SubmitBadword", voiceInteraction, {
                                badword: result.badword
                            } );
                            break;
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelStatusBadword":
                args.badword = argsFromManager?.badword;
                break;

            case "VertixBot/UI-V3/DynamicChannelStatusSuccess":
            case "VertixBot/UI-V3/DynamicChannelStatusCleared":
                args.channelStatus = argsFromManager?.channelStatus;
                break;

            default: {
                const dynamicChannelStatusService = ServiceLocator.$.get<DynamicChannelStatusService>(
                    "VertixBot/Services/DynamicChannelStatus"
                );

                args.defaultChannelStatus = await dynamicChannelStatusService.getComposedStatus( interaction.channel );
                args.channelStatus = ( await dynamicChannelStatusService.getCustomStatus( interaction.channel ) ) ?? "";
                break;
            }
        }

        return args;
    } )
    .build();

export { DynamicChannelStatusAdapter };
