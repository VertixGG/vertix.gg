import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

const RESET_CHANNEL_STEPS = {
    default: {
        elementsGroup: "VertixBot/UI-V3/DynamicChannelResetChannelButtonGroup"
    },
    "VertixBot/UI-V3/DynamicChannelResetChannelSuccess": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelResetChannelError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

async function onResetChannelButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const result = await dynamicChannelService.resetChannel( interaction, interaction.channel, {
        includeRegion: true,
        includePrimaryMessage: true
    } );

    switch ( result?.code ) {
        case "success-rename-rate-limit":
        case "success":
            context.getComponent().switchEmbedsGroup(
                "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup"
            );

            await context.ephemeral( interaction, { result } );
            break;

        case "vote-required":
            await TopGGManager.$.sendVoteEmbed( interaction );
            break;

        default:
            context.getComponent().switchEmbedsGroup(
                "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            );
            await context.ephemeral( interaction, {} );
    }
}

const DynamicChannelResetChannelAdapter = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelResetChannelAdapter"
)
    .setComponent( DynamicChannelResetChannelComponent )
    .setExecutionSteps( RESET_CHANNEL_STEPS )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelResetChannelButton",
            onResetChannelButtonClicked
        );
    } )
    .build();

export { DynamicChannelResetChannelAdapter };
