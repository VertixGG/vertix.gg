import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ChannelType, PermissionsBitField } from "discord.js";

import type { GuildMember, VoiceChannel } from "discord.js";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Function resolveMasterChannelId() :: The generator the pressed interface belongs to.
 *
 * A control panel is a text channel that names its generator, while the interface inside a dynamic
 * channel has to be traced back through the channel it sits in.
 *
 * Read off the message that was pressed rather than off the interaction. The adapter rewrites an
 * interaction's channel to whichever voice channel the presser happens to be sitting in, so asking
 * the interaction would answer for that channel's generator - and pressing a control panel while
 * sitting in a channel from another generator would list that other generator's channels.
 */
function getPressedChannelId( interaction: UIAdapterReplyContext ): string | null {
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

async function resolveMasterChannelId( interaction: UIAdapterReplyContext ): Promise<string | null> {
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
 * Function getKnockableChannels() :: The channels a member can ask to be let into.
 *
 * A channel qualifies when the member can see it but cannot connect to it - which is what a
 * private channel is. A hidden one is deliberately left out: it is absent from the member's
 * channel list precisely so they do not know it exists, and listing it here would undo that. One
 * the member already owns or can already join is nothing to ask about.
 */
export async function getKnockableChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const masterChannelId = await resolveMasterChannelId( interaction );

    if ( ! masterChannelId ) {
        return [];
    }

    const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, masterChannelId );

    const result: VoiceChannel[] = [];

    for ( const dynamicChannelDB of dynamicChannelsDB ) {
        if ( dynamicChannelDB.userOwnerId === member.id ) {
            continue;
        }

        const channel = interaction.guild.channels.cache.get( dynamicChannelDB.channelId );

        if ( ChannelType.GuildVoice !== channel?.type ) {
            continue;
        }

        const permissions = channel.permissionsFor( member );

        if ( ! permissions?.has( PermissionsBitField.Flags.ViewChannel ) ) {
            continue;
        }

        if ( permissions.has( PermissionsBitField.Flags.Connect ) ) {
            continue;
        }

        result.push( channel );
    }

    return result;
}

/**
 * Function getOwnedChannels() :: The live channels a member owns under the same generator.
 *
 * An owner acting from a control panel is not standing in the channel they mean - the panel is a
 * text channel beside the generator, and they may have stepped out of the voice channel entirely
 * while it stays open around the people still in it. Asking which of their channels they mean is
 * what replaces the channel the interface would otherwise have read off their voice state.
 */
export async function getOwnedChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const masterChannelId = await resolveMasterChannelId( interaction );

    if ( ! masterChannelId ) {
        return [];
    }

    const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, masterChannelId );

    const result: VoiceChannel[] = [];

    for ( const dynamicChannelDB of dynamicChannelsDB ) {
        if ( dynamicChannelDB.userOwnerId !== member.id ) {
            continue;
        }

        const channel = interaction.guild.channels.cache.get( dynamicChannelDB.channelId );

        if ( ChannelType.GuildVoice === channel?.type ) {
            result.push( channel );
        }
    }

    return result;
}

/**
 * Function getJoinableChannels() :: The channels under the same generator a member can walk into.
 *
 * The counterpart to the knockable ones, and the reason having nothing to knock on is not a dead
 * end: if every channel is already open, what the member wanted was to find one, not to ask for
 * one. Their own are left out - they know where those are.
 */
export async function getJoinableChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const masterChannelId = await resolveMasterChannelId( interaction );

    if ( ! masterChannelId ) {
        return [];
    }

    const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, masterChannelId );

    const result: VoiceChannel[] = [];

    for ( const dynamicChannelDB of dynamicChannelsDB ) {
        if ( dynamicChannelDB.userOwnerId === member.id ) {
            continue;
        }

        const channel = interaction.guild.channels.cache.get( dynamicChannelDB.channelId );

        if ( ChannelType.GuildVoice !== channel?.type ) {
            continue;
        }

        const permissions = channel.permissionsFor( member );

        if ( permissions?.has( PermissionsBitField.Flags.ViewChannel )
            && permissions.has( PermissionsBitField.Flags.Connect ) ) {
            result.push( channel );
        }
    }

    return result;
}
