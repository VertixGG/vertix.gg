import { Client } from "discord.js";

import { GuildManager } from "@vertix/managers/guild-manager";

export function guildHandler ( client: Client ) {
    client.on( "guildCreate", async ( guild ) => {
        await GuildManager.$.onJoin( client, guild );
    } );

    client.on( "guildDelete", async ( guild ) => {
        await GuildManager.$.onLeave( client, guild );
    } );
}
