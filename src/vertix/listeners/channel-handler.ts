import {
    ChannelType,
    Client,
    Events
} from "discord.js";

import { CategoryManager } from "@vertix/managers/category-manager";
import { ChannelManager } from "@vertix/managers/channel-manager";
import { DirectMessageManager } from "@vertix/managers/direct-message-manager";

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
        // If it was handled by the channel manager, return.
        if ( await ChannelManager.$.onChannelDelete( channel ) ) {
            return;
        }

        if ( channel.type === ChannelType.GuildCategory ) {
            await CategoryManager.$.onDelete( channel );
            return;
        }
    } );

    client.on( Events.ChannelUpdate, async ( oldChannel, newChannel ) => {
        await ChannelManager.$.onChannelUpdate( oldChannel, newChannel );
    } );

    client.on( Events.MessageCreate, async ( message ) => {
        if ( message.author.bot ) {
            return;
        }

        if ( message.channel.type !== ChannelType.DM ) {
            return;
        }

        await DirectMessageManager.$.onMessage( message );
    } );
}
