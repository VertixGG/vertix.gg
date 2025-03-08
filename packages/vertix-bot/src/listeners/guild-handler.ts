import { GuildManager } from "@vertix.gg/bot/src/managers/guild-manager";

import type { Client } from "discord.js";

export function guildHandler(client: Client) {
    client.on("guildCreate", async (guild) => {
        await GuildManager.$.onJoin(client, guild);
    });

    client.on("guildDelete", async (guild) => {
        await GuildManager.$.onLeave(client, guild);
    });
}
