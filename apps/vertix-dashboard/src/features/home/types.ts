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
    /**
     * Every channel sitting in this generator's category, against which Discord measures its
     * per-category limit. Null when the generator has no category, or when Discord could not be asked,
     * and absent altogether from an API deployed before the field existed - the dashboard ships on
     * its own schedule, so a reader of this has to allow for all three.
     */
    categoryChannelsCount?: number | null;
}

export interface GuildDetails {
    guild: GuildStats;
    masterChannels: MasterChannelInfo[];
}
