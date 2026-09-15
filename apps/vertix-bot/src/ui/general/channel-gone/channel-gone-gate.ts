import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

/**
 * Function answeredBecauseTheChannelIsGone() :: Says so, when the channel a screen was about has
 * been deleted.
 *
 * A screen outlives the channel it is about. A dynamic channel is removed the moment the last
 * person leaves it, and whatever ephemeral was open about it stays on screen with its buttons still
 * pressable - so a press can arrive about a channel that no longer exists.
 *
 * What used to happen then was not a refusal but a substitution: the resolution fell through to
 * whichever voice channel the member was sitting in by that point, and the screen carried on
 * against that one instead. Somebody whose channel had gone and who had since made another was
 * quietly editing the new one through a screen opened about the old.
 *
 * Only asked of a screen that named a channel. One that named none never made the promise.
 *
 * The screen itself is replaced rather than answered beside. A press comes from a message that is
 * still on the page with its buttons still live, and a fresh reply leaves it there - so the member
 * is told the channel is gone while looking at the controls for it, and can press again and be told
 * again. Editing puts the sentence where the screen was and takes the buttons with it: the notice
 * draws no elements of its own, so what replaces them is nothing.
 *
 * It lives here rather than in a base because there are five of those - execution steps and wizards,
 * each in two interface versions, and the command one besides - and they share no ancestor closer
 * than the framework. Put in one of them, it covered one of them: `/voice message` opens a wizard
 * and went on substituting while the others refused.
 *
 * Returns whether it answered, in which case the press is spent.
 */
export async function answeredBecauseTheChannelIsGone(
    interaction: UIAdapterReplyContext,
    args: UIArgs | undefined
): Promise<boolean> {
    const channelId = typeof args?.channelId === "string" ? args.channelId : null;

    if ( ! channelId || ! interaction.guild ) {
        return false;
    }

    const channel = interaction.guild.channels.cache.get( channelId )
        ?? await interaction.guild.channels.fetch( channelId ).catch( () => null );

    if ( channel ) {
        return false;
    }

    const notice = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/ChannelGoneAdapter" );

    // A press has a message to replace; anything else - a command opening straight onto a channel
    // that has just gone - has nothing on screen yet and is answered fresh.
    if ( interaction.isMessageComponent?.() ) {
        await notice?.editReply( interaction, {} );
    } else {
        await notice?.ephemeral( interaction, {} );
    }

    return true;
}
