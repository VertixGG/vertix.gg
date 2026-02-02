import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelPremiumResetChannelComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

const RESET_CHANNEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButtonGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelSuccess": {
        embedsGroup: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelEmbedGroup"
    },
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

async function onResetChannelButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.resetChannel( interaction, interaction.channel );

    switch ( result?.code ) {
        case "success-rename-rate-limit":
        case "success":
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPremiumResetChannelSuccess", {
                result
            } );
            break;

        case "vote-required":
            await TopGGManager.$.sendVoteEmbed( interaction );
            break;

        default:
            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPremiumResetChannelError", {} );
    }
}

const DynamicChannelPremiumResetChannelAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelAdapter"
)
    .setComponent( DynamicChannelPremiumResetChannelComponent )
    .setExecutionSteps( RESET_CHANNEL_STEPS )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { code: "success" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelError",
                navigationType: "ephemeral"
            } )
            .addTransition( "ResetSuccess", { from: "Default", to: "Success" } )
            .addTransition( "ResetError", { from: "Default", to: "Error" } )
            .bindElement( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", "ResetSuccess" );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton",
            onResetChannelButtonClicked
        );
    } )
    .build();

export { DynamicChannelPremiumResetChannelAdapter };
