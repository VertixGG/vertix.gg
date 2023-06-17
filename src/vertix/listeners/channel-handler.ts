import {
    Client,
    Events
} from "discord.js";

import { ChannelManager } from "@vertix/managers/channel-manager";

export function channelHandler( client: Client ) {
    client.on( Events.VoiceStateUpdate, async ( oldState, newState ) => {
        if ( ! oldState.channelId && newState.channelId ) {
            // User joined a channel.
            await ChannelManager.$.onJoin( oldState, newState );
        } else if ( oldState.channelId && ! newState.channelId ) {
            // User left a channel.
            await ChannelManager.$.onLeave( oldState, newState );
        } else if ( oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId ) {
            // User switched channels.
            await ChannelManager.$.onSwitch( oldState, newState );
        }
    } );

    client.on( Events.ChannelDelete, async ( channel ) => {
        await ChannelManager.$.onChannelDelete( channel );
    } );

    client.on( Events.ChannelUpdate, async ( oldChannel, newChannel ) => {
        await ChannelManager.$.onChannelUpdate( oldChannel, newChannel );
    } );
}
