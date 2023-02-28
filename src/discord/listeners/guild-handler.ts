import { Client } from "discord.js";

import GuildManager from "@internal/discord/managers/guild-manager";

export function guildHandler ( client: Client ) {
    const guildManager = GuildManager.getInstance();

    client.on( "guildCreate", async ( guild ) => {
        await guildManager.onJoin( client, guild );
    } );

    client.on( "guildDelete", async ( guild ) => {
        await guildManager.onLeave( client, guild );
    } );
}
