import { ChannelType, Client, Events } from "discord.js";

import ChannelManager from "../managers/channel";

import CategoryManager from "@dynamico/managers/category";

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
        // If it was handled by the channel manager, return
        if ( await ChannelManager.getInstance().onChannelDelete( channel ) ) {
            return;
        }

        if ( channel.type === ChannelType.GuildCategory ) {
            await CategoryManager.getInstance().onDelete( channel );
            return;
        }
    } );

    client.on( Events.ChannelUpdate, async ( oldChannel, newChannel ) => {
        await ChannelManager.getInstance().onChannelUpdate( oldChannel, newChannel );
    } );
}
