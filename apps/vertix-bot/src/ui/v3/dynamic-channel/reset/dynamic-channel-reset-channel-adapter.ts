import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

const DynamicChannelResetChannelAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelResetChannelAdapter"
)
    .setComponent( DynamicChannelResetChannelComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V3/DynamicChannelResetChannelButtonGroup"
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { code: "success" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup"
            } )
            .addState( "VoteRequired", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelVoteRequired",
                navigationType: "silent", // Uses TopGGManager.$.sendVoteEmbed() directly
                embedsGroup: "VertixBot/UI-General/TopGGVoteEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addTransition( "ResetSuccess", { from: "Default", to: "Success" } )
            .addTransition( "ResetVoteRequired", { from: "Default", to: "VoteRequired" } )
            .addTransition( "ResetError", { from: "Default", to: "Error" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                "ResetSuccess",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.resetChannel( interaction, interaction.channel, {
                        includeRegion: true,
                        includePrimaryMessage: true
                    } );

                    switch ( result?.code ) {
                        case "success-rename-rate-limit":
                        case "success":
                            context.setArgs( interaction, { result } );
                            await context.triggerTransition( "ResetSuccess", interaction, { result } );
                            break;

                        case "vote-required":
                            await TopGGManager.$.sendVoteEmbed( interaction );
                            // Silent transition - just for tracking
                            await context.triggerTransition( "ResetVoteRequired", interaction );
                            break;

                        default:
                            await context.triggerTransition( "ResetError", interaction, {} );
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    } )
    .build();

export { DynamicChannelResetChannelAdapter };
