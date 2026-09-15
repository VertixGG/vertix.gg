import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceReset() :: Resets the channel, then says how that went.
 *
 * The resetting is the whole of what this command does, and it happens before anything is drawn -
 * the interface it then opens is one of two sentences about an act already carried out. That is why
 * the work is here and not in a screen: the answer decides which screen, so no screen can be the
 * thing that decides.
 *
 * Its counterpart is the reset button, whose own handler does the same and navigates instead. Both
 * call one `resetChannel()`, so the two cannot reset differently.
 */
export async function runVoiceReset(
    interaction: CommandInteraction<"cached">,
    channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    isV2: boolean
): Promise<void> {
    if ( ! channel ) {
        return;
    }

    const result = await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .resetChannel( interaction, channel, {
            includeRegion: true,
            includePrimaryMessage: true
        } );

    switch ( result?.code ) {
        case "success-rename-rate-limit":
        case "success":
            await adapter.ephemeralWithStep(
                interaction,
                isV2
                    ? "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandSuccess"
                    : "VertixBot/UI-V3/DynamicChannelResetChannelCommandSuccess",
                { result }
            );
            break;

        // Answered by the vote embed itself rather than by a screen of this interface, which is why
        // there is no state for it in either version.
        case "vote-required":
            await TopGGManager.$.sendVoteEmbed( interaction );
            break;

        default:
            await adapter.ephemeralWithStep(
                interaction,
                isV2
                    ? "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandError"
                    : "VertixBot/UI-V3/DynamicChannelResetChannelCommandError",
                {}
            );
    }
}
