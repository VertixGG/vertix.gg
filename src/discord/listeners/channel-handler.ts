import { ChannelType, Client, Events } from "discord.js";

import ChannelManager from "../managers/channel-manager";

export function channelHandler( client: Client ) {
    client.on( Events.VoiceStateUpdate, async ( oldState, newState ) => {
        const channelManager = ChannelManager.getInstance();

        if ( ! oldState.channelId && newState.channelId ) {
            // User joined a channel
            await channelManager.onJoin( oldState, newState );
        } else if ( oldState.channelId && ! newState.channelId ) {
            // User left a channel
            await channelManager.onLeave( oldState, newState );
        } else if ( oldState.channelId && newState.channelId ) {
            // User switched channels
            await channelManager.onSwitch( oldState, newState );
        }
    } );

    client.on( Events.ChannelDelete, async ( channel ) => {
        await ChannelManager.getInstance().onChannelDelete( channel );
    } );
}
