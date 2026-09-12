import { ChannelType } from "discord.js";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Function getPressedChannelId() :: The channel the pressed interface is sitting in.
 *
 * Read off the message that was pressed rather than off the interaction. A dynamic channel adapter
 * rewrites an interaction's channel to whichever voice channel the presser happens to be sitting
 * in, so asking the interaction answers for that channel rather than for the interface - and a
 * panel pressed while its presser sits in a channel would look like a press from inside one.
 */
export function getPressedChannelId( interaction: UIAdapterReplyContext ): string | null {
    const messageChannelId = "message" in interaction ? interaction.message?.channelId : null;

    return messageChannelId ?? interaction.channelId ?? null;
}

/**
 * Function isPressedFromControlPanel() :: Whether the interface pressed is the one beside the
 * generator rather than the one inside a channel.
 *
 * The two carry the same buttons and mean different things by them: inside a channel the presser
 * is already somewhere, and from the panel they are choosing where to be.
 */
export function isPressedFromControlPanel( interaction: UIAdapterReplyContext ): boolean {
    const pressedChannelId = getPressedChannelId( interaction );

    if ( ! pressedChannelId ) {
        return false;
    }

    return ChannelType.GuildVoice !== interaction.guild.channels.cache.get( pressedChannelId )?.type;
}
