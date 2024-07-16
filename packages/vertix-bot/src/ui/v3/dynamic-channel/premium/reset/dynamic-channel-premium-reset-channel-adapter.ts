import { DynamicChannelPremiumResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-component";

import { DynamicChannelAdapterBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-base";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class DynamicChannelPremiumResetChannelAdapter extends DynamicChannelAdapterBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPremiumResetChannelAdapter";
    }

    public static getComponent() {
        return DynamicChannelPremiumResetChannelComponent;
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
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>( "Vertix/UI-V3/DynamicChannelPremiumResetChannelButton", this.onResetChannelButtonClicked );
    }

    private async onResetChannelButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const result = await this.dynamicChannelService.resetChannel( interaction, interaction.channel );

        switch ( result?.code ) {
            case "success-rename-rate-limit":
            case "success":
                this.getComponent().switchEmbedsGroup( "Vertix/UI-V3/DynamicChannelPremiumResetChannelEmbedGroup" );

                await this.ephemeral( interaction, { result } );
                break;

            case "vote-required":
                await TopGGManager.$.sendVoteEmbed( interaction );
                break;

            default:
                this.getComponent().switchEmbedsGroup( "Vertix/UI-V3/SomethingWentWrongEmbedGroup" );
                await this.ephemeral( interaction, {} );
        }
    }
}
