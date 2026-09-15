import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import {
    getJoinableChannels,
    getKnockableChannels
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import {
    requestKnock
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-request";

import {
    getInteractionChannelContext,
    interactionNamesAChannel
} from "@vertix.gg/bot/src/ui/general/misc/interaction-channel-context";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { IKnockableChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-channel-menu";
import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runKnock() :: Works out what asking to knock comes to, then shows it.
 *
 * The deciding lives here rather than in a screen because it is not one: which channels a member
 * may ask about, whether they are already standing in one, and whether there is anything to ask
 * about at all are three questions about the guild, and the answer to them is which screen to open
 * rather than something to draw. The interface this opens holds only screens.
 *
 * Its counterpart is the knock button, which asks the same three questions in its own handler and
 * navigates instead of opening. The questions themselves are asked in one place - the channel lists
 * and `requestKnock()` - so the two cannot come to different answers.
 */
export async function runKnock(
    interaction: CommandInteraction<"cached">,
    _channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    _isV2: boolean
): Promise<void> {
    const knockable = await getKnockableChannels( interaction, interaction.member );

    if ( ! knockable.length ) {
        // Nothing to ask about does not mean nowhere to go - if every channel is already open,
        // point at them rather than answering with a dead end. Only worth saying to someone who is
        // choosing: already standing in a channel, the member does not need the way to one.
        const joinable = ! interactionNamesAChannel( getInteractionChannelContext( interaction ) )
            ? await getJoinableChannels( interaction, interaction.member )
            : [];

        await adapter.ephemeralWithStep(
            interaction,
            "VertixBot/UI-V3/DynamicChannelKnockNothing",
            { openChannels: joinable.map( ( channel ) => channel.id ) }
        );

        return;
    }

    // Typed from inside the channel being asked about, which names it already. Only asking from
    // somewhere else leaves the channel open to question.
    const standingIn = knockable.find( ( channel ) => channel.id === interaction.channelId );

    if ( standingIn ) {
        const result = await requestKnock(
            { user: interaction.user, member: interaction.member },
            standingIn
        );

        switch ( result.outcome ) {
            case "sent":
                await adapter.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V3/DynamicChannelKnockSent",
                    { knockedChannelName: result.knockedChannelName }
                );
                break;

            case "waiting":
                await adapter.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V3/DynamicChannelKnockWaiting",
                    {}
                );
                break;

            case "error":
                await adapter.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V3/DynamicChannelKnockError",
                    {}
                );
                break;
        }

        return;
    }

    const knockableChannels: IKnockableChannelOption[] = await Promise.all(
        knockable.map( async( channel ) => {
            const channelDB = await ChannelModel.$.getByChannelId( channel.id );

            return {
                id: channel.id,
                name: channel.name,
                ownerDisplayName: await guildGetMemberDisplayName(
                    interaction.guild,
                    channelDB?.userOwnerId ?? ""
                )
            };
        } )
    );

    await adapter.ephemeralWithStep(
        interaction,
        "VertixBot/UI-V3/DynamicChannelKnockSelectChannel",
        { knockableChannels }
    );
}
