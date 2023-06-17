import { ChannelType, Client, Events } from "discord.js";

import { DirectMessageManager } from "@vertix/managers/direct-message-manager";

export function messageHandler( client: Client ) {
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
