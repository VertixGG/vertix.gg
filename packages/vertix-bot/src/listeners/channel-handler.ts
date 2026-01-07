import { Events } from "discord.js";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";

import type { VoiceState, Client } from "discord.js";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

export function channelHandler( client: Client ) {
    client.on( Events.VoiceStateUpdate, VoiceStateUpdate );

    const updateLastActive = ( guildId: string ) => {
        void GuildModel.$.updateLastActive( guildId ).then( ( updated ) => {
            if ( !updated ) {
                void guildLeaveBecauseNotInDatabase( client, guildId );
            }
        } );
    };

    async function VoiceStateUpdate( oldState: VoiceState, newState: VoiceState ) {
        if ( newState.guild.id ) {
            updateLastActive( newState.guild.id );
        }

        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        if ( !oldState.channelId && newState.channelId ) {
            // User joined a channel.
            await channelService.onEnter( oldState, newState );
        } else if ( oldState.channelId && !newState.channelId ) {
            // User left a channel.
            await channelService.onLeaveGeneric( oldState, newState );
        } else if ( oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId ) {
            // User switched channels.
            await channelService.onSwitch( oldState, newState );
        }
    }

    client.on( Events.ChannelDelete, async( channel ) => {
        if ( "guild" in channel && channel.guild.id ) {
            updateLastActive( channel.guild.id );
        }

        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        await channelService.onChannelDelete( channel );
    } );

    client.on( Events.ChannelUpdate, async( oldChannel, newChannel ) => {
        if ( "guild" in newChannel && newChannel.guild.id ) {
            updateLastActive( newChannel.guild.id );
        }

        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        await channelService.onChannelUpdate( oldChannel, newChannel );
    } );
}
