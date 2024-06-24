import { ChannelType, Events } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { DirectMessageService } from "@vertix.gg/bot/src/services/direct-message-service";

import type { Client} from "discord.js";

export function messageHandler( client: Client ) {
    client.on( Events.MessageCreate, async ( message ) => {
        if ( message.author.bot ) {
            return;
        }

        if ( message.channel.type !== ChannelType.DM ) {
            return;
        }

        await ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" )
            .onMessage( message );
    } );
}
