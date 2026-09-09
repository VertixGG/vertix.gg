export interface ScalingSettings {
    scalingChannelPrefix: string;
    scalingChannelMaxMembersPerChannel: number;
    scalingChannelMinAvailableChannels: number;
    scalingChannelCategoryId: string | null;
}

export interface ScalingMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    scalingChannelsCount: number;
    settings: ScalingSettings | null;
    // Populated when selected - single source of truth
    scalingChannels?: ScalingChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export type ChannelPrivacyState = "public" | "private" | "hidden";

export interface DynamicSettings {
    dynamicChannelNameTemplate: string;
    dynamicChannelAutoSave: boolean;
    dynamicChannelAutoStatus: boolean;
    dynamicChannelMentionable: boolean;
    dynamicChannelDefaultPrivacyState: ChannelPrivacyState;
    /** Null copies the generator's own limit, which is what a channel did before the setting. */
    dynamicChannelDefaultUserLimit: number | null;
    dynamicChannelVerifiedRoles: string[];
    dynamicChannelStaffRoles: string[];
    /** Null defers to the guild wide voice role. */
    dynamicChannelVoiceRoleId: string | null;
    dynamicChannelLogsChannelId: string | null;
}

export interface GuildDiscordRole {
    id: string;
    name: string;
    color: number;
}

export interface GuildDiscordChannel {
    id: string;
    name: string;
}

/**
 * What a generator's settings can point at - fetched from Discord, so the forms offer names
 * rather than asking for ids.
 */
export interface GuildDiscordOptions {
    roles: GuildDiscordRole[];
    textChannels: GuildDiscordChannel[];
}

export interface DynamicMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    dynamicChannelsCount: number;
    version: string;
    settings: DynamicSettings | null;
    // Populated when selected - single source of truth
    dynamicChannels?: DynamicChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface DynamicChannelInfo {
    id: string;
    channelId: string;
    userOwnerId: string | null;
    createdAt: string;
    discord?: DiscordChannelInfo | null;
}

export interface DynamicMasterDetails {
    master: DynamicMasterChannelInfo;
    dynamicChannels: DynamicChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface UpdateDynamicSettingsInput {
    dynamicChannelNameTemplate?: string;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelAutoStatus?: boolean;
    dynamicChannelMentionable?: boolean;
    dynamicChannelDefaultPrivacyState?: ChannelPrivacyState;
    dynamicChannelDefaultUserLimit?: number | null;
    dynamicChannelVerifiedRoles?: string[];
    dynamicChannelStaffRoles?: string[];
    dynamicChannelVoiceRoleId?: string | null;
    dynamicChannelLogsChannelId?: string | null;
}

export interface DiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
    /** The channel's own limit, `0` for none. Absent on anything that is not a voice channel. */
    userLimit?: number;
}

export interface ScalingChannelInfo {
    id: string;
    channelId: string;
    createdAt: string;
    discord?: DiscordChannelInfo | null;
}

export interface GuildGeneratorsDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
    settings: GuildSettings;
}

/**
 * The server wide defaults every generator falls back to when it holds none of its own.
 *
 * An empty list is the unset state, not an empty audience - it resolves to `@everyone` for the
 * verified roles and to nobody for the staff roles. The forms need the two apart to say which of
 * them a generator is actually following.
 */
export interface GuildSettings {
    voiceRoleId: string | null;
    verifiedRoleIds: string[];
    staffRoleIds: string[];
}

export interface ScalingMasterDetails {
    master: ScalingMasterChannelInfo;
    scalingChannels: ScalingChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface UpdateScalingSettingsInput {
    scalingChannelPrefix?: string;
    scalingChannelMaxMembersPerChannel?: number;
    scalingChannelMinAvailableChannels?: number;
    scalingChannelCategoryId?: string | null;
}

export interface CreateScalingSetupInput {
    prefix?: string;
    maxMembers?: number;
}

export type DynamicChannelVersion = "v2" | "v3";

export interface CreateDynamicSetupInput {
    version?: DynamicChannelVersion;
    nameTemplate?: string;
    autoSave?: boolean;
    mentionable?: boolean;
}

export type MasterChannelType = "scaling" | "dynamic";

export interface MasterChannelListItem {
    id: string;
    channelId: string;
    type: MasterChannelType;
    childCount: number;
    createdAt: string;
}
