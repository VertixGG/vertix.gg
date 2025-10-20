import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-base";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class DynamicChannelResetChannelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelResetChannelAdapter";
    }

    public static getComponent() {
        return DynamicChannelResetChannelComponent;
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    }

    protected onEntityMap() {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelResetChannelButton",
            this.onResetChannelButtonClicked
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
                this.getComponent().switchEmbedsGroup( "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup" );

                await this.ephemeral( interaction, { result } );
                break;

            case "vote-required":
                await TopGGManager.$.sendVoteEmbed( interaction );
                break;

            default:
                this.getComponent().switchEmbedsGroup( "VertixBot/UI-General/SomethingWentWrongEmbedGroup" );
                await this.ephemeral( interaction, {} );
        }
    }
}
