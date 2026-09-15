import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { getClaimableChannels } from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-channels";

import type { IClaimableChannelOption } from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-channel-menu";
import type { TAdapterMapping, UIService } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceClaim() :: Offers the channels whose owner has gone.
 *
 * It used to ask only about the channel the member was standing in, and told them it was not up for
 * claiming - true, and no use: somebody looking to take over a channel is not usually sitting in
 * the one they mean, and a text channel is not a candidate at all. So it asks the whole server, the
 * way knocking does.
 *
 * What it cannot do is be the press. A claim is a vote drawn by editing the very message its button
 * sits on, so picking a channel here hands back that message rather than casting anything - which
 * lands the member on the vote already running.
 */
export async function runVoiceClaim(
    interaction: CommandInteraction<"cached">,
    _channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    _isV2: boolean
): Promise<void> {
    // Both interface versions, since a guild can run generators of each and a member taking over an
    // abandoned channel has no idea which one made it.
    const claimable = getClaimableChannels( interaction.guildId );

    if ( ! claimable.length ) {
        await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/NotClaimableAdapter" )
            ?.ephemeral( interaction );

        return;
    }

    const claimableChannels: IClaimableChannelOption[] = claimable.map( ( { channel } ) => ( {
        id: channel.id,
        name: channel.name,
        memberCount: channel.members.size
    } ) );

    await adapter.ephemeralWithStep(
        interaction,
        "VertixBot/UI-V3/ClaimCommandSelectChannel",
        { claimableChannels }
    );
}
