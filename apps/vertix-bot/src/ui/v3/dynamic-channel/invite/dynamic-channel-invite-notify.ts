import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type DirectMessageService from "@vertix.gg/bot/src/services/direct-message-service";
import type { GuildMember, VoiceChannel } from "discord.js";

/**
 * Function notifyInvited() :: Tells the invited member where the channel they were let into is.
 *
 * The access is already theirs by the time this runs, so a closed inbox costs them nothing but the
 * link - which is why the outcome is reported back to the owner rather than treated as a failure.
 *
 * Shared by the invite button's interface and the one `/voice invite` opens, so an invitation reads
 * the same whichever way it was sent.
 */
export async function notifyInvited(
    channel: VoiceChannel,
    invited: GuildMember,
    invitedBy: GuildMember
): Promise<boolean> {
    const directMessageService =
        ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage", { silent: true } );

    if ( ! directMessageService ) {
        return false;
    }

    return directMessageService.sendToUser( invited.id, {
        content:
            `📨 **${ invitedBy.displayName }** invited you to **${ channel.name }** in **${ channel.guild.name }**.\n` +
            `${ channel.url }`
    } );
}
