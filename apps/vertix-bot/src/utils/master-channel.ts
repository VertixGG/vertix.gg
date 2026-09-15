import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ChannelType, PermissionsBitField } from "discord.js";

import { getPressedChannelId } from "@vertix.gg/bot/src/ui/general/misc/interaction-origin-channel";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Function masterChannelIdOfInteractionChannel() :: The generator behind the channel this came from.
 *
 * Two kinds of channel an interaction can come from, and both name a generator: one a generator
 * made, and the control panel that sits beside one. Anywhere else names none, which is the `null`.
 *
 * Deliberately not exported. It asks where an interaction belongs, which is a different question
 * from where to send someone - and when it was exported, a screen meaning the second called the
 * first and offered members nothing.
 */
async function masterChannelIdOfInteractionChannel( interaction: UIAdapterReplyContext ): Promise<string | null> {
    const pressedChannelId = getPressedChannelId( interaction );

    if ( ! pressedChannelId ) {
        return null;
    }

    const channelDB = await ChannelModel.$.getByChannelId( pressedChannelId );

    if ( ! channelDB ) {
        return null;
    }

    const pressedChannel = interaction.guild.channels.cache.get( pressedChannelId );

    if ( ChannelType.GuildVoice === pressedChannel?.type ) {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channelDB.channelId );

        return masterChannelDB?.channelId ?? null;
    }

    return channelDB.ownerChannelId ?? null;
}

/**
 * Function resolveMasterChannelId() :: The generator this interaction is about.
 *
 * Read off where the interaction came from, and nowhere else. A `null` means this did not come from
 * anywhere that names a generator - a command typed in an ordinary text channel, a press on
 * something unrelated - and `null` is the answer, not a reason to go looking.
 *
 * It used to go looking. Finding none, it took the guild's most recently made generator and offered
 * that, which is a guess wearing the clothes of an answer: nothing says the newest generator is the
 * one a server wants people sent to, and a member told to join one they never asked about is worse
 * off than a member told nothing. Screens that name this already cope with having nothing to name.
 *
 * What it does still check is that the generator can be used - it must exist, and this member must
 * be able to see and connect to it. A row outlives the channel it describes, and pointing at a
 * deleted or shut one is the same broken promise in a different costume.
 */
export async function resolveMasterChannelId(
    interaction: UIAdapterReplyContext
): Promise<string | null> {
    const masterChannelId = await masterChannelIdOfInteractionChannel( interaction );

    if ( ! masterChannelId ) {
        return null;
    }

    return await canMemberJoinChannel( interaction, masterChannelId ) ? masterChannelId : null;
}

/**
 * Function canMemberJoinChannel() :: Whether telling this member to go there would work.
 *
 * Existing is not enough, which is all this asked before: a generator the member cannot see, or can
 * see and cannot connect to, is a worse answer than none - "join <#x> to create your own channel
 * first" pointing at something invisible or shut.
 *
 * Effective permissions are the right question here, unlike in the lists that decide what a member
 * may knock on. Those *exclude* on what a member can do, and an administrator can do everything, so
 * excluding emptied them. This *includes*: the question is literally whether this member could join
 * this channel, and for an administrator the answer really is yes.
 */
async function canMemberJoinChannel( interaction: UIAdapterReplyContext, channelId: string ) {
    const channel = interaction.guild.channels.cache.get( channelId )
        ?? await interaction.guild.channels.fetch( channelId ).catch( () => null );

    if ( ChannelType.GuildVoice !== channel?.type ) {
        return false;
    }

    const permissions = channel.permissionsFor( interaction.member );

    return Boolean(
        permissions?.has( PermissionsBitField.Flags.ViewChannel )
        && permissions.has( PermissionsBitField.Flags.Connect )
    );
}
