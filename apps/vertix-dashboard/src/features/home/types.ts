export interface GlobalStats {
    totalGuilds: number;
    activeGuilds: number;
    totalChannels: number;
    totalMasterChannels: number;
    totalDynamicChannels: number;
    totalUsers: number;
}

export interface GuildStats {
    guildId: string;
    name: string;
    totalChannels: number;
    masterChannels: number;
    dynamicChannels: number;
    isInGuild: boolean;
    createdAt: string;
    lastActiveAt: string | null;
}

export interface MasterChannelInfo {
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    dynamicChannelsCount: number;
}

export interface GuildDetails {
    guild: GuildStats;
    masterChannels: MasterChannelInfo[];
    /**
     * How many channels each generator may have open at once - the bot refuses the next member at
     * it. Null when the bot could not be asked, and absent altogether from an API deployed before
     * the field existed - the dashboard ships on its own schedule, so a reader of this has to allow
     * for both.
     */
    maxActiveDynamicChannels?: number | null;
}
