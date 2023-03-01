import { Client } from "discord.js";

import GuildManager from "../managers/guild";

export function guildHandler ( client: Client ) {
    const guildManager = GuildManager.getInstance();

    client.on( "guildCreate", async ( guild ) => {
        await guildManager.onJoin( client, guild );
    } );

    client.on( "guildDelete", async ( guild ) => {
        await guildManager.onLeave( client, guild );
    } );
}
