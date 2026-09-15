import { getOwnedChannels } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import { resolveMasterChannelId } from "@vertix.gg/bot/src/utils/master-channel";

import type { IOwnedChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-channel-menu";
import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceInvite() :: Works out which channel the invitation is for, then asks who for.
 *
 * Three answers, and each is a different screen rather than a different thing said on one: a member
 * who owns nothing is told where to get a channel, one who owns a single channel is asked straight
 * away who to let in, and one who owns several is asked which channel first.
 *
 * That question is about the guild rather than about anything drawn, which is why it is answered
 * here. The interface this opens holds the screens and what leads between them, and nothing that
 * decides which of them a member starts on.
 */
export async function runVoiceInvite(
    interaction: CommandInteraction<"cached">,
    _channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    _isV2: boolean
): Promise<void> {
    const owned = await getOwnedChannels( interaction, interaction.member );

    if ( ! owned.length ) {
        // The generator is the answer to having no channel, so name it rather than describing it -
        // which is what every other screen says in the same spot.
        await adapter.ephemeralWithStep(
            interaction,
            "VertixBot/UI-V3/DynamicChannelInviteNoChannel",
            { masterChannelId: await resolveMasterChannelId( interaction ) }
        );

        return;
    }

    // Standing in one of them settles it; so does owning only one. Either way there is nothing to
    // ask, and asking anyway is a screen a member has to get past to reach the one they wanted.
    const standingIn = owned.find( ( channel ) => channel.id === interaction.channelId );

    const resolved = standingIn ?? ( 1 === owned.length ? owned[ 0 ] : null );

    if ( resolved ) {
        await adapter.ephemeralWithStep(
            interaction,
            "VertixBot/UI-V3/DynamicChannelInviteSelectUser",
            { channelId: resolved.id }
        );

        return;
    }

    const ownedChannels: IOwnedChannelOption[] = owned.map( ( channel ) => ( {
        id: channel.id,
        name: channel.name
    } ) );

    await adapter.ephemeralWithStep(
        interaction,
        "VertixBot/UI-V3/DynamicChannelInviteSelectChannel",
        { ownedChannels }
    );
}
