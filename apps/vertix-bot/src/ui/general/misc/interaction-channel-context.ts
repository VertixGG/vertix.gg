import { ChannelType } from "discord.js";

import { getPressedChannelId } from "@vertix.gg/bot/src/ui/general/misc/interaction-origin-channel";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Where an interaction came from, and whether that place names a channel.
 *
 * Four situations, said plainly, because they are four things that really happen and collapsing
 * them at the point of writing loses the one detail anyone reading a log wants:
 *
 * - `channel-interface` :: pressed on the interface inside a channel. That channel is the one meant.
 * - `control-panel` :: pressed on the panel beside a generator. It sits outside every channel the
 *   generator made, so nothing there names one.
 * - `command-in-channel` :: a command, for a member whose own channel was found. As good as being
 *   stood in it - the bridge has written that channel onto the interaction.
 * - `command-anywhere` :: a command, and no channel was found. Typed in a text channel, or by
 *   someone who owns nothing.
 *
 * What an interface wants is not which of the four, but the question underneath them: does this
 * name a channel? Ask `interactionNamesAChannel()` rather than comparing - a comparison has to
 * remember two cases, and forgetting the newer one is how a command ends up treated like a press.
 */
export type UIChannelContext =
    | "channel-interface"
    | "control-panel"
    | "command-in-channel"
    | "command-anywhere";

const CONTEXTS_THAT_NAME_A_CHANNEL: UIChannelContext[] = [ "channel-interface", "command-in-channel" ];

/**
 * Function interactionNamesAChannel() :: Whether the member is already somewhere, or choosing.
 *
 * The question behind every use of the four. An interface acting on a channel can act when this is
 * true, and has to ask, offer, or say there is nothing when it is false.
 */
export function interactionNamesAChannel( context: UIChannelContext ): boolean {
    return CONTEXTS_THAT_NAME_A_CHANNEL.includes( context );
}

/**
 * Held beside the interaction rather than on it. The alternative is another property defined onto
 * an object discord owns, and there is one of those already - the channel the bridge writes on -
 * which is exactly what made this ambiguous: a value written on, then inferred back off, and no way
 * to tell which it was.
 */
const declared = new WeakMap<UIAdapterReplyContext, UIChannelContext>();

/**
 * Function declareInteractionChannelContext() :: Says what this interaction is, once.
 *
 * Called by whoever knows - the bridge, which has just worked out whether a command found the
 * member's channel. A press declares nothing and is read the way it always was.
 */
export function declareInteractionChannelContext(
    interaction: UIAdapterReplyContext,
    context: UIChannelContext
): void {
    declared.set( interaction, context );
}

/**
 * Function getInteractionChannelContext() :: What this interaction is.
 *
 * A declaration when there is one; otherwise the same reading of a press that has always been made
 * - which channel it came from, and whether that is a voice channel or a panel beside one.
 */
export function getInteractionChannelContext( interaction: UIAdapterReplyContext ): UIChannelContext {
    const declaredContext = declared.get( interaction );

    if ( declaredContext ) {
        return declaredContext;
    }

    const pressedChannelId = getPressedChannelId( interaction );

    if ( ! pressedChannelId ) {
        return "channel-interface";
    }

    return ChannelType.GuildVoice === interaction.guild.channels.cache.get( pressedChannelId )?.type
        ? "channel-interface"
        : "control-panel";
}
