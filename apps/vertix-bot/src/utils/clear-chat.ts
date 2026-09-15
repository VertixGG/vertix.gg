import type { VoiceChannel } from "discord.js";

/**
 * Function removePreviousClearNotices() :: Takes down the notices left by earlier clears.
 *
 * Clearing a channel's chat leaves a notice saying who cleared it and how much went - and that
 * notice is a message in the channel like any other, so the next clear would leave a second one
 * below the first. They are swept first so that a channel carries one, about the clear that just
 * happened.
 *
 * Found by the broom in the title rather than by anything stored, because nothing is stored about
 * them. The title is translated per guild and the emoji is not, which is the whole of why that is
 * what is matched on.
 *
 * TODO: Find a better way to do this.
 */
export async function removePreviousClearNotices( channel: VoiceChannel ) {
    const messages = await channel.messages.fetch();

    for ( const message of messages.values() ) {
        if ( ! message.embeds.length ) {
            continue;
        }

        if ( message.embeds[ 0 ]?.title?.includes( "🧹" ) ) {
            await message.delete();
        }
    }
}
