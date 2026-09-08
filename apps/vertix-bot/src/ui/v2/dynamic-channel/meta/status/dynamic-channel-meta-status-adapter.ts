import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelMetaStatusComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/status/dynamic-channel-meta-status-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelSetStatusResultCode } from "@vertix.gg/bot/src/definitions/dynamic-channel-status";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { DynamicChannelStatusService } from "@vertix.gg/bot/src/services/dynamic-channel-status-service";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

const DynamicChannelMetaStatusAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelMetaStatusAdapter"
)
    .setComponent( DynamicChannelMetaStatusComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { defaultChannelStatus: "Valorant · 3/5" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaStatusSuccess",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaStatusSuccessEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { channelStatus: "Ranked grind, need two" }
            } )
            .addState( "Cleared", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaStatusCleared",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaStatusClearedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { channelStatus: "Valorant · 3/5" }
            } )
            .addState( "Badword", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaStatusBadword",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaStatusBadwordEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { badword: "example" }
            } )
            .addTransition( "SubmitSuccess", { from: "Default", to: "Success" } )
            .addTransition( "SubmitCleared", { from: "Default", to: "Cleared" } )
            .addTransition( "SubmitBadword", {
                from: "Default",
                to: "Badword",
                mutations: [ { type: "set", path: [ "badword" ] } ]
            } )
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelMetaStatusModal",
                "SubmitSuccess",
                async( context, interaction ) => {
                    const statusInputId = context.customIdStrategy.generateId(
                        "VertixBot/UI-V2/DynamicChannelMetaStatusAdapter:VertixBot/UI-V2/DynamicChannelMetaStatusInput"
                    );

                    const dynamicChannelStatusService = ServiceLocator.$.get<DynamicChannelStatusService>(
                        "VertixBot/Services/DynamicChannelStatus"
                    );

                    const newStatus = interaction.fields.getTextInputValue( statusInputId );

                    const result = await dynamicChannelStatusService.setCustomStatus( interaction.channel, newStatus );

                    switch ( result.code ) {
                        case DynamicChannelSetStatusResultCode.Success:
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaStatusSuccess", {
                                channelStatus: result.status
                            } );
                            break;

                        case DynamicChannelSetStatusResultCode.Cleared:
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaStatusCleared", {
                                channelStatus: await dynamicChannelStatusService.getComposedStatus( interaction.channel )
                            } );
                            break;

                        case DynamicChannelSetStatusResultCode.Badword:
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaStatusBadword", {
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
            case "VertixBot/UI-V2/DynamicChannelMetaStatusBadword":
                args.badword = argsFromManager?.badword;
                break;

            case "VertixBot/UI-V2/DynamicChannelMetaStatusSuccess":
            case "VertixBot/UI-V2/DynamicChannelMetaStatusCleared":
                args.channelStatus = argsFromManager?.channelStatus;
                break;

            default: {
                const dynamicChannelStatusService = ServiceLocator.$.get<DynamicChannelStatusService>(
                    "VertixBot/Services/DynamicChannelStatus"
                );

                // The placeholder is what the channel falls back to once the custom status is cleared,
                // which is nothing at all when the master channel has the automatic status switched off.
                args.defaultChannelStatus = ( await dynamicChannelStatusService.isAutoStatusEnabled( interaction.channel ) )
                    ? await dynamicChannelStatusService.getComposedStatus( interaction.channel )
                    : "";
                args.channelStatus = ( await dynamicChannelStatusService.getCustomStatus( interaction.channel ) ) ?? "";
                break;
            }
        }

        return args;
    } )
    .build();

export { DynamicChannelMetaStatusAdapter };
