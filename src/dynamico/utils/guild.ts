import { Guild } from "discord.js";

export const guildGetMemberDisplayName = ( guild: Guild, userId: string ): string => {
    return guild.members.cache.get( userId )?.displayName || "Unknown (Disconnected from server)";
};
