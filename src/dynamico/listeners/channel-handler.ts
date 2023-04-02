import {
    ChannelType,
    Client,
    Events
} from "discord.js";

import {
    categoryManager,
    channelManager,
    dmManager,
} from "@dynamico/managers";

export function channelHandler( client: Client ) {
    client.on( Events.VoiceStateUpdate, async ( oldState, newState ) => {
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
        // If it was handled by the channel manager, return
        if ( await channelManager.onChannelDelete( channel ) ) {
            return;
        }

        if ( channel.type === ChannelType.GuildCategory ) {
            await categoryManager.onDelete( channel );
            return;
        }
    } );

    client.on( Events.ChannelUpdate, async ( oldChannel, newChannel ) => {
        await channelManager.onChannelUpdate( oldChannel, newChannel );
    } );

    client.on( Events.MessageCreate, async ( message ) => {
        if ( message.author.bot ) {
            return;
        }

        if ( message.channel.type !== ChannelType.DM ) {
            return;
        }

        await dmManager.onMessage( message );
    } );
}
