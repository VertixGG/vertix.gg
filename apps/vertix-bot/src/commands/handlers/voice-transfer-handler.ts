import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceTransfer() :: Asks who the channel should go to.
 *
 * There is nothing to work out here - the button beside it only navigates too - and yet it is not
 * nothing: the channel has to be written onto the args the interface opens with. What follows is
 * two more presses, each its own interaction arriving with no memory of where the first one was
 * about, and each resolving the channel from those args. Without it, a member who typed this from a
 * text channel would pick a member and then be told they have no channel.
 */
export async function runVoiceTransfer(
    interaction: CommandInteraction<"cached">,
    channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    isV2: boolean
): Promise<void> {
    if ( ! channel ) {
        return;
    }

    await adapter.ephemeralWithStep(
        interaction,
        isV2
            ? "VertixBot/UI-V2/DynamicChannelTransferOwnerSelectUser"
            : "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser",
        { channelId: channel.id }
    );
}
