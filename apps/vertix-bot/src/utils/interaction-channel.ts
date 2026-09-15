import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { VoiceChannel } from "discord.js";

/**
 * Function applyResolvedChannelToInteraction() :: Points an interaction at the channel it is
 * actually about.
 *
 * Every dynamic channel adapter reads its channel off the interaction - `interaction.channel.name`,
 * `interaction.channel.id` - because the interface inside a channel is pressed from that channel
 * and the two are the same thing. They are not the same thing anywhere else: a control panel sits
 * beside a generator, and a slash command is typed wherever the member happens to be standing. In
 * both cases the channel the member means has already been resolved by the time this is called, and
 * what is left is to hand the adapters the shape they expect rather than teach every one of them a
 * second way to ask.
 *
 * Written once because both entry points need it and the rule they share should have one home. The
 * properties are read-only on the interaction discord.js built, hence `defineProperty`; a runtime
 * that refuses is left alone rather than throwing, since an adapter that then resolves the channel
 * for itself is no worse off than before.
 */
export function applyResolvedChannelToInteraction(
    interaction: UIAdapterReplyContext,
    channel: VoiceChannel
): void {
    if ( interaction.channel?.id === channel.id ) {
        return;
    }

    try {
        Object.defineProperty( interaction, "channel", { value: channel } );
    } catch {
    }

    try {
        Object.defineProperty( interaction, "channelId", { value: channel.id } );
    } catch {
    }
}
