import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelKnockManager } from "@vertix.gg/bot/src/managers/dynamic-channel-knock-manager";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { GuildMember, User, VoiceChannel } from "discord.js";

/**
 * What asking to knock came to.
 *
 * `waiting` is a knock the manager would not take because one is already outstanding, which is not
 * a failure - it is the answer "you have already asked".
 */
export type TKnockOutcome = "sent" | "waiting" | "error";

export interface IKnockResult {
    outcome: TKnockOutcome;
    /** Only on `sent`, for the screen that names what was knocked on. */
    knockedChannelName?: string;
}

/**
 * Function requestKnock() :: Records the knock and puts it in front of the channel's owner.
 *
 * Shared by every way in - the button inside the channel, the picker on the control panel, and the
 * interface `/knock` opens - so that a knock means the same thing however it was asked for.
 *
 * It answers with what happened rather than navigating anywhere, because the three callers do not
 * navigate alike: two of them are standing in a state machine and take a transition, and the third
 * is a slash command with no screen on yet, which opens one. Deciding here which of those to do
 * would mean handing this function a context that only two of them have.
 */
export async function requestKnock(
    knocker: { user: User; member: GuildMember | null },
    targetChannel: VoiceChannel
): Promise<IKnockResult> {
    const knockResult = DynamicChannelKnockManager.$.request( targetChannel.id, knocker.user.id );

    if ( "accepted" !== knockResult ) {
        return { outcome: "waiting" };
    }

    const requestAdapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-V3/DynamicChannelKnockRequestAdapter" );

    if ( ! requestAdapter ) {
        DynamicChannelKnockManager.$.resolve( targetChannel.id, knocker.user.id );

        return { outcome: "error" };
    }

    await requestAdapter.send( targetChannel, {
        knockerId: knocker.user.id,
        knockerDisplayName: knocker.member?.displayName ?? knocker.user.username
    } );

    return { outcome: "sent", knockedChannelName: targetChannel.name };
}
