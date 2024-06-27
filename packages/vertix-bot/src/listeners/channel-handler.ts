import { Events  } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { VoiceState, Client } from "discord.js";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

export function channelHandler( client: Client ) {
    client.on( Events.VoiceStateUpdate, VoiceStateUpdate );

    async function VoiceStateUpdate( oldState: VoiceState, newState: VoiceState ) {
        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        if ( ! oldState.channelId && newState.channelId ) {
            // User joined a channel.
            await channelService.onEnter( oldState, newState );
        } else if ( oldState.channelId && ! newState.channelId ) {
            // User left a channel.
            await channelService.onLeaveGeneric( oldState, newState );
        } else if ( oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId ) {
            // User switched channels.
            await channelService.onSwitch( oldState, newState );
        }
    }

    client.on( Events.ChannelDelete, async ( channel ) => {
        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        await channelService.onChannelDelete( channel );
    } );

    client.on( Events.ChannelUpdate, async ( oldChannel, newChannel ) => {
        const channelService = ServiceLocator.$.get<ChannelService>( "VertixBot/Services/Channel" );

        await channelService.onChannelUpdate( oldChannel, newChannel );
    } );
}
