import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import type { GuildMember, VoiceChannel } from "discord.js";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

/**
 * Function getKnockableChannels() :: The channels a member can ask to be let into.
 *
 * Every channel but their own and the ones nobody is meant to find.
 *
 * Not filtered by whether the member could connect. `permissionsFor()` answers with what they
 * effectively have, and an administrator effectively has everything - so the list came back empty
 * for exactly the people most likely to be looking at it, telling them every channel was already
 * open. Whether a door is worth knocking on is also not the bot's call: a member may want to ask
 * before walking into a channel they could have walked into.
 *
 * Whether a channel is hidden is asked of the channel rather than of the member, for the same
 * reason in reverse. A hidden channel is missing from a member's list so they do not learn it
 * exists; an administrator sees it regardless, and asking them would put it in front of the one
 * person who must not be shown it.
 *
 * The whole guild, not the generator the member happens to be standing under. A server can run
 * several, and which one made the channel someone is sitting in says nothing about which one made
 * the channel they want into - scoping to it meant a member in their own channel under one
 * generator could not see, let alone knock on, anything under another.
 */
export async function getKnockableChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const dynamicChannelsDB = await ChannelModel.$.getDynamics( interaction.guildId );

    const result: VoiceChannel[] = [];

    for ( const dynamicChannelDB of dynamicChannelsDB ) {
        if ( dynamicChannelDB.userOwnerId === member.id ) {
            continue;
        }

        const channel = interaction.guild.channels.cache.get( dynamicChannelDB.channelId );

        if ( ChannelType.GuildVoice !== channel?.type ) {
            continue;
        }

        if ( "hidden" === await dynamicChannelService.getChannelVisibilityState( channel ) ) {
            continue;
        }

        result.push( channel );
    }

    return result;
}

/**
 * Function getOwnedChannels() :: The live channels a member owns.
 *
 * An owner acting from a control panel is not standing in the channel they mean - the panel is a
 * text channel beside the generator, and they may have stepped out of the voice channel entirely
 * while it stays open around the people still in it. Asking which of their channels they mean is
 * what replaces the channel the interface would otherwise have read off their voice state.
 *
 * Across the whole guild, for the same reason knocking is. A server can run several generators and
 * a member can own a channel under each; scoping to the one they are standing under hid the rest
 * from them, so inviting someone into a channel meant first going and standing in it.
 */
export async function getOwnedChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const dynamicChannelsDB = await ChannelModel.$.getDynamics( interaction.guildId );

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
 * Function getJoinableChannels() :: The channels a member can walk into.
 *
 * The counterpart to the knockable ones, and the reason having nothing to knock on is not a dead
 * end: if every channel is already open, what the member wanted was to find one, not to ask for
 * one. Their own are left out - they know where those are.
 *
 * Across the guild, like the two above it. Which generator made a channel is not something the
 * member choosing where to go knows or cares about.
 */
export async function getJoinableChannels(
    interaction: UIAdapterReplyContext,
    member: GuildMember
): Promise<VoiceChannel[]> {
    const dynamicChannelsDB = await ChannelModel.$.getDynamics( interaction.guildId );

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
