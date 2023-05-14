import { Client } from "discord.js";

import { GuildManager } from "@dynamico/managers/guild";

export function guildHandler ( client: Client ) {
    client.on( "guildCreate", async ( guild ) => {
        await GuildManager.$.onJoin( client, guild );
    } );

    client.on( "guildDelete", async ( guild ) => {
        await GuildManager.$.onLeave( client, guild );
    } );
}
