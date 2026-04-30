import { ChannelType, Events } from "discord.js";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";

import type { DirectMessageService } from "@vertix.gg/bot/src/services/direct-message-service";

import type { Client } from "discord.js";

export function messageHandler( client: Client ) {
    client.on( Events.MessageCreate, async( message ) => {
        if ( message.author.bot ) {
            return;
        }

        if ( message.guildId ) {
            void GuildModel.$.updateLastActive( message.guildId ).then( ( updated ) => {
                if ( !updated ) {
                    void guildLeaveBecauseNotInDatabase( message.guildId! );
                }
            } );
        }

        if ( message.channel.type !== ChannelType.DM ) {
            return;
        }

        await ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" ).onMessage( message );
    } );
}
