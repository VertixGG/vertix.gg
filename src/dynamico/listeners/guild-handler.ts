import { Client } from "discord.js";

import { guildManager } from "../managers";

export function guildHandler ( client: Client ) {
    client.on( "guildCreate", async ( guild ) => {
        await guildManager.onJoin( client, guild );
    } );

    client.on( "guildDelete", async ( guild ) => {
        await guildManager.onLeave( client, guild );
    } );
}
