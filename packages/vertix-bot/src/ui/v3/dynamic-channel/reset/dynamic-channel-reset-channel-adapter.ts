import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const RESET_CHANNEL_STEPS = {
    default: {}
} as const;

const DynamicChannelResetChannelAdapterBase = new DynamicExecutionAdapterBuilder<UIDefaultButtonChannelVoiceInteraction>(
    "VertixBot/UI-V3/DynamicChannelResetChannelAdapter"
)
    .setComponent( DynamicChannelResetChannelComponent )
    .setExecutionSteps( RESET_CHANNEL_STEPS )
    .build();

class DynamicChannelResetChannelAdapter extends DynamicChannelResetChannelAdapterBase {
    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs( _interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    }

    protected async onEntityMap() {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelResetChannelButton",
            this.onResetChannelButtonClicked.bind( this )
        );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const result = await this.dynamicChannelService.resetChannel( interaction, interaction.channel, {
            includeRegion: true,
            includePrimaryMessage: true
        } );

        switch ( result?.code ) {
            case "success-rename-rate-limit":
            case "success":
                DynamicChannelResetChannelComponent.switchEmbedsGroup(
                    "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup"
                );

                await this.ephemeral( interaction, { result } );
                break;

            case "vote-required":
                await TopGGManager.$.sendVoteEmbed( interaction );
                break;

            default:
                DynamicChannelResetChannelComponent.switchEmbedsGroup(
                    "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
                );
                await this.ephemeral( interaction, {} );
        }
    }
}

export { DynamicChannelResetChannelAdapter };
